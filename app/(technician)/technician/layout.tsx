"use client";

import type { ReactNode } from "react";
import {
  BadgeCheck,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
} from "lucide-react";

import { RoleGuard } from "@/components/auth/role-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type TechnicianLayoutProps = {
  children: ReactNode;
};

const technicianNavItems = [
  { title: "Dashboard", href: "/technician/dashboard", icon: LayoutDashboard },
  { title: "Available Services", href: "/technician/services/available", icon: ClipboardList },
  { title: "Assigned Work", href: "/technician/services/assigned", icon: ClipboardCheck },
  { title: "Completed", href: "/technician/services/completed", icon: BadgeCheck },
  { title: "Invoices", href: "/technician/invoices", icon: FileText },
];

export default function TechnicianLayout({ children }: TechnicianLayoutProps) {
  const { profile, user, signOut } = useAuth();

  return (
    <RoleGuard allowed={["TECHNICIAN"]}>
      <AppShell
        sidebar={
          <Sidebar
            title="Technician Hub"
            subtitle="Daily Schedule"
            items={technicianNavItems}
            userName={profile?.name ?? user?.email ?? "Technician"}
            userEmail={user?.email ?? ""}
            userRole="Technician"
            onLogout={() => {
              void signOut();
            }}
          />
        }
        topbar={
          <Topbar
            title="Technician Workspace"
            description="Stay on top of assigned services and pending invoices."
            actions={
              <Button variant="subtle" className="hidden md:inline-flex">
                View Calendar
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

