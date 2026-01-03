"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Code, Brain, Briefcase, Trash2 } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// 模拟数据
const autoSkills = [
  { name: "JavaScript", level: 4, category: "technical" },
  { name: "React", level: 3, category: "technical" },
  { name: "CSS", level: 3, category: "technical" },
  { name: "TypeScript", level: 2, category: "technical" },
];

const manualSkills = [
  { id: "1", name: "问题解决", description: "能够分析和解决复杂问题", category: "soft", level: 4 },
  { id: "2", name: "团队协作", description: "与团队成员有效沟通协作", category: "soft", level: 3 },
];

const radarData = autoSkills.map((skill) => ({
  skill: skill.name,
  level: skill.level,
  fullMark: 5,
}));

function getCategoryIcon(category: string) {
  switch (category) {
    case "technical":
      return <Code className="h-4 w-4" />;
    case "soft":
      return <Brain className="h-4 w-4" />;
    case "domain":
      return <Briefcase className="h-4 w-4" />;
    default:
      return <Code className="h-4 w-4" />;
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case "technical":
      return "技术技能";
    case "soft":
      return "软技能";
    case "domain":
      return "领域知识";
    default:
      return "其他";
  }
}

function getLevelLabel(level: number) {
  const labels = ["入门", "基础", "熟练", "精通", "专家"];
  return labels[level - 1] || "入门";
}

export default function SkillsPage() {
  const [skills, setSkills] = useState(manualSkills);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: "",
    description: "",
    category: "technical",
    level: 1,
  });

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;
    setSkills([
      ...skills,
      { ...newSkill, id: Date.now().toString() },
    ]);
    setNewSkill({ name: "", description: "", category: "technical", level: 1 });
    setIsDialogOpen(false);
  };

  const handleDeleteSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">技能面板</h1>
          <p className="text-muted-foreground">
            展示和管理你的技能资产
          </p>
        </div>
      </div>

      <Tabs defaultValue="auto">
        <TabsList>
          <TabsTrigger value="auto">自动技能</TabsTrigger>
          <TabsTrigger value="manual">手动添加</TabsTrigger>
        </TabsList>

        <TabsContent value="auto" className="space-y-6 mt-4">
          {/* 雷达图 */}
          <Card>
            <CardHeader>
              <CardTitle>技能雷达图</CardTitle>
              <CardDescription>
                根据你完成的学习路径自动生成
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                    <Radar
                      name="技能水平"
                      dataKey="level"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 技能列表 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {autoSkills.map((skill) => (
              <Card key={skill.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{skill.name}</CardTitle>
                    <Badge variant="secondary">
                      {getLevelLabel(skill.level)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full ${
                          i <= skill.level ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6 mt-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  添加技能
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加技能</DialogTitle>
                  <DialogDescription>
                    手动添加你掌握的技能
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>技能名称</Label>
                    <Input
                      value={newSkill.name}
                      onChange={(e) =>
                        setNewSkill({ ...newSkill, name: e.target.value })
                      }
                      placeholder="例如：项目管理"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>描述（可选）</Label>
                    <Input
                      value={newSkill.description}
                      onChange={(e) =>
                        setNewSkill({ ...newSkill, description: e.target.value })
                      }
                      placeholder="简要描述这项技能"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>类别</Label>
                    <Select
                      value={newSkill.category}
                      onValueChange={(value) =>
                        setNewSkill({ ...newSkill, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">技术技能</SelectItem>
                        <SelectItem value="soft">软技能</SelectItem>
                        <SelectItem value="domain">领域知识</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>水平 (1-5)</Label>
                    <Select
                      value={String(newSkill.level)}
                      onValueChange={(value) =>
                        setNewSkill({ ...newSkill, level: Number(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - 入门</SelectItem>
                        <SelectItem value="2">2 - 基础</SelectItem>
                        <SelectItem value="3">3 - 熟练</SelectItem>
                        <SelectItem value="4">4 - 精通</SelectItem>
                        <SelectItem value="5">5 - 专家</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddSkill}>添加</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {skills.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                还没有添加手动技能
              </p>
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                添加第一个技能
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <Card key={skill.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(skill.category)}
                        <CardTitle className="text-base">{skill.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteSkill(skill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {skill.description && (
                      <CardDescription>{skill.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {getCategoryLabel(skill.category)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getLevelLabel(skill.level)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
