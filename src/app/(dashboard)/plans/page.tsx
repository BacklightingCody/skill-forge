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
import { Plus, Calendar, Clock, ArrowRight } from "lucide-react";

// 模拟数据
const mockPlans = [
  {
    id: "1",
    goal: "掌握 React",
    totalDays: 30,
    dailyMinutes: 60,
    startDate: new Date("2025-12-20"),
    status: "active",
    progress: 35,
    currentDay: 13,
  },
  {
    id: "2",
    goal: "学习 TypeScript",
    totalDays: 14,
    dailyMinutes: 45,
    startDate: new Date("2025-12-01"),
    status: "completed",
    progress: 100,
    currentDay: 14,
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="default">进行中</Badge>;
    case "completed":
      return <Badge variant="secondary">已完成</Badge>;
    case "paused":
      return <Badge variant="outline">已暂停</Badge>;
    default:
      return null;
  }
}

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">学习路径</h1>
          <p className="text-muted-foreground">管理你的所有学习计划</p>
        </div>
        <Link href="/plans/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            新建计划
          </Button>
        </Link>
      </div>

      {mockPlans.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-muted-foreground">还没有学习计划</p>
          <Link href="/plans/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              创建第一个计划
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockPlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{plan.goal}</CardTitle>
                  {getStatusBadge(plan.status)}
                </div>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {plan.totalDays} 天
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    每日 {plan.dailyMinutes} 分钟
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        第 {plan.currentDay} / {plan.totalDays} 天
                      </span>
                      <span className="font-medium">{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} />
                  </div>
                  <Link href={`/plans/${plan.id}`}>
                    <Button variant="outline" className="w-full gap-2">
                      查看详情
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
