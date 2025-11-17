"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CustomerSelectorWithOrders } from "@/components/services/customer-selector-with-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useServices } from "@/hooks/use-services";
import { useTechnicians } from "@/hooks/use-technicians";
import { fetchOrdersByCustomerId } from "@/lib/firestore/orders";
import type { CreateServiceInput } from "@/types/service";
import type { Order } from "@/types/order";

type ManualServiceFormProps = {
  basePath: string;
  initialOrderId?: string;
  initialCustomerId?: string;
};

type ServiceFormErrors = {
  customerId: string;
  productId: string;
  scheduledDate: string;
};

export function ManualServiceForm({ basePath, initialOrderId, initialCustomerId }: ManualServiceFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from query params if provided
  const orderIdFromQuery = initialOrderId ?? searchParams?.get("orderId") ?? "";
  const customerIdFromQuery = initialCustomerId ?? searchParams?.get("customerId") ?? "";

  const { customers, loading: customersLoading } = useCustomers();
  const { products, loading: productsLoading } = useProducts();
  const { technicians, loading: techniciansLoading } = useTechnicians();
  const { saving, handleCreate } = useServices();

  const [formValues, setFormValues] = useState<CreateServiceInput>({
    customerId: customerIdFromQuery,
    customerName: "",
    productId: "",
    productName: "",
    orderId: null,
    orderCustomId: null,
    serviceType: "MANUAL",
    scheduledDate: "",
    notes: "",
    technicianId: null,
    technicianName: null,
  });
  const [formErrors, setFormErrors] = useState<ServiceFormErrors>({
    customerId: "",
    productId: "",
    scheduledDate: "",
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const loadOrderData = useCallback(async (customerId: string, orderId: string) => {
    setLoadingOrder(true);
    try {
      const orders = await fetchOrdersByCustomerId(customerId);
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        const customer = customers.find((c) => c.id === customerId);
        setFormValues((prev) => ({
          ...prev,
          customerId: customerId,
          customerName: customer?.name ?? "",
          productId: order.productId,
          productName: order.productName,
          orderId: order.id,
          orderCustomId: order.customId,
          serviceType: "MANUAL",
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order data.");
    } finally {
      setLoadingOrder(false);
    }
  }, [customers]);

  // Load order if orderId is provided
  useEffect(() => {
    if (orderIdFromQuery && customerIdFromQuery) {
      void loadOrderData(customerIdFromQuery, orderIdFromQuery);
    } else if (customerIdFromQuery) {
      // Set customer name if customer ID is provided
      const customer = customers.find((c) => c.id === customerIdFromQuery);
      if (customer) {
        setFormValues((prev) => ({
          ...prev,
          customerId: customer.id,
          customerName: customer.name,
        }));
      }
    }
  }, [orderIdFromQuery, customerIdFromQuery, customers, loadOrderData]);

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setFormValues((prev) => ({
      ...prev,
      customerId,
      customerName: customer?.name ?? "",
      productId: "",
      productName: "",
      orderId: null,
      orderCustomId: null,
    }));
    setSelectedOrder(null);
  };

  const handleOrderSelect = (order: Order, checked: boolean) => {
    if (checked) {
      setSelectedOrder(order);
      setFormValues((prev) => ({
        ...prev,
        customerId: order.customerId,
        customerName: order.customerName,
        productId: order.productId,
        productName: order.productName,
        orderId: order.id,
        orderCustomId: order.customId,
        serviceType: "MANUAL",
      }));
    } else {
      setSelectedOrder(null);
      setFormValues((prev) => ({
        ...prev,
        productId: "",
        productName: "",
        orderId: null,
        orderCustomId: null,
      }));
    }
  };

  const validateForm = () => {
    const nextErrors: ServiceFormErrors = {
      customerId: "",
      productId: "",
      scheduledDate: "",
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
    if (!formValues.scheduledDate) {
      nextErrors.scheduledDate = "Choose a date.";
      isValid = false;
    }
    setFormErrors(nextErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    const selectedCustomer = customers.find((customer) => customer.id === formValues.customerId);
    const selectedProduct = products.find((product) => product.id === formValues.productId);

    if (!selectedCustomer || !selectedProduct) {
      toast.error("Unable to find selected customer or product.");
      return;
    }

    try {
      const selectedTechnician = formValues.technicianId
        ? technicians.find((tech) => tech.id === formValues.technicianId)
        : null;

      await handleCreate({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        orderId: formValues.orderId ?? null,
        orderCustomId: formValues.orderCustomId ?? null,
        serviceType: "MANUAL",
        scheduledDate: formValues.scheduledDate,
        notes: formValues.notes,
        technicianId: selectedTechnician?.id ?? null,
        technicianName: selectedTechnician?.name ?? null,
      });
      toast.success("Manual service scheduled successfully.");
      router.push(`${basePath}/services`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule service. Please try again.");
    }
  };

  const isFormDisabled = customersLoading || productsLoading || techniciansLoading || loadingOrder || saving;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-primary">Create Manual Service</h2>
          <p className="text-sm text-muted-foreground">
            Select a customer and order to schedule a manual service visit.
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-[2rem] border border-border/40 bg-white/90 p-6 shadow-soft">
          <CustomerSelectorWithOrders
            selectedCustomerId={formValues.customerId}
            selectedOrderId={formValues.orderId ?? null}
            onCustomerChange={handleCustomerChange}
            onSelectOrder={handleOrderSelect}
            disabled={isFormDisabled}
          />
          {formErrors.customerId ? (
            <p className="mt-2 text-xs text-destructive">{formErrors.customerId}</p>
          ) : null}
          {formErrors.productId ? (
            <p className="mt-2 text-xs text-destructive">{formErrors.productId}</p>
          ) : null}
        </div>

        <div className="grid gap-6 rounded-[2rem] border border-border/40 bg-white/90 p-6 shadow-soft md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Scheduled Date <span className="text-destructive">*</span>
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
              disabled={isFormDisabled}
              required
            />
            {formErrors.scheduledDate ? (
              <p className="text-xs text-destructive">{formErrors.scheduledDate}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assign Technician (Optional)
            </label>
            <Select
              value={formValues.technicianId ?? "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  setFormValues((prev) => ({
                    ...prev,
                    technicianId: null,
                    technicianName: null,
                  }));
                } else {
                  const technician = technicians.find((tech) => tech.id === value);
                  setFormValues((prev) => ({
                    ...prev,
                    technicianId: value,
                    technicianName: technician?.name ?? null,
                  }));
                }
              }}
              disabled={isFormDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select technician (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {technicians.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/40 bg-white/90 p-6 shadow-soft">
          <div className="grid gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Notes (Optional)
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
              disabled={isFormDisabled}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" className="rounded-full" disabled={isFormDisabled}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Service"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

