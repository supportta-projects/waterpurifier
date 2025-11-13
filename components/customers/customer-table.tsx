"use client";

import { useMemo, useState } from "react";
import { PenSquare, Plus, Search, SlidersHorizontal } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from "@/hooks/use-customers";
import type { Customer } from "@/types/customer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CustomerFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
};

type CustomerFormErrors = Record<keyof Omit<CustomerFormState, "isActive">, string>;

const emptyForm: CustomerFormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  isActive: true,
};

export function CustomerTable() {
  const { customers, loading, saving, error, handleCreate, handleUpdate } = useCustomers();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formValues, setFormValues] = useState<CustomerFormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<CustomerFormErrors>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesStatus =
        status === "ALL" || (status === "ACTIVE" ? customer.isActive : !customer.isActive);
      const matchesQuery =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.phone ?? "").toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  }, [customers, search, status]);

  const resetForm = () => {
    setFormValues(emptyForm);
    setFormErrors({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setFormMode("create");
    setEditingCustomer(null);
    setDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setFormValues({
      name: customer.name,
      email: customer.email,
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      isActive: customer.isActive,
    });
    setFormErrors({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
    setEditingCustomer(customer);
    setFormMode("edit");
    setDialogOpen(true);
  };

  const validateForm = () => {
    const nextErrors: CustomerFormErrors = {
      name: "",
      email: "",
      phone: "",
      address: "",
    };
    let isValid = true;

    if (!formValues.name.trim()) {
      nextErrors.name = "Name is required.";
      isValid = false;
    }
    if (!formValues.email.trim() || !formValues.email.includes("@")) {
      nextErrors.email = "Valid email is required.";
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

    const payload = {
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone.trim(),
      address: formValues.address.trim(),
      isActive: formValues.isActive,
    };

    try {
      if (formMode === "create") {
        await handleCreate(payload);
        toast.success("Customer added.");
      } else if (editingCustomer) {
        await handleUpdate(editingCustomer.id, payload);
        toast.success("Customer updated.");
      }
      setDialogOpen(false);
      setEditingCustomer(null);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save customer. Please try again.");
    }
  };

  const handleToggleActive = async (customer: Customer) => {
    try {
      await handleUpdate(customer.id, { isActive: !customer.isActive });
      toast.success(
        `Customer ${!customer.isActive ? "activated" : "deactivated"} successfully.`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update customer status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">Customer Management</h2>
          <p className="text-sm text-muted-foreground">
            Maintain customer records for orders and service scheduling.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 shadow-soft lg:grid-cols-[2fr_1fr]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-5 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Filter customers" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  All customers
                </div>
              </SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
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
        data={filteredCustomers}
        columns={[
          {
            key: "name",
            header: "Customer",
            render: (customer) => (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">{customer.name}</p>
                <p className="text-xs text-muted-foreground">ID: {customer.id}</p>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            render: (customer) => (
              <div className="text-sm text-foreground">
                <p>{customer.email}</p>
                {customer.phone ? (
                  <p className="text-xs text-muted-foreground">{customer.phone}</p>
                ) : null}
              </div>
            ),
          },
          {
            key: "address",
            header: "Address",
            className: "max-w-sm",
            render: (customer) => (
              <p className="text-sm text-muted-foreground">
                {customer.address || "—"}
              </p>
            ),
          },
          {
            key: "isActive",
            header: "Status",
            render: (customer) => (
              <Badge variant={customer.isActive ? "success" : "secondary"}>
                {customer.isActive ? "Active" : "Inactive"}
              </Badge>
            ),
          },
          {
            key: "createdAt",
            header: "Created",
            render: (customer) => (
              <p className="text-xs text-muted-foreground">
                {customer.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString("en-IN", {
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
            render: (customer) => (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => openEditDialog(customer)}
                >
                  <PenSquare className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant={customer.isActive ? "ghost" : "secondary"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleToggleActive(customer)}
                >
                  {customer.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ),
          },
        ]}
        emptyMessage={
          loading ? "Loading customers..." : "No customers found. Add one to get started."
        }
      />

      <div className="flex flex-col justify-between gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 text-sm text-muted-foreground shadow-soft md:flex-row md:items-center">
        <p>
          Showing{" "}
          <span className="font-semibold text-primary">{filteredCustomers.length}</span>{" "}
          customer{filteredCustomers.length === 1 ? "" : "s"} from Firestore.
        </p>
        <p className="text-xs text-muted-foreground">
          Active customers can be assigned orders and scheduled services.
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Add Customer" : "Edit Customer"}
            </DialogTitle>
            <DialogDescription>
              Store customer details for reuse in orders and recurring services.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Name
              </label>
              <Input
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Priya Sharma"
              />
              {formErrors.name ? (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                value={formValues.email}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="customer@example.com"
              />
              {formErrors.email ? (
                <p className="text-xs text-destructive">{formErrors.email}</p>
              ) : null}
            </div>

            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </label>
                <Input
                  value={formValues.phone}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </label>
                <Select
                  value={formValues.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      isActive: value === "active",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Address / Notes
              </label>
              <Textarea
                rows={4}
                value={formValues.address}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, address: event.target.value }))
                }
                placeholder="Apartment, street, city…"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingCustomer(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full" disabled={saving}>
                {saving
                  ? formMode === "create"
                    ? "Adding..."
                    : "Saving..."
                  : formMode === "create"
                    ? "Add Customer"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

