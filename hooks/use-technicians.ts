import { useMemo } from "react";

import type { Technician } from "@/types/technician";
import { useStaff } from "@/hooks/use-staff";

export function useTechnicians(): {
  technicians: Technician[];
  loading: boolean;
  error: string | null;
} {
  const { staff, loading, error } = useStaff();
  const technicians = useMemo<Technician[]>(
    () =>
      staff
        .filter((user) => user.role === "TECHNICIAN")
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
        })),
    [staff],
  );
  return {
    technicians,
    loading,
    error,
  };
}

