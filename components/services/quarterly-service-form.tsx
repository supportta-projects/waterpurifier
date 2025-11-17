"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { CustomerSelectorWithOrders } from "@/components/services/customer-selector-with-orders";
import { ServiceHistoryDialog } from "@/components/services/service-history-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { useAuth } from "@/hooks/use-auth";
import { useCustomers } from "@/hooks/use-customers";
import { useServices } from "@/hooks/use-services";
import { useTechnicians } from "@/hooks/use-technicians";
import type { CreateServiceInput } from "@/types/service";
import type { Order } from "@/types/order";

type QuarterlyServiceFormProps = {
  basePath: string;
};

type ServiceFormErrors = {
  customerId: string;
  productId: string;
  scheduledDate: string;
};

export function QuarterlyServiceForm({ basePath }: QuarterlyServiceFormProps) {
  const router = useRouter();

  const { user } = useAuth();
  const { customers, loading: customersLoading } = useCustomers();
  const { technicians, loading: techniciansLoading } = useTechnicians();
  const { saving, handleCreate } = useServices();

  const [formValues, setFormValues] = useState<CreateServiceInput>({
    customerId: "",
    customerName: "",
    productId: "",
    productName: "",
    orderId: null,
    orderCustomId: null,
    serviceType: "QUARTERLY",
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
  const [serviceHistoryOpen, setServiceHistoryOpen] = useState(false);
  const [serviceHistoryData, setServiceHistoryData] = useState<{
    customerId: string;
    customerName: string;
    productId: string;
    productName: string;
  } | null>(null);

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
  };

  const handleOrderSelect = (order: Order, checked: boolean) => {
    if (checked) {
      setFormValues((prev) => ({
        ...prev,
        customerId: order.customerId,
        customerName: order.customerName,
        productId: order.productId,
        productName: order.productName,
        orderId: order.id,
        orderCustomId: order.customId,
        serviceType: "QUARTERLY",
      }));
    } else {
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

    if (!selectedCustomer || !formValues.productId) {
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
        productId: formValues.productId,
        productName: formValues.productName,
        orderId: formValues.orderId ?? null,
        orderCustomId: formValues.orderCustomId ?? null,
        serviceType: "QUARTERLY",
        scheduledDate: formValues.scheduledDate,
        notes: formValues.notes,
        technicianId: selectedTechnician?.id ?? null,
        technicianName: selectedTechnician?.name ?? null,
        createdBy: user?.uid ?? null,
        assignedBy: selectedTechnician?.id ? (user?.uid ?? null) : null,
      });
      toast.success("Quarterly service scheduled successfully.");
      router.push(`${basePath}/services`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule service. Please try again.");
    }
  };

  const isFormDisabled = customersLoading || techniciansLoading || saving;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-primary">Create Quarterly Service</h2>
          <p className="text-sm text-muted-foreground">
            Select a customer and order to schedule a quarterly service visit.
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
            onViewServiceHistory={(customerId, customerName, productId, productName) => {
              setServiceHistoryData({ customerId, customerName, productId, productName });
              setServiceHistoryOpen(true);
            }}
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
            <Combobox
              options={[
                { value: "none", label: "None" },
                ...technicians.map((tech) => ({
                  value: tech.id,
                  label: tech.name,
                })),
              ]}
              value={formValues.technicianId ?? "none"}
              onValueChange={(value) => {
                if (value === "none" || !value) {
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
              placeholder="Select technician (optional)"
              searchPlaceholder="Search technicians..."
              emptyMessage="No technicians found"
              disabled={isFormDisabled}
              allowClear
            />
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

      {serviceHistoryData && (
        <ServiceHistoryDialog
          open={serviceHistoryOpen}
          onOpenChange={(open) => {
            setServiceHistoryOpen(open);
            if (!open) {
              setServiceHistoryData(null);
            }
          }}
          customerId={serviceHistoryData.customerId}
          customerName={serviceHistoryData.customerName}
          productId={serviceHistoryData.productId}
          productName={serviceHistoryData.productName}
        />
      )}
    </div>
  );
}

