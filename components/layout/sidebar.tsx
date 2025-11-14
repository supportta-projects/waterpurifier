"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, LogOut, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  action,
  userName,
  userEmail,
  userRole,
  onLogout,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-full w-full max-w-[17rem] flex-col rounded-3xl border border-sidebar-border/60 bg-sidebar/95 p-4 shadow-lg shadow-black/10 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex-1 space-y-6 overflow-hidden">
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

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/40 bg-white/80 px-3 py-2.5 shadow-inner shadow-black/5">
          <span className="text-sm font-semibold text-foreground">
            {userRole ?? "User"}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                title="User menu"
              >
                <User className="h-4 w-4 text-primary" />
                <span className="sr-only">User menu</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {userName ?? "User"}
                  </p>
                  <p className="text-sm text-foreground">{userEmail}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center rounded-full text-sm"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You will need to sign in again to access your
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setShowLogoutDialog(false);
                onLogout?.();
              }}
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}
