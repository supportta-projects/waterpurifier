import type { Metadata } from "next";

import { TechnicianAvailabilityClient } from "@/components/technicians/technician-availability-client";

export const metadata: Metadata = {
  title: "Technicians | Water Purifier Service Platform",
};

export default function StaffTechniciansPage() {
  return <TechnicianAvailabilityClient />;
}

