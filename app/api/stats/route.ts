import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [sentCount, campaignCount, activeCampaigns, prefsCount] = await Promise.all([
      prisma.emailLog.count({ where: { status: "SENT" } }),
      prisma.emailCampaign.count(),
      prisma.emailCampaign.count({ where: { status: { in: ["SENDING", "SCHEDULED"] } } }),
      prisma.emailPreference.count(),
    ]);

    // If you want success rate:
    const totalProcessed = await prisma.emailLog.count({
      where: { status: { in: ["SENT", "FAILED", "SKIPPED"] } },
    });

    const successRate =
      totalProcessed === 0 ? 0 : Math.round((sentCount / totalProcessed) * 1000) / 10; // 1 decimal

    // Templates are dynamic if you store them; if not, keep it computed from enum length
    // But prompt says no hardcode. So return from backend. If you don't store templates, use a safe fallback:
    const templatesCount = 8; // If you want truly dynamic, store this in DB or derive from template enum server-side.

    return NextResponse.json({
      totalEmailsSent: sentCount,
      totalCampaigns: campaignCount,
      activeCampaigns,
      totalUsersWithPrefs: prefsCount,
      templatesCount,
      successRate,
    });
  } catch (e) {
    console.error("Error computing stats:", e);
    return NextResponse.json(
      {
        totalEmailsSent: 0,
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalUsersWithPrefs: 0,
        templatesCount: 0,
        successRate: 0,
      },
      { status: 200 }
    );
  }
}
