import type { Metadata } from "next";
import { InvoiceTemplateClient } from "@/components/invoices/invoice-template-client";

type InvoiceTemplatePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Invoice | Water Purifier Service",
  description: "View your invoice details",
};

export default async function InvoiceTemplatePage({ params }: InvoiceTemplatePageProps) {
  const { id } = await params;
  return <InvoiceTemplateClient invoiceId={id} />;
}

