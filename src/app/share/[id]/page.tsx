import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, CheckCircle2, Circle, SkipForward } from "lucide-react";
import type { Milestone, GraphNode, NodeStatus } from "@/types";

// 模拟数据（实际使用时从数据库获取）
const mockSharedPlan = {
  id: "1",
  goal: "掌握 React",
  description: "从零开始学习 React，掌握组件开发、状态管理等核心概念",
  totalDays: 30,
  dailyMinutes: 60,
  startDate: new Date("2025-12-20"),
  status: "active",
  isPublic: true,
  milestones: [
    {
      id: "m1",
      dayRange: [1, 7] as [number, number],
      title: "JavaScript 基础",
      description: "复习 JavaScript 核心知识",
      tasks: [
        { id: "t1", title: "ES6+语法", desc: "ES6+ 语法复习", objectives: ["理解ES6核心特性"], timeMinutes: 45, resources: [], assessment: [] },
        { id: "t2", title: "异步编程", desc: "异步编程", objectives: ["理解Promise和async/await"], timeMinutes: 60, resources: [], assessment: [] },
      ],
    },
    {
      id: "m2",
      dayRange: [8, 14] as [number, number],
      title: "React 基础",
      description: "学习 React 核心概念",
      tasks: [
        { id: "t3", title: "JSX与组件", desc: "JSX 与组件", objectives: ["理解JSX语法", "掌握组件创建"], timeMinutes: 50, resources: [], assessment: [] },
        { id: "t4", title: "React Hooks", desc: "React Hooks", objectives: ["掌握useState", "掌握useEffect"], timeMinutes: 60, resources: [], assessment: [] },
      ],
    },
  ] as Milestone[],
  nodeProgress: {
    n1: "completed",
    n2: "completed",
    n3: "in_progress",
    n4: "pending",
  } as Record<string, NodeStatus>,
};

function getStatusIcon(status: NodeStatus) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-yellow-500" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 实际使用时从数据库获取
  const plan = mockSharedPlan;

  if (!plan || !plan.isPublic) {
    notFound();
  }

  const totalTasks = plan.milestones.reduce(
    (acc, m) => acc + m.tasks.length,
    0
  );
  const completedTasks = Object.values(plan.nodeProgress).filter(
    (s) => s === "completed"
  ).length;
  const progress = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* 头部 */}
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">
            SkillForge 学习路径
          </Badge>
          <h1 className="text-3xl font-bold">{plan.goal}</h1>
          <p className="mt-2 text-muted-foreground">{plan.description}</p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {plan.totalDays} 天
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              每日 {plan.dailyMinutes} 分钟
            </span>
          </div>
        </div>

        {/* 进度 */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>学习进度</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-500">
                  {completedTasks}
                </div>
                <div className="text-sm text-muted-foreground">
                  / {totalTasks} 任务
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 里程碑列表 */}
        <div className="space-y-6">
          {plan.milestones.map((milestone, index) => {
            const milestoneTasks = milestone.tasks;
            const completedInMilestone = milestoneTasks.filter(
              (t) =>
                plan.nodeProgress[`n${index * 2 + 1}`] === "completed" ||
                plan.nodeProgress[`n${index * 2 + 2}`] === "completed"
            ).length;

            return (
              <Card key={milestone.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{milestone.title}</CardTitle>
                      <CardDescription>
                        第 {milestone.dayRange[0]}-{milestone.dayRange[1]} 天 ·{" "}
                        {milestone.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {completedInMilestone}/{milestoneTasks.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {milestoneTasks.map((task, taskIndex) => {
                      const nodeId = `n${index * 2 + taskIndex + 1}`;
                      const status = plan.nodeProgress[nodeId] || "pending";

                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          {getStatusIcon(status)}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{task.desc}</div>
                            <div className="text-xs text-muted-foreground">
                              {task.timeMinutes} 分钟
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 底部 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            由{" "}
            <a
              href="/"
              className="text-primary hover:underline"
            >
              SkillForge
            </a>{" "}
            生成
          </p>
        </div>
      </div>
    </div>
  );
}
