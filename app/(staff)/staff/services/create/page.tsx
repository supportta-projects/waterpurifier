"use client";

import { usePathname } from "next/navigation";

import { ManualServiceForm } from "@/components/services/manual-service-form";

export default function StaffCreateManualServicePage() {
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/staff") ? "/staff" : "/admin";

  return (
    <section className="space-y-6">
      <ManualServiceForm basePath={basePath} />
    </section>
  );
}

