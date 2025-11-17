"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, ClipboardList, Users } from "lucide-react";

import { useServices } from "@/hooks/use-services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <section className="space-y-6">
      <Button
        variant="ghost"
        className="rounded-full text-sm text-primary hover:bg-primary/10"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

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
    </section>
  );
}

