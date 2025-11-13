"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Receipt, ShoppingCart, User2 } from "lucide-react";

import { useOrders } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusBadge: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  FULFILLED: { label: "Fulfilled", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

type OrderDetailClientProps = {
  orderId: string;
};

export function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const router = useRouter();
  const { orders, loading, error } = useOrders();

  const order = useMemo(
    () => orders.find((item) => item.id === orderId) ?? null,
    [orders, orderId],
  );

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center text-sm text-muted-foreground">
        Loading order details…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-border/40 bg-white/90 p-10 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">
          {error ?? "Order not found in Firestore."}
        </p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => router.push("/admin/orders")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to orders
        </Button>
      </div>
    );
  }

  const statusConfig = statusBadge[order.status];

  return (
    <section className="space-y-6">
      <Button
        variant="ghost"
        className="rounded-full text-sm text-primary hover:bg-primary/10"
        onClick={() => router.push("/admin/orders")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to orders
      </Button>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-[2rem] border border-border/40 bg-white/90 shadow-soft">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl text-primary">Order #{order.id.slice(0, 10)}</CardTitle>
              <CardDescription>
                Created{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </CardDescription>
            </div>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/40 bg-white/90 p-5 shadow-inner shadow-black/5">
              <div className="flex items-center gap-3 text-sm font-semibold text-primary">
                <User2 className="h-4 w-4" />
                Customer Details
              </div>
              <div className="mt-3 text-sm text-foreground">
                <p>{order.customerName}</p>
                <p className="text-xs text-muted-foreground">Customer ID: {order.customerId}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-white/90 p-5 shadow-inner shadow-black/5">
              <div className="flex items-center gap-3 text-sm font-semibold text-primary">
                <ShoppingCart className="h-4 w-4" />
                Product Details
              </div>
              <div className="mt-3 grid gap-2 text-sm text-foreground md:grid-cols-2">
                <p>{order.productName}</p>
                <p className="text-muted-foreground">Product ID: {order.productId}</p>
                <p>
                  Quantity: <span className="font-semibold">{order.quantity}</span>
                </p>
                <p>
                  Unit price:{" "}
                  <span className="font-semibold">
                    ₹{order.unitPrice.toLocaleString("en-IN")}
                  </span>
                </p>
                <p className="md:col-span-2 text-primary font-semibold">
                  Total amount: ₹{order.totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-border/40 bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Invoice</CardTitle>
            <CardDescription>Automatically generated for this order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Receipt className="h-4 w-4 text-primary/80" />
              Invoice number
            </div>
            <p className="font-semibold text-primary">
              {order.invoiceNumber ?? "Pending"}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="h-4 w-4 text-primary/80" />
              Status
            </div>
            <p className="font-semibold uppercase text-foreground">
              {order.invoiceStatus ?? "PENDING"}
            </p>
            <div className="rounded-xl bg-gradient-soft p-4 text-xs text-muted-foreground">
              The invoice can be re-shared from the invoices module once that workflow is
              connected. For now, share manually with the customer.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

