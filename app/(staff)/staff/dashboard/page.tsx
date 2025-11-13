import type { Metadata } from "next";
import { ClipboardList, PackagePlus, Users, Wallet } from "lucide-react";

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
  title: "Staff Dashboard | Water Purifier Service Platform",
};

const upcomingFollowUps = [
  {
    id: "CUST-203",
    name: "Saanvi Kapoor",
    product: "CrystalClean Pro",
    nextService: "Nov 16",
    type: "Quarterly",
  },
  {
    id: "CUST-188",
    name: "Ishan Gupta",
    product: "PureWave Ultra",
    nextService: "Nov 18",
    type: "Manual",
  },
  {
    id: "CUST-179",
    name: "Nisha Verma",
    product: "AquaPure Elite",
    nextService: "Nov 20",
    type: "Quarterly",
  },
];

const activeOrders = [
  {
    id: "ORD-5410",
    customer: "Rohan Patel",
    product: "AquaPure Elite",
    created: "Nov 10",
    status: "Awaiting Service Slot",
  },
  {
    id: "ORD-5407",
    customer: "Meera Bansal",
    product: "PureWave Ultra",
    created: "Nov 09",
    status: "Payment Pending",
  },
];

export default function StaffDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-soft px-8 py-10 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary/70">Today’s Focus</p>
            <h1 className="text-3xl font-semibold text-primary">
              Coordinate orders & keep services running on time
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Review follow-ups, confirm technician assignments, and ensure quarterly visits are
              on track.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create Order
            </Button>
            <Button variant="secondary" className="rounded-full">
              Schedule Service
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Orders Created (7d)"
          value="58"
          subtitle="27% from quarterly renewals"
          trend={{ value: "6.2% ↑", isPositive: true }}
        />
        <StatCard
          title="Services Assigned"
          value="34"
          subtitle="Technicians scheduled this week"
          trend={{ value: "2.1% ↓", isPositive: false }}
        />
        <StatCard
          title="Pending Follow-ups"
          value="9"
          subtitle="Reach out before Friday"
        />
        <StatCard
          title="Invoices Awaiting Share"
          value="6"
          subtitle="Add WhatsApp link for visibility"
          trend={{ value: "1.8% ↑", isPositive: true }}
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
            <Button variant="ghost" className="rounded-full">
              View Customers
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingFollowUps.map((followUp) => (
              <div
                key={followUp.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-white px-5 py-4 shadow-inner shadow-black/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-primary">{followUp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {followUp.product} · {followUp.id}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {followUp.type}
                  </span>
                  <span>{followUp.nextService}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="text-xl">Active Orders</CardTitle>
            <CardDescription>Orders needing service or payment follow-up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border/30 bg-gradient-soft px-4 py-4 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-primary font-semibold">{order.id}</span>
                  <span className="text-xs text-muted-foreground">{order.created}</span>
                </div>
                <p className="mt-1 text-sm text-foreground">{order.customer}</p>
                <p className="text-xs text-muted-foreground">{order.product}</p>
                <p className="mt-2 text-xs font-medium text-primary/80">{order.status}</p>
              </div>
            ))}
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
                Technician Scheduling
              </span>
              <span className="text-primary font-semibold">12 visits</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
              <span className="flex items-center gap-2 text-foreground">
                <Users className="h-4 w-4 text-primary" />
                Technician Capacity
              </span>
              <span>78%</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
              <span className="flex items-center gap-2 text-foreground">
                <PackagePlus className="h-4 w-4 text-primary" />
                Products Requiring Service
              </span>
              <span>18</span>
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
              <span className="text-primary font-semibold">6 invoices</span>
            </div>
            <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
              <p className="text-sm font-medium text-foreground">Pending Payments</p>
              <p className="text-xs text-muted-foreground">4 customers awaiting follow-up</p>
            </div>
            <div className="rounded-2xl bg-white/90 px-4 py-3 shadow-inner shadow-black/5">
              <p className="text-sm font-medium text-foreground">Reminders sent today</p>
              <p className="text-xs text-muted-foreground">2 WhatsApp links shared</p>
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
              <a href="/staff/orders">Orders</a>
            </Button>
            <Button variant="outline" asChild className="justify-start rounded-2xl">
              <a href="/staff/services/all">All Services</a>
            </Button>
            <Button variant="outline" asChild className="justify-start rounded-2xl">
              <a href="/staff/customers">Customer Directory</a>
            </Button>
            <Button variant="outline" asChild className="justify-start rounded-2xl">
              <a href="/staff/invoices">Invoices</a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

