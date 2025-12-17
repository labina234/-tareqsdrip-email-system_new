import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { sendEmail } from '@/lib/email/service';
import { EmailTemplateType, getEmailTemplate } from '@/lib/email/templates';
export const runtime = "nodejs";

/**
 * POST /api/admin/email/test
 * Send a test email to the admin
 */
export async function POST(_req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const toEmail = user?.emailAddresses[0]?.emailAddress;

    if (!toEmail) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 });
    }

    const html = getEmailTemplate(EmailTemplateType.WELCOME, {
      userName: user?.username || user?.firstName || 'Friend',
      firstName: user?.firstName || 'Friend',
    });

    await sendEmail({
      to: toEmail,
      subject: 'TareqsDrip Email System Test',
      html,
      templateType: EmailTemplateType.WELCOME,
      userId,
    });

    return NextResponse.json({ success: true, sentTo: toEmail });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
