import type { Metadata } from "next";

import { OrderTable } from "@/components/orders/order-table";

export const metadata: Metadata = {
  title: "Orders | Admin | Water Purifier Service Platform",
};

export default function AdminOrdersPage() {
  return (
    <section className="space-y-6">
      <OrderTable />
    </section>
  );
}

