"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, SkipForward } from "lucide-react";
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
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-500" />;
    case "skipped":
      return <SkipForward className="h-4 w-4 text-yellow-500" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

export function PathList({
  milestones,
  graphNodes,
  nodeProgress,
  onNodeClick,
}: PathListProps) {
  return (
    <Accordion type="multiple" className="space-y-4">
      {milestones.map((milestone) => {
        const milestoneTasks = milestone.tasks;
        const milestoneNodes = graphNodes.filter(
          (n) => n.milestoneId === milestone.id
        );
        const completedCount = milestoneNodes.filter(
          (n) => nodeProgress[n.id]?.status === "completed"
        ).length;

        return (
          <AccordionItem
            key={milestone.id}
            value={milestone.id}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <div className="font-medium">{milestone.title}</div>
                  <div className="text-sm text-muted-foreground">
                    第 {milestone.dayRange[0]}-{milestone.dayRange[1]} 天
                  </div>
                </div>
                <Badge variant="secondary">
                  {completedCount}/{milestoneTasks.length}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                {milestoneTasks.map((task) => {
                  const node = milestoneNodes.find((n) => n.taskId === task.id);
                  const status = node
                    ? nodeProgress[node.id]?.status || "pending"
                    : "pending";

                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <div>
                          <div className="font-medium text-sm">{task.desc}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.timeMinutes} 分钟
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => node && onNodeClick(node.id)}
                      >
                        查看
                      </Button>
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
