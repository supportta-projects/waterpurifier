import type { Metadata } from "next";

import { ServiceTable } from "@/components/services/service-table";

export const metadata: Metadata = {
  title: "Services | Staff | Water Purifier Service Platform",
};

export default function StaffServicesPage() {
  return (
    <section className="space-y-6">
      <ServiceTable variant="all" />
    </section>
  );
}

