"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Sparkles,
  Target,
  Clock,
  Calendar,
  GraduationCap,
  Zap,
  ArrowRight,
  CheckCircle2,
  Brain,
} from "lucide-react";
import type { LearningIntent } from "@/types";

const GOAL_SUGGESTIONS = [
  { label: "React", description: "前端框架" },
  { label: "TypeScript", description: "类型安全" },
  { label: "Python", description: "编程语言" },
  { label: "Node.js", description: "后端开发" },
  { label: "Vue.js", description: "前端框架" },
  { label: "机器学习", description: "AI/ML" },
  { label: "Go 语言", description: "系统编程" },
  { label: "Rust", description: "系统编程" },
  { label: "Docker", description: "容器化" },
  { label: "Kubernetes", description: "容器编排" },
];

const TIME_PRESETS = [
  { days: 7, label: "1 周速成", description: "快速入门" },
  { days: 14, label: "2 周计划", description: "基础掌握" },
  { days: 30, label: "1 月深入", description: "系统学习" },
  { days: 60, label: "2 月精通", description: "深度进阶" },
];

const DAILY_PRESETS = [
  { minutes: 30, label: "30分钟", description: "碎片时间" },
  { minutes: 60, label: "1小时", description: "日常学习" },
  { minutes: 120, label: "2小时", description: "深度学习" },
  { minutes: 180, label: "3小时", description: "全力冲刺" },
];

