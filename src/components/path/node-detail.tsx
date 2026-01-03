"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Video,
  FileText,
  Book,
  ExternalLink,
  Clock,
  CheckCircle2,
  SkipForward,
  Loader2,
  Target,
} from "lucide-react";
import type { Task, Resource, NodeStatus } from "@/types";

interface NodeDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  status: NodeStatus;
  checklistDone: boolean[];
  onComplete: (checklistDone: boolean[]) => Promise<void>;
  onSkip: () => Promise<void>;
}

function ResourceIcon({ type }: { type: Resource["type"] }) {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4" />;
    case "doc":
      return <FileText className="h-4 w-4" />;
    case "tutorial":
      return <BookOpen className="h-4 w-4" />;
    case "book":
      return <Book className="h-4 w-4" />;
  }
}

export function NodeDetail({
  open,
  onOpenChange,
  task,
  status,
  checklistDone: initialChecklistDone,
  onComplete,
  onSkip,
}: NodeDetailProps) {
  const { toast } = useToast();
  const [checklistDone, setChecklistDone] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 关键修复：当 task 或 initialChecklistDone 变化时重置状态
  useEffect(() => {
    if (task) {
      // 确保 checklistDone 数组长度与 assessment 匹配
      const assessmentLength = task.assessment?.length || 0;
      if (initialChecklistDone.length === assessmentLength) {
        setChecklistDone([...initialChecklistDone]);
      } else {
        // 如果长度不匹配，根据任务的 assessment 初始化
        setChecklistDone(Array(assessmentLength).fill(false));
      }
    }
  }, [task, initialChecklistDone, open]);

  if (!task) return null;

  const handleChecklistChange = (index: number, checked: boolean) => {
    const newChecklist = [...checklistDone];
    newChecklist[index] = checked;
    setChecklistDone(newChecklist);
  };

  const handleComplete = async () => {
    const allChecked = checklistDone.length > 0 && checklistDone.every(Boolean);
    if (!allChecked) {
      toast({
        title: "请完成所有验证项",
        description: "确保你已经掌握了所有知识点",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onComplete(checklistDone);
      toast({
        title: "太棒了！",
        description: "节点已完成，继续加油！",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "操作失败",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onSkip();
      toast({
        title: "已跳过",
        description: "建议之后回来补充学习",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "操作失败",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCompleted = status === "completed";
  const isSkipped = status === "skipped";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl leading-tight">{task.desc}</DialogTitle>
            <Badge variant="secondary" className="gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {task.timeMinutes} 分钟
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* 学习资源 */}
          {task.resources && task.resources.length > 0 && (
            <div>
              <h4 className="mb-3 font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                推荐资源
              </h4>
              <div className="space-y-2">
                {task.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <ResourceIcon type={resource.type} />
                      <span className="text-sm">{resource.title}</span>
                    </div>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 完成目标 - 验收标准 */}
          {task.assessment && task.assessment.length > 0 && (
            <div>
              <h4 className="mb-3 font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                完成目标
                <span className="text-xs text-muted-foreground font-normal">
                  (学完本节需要达到的程度)
                </span>
              </h4>
              <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                {task.assessment.map((item, index) => (
                  <div key={`${task.id}-check-${index}`} className="flex items-start gap-3">
                    <Checkbox
                      id={`${task.id}-check-${index}`}
                      checked={checklistDone[index] || false}
                      onCheckedChange={(checked) =>
                        handleChecklistChange(index, checked === true)
                      }
                      disabled={isCompleted || isSkipped}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`${task.id}-check-${index}`}
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                勾选所有目标后点击"完成"按钮
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!isCompleted && !isSkipped && (
            <>
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isLoading}
                className="gap-2"
              >
                <SkipForward className="h-4 w-4" />
                跳过
              </Button>
              <Button onClick={handleComplete} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                完成
              </Button>
            </>
          )}
          {(isCompleted || isSkipped) && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
