"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { loginWithEmailPassword, mapFirebaseError } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = {
  email: string;
  password: string;
};

const initialState: FormState = {
  email: "",
  password: "",
};

function LoginFormInner({
  searchParams,
}: {
  searchParams: URLSearchParams | null;
}) {
  const router = useRouter();
  const { isLoading, isAuthenticated, dashboardPath, role } = useAuth();

  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      router.replace(dashboardPath);
    }
  }, [dashboardPath, isAuthenticated, isLoading, role, router]);

  const inactiveMessage = useMemo(() => {
    return searchParams?.get("inactive")
      ? "Your account is not active. Contact an administrator for access."
      : null;
  }, [searchParams]);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await loginWithEmailPassword(form.email, form.password);
    } catch (err) {
      setError(mapFirebaseError(err as Error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="grid gap-2 text-left">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="staff@waterpurifier.app"
          autoComplete="email"
          value={form.email}
          onChange={handleChange("email")}
          required
        />
      </div>
      <div className="grid gap-2 text-left">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange("password")}
          required
        />
      </div>

      {inactiveMessage ? (
        <div className="rounded-2xl bg-warning/10 px-4 py-3 text-sm font-medium text-warning-foreground">
          {inactiveMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
      <div className="text-center text-xs text-muted-foreground">
        Need access? Contact the administrator to receive your credentials.
      </div>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <div className="h-4 w-32 rounded-full bg-muted/30 animate-pulse" />
          <div className="h-10 rounded-full bg-muted/20 animate-pulse" />
          <div className="h-10 rounded-full bg-muted/20 animate-pulse" />
        </div>
      }
    >
      <WithSearchParams />
    </Suspense>
  );
}

function WithSearchParams() {
  const searchParams = useSearchParams();
  return <LoginFormInner searchParams={searchParams} />;
}

