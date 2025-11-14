"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchTechnicianDashboardMetrics, type TechnicianDashboardMetrics } from "@/lib/firestore/technician-dashboard";
import { useCurrentTechnician } from "@/hooks/use-current-technician";

const CACHE_KEY = "wp-technician-dashboard-metrics-v1";
const CACHE_TTL_MS = 60_000; // 60 seconds

function readCachedMetrics(): TechnicianDashboardMetrics | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as { data: TechnicianDashboardMetrics; timestamp: number };
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

function writeCachedMetrics(data: TechnicianDashboardMetrics) {
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

type UseTechnicianDashboardReturn = {
  data: TechnicianDashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useTechnicianDashboard(initialData?: TechnicianDashboardMetrics): UseTechnicianDashboardReturn {
  const { technicianId } = useCurrentTechnician();
  const cachedFromStorage = useRef<TechnicianDashboardMetrics | null>(initialData ?? null);
  if (!cachedFromStorage.current) {
    cachedFromStorage.current = readCachedMetrics();
  }
  const [data, setData] = useState<TechnicianDashboardMetrics | null>(cachedFromStorage.current);
  const [loading, setLoading] = useState<boolean>(!cachedFromStorage.current);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!technicianId) {
        setError("Technician ID not found. Please ensure you're logged in as a technician.");
        setLoading(false);
        return;
      }

      const silent = options?.silent ?? false;
      if (!silent) setLoading(true);
      try {
        const metrics = await fetchTechnicianDashboardMetrics(technicianId);
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
    [technicianId],
  );

  useEffect(() => {
    if (!technicianId) return;
    
    if (!cachedFromStorage.current) {
      void load();
    } else {
      void load({ silent: true });
    }
  }, [load, technicianId]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return { data, loading, error, refresh };
}

