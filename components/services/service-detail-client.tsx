"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, ClipboardList, FileText, Users } from "lucide-react";
import { toast } from "sonner";

import { useServices } from "@/hooks/use-services";
import { useAuth } from "@/hooks/use-auth";
import { createInvoice } from "@/lib/firestore/invoices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusMeta: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  AVAILABLE: { label: "Available", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "success" },
};

type ServiceDetailClientProps = {
  serviceId: string;
};

export function ServiceDetailClient({ serviceId }: ServiceDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/technician")
    ? "/technician/services"
    : pathname?.startsWith("/staff")
      ? "/staff/services"
      : "/admin/services";
  const { services, loading, error } = useServices();
  const { role } = useAuth();
  const isTechnician = role === "TECHNICIAN";

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [serviceCharge, setServiceCharge] = useState<string>("");
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const service = useMemo(
    () => services.find((item) => item.id === serviceId) ?? null,
    [services, serviceId],
  );

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center text-sm text-muted-foreground">
        Loading service details…
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-border/40 bg-white/90 p-10 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">
          {error ?? "Service not found in Firestore."}
        </p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => router.push(basePath)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to services
        </Button>
      </div>
    );
  }

  const status = statusMeta[service.status];
  const canCreateInvoice = isTechnician && service.status === "COMPLETED";

  const handleCreateServiceInvoice = async () => {
    if (!service) return;
    
    const amount = parseFloat(serviceCharge);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid service charge amount.");
      return;
    }

    setCreatingInvoice(true);
    try {
      await createInvoice({
        invoiceType: "SERVICE",
        serviceId: service.id,
        serviceCustomId: service.customId ?? undefined,
        orderId: service.orderId ?? null,
        orderCustomId: service.orderCustomId ?? null,
        customerId: service.customerId,
        customerCustomId: service.customerCustomId,
        customerName: service.customerName,
        productId: service.productId,
        productCustomId: service.productCustomId,
        productName: service.productName,
        totalAmount: amount,
      });
      toast.success("Service invoice created successfully!");
      setInvoiceDialogOpen(false);
      setServiceCharge("");
      router.push(`${basePath.replace("/services", "")}/invoices`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create service invoice. Please try again.");
    } finally {
      setCreatingInvoice(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="rounded-full text-sm text-primary hover:bg-primary/10"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {canCreateInvoice && (
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setInvoiceDialogOpen(true)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Create Service Invoice
          </Button>
        )}
      </div>

      <Card className="rounded-[2rem] border border-border/40 bg-white/90 shadow-soft">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl text-primary">{service.customerName}</CardTitle>
            <CardDescription>
              {service.productName} · Scheduled{" "}
              {service.scheduledDate
                ? new Date(service.scheduledDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </CardDescription>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-3 text-sm text-foreground">
            <div className="rounded-2xl bg-gradient-soft p-4">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <ClipboardList className="h-4 w-4" />
                Service Details
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Service type</dt>
                  <dd className="uppercase text-foreground">{service.serviceType}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Status</dt>
                  <dd className="text-foreground">{status.label}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Scheduled date</dt>
                  <dd className="text-foreground">
                    {service.scheduledDate
                      ? new Date(service.scheduledDate).toLocaleString("en-IN", {
                          dateStyle: "medium",
                        })
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Completed on</dt>
                  <dd className="text-foreground">
                    {service.completedDate
                      ? new Date(service.completedDate).toLocaleString("en-IN", {
                          dateStyle: "medium",
                        })
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-2xl bg-white/90 p-4 shadow-inner shadow-black/5">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <Users className="h-4 w-4" />
                Technician
              </div>
              <p className="mt-3 text-sm text-foreground">
                {service.technicianName ?? "No technician assigned yet."}
              </p>
            </div>
            {service.notes ? (
              <div className="rounded-2xl bg-white/90 p-4 shadow-inner shadow-black/5">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes
                </div>
                <p className="mt-2 text-sm text-foreground whitespace-pre-line">{service.notes}</p>
              </div>
            ) : null}
          </div>
          <div className="space-y-3 rounded-2xl border border-border/40 bg-white/90 p-5 text-sm shadow-inner shadow-black/5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Identifiers
            </div>
            <p className="text-sm text-foreground">Service ID: {service.customId ?? service.id}</p>
            <p className="text-xs text-muted-foreground">
              Customer ID: {service.customerCustomId ?? service.customerId}
            </p>
            <p className="text-xs text-muted-foreground">
              Product ID: {service.productCustomId ?? service.productId}
            </p>
            {service.orderId ? (
              <p className="text-xs text-muted-foreground">
                Order ID: {service.orderCustomId ?? service.orderId}
              </p>
            ) : null}
            {service.technicianId ? (
              <p className="text-xs text-muted-foreground">Technician ID: {service.technicianId}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Service Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice for the service charges. This invoice will be separate from the order invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                value={service.customerName}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Input
                id="product"
                value={service.productName}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceCharge">
                Service Charge <span className="text-destructive">*</span>
              </Label>
              <Input
                id="serviceCharge"
                type="number"
                placeholder="Enter service charge amount"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                min="0"
                step="0.01"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the amount to charge for this service
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setInvoiceDialogOpen(false);
                setServiceCharge("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateServiceInvoice}
              disabled={creatingInvoice || !serviceCharge}
            >
              {creatingInvoice ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

