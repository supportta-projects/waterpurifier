"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, Clock, User, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchServicesByCustomerAndProduct } from "@/lib/firestore/services";
import type { Service } from "@/types/service";

type ServiceHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
};

const statusMeta: Record<
  Service["status"],
  { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }
> = {
  AVAILABLE: { label: "Available", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "success" },
};

export function ServiceHistoryDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  productId,
  productName,
}: ServiceHistoryDialogProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && customerId && productId) {
      void loadServiceHistory();
    }
  }, [open, customerId, productId]);

  const loadServiceHistory = async () => {
    setLoading(true);
    try {
      const serviceHistory = await fetchServicesByCustomerAndProduct(customerId, productId);
      setServices(serviceHistory);
    } catch (err) {
      console.error(err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Service History</DialogTitle>
          <DialogDescription>
            Service history for {customerName} - {productName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading service history...</div>
        ) : services.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No service history found for this product.
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => {
              const status = statusMeta[service.status];
              return (
                <div
                  key={service.id}
                  className="rounded-xl border border-border/40 bg-white/90 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant="outline" className="uppercase">
                          {service.serviceType}
                        </Badge>
                        {service.customId && (
                          <span className="text-xs text-muted-foreground">
                            Service ID: {service.customId}
                          </span>
                        )}
                      </div>

                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Scheduled:{" "}
                            {service.scheduledDate
                              ? new Date(service.scheduledDate).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>

                        {service.technicianName ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <UserCheck className="h-4 w-4" />
                            <span>
                              {service.status === "COMPLETED" ? "Completed by" : service.status === "IN_PROGRESS" ? "In progress by" : "Assigned to"}: {service.technicianName}
                            </span>
                          </div>
                        ) : service.status === "ASSIGNED" || service.status === "IN_PROGRESS" ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>No technician assigned</span>
                          </div>
                        ) : null}

                        {service.completedDate && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span>
                              Completed:{" "}
                              {new Date(service.completedDate).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}

                        {service.createdAt && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              Created:{" "}
                              {new Date(service.createdAt).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}

                        {service.notes && (
                          <div className="mt-2 rounded-lg bg-muted/50 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Notes
                            </p>
                            <p className="mt-1 text-sm text-foreground whitespace-pre-line">
                              {service.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

