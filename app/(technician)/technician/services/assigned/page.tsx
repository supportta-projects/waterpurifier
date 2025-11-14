import type { Metadata } from "next";

import { TechnicianServiceTable } from "@/components/services/technician-service-table";

export const metadata: Metadata = {
  title: "Assigned Work | Technician",
};

export default function TechnicianAssignedServicesPage() {
  return (
    <section className="space-y-6">
      <TechnicianServiceTable variant="assigned" />
    </section>
  );
}

