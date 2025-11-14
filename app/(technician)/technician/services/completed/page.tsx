import type { Metadata } from "next";

import { TechnicianServiceTable } from "@/components/services/technician-service-table";

export const metadata: Metadata = {
  title: "Completed Services | Technician",
};

export default function TechnicianCompletedServicesPage() {
  return (
    <section className="space-y-6">
      <TechnicianServiceTable variant="completed" />
    </section>
  );
}

