import type { Metadata } from "next";

import { TechnicianDashboardClient } from "@/components/dashboard/technician-dashboard-client";

export const metadata: Metadata = {
  title: "Technician Dashboard | Water Purifier Service Platform",
};

export default function TechnicianDashboardPage() {
  return <TechnicianDashboardClient />;
}

