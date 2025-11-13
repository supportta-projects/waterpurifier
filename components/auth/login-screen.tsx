"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";

export function LoginScreen() {
  const { isLoading } = useAuth();

  return (
    <div className="flex flex-col gap-6 rounded-[2rem] border border-border/40 bg-white/80 px-8 py-10 shadow-2xl shadow-primary/5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="text-xl font-semibold text-primary">Sign in</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your workspace.
        </p>
      </div>
      <LoginForm />
      {isLoading ? (
        <p className="text-center text-xs text-muted-foreground">
          Checking your session…
        </p>
      ) : null}
    </div>
  );
}

