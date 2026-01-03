import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENT_DEFINITIONS } from "@/types";

export async function GET() {
  try {
    const userId = "demo-user";

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
    });

    return NextResponse.json({
      achievements,
      available: ACHIEVEMENT_DEFINITIONS,
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    return NextResponse.json(
      { error: "Failed to get achievements" },
      { status: 500 }
    );
  }
}
