"use client";

import { useEffect, useState } from "react";
import { Calendar, History, Mail, MapPin, Phone, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { useCustomers } from "@/hooks/use-customers";
import { fetchOrdersByCustomerId } from "@/lib/firestore/orders";
import type { Customer } from "@/types/customer";
import type { Order } from "@/types/order";

type CustomerSelectorWithOrdersProps = {
  selectedCustomerId: string;
  selectedOrderId?: string | null;
  onCustomerChange: (customerId: string) => void;
  onSelectOrder: (order: Order, checked: boolean) => void;
  onViewServiceHistory?: (customerId: string, customerName: string, productId: string, productName: string) => void;
  disabled?: boolean;
};

export function CustomerSelectorWithOrders({
  selectedCustomerId,
  selectedOrderId,
  onCustomerChange,
  onSelectOrder,
  onViewServiceHistory,
  disabled,
}: CustomerSelectorWithOrdersProps) {
  const { customers, loading: customersLoading } = useCustomers();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find((c) => c.id === selectedCustomerId);
      setSelectedCustomer(customer ?? null);
      if (customer) {
        void loadOrders(customer.id);
      } else {
        setOrders([]);
      }
    } else {
      setSelectedCustomer(null);
      setOrders([]);
    }
  }, [selectedCustomerId, customers]);

  const loadOrders = async (customerId: string) => {
    setLoadingOrders(true);
    try {
      const customerOrders = await fetchOrdersByCustomerId(customerId);
      setOrders(customerOrders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order history.");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Customer
        </label>
        <Combobox
          options={customers.map((customer) => ({
            value: customer.id,
            label: `${customer.name} (${customer.email})`,
          }))}
          value={selectedCustomerId}
          onValueChange={onCustomerChange}
          placeholder="Select customer"
          searchPlaceholder="Search customers..."
          emptyMessage="No customers found"
          disabled={disabled || customersLoading}
          allowClear
        />
      </div>

      {selectedCustomer ? (
        <Card className="rounded-2xl border border-border/40 bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base text-primary">Customer Details</CardTitle>
            <CardDescription>Information about the selected customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Name:</span>
                <span className="text-foreground">{selectedCustomer.name}</span>
              </div>
              {selectedCustomer.email ? (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedCustomer.email}</span>
                </div>
              ) : null}
              {selectedCustomer.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedCustomer.phone}</span>
                </div>
              ) : null}
              {selectedCustomer.address ? (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedCustomer.address}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-muted-foreground">Status:</span>
                <Badge variant={selectedCustomer.isActive ? "success" : "secondary"}>
                  {selectedCustomer.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {selectedCustomer ? (
        <Card className="rounded-2xl border border-border/40 bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <ShoppingBag className="h-4 w-4" />
              Order History
            </CardTitle>
            <CardDescription>
              Select an order to create a service. Click the "History" button to view service history for each product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading order history...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No orders found for this customer.
              </div>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {orders
                  .filter((order) => order.status !== "CANCELLED")
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start gap-3 rounded-xl border border-input bg-white/90 p-4 transition-colors hover:bg-secondary/50"
                    >
                      <label className="flex cursor-pointer items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedOrderId === order.id}
                          onCheckedChange={(checked) => {
                            onSelectOrder(order, checked === true);
                          }}
                          disabled={disabled}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-primary">{order.productName}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Order ID: {order.customId ?? order.id.slice(0, 8)}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Qty: {order.quantity} × ₹{order.unitPrice.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">
                                ₹{order.totalAmount.toLocaleString("en-IN")}
                              </p>
                              <div className="mt-1">
                                {(() => {
                                  const statusMeta: Record<
                                    Order["status"],
                                    { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }
                                  > = {
                                    PENDING: { label: "Pending", variant: "outline" },
                                    FULFILLED: { label: "Fulfilled", variant: "success" },
                                    CANCELLED: { label: "Cancelled", variant: "destructive" },
                                  };
                                  const meta = statusMeta[order.status];
                                  return (
                                    <Badge variant={meta.variant} className="uppercase">
                                      {meta.label}
                                    </Badge>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 text-primary/70" />
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </label>
                      {selectedCustomer && onViewServiceHistory && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/40"
                          onClick={() => {
                            onViewServiceHistory(
                              selectedCustomer.id,
                              selectedCustomer.name,
                              order.productId,
                              order.productName,
                            );
                          }}
                          disabled={disabled}
                          title="View service history for this product"
                        >
                          <History className="mr-2 h-4 w-4" />
                          <span className="text-xs">History</span>
                        </Button>
                      )}
                    </div>
                  ))}
                {orders.filter((order) => order.status !== "CANCELLED").length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No active orders found for this customer.
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

