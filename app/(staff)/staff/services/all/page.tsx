import type { Metadata } from "next";

import { ServiceTable } from "@/components/services/service-table";

export const metadata: Metadata = {
  title: "All Services | Staff | Water Purifier Service Platform",
};

export default function StaffServicesAllPage() {
  return (
    <section className="space-y-6">
      <ServiceTable variant="all" />
    </section>
  );
}

