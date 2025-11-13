"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
};

export function StatCard({ title, value, subtitle, trend, className }: StatCardProps) {
  const TrendIcon = trend?.isPositive ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend?.isPositive ? "text-emerald-500" : "text-destructive";

  return (
    <Card className={cn("rounded-3xl border-none bg-white/90 shadow-soft", className)}>
      <CardHeader className="pb-4">
        <CardDescription className="uppercase tracking-wide text-xs text-muted-foreground">
          {title}
        </CardDescription>
        <CardTitle className="text-3xl font-semibold text-foreground">{value}</CardTitle>
      </CardHeader>
      {(trend || subtitle) && (
        <CardContent className="flex items-center justify-between border-t border-border/40 pt-4">
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : (
            <span />
          )}
          {trend ? (
            <span className={cn("flex items-center gap-2 text-sm font-semibold", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              {trend.value}
            </span>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
}

