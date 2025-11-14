"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Eye,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCustomers } from "@/hooks/use-customers";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import type { CreateOrderInput, OrderStatus } from "@/types/order";

const orderStatusLabels: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "success" | "destructive" }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  FULFILLED: { label: "Fulfilled", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

type OrderFormErrors = {
  customerId: string;
  productId: string;
  quantity: string;
};

export function OrderTable() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/staff") ? "/staff" : "/admin";
  const { orders, loading, saving, error, handleCreate, handleUpdateStatus, handleDelete } =
    useOrders();
  const {
    customers,
    loading: customersLoading,
    error: customersError,
  } = useCustomers();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<{
    customerId: string;
    productId: string;
    quantity: number;
  }>({
    customerId: "",
    productId: "",
    quantity: 1,
  });
  const [formErrors, setFormErrors] = useState<OrderFormErrors>({
    customerId: "",
    productId: "",
    quantity: "",
  });

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === "ALL" || order.status === status;
      const matchesQuery =
        !query ||
        order.customerName.toLowerCase().includes(query) ||
        order.productName.toLowerCase().includes(query) ||
        (order.invoiceNumber ?? "").toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [orders, search, status]);

  const selectedProduct = products.find((product) => product.id === formValues.productId);
  const selectedCustomer = customers.find((customer) => customer.id === formValues.customerId);
  const totalAmount = selectedProduct
    ? selectedProduct.price * (formValues.quantity || 0)
    : 0;

  const resetForm = () => {
    setFormValues({
      customerId: "",
      productId: "",
      quantity: 1,
    });
    setFormErrors({
      customerId: "",
      productId: "",
      quantity: "",
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const validateForm = () => {
    const nextErrors: OrderFormErrors = {
      customerId: "",
      productId: "",
      quantity: "",
    };
    let isValid = true;

    if (!formValues.customerId) {
      nextErrors.customerId = "Select a customer.";
      isValid = false;
    }
    if (!formValues.productId) {
      nextErrors.productId = "Select a product.";
      isValid = false;
    }
    if (!formValues.quantity || formValues.quantity <= 0) {
      nextErrors.quantity = "Quantity must be greater than zero.";
      isValid = false;
    }

    setFormErrors(nextErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm() || !selectedCustomer || !selectedProduct) {
      return;
    }

    const payload: CreateOrderInput = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: formValues.quantity,
      unitPrice: selectedProduct.price,
    };

    try {
      await handleCreate(payload);
      toast.success("Order created and invoice generated.");
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create order. Please try again.");
    }
  };

  const handleStatusChange = async (id: string, nextStatus: OrderStatus) => {
    try {
      await handleUpdateStatus(id, nextStatus);
      toast.success(`Order marked as ${orderStatusLabels[nextStatus].label}.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status.");
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteTargetId) return;
    try {
      await handleDelete(deleteTargetId, deleteInvoiceId ?? undefined);
      toast.success("Order deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order.");
    } finally {
      setDeleteTargetId(null);
      setDeleteInvoiceId(null);
    }
  };

  const isFormDisabled =
    customersLoading ||
    productsLoading ||
    customersError !== null ||
    productsError !== null ||
    customers.length === 0 ||
    products.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">Order Management</h2>
          <p className="text-sm text-muted-foreground">
            Create customer orders, track fulfillment, and manage generated invoices.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={openCreateDialog}>
            Create Order
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 shadow-soft lg:grid-cols-[2fr_1fr]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders by customer, product, or invoice number..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus | "ALL")}>
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-5 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  All statuses
                </div>
              </SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FULFILLED">Fulfilled</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <SimpleTable
        data={filteredOrders}
        columns={[
          {
            key: "customerName",
            header: "Customer",
            render: (order) => (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">Order #{order.customId}</p>
              </div>
            ),
          },
          {
            key: "productName",
            header: "Product",
            className: "min-w-[220px]",
            render: (order) => (
              <div className="space-y-1">
                <p className="text-sm text-foreground">{order.productName}</p>
                <p className="text-xs text-muted-foreground">
                  Qty: {order.quantity} · Unit: ₹{order.unitPrice.toLocaleString("en-IN")}
                </p>
              </div>
            ),
          },
          {
            key: "totalAmount",
            header: "Total",
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
              const statusConfig = orderStatusLabels[order.status];
              return (
                <Badge variant={statusConfig.variant} className="uppercase">
                  {statusConfig.label}
                </Badge>
              );
            },
          },
          {
            key: "invoiceNumber",
            header: "Invoice",
            className: "whitespace-nowrap",
            render: (order) => (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>{order.invoiceNumber ?? "Pending"}</p>
                <p>Status: {order.invoiceStatus ?? "PENDING"}</p>
              </div>
            ),
          },
          {
            key: "createdAt",
            header: "Created",
            render: (order) => (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 text-primary/70" />
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </div>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (order) => (
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => router.push(`${basePath}/orders/${order.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
                {order.status !== "FULFILLED" ? (
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleStatusChange(order.id, "FULFILLED")}
                    title="Mark fulfilled"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="sr-only">Mark fulfilled</span>
                  </Button>
                ) : null}
                {order.status !== "CANCELLED" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-amber-600 hover:bg-amber-100"
                    onClick={() => handleStatusChange(order.id, "CANCELLED")}
                    title="Cancel order"
                  >
                    <Ban className="h-4 w-4" />
                    <span className="sr-only">Cancel order</span>
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setDeleteTargetId(order.id);
                    setDeleteInvoiceId(order.invoiceId ?? null);
                  }}
                  title="Delete order"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ),
          },
        ]}
        emptyMessage={
          loading
            ? "Loading orders..."
            : "No orders found. Create one to get started."
        }
      />

      <div className="flex flex-col justify-between gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 text-sm text-muted-foreground shadow-soft md:flex-row md:items-center">
        <p>
          Showing{" "}
          <span className="font-semibold text-primary">{filteredOrders.length}</span>{" "}
          order{filteredOrders.length === 1 ? "" : "s"} from Firestore.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Status updates automatically sync invoices.
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Order</DialogTitle>
            <DialogDescription>
              Choose a customer and product to create a new order. An invoice will be generated
              automatically.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Customer
              </label>
              <Select
                value={formValues.customerId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, customerId: value }))
                }
                disabled={isFormDisabled}
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
              {formErrors.customerId ? (
                <p className="text-xs text-destructive">{formErrors.customerId}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Product
              </label>
              <Select
                value={formValues.productId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, productId: value }))
                }
                disabled={isFormDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} · ₹{product.price.toLocaleString("en-IN")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.productId ? (
                <p className="text-xs text-destructive">{formErrors.productId}</p>
              ) : null}
            </div>

            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quantity
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formValues.quantity}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      quantity: Number(event.target.value),
                    }))
                  }
                  disabled={isFormDisabled}
                />
                {formErrors.quantity ? (
                  <p className="text-xs text-destructive">{formErrors.quantity}</p>
                ) : null}
              </div>
              <div className="grid gap-2 rounded-2xl bg-gradient-soft p-4 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Unit price</span>
                  <span className="font-semibold text-foreground">
                    {selectedProduct
                      ? `₹${selectedProduct.price.toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Quantity</span>
                  <span className="font-semibold text-foreground">
                    {formValues.quantity || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-primary">
                  <span>Total</span>
                  <span className="text-lg font-semibold">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={saving || isFormDisabled}>
                {saving ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTargetId)} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the order and its associated invoice. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteTargetId(null);
                setDeleteInvoiceId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteOrder}
              disabled={saving}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

