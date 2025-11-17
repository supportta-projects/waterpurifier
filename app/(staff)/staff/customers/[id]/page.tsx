import type { Metadata } from "next";

import { CustomerDetailClient } from "@/components/customers/customer-detail-client";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Customer Details | Staff | Water Purifier Service Platform",
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  return <CustomerDetailClient customerId={id} />;
}

