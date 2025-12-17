import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await prisma.emailPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        salesEmails: true,
        offerEmails: true,
        newProductEmails: true,
        orderConfirmation: true,
        orderUpdates: true,
        emailVerified: false,
        unsubscribedAll: false,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const toBool = (v: any) => v === true;

    const data = {
      salesEmails: toBool(body.salesEmails),
      offerEmails: toBool(body.offerEmails),
      newProductEmails: toBool(body.newProductEmails),
      orderConfirmation: toBool(body.orderConfirmation),
      orderUpdates: toBool(body.orderUpdates),
      unsubscribedAll: toBool(body.unsubscribedAll),
    };

    const preferences = await prisma.emailPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
        emailVerified: false,
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 }
    );
  }
}
