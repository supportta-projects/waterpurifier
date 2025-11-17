"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
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
import { getPageTitle } from "@/lib/utils/page-titles";

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
  const pathname = usePathname();
  const { title, description } = getPageTitle(pathname, "TECHNICIAN");

  return (
    <RoleGuard allowed={["TECHNICIAN"]}>
      <AppShell
        sidebar={
          <Sidebar
            title="Technician"
            subtitle=""
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
            title={title}
            description={description}
          />
        }
      >
        {children}
      </AppShell>
    </RoleGuard>
  );
}

