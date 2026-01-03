"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  SkipForward, 
  Target,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import type { Milestone, GraphNode, NodeStatus } from "@/types";

interface PathListProps {
  milestones: Milestone[];
  graphNodes: GraphNode[];
  nodeProgress: Record<string, { status: NodeStatus; checklistDone: boolean[] }>;
  onNodeClick: (nodeId: string) => void;
}

function getStatusIcon(status: NodeStatus) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-500 shrink-0" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-yellow-500 shrink-0" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground shrink-0" />;
  }
}

function getStatusBadge(status: NodeStatus) {
  switch (status) {
    case "completed":
      return <Badge variant="default" className="bg-green-500 text-xs">已完成</Badge>;
    case "in_progress":
      return <Badge variant="default" className="bg-blue-500 text-xs">进行中</Badge>;
    case "skipped":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">已跳过</Badge>;
    default:
      return null;
  }
}

export function PathList({
  milestones,
  graphNodes,
  nodeProgress,
  onNodeClick,
}: PathListProps) {
  return (
    <Accordion type="multiple" className="space-y-4" defaultValue={milestones.map(m => m.id)}>
      {milestones.map((milestone) => {
        const milestoneTasks = milestone.tasks;
        const milestoneNodes = graphNodes.filter(
          (n) => n.milestoneId === milestone.id
        );
        const completedCount = milestoneNodes.filter(
          (n) => nodeProgress[n.id]?.status === "completed"
        ).length;
        const skippedCount = milestoneNodes.filter(
          (n) => nodeProgress[n.id]?.status === "skipped"
        ).length;
        const progressPercent = milestoneTasks.length > 0 
          ? Math.round((completedCount / milestoneTasks.length) * 100) 
          : 0;

        return (
          <AccordionItem
            key={milestone.id}
            value={milestone.id}
            className="border rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-accent/30">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-left flex-1">
                  <div className="font-medium text-base">{milestone.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {milestone.description}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground">
                      Day {milestone.dayRange[0]}-{milestone.dayRange[1]}
                    </span>
                    <Progress value={progressPercent} className="w-24 h-1.5" />
                    <span className="text-xs text-muted-foreground">
                      {completedCount}/{milestoneTasks.length} 完成
                      {skippedCount > 0 && ` / ${skippedCount} 跳过`}
                    </span>
                  </div>
                </div>
                <Badge 
                  variant={completedCount === milestoneTasks.length ? "default" : "secondary"}
                  className={completedCount === milestoneTasks.length ? "bg-green-500" : ""}
                >
                  {progressPercent}%
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {milestoneTasks.map((task) => {
                  const node = milestoneNodes.find((n) => n.taskId === task.id);
                  const status = node
                    ? nodeProgress[node.id]?.status || "pending"
                    : "pending";
                  const progress = node ? nodeProgress[node.id] : null;
                  const checkedCount = progress?.checklistDone?.filter(Boolean).length || 0;
                  const totalChecks = task.assessment?.length || 0;

                  // 兼容新旧数据结构
                  const taskTitle = task.title || task.desc.split("\n")[0].replace(/^【.*?】/, "").substring(0, 30);
                  const objectives = task.objectives || [];
                  const firstObjective = objectives[0] || (task.assessment?.[0] ? `目标: ${task.assessment[0].substring(0, 40)}...` : "");

                  return (
                    <div
                      key={task.id}
                      onClick={() => node && onNodeClick(node.id)}
                      className={`
                        rounded-lg border p-4 cursor-pointer transition-all
                        hover:border-primary/50 hover:shadow-sm
                        ${status === "completed" ? "bg-green-50/50 border-green-200" : ""}
                        ${status === "skipped" ? "bg-yellow-50/50 border-yellow-200" : ""}
                      `}
                    >
                      {/* 头部：标题、时间、状态 */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getStatusIcon(status)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {taskTitle}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.timeMinutes} 分钟
                              </span>
                              {totalChecks > 0 && (
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {checkedCount}/{totalChecks} 验收项
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getStatusBadge(status)}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      {/* 学习目标预览 */}
                      {firstObjective && status === "pending" && (
                        <div className="mt-3 pl-7 flex items-start gap-2 text-xs text-muted-foreground">
                          <Lightbulb className="h-3 w-3 mt-0.5 text-blue-400 shrink-0" />
                          <span className="line-clamp-1">{firstObjective}</span>
                        </div>
                      )}

                      {/* 进度条（仅进行中的任务） */}
                      {status === "in_progress" && totalChecks > 0 && (
                        <div className="mt-3 pl-7">
                          <Progress 
                            value={(checkedCount / totalChecks) * 100} 
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
