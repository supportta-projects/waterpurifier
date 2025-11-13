import type { Metadata } from "next";

import { StaffTable } from "@/components/staff/staff-table";

export const metadata: Metadata = {
  title: "Staff & Technicians | Admin | Water Purifier Service Platform",
};

export default function AdminStaffPage() {
  return (
    <section className="space-y-6">
      <StaffTable />
    </section>
  );
}

