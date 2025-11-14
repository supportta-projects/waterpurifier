import type { Metadata } from "next";

import { CustomerTable } from "@/components/customers/customer-table";

export const metadata: Metadata = {
  title: "Customers | Staff | Water Purifier Service Platform",
};

export default function StaffCustomersPage() {
  return (
    <section className="space-y-6">
      <CustomerTable />
    </section>
  );
}

