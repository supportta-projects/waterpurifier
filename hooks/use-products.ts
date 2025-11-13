import { useCallback, useEffect, useState } from "react";

import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "@/lib/firestore/products";
import type { Product, ProductInput } from "@/types/product";

type UseProductsReturn = {
  products: Product[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  handleCreate: (payload: ProductInput) => Promise<void>;
  handleUpdate: (id: string, payload: Partial<ProductInput>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
};

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = useCallback(
    async (payload: ProductInput) => {
      setSaving(true);
      try {
        const product = await createProduct(payload);
        setProducts((prev) => [product, ...prev]);
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const handleUpdate = useCallback(
    async (id: string, payload: Partial<ProductInput>) => {
      setSaving(true);
      try {
        const updated = await updateProduct(id, payload);
        setProducts((prev) =>
          prev.map((product) => (product.id === id ? updated : product)),
        );
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setSaving(true);
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((product) => product.id !== id));
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return {
    products,
    loading,
    saving,
    error,
    refresh: load,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}

