"use client";

import { Calendar, RefreshCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ServiceFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  serviceType: string;
  onServiceTypeChange: (value: string) => void;
  technicianId: string;
  onTechnicianChange: (value: string) => void;
  technicians: { id: string; name: string }[];
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  onReset: () => void;
};

export function ServiceFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  serviceType,
  onServiceTypeChange,
  technicianId,
  onTechnicianChange,
  technicians,
  dateFilter,
  onDateFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onReset,
}: ServiceFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 shadow-soft lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer, technician, or product..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={onStatusChange}>
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
        <div className="flex flex-wrap items-center gap-2">
          <Select value={serviceType} onValueChange={onServiceTypeChange}>
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-4 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Service type" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={technicianId} onValueChange={onTechnicianChange}>
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-4 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Technician" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">All technicians</SelectItem>
              {technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-4 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Date filter" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">All dates</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="RANGE">Date range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {dateFilter === "RANGE" ? (
        <div className="grid gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 shadow-soft lg:grid-cols-[1fr_1fr]">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              placeholder="From date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
              className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="date"
              placeholder="To date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
              className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
            />
          </div>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          className="rounded-full text-xs text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          <RefreshCcw className="mr-2 h-3.5 w-3.5" />
          Reset filters
        </Button>
      </div>
    </div>
  );
}

