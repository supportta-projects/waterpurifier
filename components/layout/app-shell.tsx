"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppShellProps = {
  sidebar: ReactNode;
  topbar?: ReactNode;
  children: ReactNode;
  className?: string;
  mainClassName?: string;
};

export function AppShell({
  sidebar,
  topbar,
  children,
  className,
  mainClassName,
}: AppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-[length:300%_300%] bg-gradient-to-br from-sky-50 via-white to-blue-50 text-foreground",
        className,
      )}
    >
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-4 py-4 lg:flex-row lg:px-6 lg:py-6">
        <div className="lg:w-[280px] lg:flex-none">
          <div className="lg:hidden">
            <div className="mb-4">{sidebar}</div>
          </div>
          <div className="hidden lg:flex">{sidebar}</div>
        </div>
        <div className="flex w-full flex-1 overflow-hidden rounded-[2.25rem] border border-border/40 bg-white/85 shadow-2xl shadow-primary/5 backdrop-blur-xl">
          <div className="flex w-full flex-col overflow-hidden">
            {topbar ? (
              <div className="sticky top-0 z-10 border-b border-border/40 bg-white/85 px-4 py-4 backdrop-blur-lg lg:px-6">
                {topbar}
              </div>
            ) : null}
            <main
              className={cn(
                "flex-1 overflow-y-auto px-4 py-6 lg:px-6 lg:py-8",
                mainClassName,
              )}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
