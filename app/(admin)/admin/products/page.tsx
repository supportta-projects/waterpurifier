import type { Metadata } from "next";

import { ProductTable } from "@/components/products/product-table";

export const metadata: Metadata = {
  title: "Products | Admin | Water Purifier Service Platform",
};

export default function AdminProductsPage() {
  return (
    <section className="space-y-6">
      <ProductTable />
    </section>
  );
}

