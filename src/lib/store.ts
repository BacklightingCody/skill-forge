// 内存存储（MVP 阶段，后续接入数据库）
// 使用 globalThis 确保在 Next.js 开发模式下单例

export interface StoredPlan {
  id: string;
  userId: string;
  domain: string;
  goal: string;
  totalDays: number;
  dailyMinutes: number;
  experienceLevel: string;
  currentLevel: string;
  milestones: unknown;
  graphData: unknown;
  status: string;
  startDate: Date;
  createdAt: Date;
  nodeProgress: { nodeId: string; status: string }[];
}

// 声明全局变量类型
declare global {
  // eslint-disable-next-line no-var
  var __inMemoryPlans: Map<string, StoredPlan> | undefined;
}

// 确保在 Next.js 热重载时保持数据
function getInMemoryPlans(): Map<string, StoredPlan> {
  if (!globalThis.__inMemoryPlans) {
    globalThis.__inMemoryPlans = new Map<string, StoredPlan>();
    console.log("Created new in-memory plans store");
  }
  return globalThis.__inMemoryPlans;
}

export const inMemoryPlans = getInMemoryPlans();
