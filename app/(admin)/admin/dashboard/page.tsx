import type { Metadata } from "next";
import { AdminDashboardClient } from "@/components/dashboard/admin-dashboard-client";

export const metadata: Metadata = {
  title: "Admin Dashboard | Water Purifier Service Platform",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}

