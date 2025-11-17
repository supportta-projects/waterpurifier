"use client";

import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";

import { useTechnicians } from "@/hooks/use-technicians";
import { useServices } from "@/hooks/use-services";
import { SimpleTable } from "@/components/data/simple-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function TechnicianAvailabilityClient() {
  const { technicians, loading: techniciansLoading, error: techniciansError } = useTechnicians();
  const { services, loading: servicesLoading } = useServices();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Available" | "Busy" | "Inactive">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const technicianStats = useMemo(() => {
    if (!technicians.length) {
      return [];
    }

    return technicians.map((technician) => {
      const assignedServices = services.filter(
        (s) => s.technicianId === technician.id && (s.status === "ASSIGNED" || s.status === "IN_PROGRESS"),
      );
      const completedServices = services.filter(
        (s) => s.technicianId === technician.id && s.status === "COMPLETED",
      );
      const availableServices = services.filter(
        (s) => s.technicianId === technician.id && s.status === "AVAILABLE",
      );

      // Determine availability status
      const activeCount = assignedServices.length;
      const isAvailable = activeCount < 5; // Consider available if less than 5 active services
      const availabilityStatus = technician.isActive
        ? isAvailable
          ? "Available"
          : "Busy"
        : "Inactive";

      return {
        ...technician,
        assignedCount: assignedServices.length,
        inProgressCount: services.filter((s) => s.technicianId === technician.id && s.status === "IN_PROGRESS").length,
        completedCount: completedServices.length,
        availableCount: availableServices.length,
        availabilityStatus,
        isAvailable: technician.isActive && isAvailable,
      };
    });
  }, [technicians, services]);

  const filteredTechnicians = useMemo(() => {
    let result = technicianStats;

    // Filter by status
    if (statusFilter !== "ALL") {
      result = result.filter((tech) => tech.availabilityStatus === statusFilter);
    }

    // Filter by search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (tech) =>
          tech.name.toLowerCase().includes(query) ||
          tech.email.toLowerCase().includes(query) ||
          (tech.phone ?? "").toLowerCase().includes(query),
      );
    }

    return result;
  }, [technicianStats, statusFilter, search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, search]);

  if (techniciansLoading || servicesLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border/40 bg-white px-6 py-6 shadow-sm">
          <div className="h-8 w-48 rounded bg-muted/40 animate-pulse" />
        </div>
        <div className="h-64 rounded-2xl border border-border/40 bg-white shadow-sm" />
      </div>
    );
  }

  if (techniciansError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
        {techniciansError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/40 bg-white px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-primary">Technicians</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View technician availability and workload status
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border/40 bg-white px-6 py-4 shadow-sm lg:grid-cols-[2fr_1fr]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search technicians..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
          <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-4 text-sm shadow-inner shadow-black/5">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="rounded-3xl">
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Busy">Busy</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SimpleTable
        data={filteredTechnicians}
        columns={[
          {
            key: "name",
            header: "Name",
            className: "min-w-[200px]",
            render: (tech) => (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">{tech.name}</p>
                <p className="text-xs text-muted-foreground">{tech.email}</p>
                {tech.phone && (
                  <p className="text-xs text-muted-foreground">{tech.phone}</p>
                )}
              </div>
            ),
          },
          {
            key: "availabilityStatus",
            header: "Status",
            render: (tech) => (
              <Badge
                variant={
                  tech.availabilityStatus === "Available"
                    ? "success"
                    : tech.availabilityStatus === "Busy"
                      ? "default"
                      : "secondary"
                }
              >
                {tech.availabilityStatus}
              </Badge>
            ),
          },
          {
            key: "assignedCount",
            header: "Assigned",
            render: (tech) => (
              <span className="text-sm font-semibold text-primary">{formatNumber(tech.assignedCount)}</span>
            ),
          },
          {
            key: "inProgressCount",
            header: "In Progress",
            render: (tech) => (
              <span className="text-sm font-semibold text-primary">{formatNumber(tech.inProgressCount)}</span>
            ),
          },
          {
            key: "completedCount",
            header: "Completed",
            render: (tech) => (
              <span className="text-sm font-semibold text-success">{formatNumber(tech.completedCount)}</span>
            ),
          },
          {
            key: "availableCount",
            header: "Available",
            render: (tech) => (
              <span className="text-sm text-muted-foreground">{formatNumber(tech.availableCount)}</span>
            ),
          },
        ]}
        emptyMessage="No technicians found"
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredTechnicians.length,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  );
}