export default function NewPlanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<LearningIntent>({
    domain: "programming",
    goal: "",
    totalDays: 14,
    dailyMinutes: 60,
    experienceLevel: "beginner",
    currentLevel: "none",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.goal.trim()) {
      toast({
        title: "请输入学习目标",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. 生成计划
      const generateRes = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!generateRes.ok) {
        throw new Error("生成计划失败");
      }

      const { plan: generatedPlan } = await generateRes.json();

      // 2. 保存计划
      const saveRes = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: formData,
          plan: generatedPlan,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("保存计划失败");
      }

      const { id } = await saveRes.json();

      toast({
        title: "计划创建成功！",
        description: "AI 已为你生成个性化学习路径",
      });

      router.push(`/plans/${id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "创建失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalHours = Math.round((formData.totalDays * formData.dailyMinutes) / 60);

  return (
    <div className="mx-auto max-w-3xl py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Brain className="h-4 w-4" />
          AI 学习规划
        </div>
        <h1 className="text-3xl font-bold mb-2">创建你的学习计划</h1>
        <p className="text-muted-foreground">
          告诉我们你的目标，AI 将为你生成精确到每一天的学习路径
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-1 mx-2 rounded transition-colors ${
                  step > s ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Goal */}
        {step === 1 && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">第 1 步</span>
              </div>
              <CardTitle>你想学习什么？</CardTitle>
              <CardDescription>
                选择一个技能或输入自定义学习目标
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="goal">学习目标</Label>
                <Input
                  id="goal"
                  placeholder="例如：掌握 React 并能独立开发前端项目"
                  value={formData.goal}
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value })
                  }
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-muted-foreground">热门技能</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {GOAL_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, goal: `学习 ${suggestion.label}` })
                      }
                      className={`p-3 rounded-lg border text-left transition-all hover:border-primary hover:bg-primary/5 ${
                        formData.goal.includes(suggestion.label)
                          ? "border-primary bg-primary/10"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-sm">{suggestion.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {suggestion.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                className="w-full h-12"
                onClick={() => setStep(2)}
                disabled={!formData.goal.trim()}
              >
                下一步
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Time */}
        {step === 2 && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">第 2 步</span>
              </div>
              <CardTitle>你有多少时间？</CardTitle>
              <CardDescription>
                设置学习周期和每日学习时长
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 学习周期 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    学习周期
                  </Label>
                  <span className="font-semibold text-primary">
                    {formData.totalDays} 天
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, totalDays: preset.days })
                      }
                      className={`p-3 rounded-lg border text-center transition-all hover:border-primary ${
                        formData.totalDays === preset.days
                          ? "border-primary bg-primary/10"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-sm">{preset.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>

                <Slider
                  value={[formData.totalDays]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, totalDays: value })
                  }
                  min={7}
                  max={60}
                  step={1}
                  className="mt-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>7 天</span>
                  <span>60 天</span>
                </div>
              </div>

              {/* 每日时长 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    每日学习时间
                  </Label>
                  <span className="font-semibold text-primary">
                    {formData.dailyMinutes} 分钟
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {DAILY_PRESETS.map((preset) => (
                    <button
                      key={preset.minutes}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, dailyMinutes: preset.minutes })
                      }
                      className={`p-3 rounded-lg border text-center transition-all hover:border-primary ${
                        formData.dailyMinutes === preset.minutes
                          ? "border-primary bg-primary/10"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-sm">{preset.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {preset.description}
                      </div>
                    </button>
                  ))}
                </div>

                <Slider
                  value={[formData.dailyMinutes]}
                  onValueChange={([value]) =>
                    setFormData({ ...formData, dailyMinutes: value })
                  }
                  min={30}
                  max={240}
                  step={15}
                  className="mt-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30 分钟</span>
                  <span>4 小时</span>
                </div>
              </div>

              {/* 时间统计 */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">预计总学习时间</span>
                  <span className="font-semibold">约 {totalHours} 小时</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(1)}
                >
                  上一步
                </Button>
                <Button
                  type="button"
                  className="flex-1 h-12"
                  onClick={() => setStep(3)}
                >
                  下一步
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Experience */}
        {step === 3 && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary mb-2">
                <GraduationCap className="h-5 w-5" />
                <span className="text-sm font-medium">第 3 步</span>
              </div>
              <CardTitle>你的学习经验</CardTitle>
              <CardDescription>
                帮助 AI 为你生成合适难度的学习计划
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 目标水平 */}
              <div className="space-y-3">
                <Label>目标水平</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, experienceLevel: "beginner" })
                    }
                    className={`p-4 rounded-lg border text-left transition-all hover:border-primary ${
                      formData.experienceLevel === "beginner"
                        ? "border-primary bg-primary/10"
                        : ""
                    }`}
                  >
                    <div className="font-medium mb-1">初学者</div>
                    <div className="text-sm text-muted-foreground">
                      能够基础使用，完成简单任务
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, experienceLevel: "intermediate" })
                    }
                    className={`p-4 rounded-lg border text-left transition-all hover:border-primary ${
                      formData.experienceLevel === "intermediate"
                        ? "border-primary bg-primary/10"
                        : ""
                    }`}
                  >
                    <div className="font-medium mb-1">中级</div>
                    <div className="text-sm text-muted-foreground">
                      灵活运用，能独立负责项目
                    </div>
                  </button>
                </div>
              </div>

              {/* 当前水平 */}
              <div className="space-y-3">
                <Label>当前基础</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "none", label: "零基础", desc: "完全没有接触过" },
                    { value: "basic", label: "有概念", desc: "了解基础知识" },
                    { value: "some", label: "有经验", desc: "有实践经历" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          currentLevel: option.value as "none" | "basic" | "some",
                        })
                      }
                      className={`p-4 rounded-lg border text-left transition-all hover:border-primary ${
                        formData.currentLevel === option.value
                          ? "border-primary bg-primary/10"
                          : ""
                      }`}
                    >
                      <div className="font-medium mb-1">{option.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  学习计划预览
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">目标：</span>
                    <span className="font-medium ml-2">{formData.goal}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">周期：</span>
                    <span className="font-medium ml-2">{formData.totalDays} 天</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">每日时间：</span>
                    <span className="font-medium ml-2">{formData.dailyMinutes} 分钟</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">总时长：</span>
                    <span className="font-medium ml-2">约 {totalHours} 小时</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                >
                  上一步
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI 正在生成...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      生成学习计划
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-80">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="relative mx-auto w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-muted" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Brain className="absolute inset-0 m-auto h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI 正在规划你的学习路径</h3>
                  <p className="text-sm text-muted-foreground">
                    正在为 {formData.totalDays} 天生成每日任务...
                  </p>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    分析学习目标
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    生成知识点结构
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <Clock className="h-3 w-3" />
                    安排每日任务
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
