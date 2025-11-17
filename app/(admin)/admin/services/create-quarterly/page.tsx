"use client";

import { usePathname } from "next/navigation";

import { QuarterlyServiceForm } from "@/components/services/quarterly-service-form";

export default function AdminCreateQuarterlyServicePage() {
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/staff") ? "/staff" : "/admin";

  return (
    <section className="space-y-6">
      <QuarterlyServiceForm basePath={basePath} />
    </section>
  );
}

