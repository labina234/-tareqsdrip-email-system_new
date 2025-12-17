import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest/client';
export const runtime = "nodejs";

/**
 * POST /api/admin/email/campaigns/[id]/send
 * Send a campaign immediately or schedule it (admin only)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'SENT') {
      return NextResponse.json(
        { error: 'Campaign already sent' },
        { status: 400 }
      );
    }

    // Queue the campaign for sending via Inngest
    // This will be handled by the Inngest function
    await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        status: 'SENDING',
      },
    });

    // Trigger Inngest function to send emails
    await inngest.send({
      name: 'email/campaign.send',
      data: { campaignId: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Campaign queued for sending',
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
