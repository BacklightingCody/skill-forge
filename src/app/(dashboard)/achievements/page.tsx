import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Flame,
  Trophy,
  Zap,
  BookOpen,
  Medal,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ACHIEVEMENT_DEFINITIONS } from "@/types";

// 模拟已解锁的成就
const unlockedAchievements = [
  { type: "first_day", unlockedAt: new Date("2025-12-20") },
  { type: "streak_7", unlockedAt: new Date("2025-12-27") },
];

function getAchievementIcon(icon: string) {
  const icons: Record<string, React.ReactNode> = {
    star: <Star className="h-8 w-8" />,
    flame: <Flame className="h-8 w-8" />,
    trophy: <Trophy className="h-8 w-8" />,
    zap: <Zap className="h-8 w-8" />,
    book: <BookOpen className="h-8 w-8" />,
    medal: <Medal className="h-8 w-8" />,
  };
  return icons[icon] || <Star className="h-8 w-8" />;
}

function getTierColor(tier: "bronze" | "silver" | "gold") {
  switch (tier) {
    case "gold":
      return "text-yellow-500 bg-yellow-500/10";
    case "silver":
      return "text-slate-400 bg-slate-400/10";
    case "bronze":
      return "text-orange-600 bg-orange-600/10";
  }
}

export default function AchievementsPage() {
  const unlockedTypes = new Set(unlockedAchievements.map((a) => a.type));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">成就墙</h1>
        <p className="text-muted-foreground">
          展示你的学习成就，已解锁 {unlockedAchievements.length} /{" "}
          {ACHIEVEMENT_DEFINITIONS.length}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已解锁
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {unlockedAchievements.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              金牌成就
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {
                unlockedAchievements.filter(
                  (a) =>
                    ACHIEVEMENT_DEFINITIONS.find((d) => d.type === a.type)
                      ?.tier === "gold"
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待解锁
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">
              {ACHIEVEMENT_DEFINITIONS.length - unlockedAchievements.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 成就列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
          const isUnlocked = unlockedTypes.has(achievement.type);
          const unlockData = unlockedAchievements.find(
            (a) => a.type === achievement.type
          );

          return (
            <Card
              key={achievement.type}
              className={cn(
                "relative overflow-hidden transition-all",
                isUnlocked
                  ? "border-primary/50"
                  : "opacity-60 grayscale"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div
                    className={cn(
                      "rounded-full p-3",
                      isUnlocked
                        ? getTierColor(achievement.tier)
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isUnlocked ? (
                      getAchievementIcon(achievement.icon)
                    ) : (
                      <Lock className="h-8 w-8" />
                    )}
                  </div>
                  <Badge
                    variant={isUnlocked ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {achievement.tier}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{achievement.name}</CardTitle>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isUnlocked && unlockData && (
                  <p className="text-xs text-muted-foreground">
                    解锁于{" "}
                    {unlockData.unlockedAt.toLocaleDateString("zh-CN")}
                  </p>
                )}
                {!isUnlocked && (
                  <p className="text-xs text-muted-foreground">
                    继续努力，即将解锁！
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
