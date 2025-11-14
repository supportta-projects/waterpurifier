"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Eye,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { SimpleTable } from "@/components/data/simple-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useServices } from "@/hooks/use-services";
import { useCurrentTechnician } from "@/hooks/use-current-technician";
import type { Service, ServiceStatus } from "@/types/service";

type TechnicianServiceTableProps = {
  variant: "available" | "assigned" | "completed";
};

const statusMeta: Record<ServiceStatus, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  AVAILABLE: { label: "Available", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "success" },
};

export function TechnicianServiceTable({ variant }: TechnicianServiceTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/technician") ? "/technician" : "/admin";
  const { services, loading, saving, handleUpdate } = useServices();
  const { technician, technicianId } = useCurrentTechnician();

  const [search, setSearch] = useState("");

  const filteredServices = useMemo(() => {
    let result = services;

    if (variant === "available") {
      // Show only services that are AVAILABLE (not assigned to anyone)
      result = result.filter((service) => service.status === "AVAILABLE");
    } else if (variant === "assigned") {
      // Show services assigned to this technician
      result = result.filter(
        (service) =>
          service.technicianId === technicianId &&
          (service.status === "ASSIGNED" || service.status === "IN_PROGRESS"),
      );
    } else if (variant === "completed") {
      // Show completed services by this technician
      result = result.filter(
        (service) => service.technicianId === technicianId && service.status === "COMPLETED",
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (service) =>
          service.customerName.toLowerCase().includes(q) ||
          service.productName.toLowerCase().includes(q),
      );
    }

    // Sort by scheduled date
    result = [...result].sort((a, b) => {
      const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
      const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
      return dateA - dateB; // Ascending order (earliest first)
    });

    return result;
  }, [services, variant, technicianId, search]);

  const handleAcceptService = async (service: Service) => {
    if (!technician || !technicianId) {
      toast.error("Technician information not found.");
      return;
    }

    try {
      await handleUpdate(service.id, {
        technicianId,
        technicianName: technician.name,
        status: "ASSIGNED",
      });
      toast.success("Service accepted. You can now start working on it.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept service. Please try again.");
    }
  };

  const handleStartService = async (service: Service) => {
    try {
      await handleUpdate(service.id, {
        status: "IN_PROGRESS",
      });
      toast.success("Service started. Good luck with the job!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start service. Please try again.");
    }
  };

  const handleCompleteService = async (service: Service) => {
    try {
      await handleUpdate(service.id, {
        status: "COMPLETED",
        completedDate: new Date().toISOString(),
      });
      toast.success("Service marked as completed. Great work!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete service. Please try again.");
    }
  };

  const getTitle = () => {
    switch (variant) {
      case "available":
        return "Available Services";
      case "assigned":
        return "Assigned Work";
      case "completed":
        return "Completed Services";
      default:
        return "Services";
    }
  };

  const getDescription = () => {
    switch (variant) {
      case "available":
        return "Accept new service jobs that are available for assignment.";
      case "assigned":
        return "Services assigned to you. Start working and update status as you progress.";
      case "completed":
        return "Services you've completed. Review details and ensure invoices are shared.";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">{getTitle()}</h2>
          <p className="text-sm text-muted-foreground">{getDescription()}</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 shadow-soft">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by customer or product..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
          />
        </div>
      </div>

      <SimpleTable
        data={filteredServices}
        columns={[
          {
            key: "customerName",
            header: "Customer",
            className: "min-w-[200px]",
            render: (service) => (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">{service.customerName}</p>
                <p className="text-xs text-muted-foreground">{service.productName}</p>
              </div>
            ),
          },
          {
            key: "serviceType",
            header: "Type",
            className: "min-w-[100px]",
            render: (service) => (
              <Badge variant="outline" className="uppercase">
                {service.serviceType === "MANUAL" ? "Manual" : "Quarterly"}
              </Badge>
            ),
          },
          {
            key: "scheduledDate",
            header: "Scheduled",
            className: "min-w-[140px] whitespace-nowrap",
            render: (service) => (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 text-primary/70" />
                {service.scheduledDate
                  ? new Date(service.scheduledDate).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            className: "min-w-[120px]",
            render: (service) => {
              const meta = statusMeta[service.status];
              return (
                <Badge variant={meta.variant} className="uppercase">
                  {meta.label}
                </Badge>
              );
            },
          },
          {
            key: "actions",
            header: "Actions",
            className: "min-w-[200px]",
            render: (service) => (
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => router.push(`${basePath}/services/${service.id}`)}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View service</span>
                </Button>
                {variant === "available" && service.status === "AVAILABLE" ? (
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleAcceptService(service)}
                    disabled={saving || !technicianId}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                ) : null}
                {variant === "assigned" && service.status === "ASSIGNED" ? (
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleStartService(service)}
                    disabled={saving}
                  >
                    <Loader2 className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                ) : null}
                {variant === "assigned" && service.status === "IN_PROGRESS" ? (
                  <Button
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleCompleteService(service)}
                    disabled={saving}
                  >
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
        emptyMessage={
          loading
            ? "Loading services..."
            : variant === "available"
              ? "No available services at the moment."
              : variant === "assigned"
                ? "No assigned services. Accept available services to get started."
                : "No completed services yet."
        }
      />
    </div>
  );
}

