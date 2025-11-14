"use client";

import { useEffect, useState } from "react";
import { Calendar, Mail, MapPin, Phone, ShoppingBag, Wrench } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleTable } from "@/components/data/simple-table";
import { useCustomers } from "@/hooks/use-customers";
import { fetchOrdersByCustomerId } from "@/lib/firestore/orders";
import type { Customer } from "@/types/customer";
import type { Order } from "@/types/order";

type CustomerSelectorWithOrdersProps = {
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
  onSelectOrder: (order: Order) => void;
  disabled?: boolean;
};

export function CustomerSelectorWithOrders({
  selectedCustomerId,
  onCustomerChange,
  onSelectOrder,
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
        <Select
          value={selectedCustomerId}
          onValueChange={onCustomerChange}
          disabled={disabled || customersLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name} ({customer.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              Select an order to create a manual service for this customer
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
              <SimpleTable
                data={orders}
                columns={[
                  {
                    key: "productName",
                    header: "Product",
                    className: "min-w-[180px]",
                    render: (order) => (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-primary">{order.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {order.quantity} × ₹{order.unitPrice.toLocaleString()}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "totalAmount",
                    header: "Amount",
                    className: "min-w-[120px]",
                    render: (order) => (
                      <span className="text-sm font-semibold text-foreground">
                        ₹{order.totalAmount.toLocaleString()}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    className: "min-w-[100px]",
                    render: (order) => {
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
                    },
                  },
                  {
                    key: "createdAt",
                    header: "Order Date",
                    className: "min-w-[140px] whitespace-nowrap",
                    render: (order) => (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-primary/70" />
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    ),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    className: "min-w-[160px]",
                    render: (order) => (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => onSelectOrder(order)}
                        disabled={order.status === "CANCELLED"}
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        Create Service
                      </Button>
                    ),
                  },
                ]}
                emptyMessage="No orders found."
              />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

