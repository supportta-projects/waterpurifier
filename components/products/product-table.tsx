"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { SimpleTable } from "@/components/data/simple-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/hooks/use-products";
import type { Product, ProductInput, ProductStatus } from "@/types/product";

type ProductFormState = Omit<ProductInput, "price"> & { price: string };
type ProductFormErrors = Record<keyof ProductInput, string>;

const statusLabels: Record<
  ProductStatus,
  { label: string; variant: "default" | "secondary" | "success" | "destructive" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  DISCONTINUED: { label: "Discontinued", variant: "destructive" },
  COMING_SOON: { label: "Coming Soon", variant: "secondary" },
};

const emptyForm: ProductFormState = {
  name: "",
  model: "",
  description: "",
  price: "",
  status: "ACTIVE",
};

export function ProductTable() {
  const router = useRouter();
  const { products, loading, saving, error, handleCreate, handleUpdate, handleDelete } =
    useProducts();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "ALL">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<ProductFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({
    name: "",
    model: "",
    description: "",
    price: "",
    status: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesStatus = status === "ALL" || product.status === status;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.model.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [products, search, status]);

  const resetForm = () => {
    setFormValues(emptyForm);
    setFormErrors({
      name: "",
      model: "",
      description: "",
      price: "",
      status: "",
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogMode("create");
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setFormValues({
      name: product.name,
      model: product.model,
      description: product.description,
      price: product.price.toString(),
      status: product.status,
    });
    setFormErrors({
      name: "",
      model: "",
      description: "",
      price: "",
      status: "",
    });
    setEditingProduct(product);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const validateForm = () => {
    const nextErrors: ProductFormErrors = {
      name: "",
      model: "",
      description: "",
      price: "",
      status: "",
    };
    let isValid = true;

    if (!formValues.name.trim()) {
      nextErrors.name = "Product name is required.";
      isValid = false;
    }
    if (!formValues.model.trim()) {
      nextErrors.model = "Model is required.";
      isValid = false;
    }
    if (!formValues.description.trim()) {
      nextErrors.description = "Description is required.";
      isValid = false;
    }
    const priceNumber = Number(formValues.price);
    if (!formValues.price.trim() || Number.isNaN(priceNumber) || priceNumber <= 0) {
      nextErrors.price = "Enter a valid price.";
      isValid = false;
    }

    setFormErrors(nextErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    const priceNumber = Number(formValues.price);
    const payload: ProductInput = {
      name: formValues.name.trim(),
      model: formValues.model.trim(),
      description: formValues.description.trim(),
      price: priceNumber,
      status: formValues.status,
    };

    try {
      if (dialogMode === "create") {
        await handleCreate(payload);
        toast.success("Product created successfully.");
      } else if (editingProduct) {
        await handleUpdate(editingProduct.id, payload);
        toast.success("Product updated successfully.");
      }
      setDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    try {
      await handleDelete(deleteTarget.id);
      toast.success("Product deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleNavigate = (id: string) => {
    router.push(`/admin/products/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">Water Purifier Catalog</h2>
          <p className="text-sm text-muted-foreground">
            Manage purifier models, variants, and their availability across teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={openCreateDialog}>
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 shadow-soft lg:grid-cols-[2fr_1fr]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, model, or description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(value) => setStatus(value as ProductStatus | "ALL")}>
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-5 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  All statuses
                </div>
              </SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
              <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <SimpleTable
        data={filteredProducts}
        columns={[
          {
            key: "name",
            header: "Product",
            render: (product) => (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">{product.name}</p>
                <p className="text-xs text-muted-foreground">Model: {product.model}</p>
              </div>
            ),
          },
          {
            key: "description",
            header: "Description",
            className: "max-w-sm",
            render: (product) => (
              <p className="text-sm text-muted-foreground">{product.description}</p>
            ),
          },
          {
            key: "price",
            header: "Price",
            render: (product) => (
              <p className="text-sm font-semibold text-foreground">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (product) => {
              const statusConfig = statusLabels[product.status];
              return (
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              );
            },
          },
          {
            key: "updatedAt",
            header: "Last Updated",
            render: (product) => (
              <p className="text-xs text-muted-foreground">
                {product.updatedAt
                  ? new Date(product.updatedAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            render: (product) => (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleNavigate(product.id)}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => openEditDialog(product)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(product)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        emptyMessage={
          loading ? "Loading products..." : "No products match your filters."
        }
      />

      <div className="flex flex-col justify-between gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 text-sm text-muted-foreground shadow-soft md:flex-row md:items-center">
        <p>
          Showing{" "}
          <span className="font-semibold text-primary">{filteredProducts.length}</span>{" "}
          product{filteredProducts.length === 1 ? "" : "s"} from Firestore.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          Data refreshes automatically after updates.
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Add Product" : "Edit Product"}
            </DialogTitle>
            <DialogDescription>
              Provide product details to {dialogMode === "create" ? "create" : "update"} this entry.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Product name
              </label>
              <Input
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="AquaPure Elite"
              />
              {formErrors.name ? (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              ) : null}
            </div>
            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Model
                </label>
                <Input
                  value={formValues.model}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, model: event.target.value }))
                  }
                  placeholder="AP-ELT-2024"
                />
                {formErrors.model ? (
                  <p className="text-xs text-destructive">{formErrors.model}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Price (₹)
                </label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={formValues.price}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      price: event.target.value,
                    }))
                  }
                />
                {formErrors.price ? (
                  <p className="text-xs text-destructive">{formErrors.price}</p>
                ) : null}
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </label>
              <Textarea
                rows={5}
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe the product features..."
              />
              {formErrors.description ? (
                <p className="text-xs text-destructive">{formErrors.description}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </label>
              <Select
                value={formValues.status}
                onValueChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    status: value as ProductStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={saving}>
                {saving
                  ? dialogMode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : dialogMode === "create"
                    ? "Create Product"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span> from
              the catalog. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteTarget(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirmed}
              disabled={saving}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

