import type { Metadata } from "next";

import { InvoiceTable } from "@/components/invoices/invoice-table";

export const metadata: Metadata = {
  title: "Invoices | Staff",
};

export default function StaffInvoicesPage() {
  return <InvoiceTable />;
}

