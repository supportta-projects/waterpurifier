"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchStaffDashboardMetrics, type StaffDashboardMetrics } from "@/lib/firestore/staff-dashboard";

const CACHE_KEY = "wp-staff-dashboard-metrics-v1";
const CACHE_TTL_MS = 60_000; // 60 seconds

function readCachedMetrics(): StaffDashboardMetrics | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as { data: StaffDashboardMetrics; timestamp: number };
    const age = Date.now() - parsed.timestamp;

    if (age > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function writeCachedMetrics(data: StaffDashboardMetrics) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {
    // Ignore storage errors
  }
}

type UseStaffDashboardReturn = {
  data: StaffDashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useStaffDashboard(initialData?: StaffDashboardMetrics, staffUid?: string): UseStaffDashboardReturn {
  const cachedFromStorage = useRef<StaffDashboardMetrics | null>(initialData ?? null);
  if (!cachedFromStorage.current) {
    cachedFromStorage.current = readCachedMetrics();
  }
  const [data, setData] = useState<StaffDashboardMetrics | null>(cachedFromStorage.current);
  const [loading, setLoading] = useState<boolean>(!cachedFromStorage.current);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) setLoading(true);
      try {
        const metrics = await fetchStaffDashboardMetrics(staffUid);
        setData(metrics);
        writeCachedMetrics(metrics);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard insights. Please try again.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [staffUid],
  );

  useEffect(() => {
    if (!cachedFromStorage.current) {
      void load();
    } else {
      void load({ silent: true });
    }
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return { data, loading, error, refresh };
}

