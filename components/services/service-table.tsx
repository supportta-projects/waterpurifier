"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BadgeCheck,
  CalendarClock,
  ClipboardList,
  Eye,
  Loader2,
  Play,
  RotateCw,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { SimpleTable } from "@/components/data/simple-table";
import { ServiceFilters } from "@/components/services/service-filters";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { useCustomers } from "@/hooks/use-customers";
import { useProducts } from "@/hooks/use-products";
import { useServices } from "@/hooks/use-services";
import { useTechnicians } from "@/hooks/use-technicians";
import { useAuth } from "@/hooks/use-auth";
import type { CreateServiceInput, Service, ServiceStatus, UpdateServiceInput } from "@/types/service";

type ServiceTableProps = {
  variant: "all" | "latest";
  initialDateFilter?: string;
};

const statusMeta: Record<ServiceStatus, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  AVAILABLE: { label: "Available", variant: "secondary" },
  ASSIGNED: { label: "Assigned", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "success" },
};


export function ServiceTable({ variant, initialDateFilter }: ServiceTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/staff") ? "/staff" : "/admin";
  const { role, user } = useAuth();

  const {
    services,
    loading,
    saving,
    error,
    handleCreate,
    handleUpdate,
  } = useServices();
  const { customers, loading: customersLoading } = useCustomers();
  const { products, loading: productsLoading } = useProducts();
  const { technicians, loading: techniciansLoading } = useTechnicians();
  
  // Only Admin and Staff can assign/manage services, not perform them
  const canAssignTechnician = role === "ADMIN" || role === "STAFF";
  const canPerformService = role === "TECHNICIAN";

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [serviceType, setServiceType] = useState<string>("ALL");
  const [technicianId, setTechnicianId] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>(initialDateFilter ?? "ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    service: Service | null;
  }>({
    open: false,
    service: null,
  });
  const [assignTechnicianId, setAssignTechnicianId] = useState<string>("");
  const [navigatingToManualService, setNavigatingToManualService] = useState(false);
  const [openingQuarterlyDialog, setOpeningQuarterlyDialog] = useState(false);


  const filteredServices = useMemo(() => {
    let result = services;

    if (variant === "latest") {
      result = [...services]
        .filter((service) => service.status !== "COMPLETED")
        .slice(0, 6);
    }

    if (status !== "ALL") {
      result = result.filter((service) => service.status === status);
    }

    if (serviceType !== "ALL") {
      result = result.filter((service) => service.serviceType === serviceType);
    }

    if (technicianId !== "ALL") {
      result = result.filter((service) => service.technicianId === technicianId);
    }

    // Date filtering
    if (dateFilter === "UPCOMING") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter((service) => {
        if (!service.scheduledDate) return false;
        const scheduledDate = new Date(service.scheduledDate);
        scheduledDate.setHours(0, 0, 0, 0);
        return scheduledDate >= today;
      });
    } else if (dateFilter === "RANGE") {
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        result = result.filter((service) => {
          if (!service.scheduledDate) return false;
          const scheduledDate = new Date(service.scheduledDate);
          scheduledDate.setHours(0, 0, 0, 0);
          return scheduledDate >= fromDate;
        });
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        result = result.filter((service) => {
          if (!service.scheduledDate) return false;
          const scheduledDate = new Date(service.scheduledDate);
          scheduledDate.setHours(0, 0, 0, 0);
          return scheduledDate <= toDate;
        });
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (service) =>
          service.customerName.toLowerCase().includes(q) ||
          service.productName.toLowerCase().includes(q) ||
          (service.technicianName ?? "").toLowerCase().includes(q),
      );
    }

    return result;
  }, [services, variant, status, serviceType, technicianId, search, dateFilter, dateFrom, dateTo]);

  const resetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setServiceType("ALL");
    setTechnicianId("ALL");
    setDateFilter("ALL");
    setDateFrom("");
    setDateTo("");
  };


  const handleStatusChange = async (service: Service, nextStatus: ServiceStatus) => {
    try {
      const updatePayload: UpdateServiceInput = {};
      if (nextStatus === "COMPLETED") {
        updatePayload.completedDate = new Date().toISOString();
      }
      if (nextStatus === "AVAILABLE") {
        updatePayload.technicianId = null;
        updatePayload.technicianName = null;
        updatePayload.completedDate = null;
      }
      await handleUpdate(service.id, {
        ...updatePayload,
        status: nextStatus,
      });
      toast.success(`Service marked as ${statusMeta[nextStatus].label}.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update service status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            {dateFilter === "UPCOMING"
              ? "Upcoming Services"
              : variant === "latest"
                ? "Latest Services"
                : "Service Management"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {dateFilter === "UPCOMING"
              ? "View all services scheduled for today and future dates."
              : variant === "latest"
                ? "Quick view of upcoming and recently assigned services."
                : "Track quarterly and manual services, assign technicians, and update progress."}
          </p>
        </div>
      {variant === "all" ? (
        <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="rounded-full" 
              onClick={() => {
                setNavigatingToManualService(true);
                router.push(`${basePath}/services/create`);
              }}
              disabled={navigatingToManualService}
            >
              {navigatingToManualService ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Manual Service
                </>
              )}
            </Button>
              <Button
                variant="outline" 
                className="rounded-full" 
                onClick={() => {
                  setOpeningQuarterlyDialog(true);
                  router.push(`${basePath}/services/create-quarterly`);
                  setTimeout(() => setOpeningQuarterlyDialog(false), 100);
                }}
                disabled={openingQuarterlyDialog}
              >
                {openingQuarterlyDialog ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Quarterly Service
                  </>
                )}
              </Button>
          </div>
        ) : null}
      </div>

      {variant === "all" ? (
        <ServiceFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          serviceType={serviceType}
          onServiceTypeChange={setServiceType}
          technicianId={technicianId}
          onTechnicianChange={(value) => {
            setTechnicianId(value);
            setCurrentPage(1);
          }}
          technicians={technicians}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onReset={resetFilters}
        />
      ) : (
        <div className="grid gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 shadow-soft lg:grid-cols-[2fr_1fr]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search latest services..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-4 text-sm shadow-inner shadow-black/5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

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
            render: (service) => (
              <Badge variant="outline" className="uppercase">
                {service.serviceType === "MANUAL" ? "Manual" : "Quarterly"}
              </Badge>
            ),
          },
          {
            key: "technicianName",
            header: "Technician",
            className: "min-w-[160px]",
            render: (service) =>
              service.technicianName ? (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Users className="h-3.5 w-3.5 text-primary/70" />
                  {service.technicianName}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Not assigned</span>
              ),
          },
          {
            key: "scheduledDate",
            header: "Scheduled",
            className: "whitespace-nowrap",
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
            className: "min-w-[160px]",
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
                {/* Only Admin/Staff can assign technicians */}
                {canAssignTechnician && service.status === "AVAILABLE" ? (
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => {
                      setAssignTechnicianId(service.technicianId ?? "");
                      setAssignDialog({
                        open: true,
                        service,
                      });
                    }}
                    title="Assign technician"
                  >
                    <Users className="h-4 w-4" />
                    <span className="sr-only">Assign technician</span>
                  </Button>
                ) : null}
                {/* Only Technicians can perform services (start/complete) */}
                {canPerformService && service.status === "ASSIGNED" ? (
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleStatusChange(service, "IN_PROGRESS")}
                    title="Start service"
                  >
                    <Play className="h-4 w-4" />
                    <span className="sr-only">Start service</span>
                  </Button>
                ) : null}
                {canPerformService && service.status === "IN_PROGRESS" ? (
                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => handleStatusChange(service, "COMPLETED")}
                    title="Mark completed"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    <span className="sr-only">Mark completed</span>
                  </Button>
                ) : null}
                {/* Only Admin/Staff can reset service status */}
                {canAssignTechnician && service.status !== "AVAILABLE" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
                    onClick={() => handleStatusChange(service, "AVAILABLE")}
                    title="Reset to available"
                  >
                    <RotateCw className="h-4 w-4" />
                    <span className="sr-only">Reset status</span>
                  </Button>
                ) : null}
              </div>
            ),
          },
        ]}
        emptyMessage={
          loading
            ? "Loading services..."
            : variant === "latest"
              ? "No recent services scheduled."
              : "No services found. Schedule one to get started."
        }
        pagination={
          variant === "all"
            ? {
                currentPage,
                pageSize,
                totalItems: filteredServices.length,
                onPageChange: setCurrentPage,
              }
            : undefined
        }
      />

      {variant === "all" ? (
        <div className="flex flex-col justify-between gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 text-sm text-muted-foreground shadow-soft md:flex-row md:items-center">
          <p>
            Showing{" "}
            <span className="font-semibold text-primary">{filteredServices.length}</span>{" "}
            service{filteredServices.length === 1 ? "" : "s"} from Firestore.
          </p>
          <p className="text-xs text-muted-foreground">
            Assign technicians to manual and quarterly services to keep schedules on track.
          </p>
        </div>
      ) : null}

      <Dialog
        open={assignDialog.open}
        onOpenChange={(open) => setAssignDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>
              Select a technician to assign this service. They will see it in their workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Technician
              </label>
              <Combobox
                options={technicians.map((tech) => ({
                  value: tech.id,
                  label: tech.name,
                }))}
                value={assignTechnicianId}
                onValueChange={(value) => setAssignTechnicianId(value)}
                placeholder="Select technician"
                searchPlaceholder="Search technicians..."
                emptyMessage="No technicians found"
                disabled={saving}
                allowClear
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setAssignDialog({ open: false, service: null })}
              >
                Cancel
              </Button>
              <Button
                className="rounded-full"
                disabled={saving || !assignTechnicianId}
                onClick={async () => {
                  if (!assignDialog.service) return;
                  const selectedTech = technicians.find((tech) => tech.id === assignTechnicianId);
                  if (!selectedTech) {
                    toast.error("Select a technician.");
                    return;
                  }
                  try {
                    await handleUpdate(assignDialog.service.id, {
                      technicianId: selectedTech.id,
                      technicianName: selectedTech.name,
                      status: "ASSIGNED",
                      assignedBy: user?.uid ?? null,
                    });
                    toast.success("Service assigned.");
                    setAssignDialog({ open: false, service: null });
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to assign service.");
                  }
                }}
              >
                {saving ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

