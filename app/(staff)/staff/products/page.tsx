import type { Metadata } from "next";

import { ProductTable } from "@/components/products/product-table";

export const metadata: Metadata = {
  title: "Products | Staff | Water Purifier Service Platform",
};

export default function StaffProductsPage() {
  return (
    <section className="space-y-6">
      <ProductTable />
    </section>
  );
}

