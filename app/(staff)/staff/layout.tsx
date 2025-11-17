"use client";

import type { ReactNode } from "react";
import {
  ClipboardList,
  Droplets,
  FileText,
  LayoutDashboard,
  PackagePlus,
  UsersRound,
  Wrench,
} from "lucide-react";

import { RoleGuard } from "@/components/auth/role-guard";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";

type StaffLayoutProps = {
  children: ReactNode;
};

const staffNavItems = [
  { title: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
  { title: "Services", href: "/staff/services", icon: ClipboardList },
  { title: "Orders", href: "/staff/orders", icon: PackagePlus },
  { title: "Products", href: "/staff/products", icon: Droplets },
  { title: "Customers", href: "/staff/customers", icon: UsersRound },
  { title: "Technicians", href: "/staff/technicians", icon: Wrench },
  { title: "Invoices", href: "/staff/invoices", icon: FileText },
];

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { profile, user, signOut } = useAuth();

  return (
    <RoleGuard allowed={["STAFF"]}>
      <AppShell
        sidebar={
          <Sidebar
            title="Staff"
            subtitle=""
            items={staffNavItems}
            userName={profile?.name ?? user?.email ?? "Staff Member"}
            userEmail={user?.email ?? ""}
            userRole="Staff"
            onLogout={() => {
              void signOut();
            }}
          />
        }
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}

