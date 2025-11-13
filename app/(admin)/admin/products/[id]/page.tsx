import type { Metadata } from "next";

import { ProductDetailClient } from "@/components/products/product-detail-client";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Product Details | Admin",
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}
