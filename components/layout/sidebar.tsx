"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SidebarItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  trailingAction?: ReactNode;
  exact?: boolean;
};

type SidebarProps = {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  footer?: ReactNode;
  action?: ReactNode;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onLogout?: () => void;
  className?: string;
};

export function Sidebar({
  title,
  subtitle,
  items,
  footer,
  action,
  userName,
  userEmail,
  userRole,
  onLogout,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-full max-w-[17rem] flex-col justify-between rounded-3xl border border-sidebar-border/60 bg-sidebar/95 p-4 shadow-lg shadow-black/10 backdrop-blur-xl",
        className,
      )}
    >
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-soft px-4 py-5">
          <div className="text-xs font-medium uppercase tracking-wide text-primary/80">
            {subtitle ?? "Water Purifier"}
          </div>
          <h2 className="text-xl font-semibold text-sidebar-foreground">{title}</h2>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>

        <nav className="space-y-1">
          {items.map(({ title: itemTitle, href, icon: Icon, trailingAction, exact }) => {
            const isActive = exact ? pathname === href : pathname?.startsWith(href);
            return (
              <Button
                key={href}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium",
                  isActive
                    ? "bg-gradient-soft text-primary shadow-soft"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                <Link href={href} className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-3">
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    <span>{itemTitle}</span>
                  </span>
                  {trailingAction ? (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {trailingAction}
                    </span>
                  ) : null}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        {footer ? <div>{footer}</div> : null}
        <div className="rounded-2xl border border-border/40 bg-white/80 p-4 shadow-inner shadow-black/5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Signed in as
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            {userName ?? "User"}
          </div>
          <div className="text-xs text-muted-foreground">{userEmail}</div>
          {userRole ? (
            <div className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              {userRole}
            </div>
          ) : null}
          <Button
            variant="outline"
            className="mt-4 w-full justify-center rounded-full text-sm"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
