"use client";

import type { ReactNode } from "react";
import {
  ClipboardList,
  Droplets,
  FileText,
  LayoutDashboard,
  PackagePlus,
  UsersRound,
} from "lucide-react";

import { RoleGuard } from "@/components/auth/role-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type StaffLayoutProps = {
  children: ReactNode;
};

const staffNavItems = [
  { title: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  { title: "Services", href: "/staff/services", icon: ClipboardList },
  { title: "Products", href: "/staff/products", icon: Droplets },
  { title: "Orders", href: "/staff/orders", icon: PackagePlus },
  { title: "Customers", href: "/staff/customers", icon: UsersRound },
  { title: "Invoices", href: "/staff/invoices", icon: FileText },
];

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { profile, user, signOut } = useAuth();

  return (
    <RoleGuard allowed={["STAFF"]}>
      <AppShell
        sidebar={
          <Sidebar
            title="Staff Workspace"
            subtitle="Daily Operations"
            items={staffNavItems}
            footer={
              <div className="rounded-2xl bg-white/70 p-4 text-xs text-muted-foreground shadow-inner">
                Manage orders, schedule services, and keep customers in sync.
              </div>
            }
            userName={profile?.name ?? user?.email ?? "Staff Member"}
            userEmail={user?.email ?? ""}
            userRole="Staff"
            onLogout={() => {
              void signOut();
            }}
          />
        }
        topbar={
          <Topbar
            title="Staff Dashboard"
            description="Oversee orders, services, and customer follow-ups."
            actions={
              <Button variant="subtle" className="hidden md:inline-flex">
                New Order
              </Button>
            }
          />
        }
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}

