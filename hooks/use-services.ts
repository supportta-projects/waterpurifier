"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createService,
  fetchServices,
  updateService as updateServiceDoc,
} from "@/lib/firestore/services";
import type {
  CreateServiceInput,
  Service,
  ServiceStatus,
  UpdateServiceInput,
} from "@/types/service";

type UseServicesOptions = {
  initialStatus?: ServiceStatus;
  technicianId?: string;
};

type UseServicesReturn = {
  services: Service[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  handleCreate: (payload: CreateServiceInput) => Promise<void>;
  handleUpdate: (id: string, payload: UpdateServiceInput) => Promise<void>;
  groupedByStatus: Record<ServiceStatus, Service[]>;
};

export function useServices(options?: UseServicesOptions): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchServices({ 
        status: options?.initialStatus,
        technicianId: options?.technicianId,
      });
      setServices(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [options?.initialStatus, options?.technicianId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = useCallback(async (payload: CreateServiceInput) => {
    setSaving(true);
    try {
      const service = await createService(payload);
      setServices((prev) => [service, ...prev]);
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdate = useCallback(
    async (id: string, payload: UpdateServiceInput) => {
      setSaving(true);
      try {
        const updated = await updateServiceDoc(id, payload);
        setServices((prev) =>
          prev.map((service) => (service.id === id ? updated : service)),
        );
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const groupedByStatus = useMemo(() => {
    const groups: Record<ServiceStatus, Service[]> = {
      AVAILABLE: [],
      ASSIGNED: [],
      IN_PROGRESS: [],
      COMPLETED: [],
    };
    for (const service of services) {
      groups[service.status]?.push(service);
    }
    return groups;
  }, [services]);

  return {
    services,
    loading,
    saving,
    error,
    refresh: load,
    handleCreate,
    handleUpdate,
    groupedByStatus,
  };
}

