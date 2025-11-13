"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchInvoices,
  refreshInvoiceShareUrl,
  updateInvoiceStatus,
} from "@/lib/firestore/invoices";
import type { Invoice, InvoiceStatus } from "@/types/invoice";

type UseInvoicesReturn = {
  invoices: Invoice[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  handleStatusChange: (id: string, status: InvoiceStatus) => Promise<void>;
  handleResend: (id: string) => Promise<string | null>;
};

export function useInvoices(): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInvoices();
      setInvoices(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleStatusChange = useCallback(async (id: string, status: InvoiceStatus) => {
    setSaving(true);
    try {
      const updated = await updateInvoiceStatus(id, status);
      setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? updated : invoice)));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleResend = useCallback(async (id: string) => {
    setSaving(true);
    try {
      const updated = await refreshInvoiceShareUrl(id);
      setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? updated : invoice)));
      return updated.shareUrl ?? null;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    invoices,
    loading,
    saving,
    error,
    refresh: load,
    handleStatusChange,
    handleResend,
  };
}


