"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  RefreshCcw,
} from "lucide-react";

import { useStaffDashboard } from "@/hooks/use-staff-dashboard";
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
import type { StaffDashboardMetrics } from "@/lib/firestore/staff-dashboard";

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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

const serviceTypeLabels: Record<string, string> = {
  MANUAL: "Manual",
  QUARTERLY: "Quarterly",
};

const serviceStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  AVAILABLE: { label: "Available", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "success" },
};

const orderStatusLabels: Record<string, string> = {
  PENDING: "Awaiting Service Slot",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

type StaffDashboardClientProps = {
  initialData?: StaffDashboardMetrics;
};

export function StaffDashboardClient({ initialData }: StaffDashboardClientProps) {
  const router = useRouter();
  const { profile, user } = useAuth();
  const staffUid = user?.uid ?? undefined;
  const { data, loading, error, refresh } = useStaffDashboard(initialData, staffUid);
  const showSkeleton = loading && !data;
  const isRefreshing = loading && Boolean(data);
  
  const userName = profile?.name ?? user?.email?.split("@")[0] ?? "Staff Member";
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
              Here's what's happening with your services and customers today
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push("/staff/services/create")}
            >
              Create Service
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
              title="Services Created"
              value={formatNumber(data.totals.servicesAssigned)}
              subtitle="By you"
            />
            <StatCard
              title="Upcoming Services"
              value={formatNumber(data.totals.pendingFollowUps)}
              subtitle="Scheduled by you"
            />
            <StatCard
              title="Orders Created"
              value={formatNumber(data.totals.ordersCreated7d)}
              subtitle="Last 7 days"
            />
            <StatCard
              title="Invoices Ready"
              value={formatNumber(data.totals.invoicesAwaitingShare)}
              subtitle="To share"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl border border-border/40 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Services</CardTitle>
                <CardDescription>Services scheduled for the next few days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.upcomingFollowUps.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No upcoming services
                  </div>
                ) : (
                  data.upcomingFollowUps.slice(0, 5).map((followUp) => (
                    <div
                      key={followUp.id}
                      className="flex items-center justify-between rounded-xl border border-border/40 bg-white px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {followUp.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {followUp.productName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant={serviceStatusLabels[followUp.status]?.variant ?? "outline"}>
                          {serviceStatusLabels[followUp.status]?.label ?? followUp.status}
                        </Badge>
                        <span className="text-muted-foreground">{formatDate(followUp.scheduledDate)}</span>
                      </div>
                    </div>
                  ))
                )}
                {data.upcomingFollowUps.length > 5 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => router.push("/staff/services")}
                  >
                    View All Services
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-border/40 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common tasks and navigation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/staff/services">View All Services</Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/staff/services/create">Create Service</Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/staff/customers">Customers</Link>
                  </Button>
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/staff/invoices">Invoices</Link>
                  </Button>
                </div>
                {data.totals.pendingFollowUps > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                    <p className="font-medium text-amber-900">💡 Quick Tip</p>
                    <p className="mt-1 text-amber-700">
                      You have {data.totals.pendingFollowUps} service{data.totals.pendingFollowUps !== 1 ? "s" : ""} that need attention. Review them to keep customers satisfied.
                    </p>
                  </div>
                )}
                {data.totals.invoicesAwaitingShare > 0 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                    <p className="font-medium text-blue-900">📧 Action Needed</p>
                    <p className="mt-1 text-blue-700">
                      {data.totals.invoicesAwaitingShare} invoice{data.totals.invoicesAwaitingShare !== 1 ? "s" : ""} from your orders ready to share with customers.
                    </p>
                  </div>
                )}
                {data.totals.ordersCreated7d > 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
                    <p className="font-medium text-green-900">📊 This Week</p>
                    <p className="mt-1 text-green-700">
                      You've created {data.totals.ordersCreated7d} order{data.totals.ordersCreated7d !== 1 ? "s" : ""} in the last 7 days. Great work!
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

