"use client";

import { useState, useMemo, use, useEffect } from "react";
import { PathGraph } from "@/components/path/path-graph";
import { NodeDetail } from "@/components/path/node-detail";
import { PathList } from "@/components/path/path-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Share2, Calendar, Clock, Pause, Play, Loader2, AlertCircle } from "lucide-react";
import type { Task, GraphNode, NodeStatus, Milestone, GraphData } from "@/types";

interface PlanData {
  id: string;
  goal: string;
  description?: string;
  totalDays: number;
  dailyMinutes: number;
  startDate: string;
  status: string;
  milestones: Milestone[];
  graphData: GraphData;
  nodeProgress: { nodeId: string; status: string }[];
}

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeProgress, setNodeProgress] = useState<Record<string, { status: NodeStatus; checklistDone: boolean[] }>>({});

  // 从 API 获取计划数据
  useEffect(() => {
    async function fetchPlan() {
      try {
        setLoading(true);
        const res = await fetch(`/api/plans/${id}`);
        if (!res.ok) {
          throw new Error("计划不存在或加载失败");
        }
        const data = await res.json();
        setPlan(data.plan);

        // 初始化节点进度
        const initialProgress: Record<string, { status: NodeStatus; checklistDone: boolean[] }> = {};
        data.plan.nodeProgress?.forEach((np: { nodeId: string; status: string }) => {
          const node = data.plan.graphData.nodes.find((n: GraphNode) => n.id === np.nodeId);
          const milestone = data.plan.milestones.find((m: Milestone) => m.id === node?.milestoneId);
          const task = milestone?.tasks.find((t: Task) => t.id === node?.taskId);
          const checklistLength = task?.assessment?.length || 3;

          initialProgress[np.nodeId] = {
            status: np.status as NodeStatus,
            checklistDone: Array(checklistLength).fill(np.status === "completed"),
          };
        });
        setNodeProgress(initialProgress);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [id]);

  const nodeProgressMap = useMemo(
    () => new Map(Object.entries(nodeProgress).map(([k, v]) => [k, v.status])),
    [nodeProgress]
  );

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !plan) return null;
    const graphNode = plan.graphData.nodes.find((n) => n.id === selectedNodeId);
    if (!graphNode) return null;

    // 找到对应的 task
    for (const milestone of plan.milestones) {
      const task = milestone.tasks.find((t) => t.id === graphNode.taskId);
      if (task) return { graphNode, task };
    }
    return null;
  }, [selectedNodeId, plan]);

  const stats = useMemo(() => {
    if (!plan) return { total: 0, completed: 0, skipped: 0, progress: 0 };

    const total = plan.graphData.nodes.length;
    const completed = Object.values(nodeProgress).filter(
      (p) => p.status === "completed"
    ).length;
    const skipped = Object.values(nodeProgress).filter(
      (p) => p.status === "skipped"
    ).length;
    return {
      total,
      completed,
      skipped,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [nodeProgress, plan]);

  const handleComplete = async (checklistDone: boolean[]) => {
    if (!selectedNodeId) return;
    setNodeProgress((prev) => ({
      ...prev,
      [selectedNodeId]: { status: "completed", checklistDone },
    }));
  };

  const handleSkip = async () => {
    if (!selectedNodeId) return;
    setNodeProgress((prev) => ({
      ...prev,
      [selectedNodeId]: {
        ...prev[selectedNodeId],
        status: "skipped",
      },
    }));
  };

  // 加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">加载学习计划中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h2 className="text-lg font-semibold">加载失败</h2>
              <p className="text-muted-foreground">{error || "计划不存在"}</p>
              <Button onClick={() => window.location.href = "/plans/new"}>
                创建新计划
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{plan.goal}</h1>
          <p className="text-muted-foreground mt-1">{plan.description || `${plan.totalDays} 天学习计划`}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {plan.totalDays} 天
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              每日 {plan.dailyMinutes} 分钟
            </span>
            <Badge variant={plan.status === "active" ? "default" : "secondary"}>
              {plan.status === "active" ? "进行中" : plan.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            {plan.status === "active" ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 进度统计 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>总体进度</span>
                <span className="font-medium">{stats.progress}%</span>
              </div>
              <Progress value={stats.progress} />
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {stats.completed}
                </div>
                <div className="text-muted-foreground">已完成</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {stats.skipped}
                </div>
                <div className="text-muted-foreground">已跳过</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-muted-foreground">总计</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 路径视图切换 */}
      <Tabs defaultValue="graph">
        <TabsList>
          <TabsTrigger value="graph">路径图</TabsTrigger>
          <TabsTrigger value="list">列表视图</TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="mt-4">
          <PathGraph
            nodes={plan.graphData.nodes}
            edges={plan.graphData.edges}
            nodeProgress={nodeProgressMap}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId)}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <PathList
            milestones={plan.milestones}
            graphNodes={plan.graphData.nodes}
            nodeProgress={nodeProgress}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId)}
          />
        </TabsContent>
      </Tabs>

      {/* 节点详情弹窗 */}
      <NodeDetail
        open={!!selectedNodeId}
        onOpenChange={(open) => !open && setSelectedNodeId(null)}
        task={selectedNode?.task || null}
        status={selectedNodeId ? nodeProgress[selectedNodeId]?.status || "pending" : "pending"}
        checklistDone={
          selectedNodeId
            ? nodeProgress[selectedNodeId]?.checklistDone || []
            : []
        }
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}
