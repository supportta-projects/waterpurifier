"use client";

import { useCallback, useEffect, useState } from "react";

import { createCustomer, fetchCustomers, updateCustomer } from "@/lib/firestore/customers";
import type { Customer } from "@/types/customer";

type CustomerInput = Omit<Customer, "id" | "createdAt" | "updatedAt">;

type UseCustomersReturn = {
  customers: Customer[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  handleCreate: (payload: CustomerInput) => Promise<void>;
  handleUpdate: (id: string, payload: Partial<CustomerInput>) => Promise<void>;
};

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = useCallback(async (payload: CustomerInput) => {
    setSaving(true);
    try {
      const customer = await createCustomer(payload);
      setCustomers((prev) => [...prev, customer]);
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdate = useCallback(
    async (id: string, payload: Partial<CustomerInput>) => {
      setSaving(true);
      try {
        const updated = await updateCustomer(id, payload);
        setCustomers((prev) =>
          prev.map((customer) => (customer.id === id ? updated : customer)),
        );
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return {
    customers,
    loading,
    saving,
    error,
    refresh: load,
    handleCreate,
    handleUpdate,
  };
}
// replaced by new hook definition

