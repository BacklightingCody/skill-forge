"use client";

import { Flame, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  streak?: number;
}

export function Header({ streak = 0 }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        {streak > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-medium">连续 {streak} 天</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
