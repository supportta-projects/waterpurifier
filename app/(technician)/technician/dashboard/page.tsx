import type { Metadata } from "next";
import { BadgeCheck, ClipboardList, Clock, MapPinned } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Technician Dashboard | Water Purifier Service Platform",
};

const todaySchedule = [
  {
    id: "SRV-1046",
    customer: "Arjun Malhotra",
    address: "Banjara Hills, Hyderabad",
    time: "09:30 AM",
    product: "PureWave Ultra",
    status: "Available",
  },
  {
    id: "SRV-1047",
    customer: "Fatima Shaikh",
    address: "Powai, Mumbai",
    time: "12:30 PM",
    product: "AquaPure Elite",
    status: "Assigned",
  },
  {
    id: "SRV-1048",
    customer: "Karan Desai",
    address: "Indiranagar, Bengaluru",
    time: "03:45 PM",
    product: "CrystalClean Pro",
    status: "In Progress",
  },
];

const recentCompletions = [
  { id: "SRV-1041", customer: "Neha Jain", completedAt: "Yesterday, 6:40 PM", rating: "4.8 ★" },
  { id: "SRV-1039", customer: "Vishal Bhatia", completedAt: "Yesterday, 2:15 PM", rating: "5.0 ★" },
  { id: "SRV-1038", customer: "Maya Pillai", completedAt: "Nov 11, 4:50 PM", rating: "4.5 ★" },
];

export default function TechnicianDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white/90 px-8 py-9 shadow-soft ring-1 ring-primary/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary/70">Today’s Plan</p>
            <h1 className="text-3xl font-semibold text-primary">
              Stay on top of assigned services & capture completion notes
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Accept new work, update status as you progress, and generate invoices once the job
              is done.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              View Available Work
            </Button>
            <Button variant="secondary" className="rounded-full">
              Generate Invoice
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Assigned Today"
          value="5"
          subtitle="Includes manual + quarterly visits"
        />
        <StatCard
          title="Completed This Week"
          value="14"
          subtitle="Keep streak above 12/week"
          trend={{ value: "2 visits ↑", isPositive: true }}
        />
        <StatCard
          title="Avg. Feedback"
          value="4.7 ★"
          subtitle="Based on last 20 visits"
        />
        <StatCard
          title="Invoices Pending"
          value="3"
          subtitle="Share links after completion"
          trend={{ value: "1 ↓", isPositive: true }}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[2.4fr_1.6fr]">
        <Card className="rounded-[2rem] bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl">Today’s Schedule</CardTitle>
            <CardDescription>
              Accept new jobs or update status as you progress through the day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaySchedule.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-gradient-soft px-5 py-4 shadow-inner shadow-primary/5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-primary">{slot.id}</span>
                  <span className="text-sm text-foreground">{slot.customer}</span>
                  <span className="text-xs text-muted-foreground">{slot.product}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPinned className="h-3.5 w-3.5 text-primary/70" />
                    {slot.address}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
                  <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-inner shadow-black/5">
                    <Clock className="h-4 w-4 text-primary" />
                    {slot.time}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {slot.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl">Recent Completions</CardTitle>
            <CardDescription>Finish invoice handoff to get credit for the job.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCompletions.map((completion) => (
              <div
                key={completion.id}
                className="rounded-2xl border border-border/40 bg-white px-4 py-4 text-sm shadow-inner shadow-black/5"
              >
                <div className="flex items-center justify-between text-foreground">
                  <span className="font-medium text-primary">{completion.customer}</span>
                  <span className="text-xs text-muted-foreground">{completion.completedAt}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Service #{completion.id}</span>
                  <span className="font-semibold text-primary/80">{completion.rating}</span>
                </div>
              </div>
            ))}
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
              <span className="text-primary font-semibold">2</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
              <span className="flex items-center gap-2 text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                In Progress
              </span>
              <span>1</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
              <span className="flex items-center gap-2 text-foreground">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Completed & Awaiting Invoice
              </span>
              <span>3</span>
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
              <a href="/technician/services/available">Available Services</a>
            </Button>
            <Button variant="outline" asChild className="justify-start rounded-2xl">
              <a href="/technician/services/assigned">Assigned Work</a>
            </Button>
            <Button variant="outline" asChild className="justify-start rounded-2xl">
              <a href="/technician/services/completed">Completed Services</a>
            </Button>
            <Button variant="outline" asChild className="justify-start rounded-2xl">
              <a href="/technician/invoices">Generate Invoice</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

