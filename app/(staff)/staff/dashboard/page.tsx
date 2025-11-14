import type { Metadata } from "next";

import { StaffDashboardClient } from "@/components/dashboard/staff-dashboard-client";

export const metadata: Metadata = {
  title: "Staff Dashboard | Water Purifier Service Platform",
};

export default function StaffDashboardPage() {
  return <StaffDashboardClient />;
}

