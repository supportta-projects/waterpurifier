"use client";

import type { ReactNode } from "react";
import {
  ClipboardList,
  Droplets,
  FileText,
  LayoutDashboard,
  PackageCheck,
  UserCog,
  UsersRound,
} from "lucide-react";

import { RoleGuard } from "@/components/auth/role-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type AdminLayoutProps = {
  children: ReactNode;
};

const adminNavItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, exact: false },
  { title: "Services", href: "/admin/services", icon: ClipboardList },
  { title: "Products", href: "/admin/products", icon: Droplets },
  { title: "Orders", href: "/admin/orders", icon: PackageCheck },
  { title: "Customers", href: "/admin/customers", icon: UsersRound },
  { title: "Staff & Technicians", href: "/admin/staff", icon: UserCog },
  { title: "Invoices", href: "/admin/invoices", icon: FileText },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { profile, user, signOut } = useAuth();

  return (
    <RoleGuard allowed={["ADMIN"]}>
      <AppShell
        sidebar={
          <Sidebar
            title="Admin Control"
            subtitle="Operations HQ"
            items={adminNavItems}
            userName={profile?.name ?? user?.email ?? "Admin"}
            userEmail={user?.email ?? ""}
            userRole="Administrator"
            onLogout={() => {
              void signOut();
            }}
          />
        }
        topbar={
          <Topbar
            title="Admin Control Center"
            description="Monitor services, orders, and team operations."
            actions={
              <Button variant="subtle" className="hidden md:inline-flex">
                Schedule Service
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

