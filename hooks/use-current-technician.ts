"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useStaff } from "@/hooks/use-staff";

/**
 * Hook to get the current technician's staff record ID
 * This is needed because services use staff.id as technicianId, not the Firebase uid
 */
export function useCurrentTechnician() {
  const { user, profile } = useAuth();
  const { staff, loading } = useStaff();

  const technician = useMemo(() => {
    if (!user || !profile || profile.role !== "TECHNICIAN") {
      return null;
    }

    // Find the staff record that matches the current user's uid
    const staffRecord = staff.find((s) => s.uid === user.uid && s.role === "TECHNICIAN");
    return staffRecord ?? null;
  }, [user, profile, staff]);

  return {
    technician,
    technicianId: technician?.id ?? null,
    loading,
  };
}

