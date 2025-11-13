import type { Metadata } from "next";

import { InvoiceDetailClient } from "@/components/invoices/invoice-detail-client";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Invoice Details | Admin",
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  return <InvoiceDetailClient invoiceId={id} />;
}


