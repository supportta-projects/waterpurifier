"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/user";

type RoleGuardProps = {
  allowed: UserRole[];
  children: React.ReactNode;
};

export function RoleGuard({ allowed, children }: RoleGuardProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, role, dashboardPath, isActive } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!role) {
      router.replace("/login");
      return;
    }
    if (!isActive) {
      router.replace("/login?inactive=1");
      return;
    }
    if (!allowed.includes(role)) {
      router.replace(dashboardPath);
    }
  }, [allowed, dashboardPath, isActive, isAuthenticated, isLoading, role, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-border/40 bg-white/90 px-8 py-10 shadow-2xl shadow-primary/5 backdrop-blur-xl">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-primary" />
            <div className="absolute inset-2 h-12 w-12 rounded-full bg-primary/5" />
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-lg font-semibold text-primary">Preparing Your Workspace</h3>
            <p className="text-sm text-muted-foreground">
              Just a moment while we set everything up...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !role || !allowed.includes(role) || !isActive) {
    return null;
  }

  return <>{children}</>;
}

