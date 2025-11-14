import type { Metadata } from "next";

import { InvoiceDetailClient } from "@/components/invoices/invoice-detail-client";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Invoice Details | Staff",
};

export default async function StaffInvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  return <InvoiceDetailClient invoiceId={id} />;
}

