import { NextRequest, NextResponse } from "next/server";
import { validateLearningIntent, generatedPlanSchema } from "@/lib/validators";
import { inMemoryPlans } from "@/lib/store";

// 创建计划
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intent, plan: generatedPlan } = body;

    // 验证输入
    const validIntent = validateLearningIntent(intent);
    const validPlan = generatedPlanSchema.parse(generatedPlan);

    // 生成唯一 ID
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = "demo-user";

    // 初始化节点进度
    const nodeProgress = validPlan.graphData.nodes.map((node) => ({
      nodeId: node.id,
      status: "pending",
    }));

    // 存储到内存
    const plan = {
      id: planId,
      userId,
      domain: validIntent.domain,
      goal: validIntent.goal,
      totalDays: validIntent.totalDays,
      dailyMinutes: validIntent.dailyMinutes,
      experienceLevel: validIntent.experienceLevel,
      currentLevel: validIntent.currentLevel,
      milestones: validPlan.milestones,
      graphData: validPlan.graphData,
      status: "active",
      startDate: new Date(),
      createdAt: new Date(),
      nodeProgress,
    };

    inMemoryPlans.set(planId, plan);

    console.log(`Plan created: ${planId}, total plans in memory: ${inMemoryPlans.size}`);

    return NextResponse.json({ id: planId });
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}

// 获取计划列表
export async function GET() {
  try {
    const plans = Array.from(inMemoryPlans.values());

    // 计算进度
    const plansWithStats = plans.map((plan) => {
      const totalNodes = plan.nodeProgress.length;
      const completedNodes = plan.nodeProgress.filter(
        (np) => np.status === "completed"
      ).length;
      const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

      const startDate = new Date(plan.startDate);
      const now = new Date();
      const currentDay = Math.max(
        1,
        Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        ...plan,
        progress,
        currentDay,
      };
    });

    return NextResponse.json({ plans: plansWithStats });
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json(
      { error: "Failed to get plans" },
      { status: 500 }
    );
  }
}
