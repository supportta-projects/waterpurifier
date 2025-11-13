import { useMemo } from "react";

import { useAuthContext } from "@/context/auth-context";
import { getDashboardPath } from "@/lib/routes";

export function useAuth() {
  const context = useAuthContext();

  const dashboardPath = useMemo(() => {
    if (!context.role) {
      return "/login";
    }
    return getDashboardPath(context.role);
  }, [context.role]);

  return {
    ...context,
    dashboardPath,
    isLoading: context.status === "loading",
    isAuthenticated: context.status === "authenticated" && !!context.user,
  };
}

