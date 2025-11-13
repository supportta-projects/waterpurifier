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
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Loading workspace…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !role || !allowed.includes(role) || !isActive) {
    return null;
  }

  return <>{children}</>;
}

