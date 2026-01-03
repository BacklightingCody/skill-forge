import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Circle, Clock } from "lucide-react";

import type { NodeStatus } from "@/types";

// 模拟数据 - 实际使用时从 API 获取
const mockTodayTasks: Array<{
  id: string;
  planId: string;
  title: string;
  description: string;
  timeMinutes: number;
  status: NodeStatus;
  assessment: string[];
}> = [
  {
    id: "1",
    planId: "plan1",
    title: "学习 React Hooks 基础",
    description: "理解 useState 和 useEffect 的使用",
    timeMinutes: 45,
    status: "pending",
    assessment: [
      "能解释 useState 的工作原理",
      "完成了一个计数器组件",
      "理解 useEffect 的依赖数组",
    ],
  },
  {
    id: "2",
    planId: "plan1",
    title: "完成 useState 练习",
    description: "实现一个简单的待办事项列表",
    timeMinutes: 30,
    status: "pending",
    assessment: [
      "完成待办事项的添加功能",
      "完成待办事项的删除功能",
      "完成待办事项的状态切换",
    ],
  },
];

const mockStats = {
  todayCompleted: 0,
  todayTotal: 2,
  overallProgress: 35,
  currentStreak: 7,
};

export default function TodayPage() {
  const hasPlan = mockTodayTasks.length > 0;

  if (!hasPlan) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">开始你的学习之旅</h2>
          <p className="mt-2 text-muted-foreground">
            创建一个学习计划，AI 将为你生成个性化的学习路径
          </p>
          <Link href="/plans/new" className="mt-6 inline-block">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              创建学习计划
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 激励横幅 */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                坚持就是胜利！
              </h2>
              <p className="text-muted-foreground">
                你已经连续学习 {mockStats.currentStreak} 天了，继续保持！
              </p>
            </div>
            <div className="text-4xl font-bold text-primary">
              {mockStats.currentStreak}
              <span className="text-lg text-muted-foreground ml-1">天</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 今日任务 */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">今日任务</h3>
        <div className="space-y-4">
          {mockTodayTasks.map((task) => (
            <Card key={task.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {task.status === "completed" ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">{task.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {task.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {task.timeMinutes} 分钟
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="ml-8">
                  <p className="mb-2 text-sm text-muted-foreground">完成验证：</p>
                  <ul className="space-y-1">
                    {task.assessment.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Circle className="h-3 w-3 text-muted-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-end">
                    <Link href={`/plans/${task.planId}?node=${task.id}`}>
                      <Button size="sm">查看详情</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 进度统计 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress
                value={(mockStats.todayCompleted / mockStats.todayTotal) * 100}
                className="flex-1"
              />
              <span className="text-sm font-medium">
                {mockStats.todayCompleted}/{mockStats.todayTotal}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总体进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={mockStats.overallProgress} className="flex-1" />
              <span className="text-sm font-medium">
                {mockStats.overallProgress}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
