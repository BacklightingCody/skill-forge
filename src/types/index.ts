// ============ 输入类型 ============

export type Domain = "programming";
export type ExperienceLevel = "beginner" | "intermediate";
export type CurrentLevel = "none" | "basic" | "some";
export type NodeStatus = "pending" | "in_progress" | "completed" | "skipped";
export type PlanStatus = "active" | "paused" | "completed" | "abandoned";

export interface LearningIntent {
  domain: Domain;
  goal: string;
  totalDays: number;
  dailyMinutes: number;
  experienceLevel: ExperienceLevel;
  currentLevel: CurrentLevel;
}

// ============ AI 生成的结构 ============

export interface Resource {
  type: "doc" | "video" | "tutorial" | "book";
  title: string;
  url?: string;
}

export interface Task {
  id: string;
  title: string;           // 简短标题，用于节点展示（如："学习变量与数据类型"）
  desc: string;            // 详细描述
  objectives: string[];    // 学习目标：学完这个任务后应该能理解/掌握什么
  timeMinutes: number;
  resources: Resource[];
  assessment: string[];    // 验收标准：具体的、可验证的检验项
}

export interface Milestone {
  id: string;
  dayRange: [number, number];
  title: string;
  description: string;
  tasks: Task[];
}

export interface GraphNode {
  id: string;
  milestoneId: string;
  taskId?: string;
  label: string;
  type: "milestone" | "task";
  day: number;
  dependencies: string[];
  position?: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GeneratedPlan {
  milestones: Milestone[];
  graphData: GraphData;
}

// ============ 数据库模型类型 ============

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  userId: string;
  domain: string;
  goal: string;
  description?: string | null;
  totalDays: number;
  dailyMinutes: number;
  startDate: Date;
  experienceLevel: string;
  currentLevel: string;
  milestones: Milestone[];
  graphData: GraphData;
  status: PlanStatus;
  completedAt?: Date | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NodeProgress {
  id: string;
  planId: string;
  nodeId: string;
  status: NodeStatus;
  checklistDone?: boolean[] | null;
  notes?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  planId?: string | null;
  metadata?: Record<string, unknown> | null;
  unlockedAt: Date;
}

export interface ManualSkill {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  level: number;
  createdAt: Date;
}

// ============ 运行时类型 ============

export interface PlanWithProgress extends Plan {
  nodeProgress: NodeProgress[];
}

export interface PlanStats {
  totalNodes: number;
  completedNodes: number;
  skippedNodes: number;
  progressPercent: number;
  currentDay: number;
  daysRemaining: number;
}

// ============ 成就类型 ============

export const ACHIEVEMENT_TYPES = {
  FIRST_DAY: "first_day",
  STREAK_7: "streak_7",
  PATH_COMPLETE: "path_complete",
  EARLY_BIRD: "early_bird",
  SKILL_BASIC: "skill_basic",
  PERSIST_30: "persist_30",
} as const;

export type AchievementType = typeof ACHIEVEMENT_TYPES[keyof typeof ACHIEVEMENT_TYPES];

export interface AchievementDef {
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  {
    type: ACHIEVEMENT_TYPES.FIRST_DAY,
    name: "第一步",
    description: "完成第1天任务",
    icon: "star",
    tier: "bronze",
  },
  {
    type: ACHIEVEMENT_TYPES.STREAK_7,
    name: "坚持一周",
    description: "连续打卡7天",
    icon: "flame",
    tier: "silver",
  },
  {
    type: ACHIEVEMENT_TYPES.PATH_COMPLETE,
    name: "路径大师",
    description: "完成整个学习路径",
    icon: "trophy",
    tier: "gold",
  },
  {
    type: ACHIEVEMENT_TYPES.EARLY_BIRD,
    name: "快人一步",
    description: "提前完成3个节点",
    icon: "zap",
    tier: "bronze",
  },
  {
    type: ACHIEVEMENT_TYPES.SKILL_BASIC,
    name: "基础扎实",
    description: "完成基础技能组",
    icon: "book",
    tier: "silver",
  },
  {
    type: ACHIEVEMENT_TYPES.PERSIST_30,
    name: "三十而立",
    description: "累计学习30天",
    icon: "medal",
    tier: "gold",
  },
];

// ============ API 响应类型 ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GeneratePlanResponse {
  plan: GeneratedPlan;
}

export interface CreatePlanResponse {
  id: string;
}

export interface CheckinResponse {
  progress: NodeProgress;
  newAchievements?: Achievement[];
}
