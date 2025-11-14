"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  ClipboardList,
  Loader2,
  PackagePlus,
  RefreshCcw,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { useStaffDashboard } from "@/hooks/use-staff-dashboard";
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
  const { data, loading, error, refresh } = useStaffDashboard(initialData);
  const showSkeleton = loading && !data;
  const isRefreshing = loading && Boolean(data);

  if (showSkeleton) {
    return (
      <div className="space-y-8">
        <section className="rounded-[2rem] bg-gradient-soft px-8 py-10 shadow-soft">
          <div className="space-y-4">
            <div className="h-3 w-24 rounded-full bg-white/30 animate-pulse" />
            <div className="h-10 w-64 rounded-full bg-white/20 animate-pulse" />
            <div className="h-14 w-full max-w-2xl rounded-3xl bg-white/10 animate-pulse" />
          </div>
        </section>
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border/40 bg-white/90 p-6 shadow-soft">
              <div className="h-3 w-24 rounded-full bg-muted/40 animate-pulse" />
              <div className="mt-4 h-10 w-32 rounded-full bg-muted/30 animate-pulse" />
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-soft px-8 py-10 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary/70">Today's Focus</p>
            <h1 className="text-3xl font-semibold text-primary">
              Coordinate orders & keep services running on time
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review follow-ups, confirm technician assignments, and ensure quarterly visits are on
              track.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push("/staff/orders")}
            >
              Create Order
            </Button>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => router.push("/staff/services")}
            >
              Schedule Service
            </Button>
            <Button
              variant="ghost"
              className="rounded-full"
              onClick={async () => {
                toast.info("Refreshing dashboard...");
                await refresh();
              }}
              disabled={loading}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {isRefreshing ? (
        <div className="flex items-center gap-2 rounded-[2rem] border border-border/40 bg-white/90 px-5 py-3 text-sm text-muted-foreground shadow-soft">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Refreshing dashboard metrics...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Orders Created (7d)"
              value={formatNumber(data.totals.ordersCreated7d)}
              subtitle="New orders in the last week"
            />
            <StatCard
              title="Services Assigned"
              value={formatNumber(data.totals.servicesAssigned)}
              subtitle="Technicians scheduled this week"
            />
            <StatCard
              title="Pending Follow-ups"
              value={formatNumber(data.totals.pendingFollowUps)}
              subtitle="Reach out before Friday"
            />
            <StatCard
              title="Invoices Awaiting Share"
              value={formatNumber(data.totals.invoicesAwaitingShare)}
              subtitle="Add WhatsApp link for visibility"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[2.2fr_1.8fr]">
            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">Upcoming Follow-ups</CardTitle>
                  <CardDescription>
                    Customers due for manual or quarterly visits—confirm their slots.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => router.push("/staff/customers")}
                >
                  View Customers
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.upcomingFollowUps.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No upcoming follow-ups scheduled.
                  </div>
                ) : (
                  data.upcomingFollowUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white px-5 py-4 shadow-inner shadow-black/5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {followUp.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {followUp.productName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant={serviceStatusLabels[followUp.status]?.variant ?? "outline"}>
                          {serviceStatusLabels[followUp.status]?.label ?? followUp.status}
                        </Badge>
                        <span>{formatDate(followUp.scheduledDate)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Active Orders</CardTitle>
                <CardDescription>Orders needing service or payment follow-up.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.activeOrders.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No active orders.
                  </div>
                ) : (
                  data.activeOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-border/30 bg-gradient-soft px-4 py-4 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-semibold">{order.customId ?? order.id.slice(0, 8)}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.productName}</p>
                      <p className="mt-2 text-xs font-medium text-primary/80">
                        {orderStatusLabels[order.status] ?? order.status}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Service Assignment</CardTitle>
                <CardDescription>Technicians with upcoming visits this week.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-2xl bg-gradient-soft px-4 py-3">
                  <span className="flex items-center gap-2 text-foreground">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Services Assigned
                  </span>
                  <span className="text-primary font-semibold">
                    {formatNumber(data.totals.servicesAssigned)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
                  <span className="flex items-center gap-2 text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Pending Follow-ups
                  </span>
                  <span>{formatNumber(data.totals.pendingFollowUps)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
                  <span className="flex items-center gap-2 text-foreground">
                    <PackagePlus className="h-4 w-4 text-primary" />
                    Orders Created (7d)
                  </span>
                  <span>{formatNumber(data.totals.ordersCreated7d)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Invoice Actions</CardTitle>
                <CardDescription>Follow through on payment & customer communication.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-2xl bg-gradient-soft px-4 py-3">
                  <span className="flex items-center gap-2 text-foreground">
                    <Wallet className="h-4 w-4 text-primary" />
                    Ready to Share
                  </span>
                  <span className="text-primary font-semibold">
                    {formatNumber(data.invoiceActions.readyToShare)} invoices
                  </span>
                </div>
                <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
                  <p className="text-sm font-medium text-foreground">Pending Payments</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(data.invoiceActions.pendingPayments)} customers awaiting
                    follow-up
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
                  <p className="text-sm font-medium text-foreground">Reminders sent today</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(data.invoiceActions.remindersSentToday)} WhatsApp links shared
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
                <CardDescription>Frequently used actions for staff workflows.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-primary">
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/staff/orders">Orders</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/staff/services">All Services</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/staff/customers">Customer Directory</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/staff/invoices">Invoices</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}

