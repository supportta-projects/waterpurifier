import { useCallback, useEffect, useState } from "react";

import {
  createOrder,
  deleteOrder as deleteOrderDoc,
  fetchOrders,
  updateOrderStatus,
} from "@/lib/firestore/orders";
import type { CreateOrderInput, Order, OrderStatus } from "@/types/order";

type UseOrdersReturn = {
  orders: Order[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  handleCreate: (payload: CreateOrderInput) => Promise<void>;
  handleUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
  handleDelete: (id: string, invoiceId?: string | null) => Promise<void>;
};

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = useCallback(async (payload: CreateOrderInput) => {
    setSaving(true);
    try {
      const order = await createOrder(payload);
      setOrders((prev) => [order, ...prev]);
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdateStatus = useCallback(async (id: string, status: OrderStatus) => {
    setSaving(true);
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((order) => (order.id === id ? updated : order)));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: string, invoiceId?: string | null) => {
    setSaving(true);
    try {
      await deleteOrderDoc(id, invoiceId);
      setOrders((prev) => prev.filter((order) => order.id !== id));
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    orders,
    loading,
    saving,
    error,
    refresh: load,
    handleCreate,
    handleUpdateStatus,
    handleDelete,
  };
}

