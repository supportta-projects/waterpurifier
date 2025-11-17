"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Loader2,
  MapPinned,
  RefreshCcw,
} from "lucide-react";

import { useTechnicianDashboard } from "@/hooks/use-technician-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TechnicianDashboardMetrics } from "@/lib/firestore/technician-dashboard";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const serviceStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  AVAILABLE: { label: "Available", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "success" },
};

type TechnicianDashboardClientProps = {
  initialData?: TechnicianDashboardMetrics;
};

export function TechnicianDashboardClient({ initialData }: TechnicianDashboardClientProps) {
  const router = useRouter();
  const { profile, user } = useAuth();
  const { data, loading, error, refresh } = useTechnicianDashboard(initialData);
  const showSkeleton = loading && !data;
  const isRefreshing = loading && Boolean(data);
  
  const userName = profile?.name ?? user?.email?.split("@")[0] ?? "Technician";
  const greeting = getGreeting();

  if (showSkeleton) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/40 bg-white px-6 py-6 shadow-sm">
          <div className="h-8 w-32 rounded bg-muted/40 animate-pulse" />
        </section>
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border/40 bg-white p-6 shadow-sm">
              <div className="h-3 w-24 rounded bg-muted/40 animate-pulse" />
              <div className="mt-4 h-8 w-20 rounded bg-muted/30 animate-pulse" />
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/40 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-primary">
              {greeting}, {userName.split(" ")[0]}!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Here's your schedule and work overview for today
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push("/technician/services/available")}
            >
              Available Services
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await refresh();
              }}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </section>

      {isRefreshing ? (
        <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-white px-4 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Refreshing...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Assigned Today"
              value={formatNumber(data.totals.assignedToday)}
              subtitle="Services"
            />
            <StatCard
              title="Completed This Week"
              value={formatNumber(data.totals.completedThisWeek)}
              subtitle="Services"
            />
            <StatCard
              title="In Progress"
              value={formatNumber(data.serviceStatusCounts.inProgress)}
              subtitle="Active"
            />
            <StatCard
              title="Available"
              value={formatNumber(data.serviceStatusCounts.available)}
              subtitle="To accept"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl border border-border/40 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Today's Schedule</CardTitle>
                <CardDescription>Services scheduled for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.todaySchedule.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No services scheduled for today
                  </div>
                ) : (
                  data.todaySchedule.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col gap-2 rounded-xl border border-border/40 bg-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{slot.customerName}</span>
                        <Badge variant={serviceStatusLabels[slot.status]?.variant ?? "outline"}>
                          {serviceStatusLabels[slot.status]?.label ?? slot.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{slot.productName}</p>
                      {slot.address && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPinned className="h-3 w-3" />
                          {slot.address}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(slot.scheduledDate)}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/40 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Navigate to your work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/technician/services/available">Available Services</Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/technician/services/assigned">Assigned Work</Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/technician/services/completed">Completed</Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/technician/invoices">Invoices</Link>
                  </Button>
                </div>
                {data.serviceStatusCounts.available > 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
                    <p className="font-medium text-green-900">✨ New Opportunities</p>
                    <p className="mt-1 text-green-700">
                      {data.serviceStatusCounts.available} service{data.serviceStatusCounts.available !== 1 ? "s" : ""} available for you to accept.
                    </p>
                  </div>
                )}
                {data.totals.completedThisWeek > 0 && (
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm">
                    <p className="font-medium text-purple-900">🎉 Great Work!</p>
                    <p className="mt-1 text-purple-700">
                      You've completed {data.totals.completedThisWeek} service{data.totals.completedThisWeek !== 1 ? "s" : ""} this week. Keep it up!
                    </p>
                  </div>
                )}
                {data.serviceStatusCounts.inProgress > 0 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                    <p className="font-medium text-blue-900">⚡ In Progress</p>
                    <p className="mt-1 text-blue-700">
                      You have {data.serviceStatusCounts.inProgress} active service{data.serviceStatusCounts.inProgress !== 1 ? "s" : ""}. Don't forget to update status when done.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}

