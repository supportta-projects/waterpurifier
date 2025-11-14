import type { Metadata } from "next";

import { InvoiceTable } from "@/components/invoices/invoice-table";

export const metadata: Metadata = {
  title: "Invoices | Technician",
};

export default function TechnicianInvoicesPage() {
  return <InvoiceTable />;
}

