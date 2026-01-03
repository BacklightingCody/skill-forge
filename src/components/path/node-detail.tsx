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
  Lightbulb,
  ClipboardCheck,
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

function ResourceTypeBadge({ type }: { type: Resource["type"] }) {
  const labels = {
    video: "视频",
    doc: "文档",
    tutorial: "教程",
    book: "书籍",
  };
  return (
    <Badge variant="outline" className="text-xs">
      {labels[type]}
    </Badge>
  );
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
        title: "请完成所有验收项",
        description: "确保你已经达到了所有验收标准",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onComplete(checklistDone);
      toast({
        title: "太棒了！",
        description: "任务已完成，继续加油！",
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
  const checkedCount = checklistDone.filter(Boolean).length;
  const totalCount = task.assessment?.length || 0;

  // 兼容旧数据：如果没有 title 字段，从 desc 中提取
  const taskTitle = task.title || task.desc.split("\n")[0].replace(/^【.*?】/, "").trim();
  // 兼容旧数据：如果没有 objectives 字段，使用空数组
  const objectives = task.objectives || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          {/* 标题和时间 */}
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl leading-tight pr-4">
              {taskTitle}
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              {task.timeMinutes} 分钟
            </Badge>
          </div>
          
          {/* 状态指示 */}
          {(isCompleted || isSkipped) && (
            <div className="flex items-center gap-2">
              {isCompleted && (
                <Badge variant="default" className="bg-green-500 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  已完成
                </Badge>
              )}
              {isSkipped && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 gap-1">
                  <SkipForward className="h-3 w-3" />
                  已跳过
                </Badge>
              )}
            </div>
          )}

          {/* 详细描述 */}
          {task.desc && task.desc !== taskTitle && (
            <DialogDescription className="text-sm leading-relaxed whitespace-pre-wrap">
              {task.desc.replace(/^【.*?】[^\n]*\n*/, "").trim()}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 学习目标 - 新增板块 */}
          {objectives.length > 0 && (
            <div className="rounded-lg border bg-blue-50/50 p-4">
              <h4 className="mb-3 font-medium flex items-center gap-2 text-blue-700">
                <Lightbulb className="h-4 w-4" />
                学习目标
                <span className="text-xs text-blue-500 font-normal">
                  学完后你将理解/掌握
                </span>
              </h4>
              <ul className="space-y-2">
                {objectives.map((objective, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 text-sm text-blue-900"
                  >
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 学习资源 */}
          {task.resources && task.resources.length > 0 && (
            <div>
              <h4 className="mb-3 font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                推荐资源
              </h4>
              <div className="space-y-2">
                {task.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <ResourceIcon type={resource.type} />
                      <span className="text-sm truncate">{resource.title}</span>
                      <ResourceTypeBadge type={resource.type} />
                    </div>
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 ml-2 shrink-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 验收标准 - 核心板块 */}
          {task.assessment && task.assessment.length > 0 && (
            <div className="rounded-lg border bg-amber-50/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2 text-amber-700">
                  <ClipboardCheck className="h-4 w-4" />
                  验收标准
                  <span className="text-xs text-amber-500 font-normal">
                    完成以下所有项即可标记完成
                  </span>
                </h4>
                {!isCompleted && !isSkipped && (
                  <Badge 
                    variant={checkedCount === totalCount ? "default" : "outline"}
                    className={checkedCount === totalCount ? "bg-green-500" : ""}
                  >
                    {checkedCount}/{totalCount}
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                {task.assessment.map((item, index) => (
                  <div 
                    key={`${task.id}-check-${index}`} 
                    className="flex items-start gap-3 p-2 rounded hover:bg-amber-100/50 transition-colors"
                  >
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
                      className={`text-sm leading-relaxed cursor-pointer flex-1 ${
                        checklistDone[index] ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {item}
                    </label>
                  </div>
                ))}
              </div>
              {!isCompleted && !isSkipped && (
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  勾选所有验收项后点击"完成"按钮
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
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
              <Button 
                onClick={handleComplete} 
                disabled={isLoading || checkedCount < totalCount} 
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                完成 ({checkedCount}/{totalCount})
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
