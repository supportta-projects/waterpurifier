import type { Metadata } from "next";

import { ServiceTable } from "@/components/services/service-table";

export const metadata: Metadata = {
  title: "All Services | Admin | Water Purifier Service Platform",
};

export default function AdminServicesAllPage() {
  return (
    <section className="space-y-6">
      <ServiceTable variant="all" />
    </section>
  );
}

