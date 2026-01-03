import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkinRequestSchema } from "@/lib/validators";
import { ACHIEVEMENT_TYPES } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, nodeId, status, checklistDone, notes } =
      checkinRequestSchema.parse(body);

    const userId = "demo-user";

    // 更新节点进度
    const progress = await prisma.nodeProgress.upsert({
      where: {
        planId_nodeId: { planId, nodeId },
      },
      update: {
        status,
        checklistDone: checklistDone || undefined,
        notes,
        completedAt: status === "completed" ? new Date() : undefined,
        startedAt:
          status === "in_progress"
            ? new Date()
            : undefined,
      },
      create: {
        planId,
        nodeId,
        status,
        checklistDone: checklistDone || undefined,
        notes,
        startedAt: status === "in_progress" ? new Date() : undefined,
        completedAt: status === "completed" ? new Date() : undefined,
      },
    });

    // 检查成就解锁
    const newAchievements = await checkAchievements(userId, planId);

    // 更新用户活跃状态和连续天数
    await updateUserStreak(userId);

    return NextResponse.json({ progress, newAchievements });
  } catch (error) {
    console.error("Checkin error:", error);
    return NextResponse.json(
      { error: "Failed to checkin" },
      { status: 500 }
    );
  }
}

async function checkAchievements(userId: string, planId: string) {
  const newAchievements = [];

  // 获取计划和进度
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    include: { nodeProgress: true },
  });

  if (!plan) return [];

  const completedNodes = plan.nodeProgress.filter(
    (np: { status: string }) => np.status === "completed"
  ).length;
  const totalNodes = plan.nodeProgress.length;

  // 检查 FIRST_DAY
  if (completedNodes >= 1) {
    const exists = await prisma.achievement.findUnique({
      where: {
        userId_type_planId: {
          userId,
          type: ACHIEVEMENT_TYPES.FIRST_DAY,
          planId,
        },
      },
    });
    if (!exists) {
      const achievement = await prisma.achievement.create({
        data: {
          userId,
          type: ACHIEVEMENT_TYPES.FIRST_DAY,
          planId,
        },
      });
      newAchievements.push(achievement);
    }
  }

  // 检查 PATH_COMPLETE
  if (completedNodes === totalNodes && totalNodes > 0) {
    const exists = await prisma.achievement.findUnique({
      where: {
        userId_type_planId: {
          userId,
          type: ACHIEVEMENT_TYPES.PATH_COMPLETE,
          planId,
        },
      },
    });
    if (!exists) {
      const achievement = await prisma.achievement.create({
        data: {
          userId,
          type: ACHIEVEMENT_TYPES.PATH_COMPLETE,
          planId,
        },
      });
      newAchievements.push(achievement);

      // 标记计划完成
      await prisma.plan.update({
        where: { id: planId },
        data: { status: "completed", completedAt: new Date() },
      });
    }
  }

  // 检查 EARLY_BIRD (跳过节点数 >= 3)
  const skippedNodes = plan.nodeProgress.filter(
    (np: { status: string }) => np.status === "skipped"
  ).length;
  if (skippedNodes >= 3) {
    const exists = await prisma.achievement.findUnique({
      where: {
        userId_type_planId: {
          userId,
          type: ACHIEVEMENT_TYPES.EARLY_BIRD,
          planId,
        },
      },
    });
    if (!exists) {
      const achievement = await prisma.achievement.create({
        data: {
          userId,
          type: ACHIEVEMENT_TYPES.EARLY_BIRD,
          planId,
        },
      });
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

async function updateUserStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.lastActiveAt
    ? new Date(user.lastActiveAt)
    : null;

  if (lastActive) {
    lastActive.setHours(0, 0, 0, 0);
  }

  let newStreak = user.currentStreak;

  if (!lastActive) {
    // 首次活跃
    newStreak = 1;
  } else {
    const diffDays = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      // 同一天，不更新
    } else if (diffDays === 1) {
      // 连续天
      newStreak = user.currentStreak + 1;
    } else {
      // 断了
      newStreak = 1;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastActiveAt: new Date(),
    },
  });

  // 检查连续7天成就
  if (newStreak >= 7) {
    const exists = await prisma.achievement.findFirst({
      where: {
        userId,
        type: ACHIEVEMENT_TYPES.STREAK_7,
      },
    });
    if (!exists) {
      await prisma.achievement.create({
        data: {
          userId,
          type: ACHIEVEMENT_TYPES.STREAK_7,
        },
      });
    }
  }
}
