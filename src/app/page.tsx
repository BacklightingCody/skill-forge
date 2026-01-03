import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sparkles,
  Map,
  Trophy,
  Share2,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  Brain,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  BookOpen,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI 智能规划",
    description: "输入学习目标，AI 为你生成每日具体任务，精确到每一天的学习内容",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Map,
    title: "可视化路径",
    description: "直观的知识图谱展示学习进度，支持并行和依赖学习路线",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Trophy,
    title: "成就激励",
    description: "完成里程碑解锁成就徽章，连续打卡获得特殊奖励",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Share2,
    title: "技能展示",
    description: "将掌握的技能沉淀为可分享的能力资产，构建你的技能档案",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const steps = [
  {
    icon: Target,
    title: "设定目标",
    description: "输入你想学习的技能和可用时间",
  },
  {
    icon: Sparkles,
    title: "AI 规划",
    description: "智能生成每日具体学习任务",
  },
  {
    icon: CheckCircle2,
    title: "每日打卡",
    description: "完成任务，验证学习成果",
  },
  {
    icon: TrendingUp,
    title: "持续成长",
    description: "解锁成就，沉淀技能资产",
  },
];

const stats = [
  { value: "10,000+", label: "学习计划已生成", icon: BookOpen },
  { value: "50,000+", label: "任务已完成", icon: CheckCircle2 },
  { value: "95%", label: "用户满意度", icon: Users },
  { value: "24/7", label: "AI 随时可用", icon: Clock },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 animate-ping">
                <Sparkles className="h-6 w-6 text-primary opacity-30" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
              SkillForge
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              我的计划
            </Link>
            <Link href="/plans/new">
              <Button className="shadow-lg shadow-primary/25">开始使用</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            AI 驱动的学习规划系统
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            让学习目标
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
              可追踪、可验证、可展示
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            SkillForge 为你生成<strong className="text-foreground">精确到每一天</strong>的学习计划，
            通过可视化路径图追踪进度，让每一步学习都清晰可见。
            告别盲目学习，让 AI 成为你的专属学习规划师。
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/plans/new">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 h-12 px-8 text-base">
                免费创建学习计划
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/share/demo">
              <Button size="lg" variant="outline" className="gap-2 h-12 px-8 text-base">
                <Map className="h-4 w-4" />
                查看示例计划
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">为什么选择 SkillForge</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              不同于传统的学习计划工具，我们用 AI 为你量身定制每一天的学习任务
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-muted/50 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <CardHeader>
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">简单四步，开启学习之旅</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              从设定目标到持续成长，每一步都有 AI 陪伴
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/10" />
                )}
                <div className="relative text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary text-xs font-bold text-primary">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Differentiator */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-6">
                <Calendar className="h-4 w-4" />
                核心特色
              </div>
              <h2 className="text-3xl font-bold mb-6">
                精确到每一天的学习规划
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                不再是笼统的学习建议，SkillForge 为你生成的计划精确到每一天：
                <br /><br />
                选择学习 14 天，就有 14 天的具体任务安排；
                选择学习 30 天，就有 30 天的详细规划。
                每个任务都有明确的学习时长、推荐资源和验证检查项。
              </p>
              <ul className="space-y-4">
                {[
                  "每天具体学习任务，不遗漏任何一天",
                  "任务时长适配你的每日可用时间",
                  "循序渐进，知识点层层递进",
                  "可视化路径图，进度一目了然",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-card rounded-2xl border shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">学习计划示例</h3>
                  <span className="text-xs text-muted-foreground">14天 React 入门</span>
                </div>
                {[
                  { day: 1, task: "JavaScript ES6+ 语法复习", time: "45min" },
                  { day: 2, task: "异步编程与 Promise", time: "60min" },
                  { day: 3, task: "React 环境搭建", time: "30min" },
                  { day: 4, task: "JSX 语法与组件基础", time: "50min" },
                  { day: 5, task: "Props 与组件通信", time: "45min" },
                  { day: "...", task: "更多任务...", time: "" },
                  { day: 14, task: "综合项目实战", time: "90min" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                      item.day === 1 ? "bg-primary/10" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                      item.day === 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {item.day}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.task}</p>
                    </div>
                    {item.time && (
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-violet-500 to-purple-500 p-12 text-center text-white">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">准备好开始学习了吗？</h2>
              <p className="mx-auto max-w-xl opacity-90 mb-8">
                加入 SkillForge，让 AI 帮你规划学习路径，追踪学习进度，
                把每一个学习目标变成可实现的每日任务。
              </p>
              <Link href="/plans/new">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 h-12 px-8 text-base shadow-lg"
                >
                  免费开始
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>SkillForge</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Tailwind CSS, LangChain, and AI
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/plans" className="hover:text-foreground transition-colors">
                我的计划
              </Link>
              <Link href="/achievements" className="hover:text-foreground transition-colors">
                成就墙
              </Link>
              <Link href="/skills" className="hover:text-foreground transition-colors">
                技能面板
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
