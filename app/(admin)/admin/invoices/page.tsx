import type { Metadata } from "next";

import { InvoiceTable } from "@/components/invoices/invoice-table";

export const metadata: Metadata = {
  title: "Invoices | Admin",
};

export default function AdminInvoicesPage() {
  return <InvoiceTable />;
}


