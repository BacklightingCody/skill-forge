import { z } from "zod";
import type {
  LearningIntent,
  Milestone,
  GraphNode,
  GraphEdge,
  GeneratedPlan,
} from "@/types";

// 学习意图验证
export const learningIntentSchema = z.object({
  domain: z.literal("programming"),
  goal: z.string().min(2).max(200),
  totalDays: z.number().int().min(7).max(60),
  dailyMinutes: z.number().int().min(30).max(240),
  experienceLevel: z.enum(["beginner", "intermediate"]),
  currentLevel: z.enum(["none", "basic", "some"]),
});

export function validateLearningIntent(data: unknown): LearningIntent {
  return learningIntentSchema.parse(data);
}

// 资源验证
const resourceSchema = z.object({
  type: z.enum(["doc", "video", "tutorial", "book"]),
  title: z.string(),
  url: z.string().optional(),
});

// 任务验证
const taskSchema = z.object({
  id: z.string(),
  desc: z.string(),
  timeMinutes: z.number().int().min(5).max(120),
  resources: z.array(resourceSchema),
  assessment: z.array(z.string()).min(1).max(10),
});

// 里程碑验证
const milestoneSchema = z.object({
  id: z.string(),
  dayRange: z.tuple([z.number().int().min(1), z.number().int()]),
  title: z.string(),
  description: z.string(),
  tasks: z.array(taskSchema).min(1),
});

// 图节点验证
const graphNodeSchema = z.object({
  id: z.string(),
  milestoneId: z.string(),
  taskId: z.string().optional(),
  label: z.string(),
  type: z.enum(["milestone", "task"]),
  day: z.number().int().min(1),
  dependencies: z.array(z.string()),
  position: z
    .object({
      x: z.number(),
      y: z.number(),
    })
    .optional(),
});

// 图边验证
const graphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

// 生成的计划验证
export const generatedPlanSchema = z.object({
  milestones: z.array(milestoneSchema).min(1),
  graphData: z.object({
    nodes: z.array(graphNodeSchema).min(1),
    edges: z.array(graphEdgeSchema),
  }),
});

export function validateGeneratedPlan(data: unknown): GeneratedPlan {
  return generatedPlanSchema.parse(data);
}

// 打卡请求验证
export const checkinRequestSchema = z.object({
  planId: z.string(),
  nodeId: z.string(),
  status: z.enum(["pending", "in_progress", "completed", "skipped"]),
  checklistDone: z.array(z.boolean()).optional(),
  notes: z.string().optional(),
});

export type CheckinRequest = z.infer<typeof checkinRequestSchema>;
