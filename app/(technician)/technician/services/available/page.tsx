import type { Metadata } from "next";

import { TechnicianServiceTable } from "@/components/services/technician-service-table";

export const metadata: Metadata = {
  title: "Available Services | Technician",
};

export default function TechnicianAvailableServicesPage() {
  return (
    <section className="space-y-6">
      <TechnicianServiceTable variant="available" />
    </section>
  );
}

