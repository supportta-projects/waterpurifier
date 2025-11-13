import type { Metadata } from "next";

import { OrderDetailClient } from "@/components/orders/order-detail-client";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Order Details | Admin",
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailClient orderId={id} />;
}

