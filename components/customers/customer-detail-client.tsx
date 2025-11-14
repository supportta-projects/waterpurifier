"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, ClipboardList, Mail, MapPin, Phone, Plus } from "lucide-react";
import { toast } from "sonner";

import { SimpleTable } from "@/components/data/simple-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchCustomers } from "@/lib/firestore/customers";
import { fetchOrdersByCustomerId } from "@/lib/firestore/orders";
import { useServices } from "@/hooks/use-services";
import { useProducts } from "@/hooks/use-products";
import type { Customer } from "@/types/customer";
import type { Order } from "@/types/order";
import type { CreateServiceInput } from "@/types/service";

type CustomerDetailClientProps = {
  customerId: string;
};

type ServiceFormErrors = {
  productId: string;
  scheduledDate: string;
};

export function CustomerDetailClient({ customerId }: CustomerDetailClientProps) {
  const router = useRouter();
  const { handleCreate, saving } = useServices();
  const { products, loading: productsLoading } = useProducts();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createServiceDialogOpen, setCreateServiceDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formValues, setFormValues] = useState<{
    productId: string;
    scheduledDate: string;
    notes: string;
  }>({
    productId: "",
    scheduledDate: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<ServiceFormErrors>({
    productId: "",
    scheduledDate: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersData, ordersData] = await Promise.all([
        fetchCustomers(),
        fetchOrdersByCustomerId(customerId),
      ]);
      const foundCustomer = customersData.find((c) => c.id === customerId);
      if (!foundCustomer) {
        setError("Customer not found.");
        return;
      }
      setCustomer(foundCustomer);
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
      setError("Failed to load customer data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openCreateServiceDialog = (order: Order) => {
    setSelectedOrder(order);
    setFormValues({
      productId: order.productId,
      scheduledDate: "",
      notes: "",
    });
    setFormErrors({
      productId: "",
      scheduledDate: "",
    });
    setCreateServiceDialogOpen(true);
  };

  const validateForm = () => {
    const nextErrors: ServiceFormErrors = {
      productId: "",
      scheduledDate: "",
    };
    let isValid = true;
    if (!formValues.productId) {
      nextErrors.productId = "Select a product.";
      isValid = false;
    }
    if (!formValues.scheduledDate) {
      nextErrors.scheduledDate = "Choose a date.";
      isValid = false;
    }
    setFormErrors(nextErrors);
    return isValid;
  };

  const handleCreateService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm() || !selectedOrder || !customer) return;

    const selectedProduct = products.find((product) => product.id === formValues.productId);
    if (!selectedProduct) {
      toast.error("Unable to find selected product.");
      return;
    }

    try {
      const payload: CreateServiceInput = {
        customerId: customer.id,
        customerName: customer.name,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        serviceType: "MANUAL",
        scheduledDate: formValues.scheduledDate,
        notes: formValues.notes,
      };
      await handleCreate(payload);
      toast.success("Manual service scheduled.");
      setCreateServiceDialogOpen(false);
      setSelectedOrder(null);
      setFormValues({
        productId: "",
        scheduledDate: "",
        notes: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule service. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-64 animate-pulse rounded-[2rem] bg-muted" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-primary">Customer Details</h2>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error || "Customer not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-primary">{customer.name}</h2>
          <p className="text-sm text-muted-foreground">Customer Details & Order History</p>
        </div>
      </div>

      <div className="grid gap-6 rounded-[2rem] border border-border/40 bg-white/90 p-6 shadow-soft md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary/70" />
                <span className="text-sm">{customer.email}</span>
              </div>
              {customer.phone ? (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary/70" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              ) : null}
              {customer.address ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary/70" />
                  <span className="text-sm">{customer.address}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Account Status
            </h3>
            <div className="space-y-3">
              <div>
                <Badge variant={customer.isActive ? "success" : "secondary"}>
                  {customer.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary/70" />
                <span>
                  Created{" "}
                  {customer.createdAt
                    ? new Date(customer.createdAt).toLocaleDateString("en-IN", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">Order History</h3>
            <p className="text-sm text-muted-foreground">
              {orders.length} order{orders.length === 1 ? "" : "s"} found
            </p>
          </div>
        </div>

        <SimpleTable
          data={orders}
          columns={[
            {
              key: "productName",
              header: "Product",
              className: "min-w-[200px]",
              render: (order) => (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary">{order.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {order.quantity} × ₹{order.unitPrice.toLocaleString("en-IN")}
                  </p>
                </div>
              ),
            },
            {
              key: "totalAmount",
              header: "Amount",
              render: (order) => (
                <p className="text-sm font-semibold text-foreground">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </p>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (order) => {
                const statusMeta: Record<
                  typeof order.status,
                  { label: string; variant: "default" | "secondary" | "success" | "destructive" }
                > = {
                  PENDING: { label: "Pending", variant: "secondary" },
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
              render: (order) => (
                <p className="text-xs text-muted-foreground">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              className: "min-w-[160px]",
              render: (order) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    View
                  </Button>
                  {order.status === "FULFILLED" ? (
                    <Button
                      size="sm"
                      className="rounded-full"
                      onClick={() => openCreateServiceDialog(order)}
                    >
                      <ClipboardList className="mr-1.5 h-4 w-4" />
                      Manual Service
                    </Button>
                  ) : null}
                </div>
              ),
            },
          ]}
          emptyMessage="No orders found for this customer."
        />
      </div>

      <Dialog open={createServiceDialogOpen} onOpenChange={setCreateServiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Manual Service</DialogTitle>
            <DialogDescription>
              Schedule a manual service for this customer based on their order. The service will be
              created as "Manual" type.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateService}>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Product
              </label>
              <Select
                value={formValues.productId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, productId: value }))
                }
                disabled={productsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.productId ? (
                <p className="text-xs text-destructive">{formErrors.productId}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Scheduled Date
              </label>
              <Input
                type="date"
                value={formValues.scheduledDate}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    scheduledDate: event.target.value,
                  }))
                }
              />
              {formErrors.scheduledDate ? (
                <p className="text-xs text-destructive">{formErrors.scheduledDate}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notes
              </label>
              <Textarea
                rows={4}
                value={formValues.notes}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder="Any special instructions or customer preferences."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setCreateServiceDialogOpen(false);
                  setSelectedOrder(null);
                  setFormValues({
                    productId: "",
                    scheduledDate: "",
                    notes: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={saving || productsLoading}>
                {saving ? "Scheduling..." : "Schedule Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

