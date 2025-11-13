import type { Metadata } from "next";

import { ServiceTable } from "@/components/services/service-table";

export const metadata: Metadata = {
  title: "Latest Services | Admin | Water Purifier Service Platform",
};

export default function AdminServicesLatestPage() {
  return (
    <section className="space-y-6">
      <ServiceTable variant="latest" />
    </section>
  );
}

