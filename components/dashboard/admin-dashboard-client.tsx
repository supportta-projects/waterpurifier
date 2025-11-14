"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CalendarClock,
  ClipboardList,
  Droplets,
  Loader2,
  RefreshCcw,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { AdminDashboardSkeleton } from "@/components/dashboard/admin-dashboard-skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AdminDashboardMetrics } from "@/lib/firestore/dashboard";

const serviceStatusLabels: Record<
  "AVAILABLE" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED",
  { label: string; accent: string }
> = {
  AVAILABLE: { label: "Available", accent: "bg-blue-100 text-blue-600" },
  ASSIGNED: { label: "Assigned", accent: "bg-sky-100 text-sky-600" },
  IN_PROGRESS: { label: "In Progress", accent: "bg-indigo-100 text-indigo-600" },
  COMPLETED: { label: "Completed (30d)", accent: "bg-emerald-100 text-emerald-700" },
};

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

type AdminDashboardClientProps = {
  initialData?: AdminDashboardMetrics;
};

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const { data, loading, error, refresh } = useAdminDashboard(initialData);
  const showSkeleton = loading && !data;
  const isRefreshing = loading && Boolean(data);

  const latestServices = data?.latestServices ?? [];
  const teamCounts = data?.counts ?? { customers: 0, staff: 0, technicians: 0, subscriptions: 0 };

  const serviceSnapshot = useMemo(() => {
    if (!data) {
      return [];
    }
    return (Object.keys(data.serviceStatusCounts) as Array<
      keyof typeof data.serviceStatusCounts
    >).map((status) => ({
      status,
      label: serviceStatusLabels[status].label,
      value: data.serviceStatusCounts[status],
      accent: serviceStatusLabels[status].accent,
    }));
  }, [data]);

  const isEmpty =
    !loading &&
    data &&
    data.serviceStatusCounts.AVAILABLE === 0 &&
    data.serviceStatusCounts.ASSIGNED === 0 &&
    data.serviceStatusCounts.IN_PROGRESS === 0 &&
    data.serviceStatusCounts.COMPLETED === 0;

  if (showSkeleton) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-primary px-8 py-10 text-white shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/70">Overview</p>
            <h1 className="text-3xl font-semibold leading-tight">
              Service &amp; Operations Control Center
            </h1>
            <p className="mt-2 max-w-2xl text-white/80">
              Track purifier performance, coordinate technicians, and keep customers informed with
              upcoming quarterly services.
            </p>
            {data?.generatedAt ? (
              <p className="mt-3 text-xs text-white/60">
                Last updated {formatDateTime(data.generatedAt)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="rounded-full bg-white/10 text-white"
              onClick={async () => {
                toast.info("Refreshing insights…");
                await refresh();
              }}
              disabled={loading}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>
      </section>

      {isRefreshing ? (
        <div className="flex items-center gap-2 rounded-[2rem] border border-border/40 bg-white/90 px-5 py-3 text-sm text-muted-foreground shadow-soft">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Refreshing dashboard metrics…
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[2rem] border border-destructive/30 bg-destructive/10 px-6 py-5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Services (30d)"
              value={formatNumber(data.totals.services30d)}
              subtitle="Quarterly + manual visits"
            />
            <StatCard
              title="Open Orders"
              value={formatNumber(data.totals.openOrders)}
              subtitle="Awaiting completion or payment"
            />
            <StatCard
              title="Technician Utilisation"
              value={`${data.totals.technicianUtilization}%`}
              subtitle="Assignments per active technician"
            />
            <StatCard
              title="Month-to-date Revenue"
              value={data.totals.monthlyRevenueFormatted}
              subtitle="Invoices (excludes cancelled)"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[3fr_2fr]">
            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">Latest Service Updates</CardTitle>
                  <CardDescription>
                    Recently scheduled or completed services needing attention.
                  </CardDescription>
                </div>
                <Button variant="ghost" className="rounded-full" asChild>
                  <Link href="/admin/services/latest">View Latest Services</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestServices.length === 0 ? (
                  <div className="rounded-2xl border border-border/40 bg-white/80 px-5 py-6 text-sm text-muted-foreground shadow-inner shadow-black/5">
                    No recent services to display.
                  </div>
                ) : (
                  latestServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex flex-col gap-2 rounded-2xl border border-border/40 bg-white/80 px-5 py-4 shadow-inner shadow-black/5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-primary">#{service.customId ?? service.id}</p>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{service.customerName}</span>
                          {" · "}
                          {service.productName}
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ClipboardList className="h-3.5 w-3.5 text-primary/70" />
                            {service.status.replace("_", " ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5 text-primary/70" />
                            {formatDate(service.scheduledDate) || formatDate(service.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                          {service.technicianName ?? "Unassigned"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Service Status Snapshot</CardTitle>
                <CardDescription>Manual + quarterly pipelines across all customers.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEmpty ? (
                  <div className="rounded-2xl border border-border/40 bg-gradient-soft px-4 py-6 text-center text-sm text-muted-foreground">
                    No services created yet. Start by scheduling your first service.
                  </div>
                ) : (
                  serviceSnapshot.map((snapshot) => (
                    <div
                      key={snapshot.status}
                      className="flex items-center justify-between rounded-2xl bg-gradient-soft px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-semibold ${snapshot.accent}`}
                        >
                          {snapshot.label.slice(0, 2)}
                        </span>
                        <span className="text-sm font-medium text-foreground">{snapshot.label}</span>
                      </div>
                      <span className="text-lg font-semibold text-primary">
                        {formatNumber(snapshot.value)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-[2rem] border border-border/40 bg-white/90 px-5 py-6 text-center shadow-soft">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Active Customers
              </p>
              <p className="mt-2 text-2xl font-semibold text-primary">
                {formatNumber(teamCounts.customers)}
              </p>
            </Card>
            <Card className="rounded-[2rem] border border-border/40 bg-white/90 px-5 py-6 text-center shadow-soft">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Technicians
              </p>
              <p className="mt-2 text-2xl font-semibold text-primary">
                {formatNumber(teamCounts.technicians)}
              </p>
            </Card>
            <Card className="rounded-[2rem] border border-border/40 bg-white/90 px-5 py-6 text-center shadow-soft">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Staff Members
              </p>
              <p className="mt-2 text-2xl font-semibold text-primary">
                {formatNumber(teamCounts.staff)}
              </p>
            </Card>
            <Card className="rounded-[2rem] border border-border/40 bg-white/90 px-5 py-6 text-center shadow-soft">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Subscriptions
              </p>
              <p className="mt-2 text-2xl font-semibold text-primary">
                {formatNumber(teamCounts.subscriptions)}
              </p>
            </Card>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Order Funnel</CardTitle>
                <CardDescription>Breakdown of order pipeline this week.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-2xl bg-gradient-soft px-4 py-3">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Droplets className="h-4 w-4 text-primary" />
                    New Orders (7d)
                  </span>
                  <span className="text-primary">
                    {formatNumber(data.orderFunnel.newOrders7d)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Services Created (7d)
                  </span>
                  <span>{formatNumber(data.orderFunnel.servicesCreated7d)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Invoices Generated (7d)
                  </span>
                  <span>{formatNumber(data.orderFunnel.invoicesGenerated7d)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Quick Links</CardTitle>
                <CardDescription>Jump into key workflows to keep operations smooth.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-primary">
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/admin/services/all">All Services</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/admin/orders">View Orders</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/admin/staff">Manage Staff &amp; Technicians</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/admin/invoices">Invoices</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}


