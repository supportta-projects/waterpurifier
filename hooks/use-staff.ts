"use client";

import { useCallback, useEffect, useState } from "react";

import { createStaff, fetchStaff, updateStaff } from "@/lib/firestore/staff";
import type { CreateStaffInput, StaffUser, UpdateStaffInput } from "@/types/staff";

type UseStaffReturn = {
  staff: StaffUser[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  handleCreate: (payload: CreateStaffInput) => Promise<StaffUser>;
  handleUpdate: (id: string, payload: UpdateStaffInput) => Promise<void>;
};

export function useStaff(): UseStaffReturn {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStaff();
      setStaff(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load staff. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = useCallback(async (payload: CreateStaffInput) => {
    setSaving(true);
    try {
      const user = await createStaff(payload);
      setStaff((prev) => [...prev, user]);
      return user;
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdate = useCallback(async (id: string, payload: UpdateStaffInput) => {
    setSaving(true);
    try {
      const updated = await updateStaff(id, payload);
      setStaff((prev) => prev.map((user) => (user.id === id ? updated : user)));
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    staff,
    loading,
    saving,
    error,
    refresh: load,
    handleCreate,
    handleUpdate,
  };
}

