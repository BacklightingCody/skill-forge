"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Trophy,
  Sparkles,
  Plus,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  {
    title: "今日",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "路径",
    href: "/plans",
    icon: Map,
  },
  {
    title: "成就",
    href: "/achievements",
    icon: Trophy,
  },
  {
    title: "技能",
    href: "/skills",
    icon: Sparkles,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="mr-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>SkillForge</span>
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link href="/plans/new">
          <Button className="w-full gap-2" size={collapsed ? "icon" : "default"}>
            <Plus className="h-4 w-4" />
            {!collapsed && <span>新建计划</span>}
          </Button>
        </Link>
      </div>
    </aside>
  );
}
