"use client";

import { type ReactNode } from "react";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type TopbarProps = {
  title: string;
  description?: string;
  onToggleSidebar?: () => void;
  actions?: ReactNode;
  className?: string;
};

export function Topbar({
  title,
  description,
  onToggleSidebar,
  actions,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-gradient-soft px-6 py-4 shadow-lg shadow-black/5 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {onToggleSidebar ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-2xl bg-white/50 text-primary shadow-sm lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : null}
        <div>
          <h1 className="text-lg font-semibold text-primary">{title}</h1>
          {description ? (
            <p className="text-xs font-medium text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">{actions}</div>
    </header>
  );
}
