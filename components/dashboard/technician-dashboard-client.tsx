"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ClipboardList,
  Clock,
  Loader2,
  MapPinned,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";

import { useTechnicianDashboard } from "@/hooks/use-technician-dashboard";
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
  const { data, loading, error, refresh } = useTechnicianDashboard(initialData);
  const showSkeleton = loading && !data;
  const isRefreshing = loading && Boolean(data);

  if (showSkeleton) {
    return (
      <div className="space-y-8">
        <section className="rounded-[2rem] bg-white/90 px-8 py-9 shadow-soft ring-1 ring-primary/10">
          <div className="space-y-4">
            <div className="h-3 w-24 rounded-full bg-primary/30 animate-pulse" />
            <div className="h-10 w-64 rounded-full bg-primary/20 animate-pulse" />
            <div className="h-14 w-full max-w-2xl rounded-3xl bg-primary/10 animate-pulse" />
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
      <section className="rounded-[2rem] bg-white/90 px-8 py-9 shadow-soft ring-1 ring-primary/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary/70">Today's Plan</p>
            <h1 className="text-3xl font-semibold text-primary">
              Stay on top of assigned services & capture completion notes
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Accept new work, update status as you progress, and generate invoices once the job is
              done.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => router.push("/technician/services/available")}
            >
              View Available Work
            </Button>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => router.push("/technician/invoices")}
            >
              Generate Invoice
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
              title="Assigned Today"
              value={formatNumber(data.totals.assignedToday)}
              subtitle="Includes manual + quarterly visits"
            />
            <StatCard
              title="Completed This Week"
              value={formatNumber(data.totals.completedThisWeek)}
              subtitle="Keep streak above 12/week"
            />
            <StatCard title="Avg. Feedback" value="4.7 ★" subtitle="Based on last 20 visits" />
            <StatCard
              title="Invoices Pending"
              value={formatNumber(data.totals.invoicesPending)}
              subtitle="Share links after completion"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[2.4fr_1.6fr]">
            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Today's Schedule</CardTitle>
                <CardDescription>
                  Accept new jobs or update status as you progress through the day.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.todaySchedule.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No services scheduled for today.
                  </div>
                ) : (
                  data.todaySchedule.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-gradient-soft px-5 py-4 shadow-inner shadow-primary/5 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-primary">{slot.id.slice(0, 8)}</span>
                        <span className="text-sm text-foreground">{slot.customerName}</span>
                        <span className="text-xs text-muted-foreground">{slot.productName}</span>
                        {slot.address ? (
                          <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPinned className="h-3.5 w-3.5 text-primary/70" />
                            {slot.address}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
                        <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-inner shadow-black/5">
                          <Clock className="h-4 w-4 text-primary" />
                          {formatTime(slot.scheduledDate)}
                        </span>
                        <Badge variant={serviceStatusLabels[slot.status]?.variant ?? "outline"}>
                          {serviceStatusLabels[slot.status]?.label ?? slot.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Recent Completions</CardTitle>
                <CardDescription>Finish invoice handoff to get credit for the job.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.recentCompletions.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No recent completions.
                  </div>
                ) : (
                  data.recentCompletions.map((completion) => (
                    <div
                      key={completion.id}
                      className="rounded-2xl border border-border/40 bg-white px-4 py-4 text-sm shadow-inner shadow-black/5"
                    >
                      <div className="flex items-center justify-between text-foreground">
                        <span className="font-medium text-primary">{completion.customerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(completion.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Service #{completion.id.slice(0, 8)}</span>
                        <span className="font-semibold text-primary/80">Completed</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Service Status Checklist</CardTitle>
                <CardDescription>Keep your work items moving towards completion.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-2xl bg-gradient-soft px-4 py-3">
                  <span className="flex items-center gap-2 text-foreground">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Available Services
                  </span>
                  <span className="text-primary font-semibold">
                    {formatNumber(data.serviceStatusCounts.available)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
                  <span className="flex items-center gap-2 text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    In Progress
                  </span>
                  <span>{formatNumber(data.serviceStatusCounts.inProgress)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
                  <span className="flex items-center gap-2 text-foreground">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    Completed & Awaiting Invoice
                  </span>
                  <span>{formatNumber(data.serviceStatusCounts.completedAwaitingInvoice)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] bg-white/90 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Quick Access</CardTitle>
                <CardDescription>Jump to the pages you need while on the move.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-primary">
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/technician/services/available">Available Services</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/technician/services/assigned">Assigned Work</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/technician/services/completed">Completed Services</Link>
                </Button>
                <Button variant="outline" asChild className="justify-start rounded-2xl">
                  <Link href="/technician/invoices">Generate Invoice</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}

