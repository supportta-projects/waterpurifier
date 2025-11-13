"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchAdminDashboardMetrics,
  type AdminDashboardMetrics,
} from "@/lib/firestore/dashboard";

type UseAdminDashboardReturn = {
  data: AdminDashboardMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const CACHE_KEY = "wp-admin-dashboard-metrics-v1";
const CACHE_TTL_MS = 60_000;

function readCachedMetrics(): AdminDashboardMetrics | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { timestamp: number; data: AdminDashboardMetrics };
    if (!parsed?.timestamp || Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.warn("Failed to read cached admin dashboard metrics.", error);
    return null;
  }
}

function writeCachedMetrics(data: AdminDashboardMetrics) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({ timestamp: Date.now(), data });
    window.sessionStorage.setItem(CACHE_KEY, payload);
  } catch (error) {
    console.warn("Failed to cache admin dashboard metrics.", error);
  }
}

export function useAdminDashboard(initialData?: AdminDashboardMetrics): UseAdminDashboardReturn {
  const cachedFromStorage = useRef<AdminDashboardMetrics | null>(initialData ?? null);

  if (!cachedFromStorage.current) {
    cachedFromStorage.current = readCachedMetrics();
  }

  const [data, setData] = useState<AdminDashboardMetrics | null>(cachedFromStorage.current);
  const [loading, setLoading] = useState<boolean>(!cachedFromStorage.current);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      const hadData = cachedFromStorage.current != null;

      if (!silent) {
        setLoading(true);
      }

      try {
        const metrics = await fetchAdminDashboardMetrics();
        cachedFromStorage.current = metrics;
        setData(metrics);
        setError(null);
        writeCachedMetrics(metrics);
      } catch (err) {
        console.error(err);
        if (!hadData || !silent) {
          setError("Unable to load dashboard insights. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!cachedFromStorage.current) {
      void load();
    } else {
      void load({ silent: true });
    }
  }, [load]);

  const refresh = useCallback(async () => {
    await load({ silent: false });
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

