"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Mail, Phone, Search, UserPlus } from "lucide-react";

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
import { useStaff } from "@/hooks/use-staff";
import type { CreateStaffInput, StaffRole, StaffUser } from "@/types/staff";

const roleLabels: Record<StaffRole, string> = {
  STAFF: "Staff",
  TECHNICIAN: "Technician",
};

type StaffFormErrors = Record<keyof Pick<CreateStaffInput, "name" | "email">, string>;

const emptyForm: CreateStaffInput = {
  name: "",
  email: "",
  phone: "",
  role: "STAFF",
  isActive: true,
};

export function StaffTable() {
  const { staff, loading, saving, error, handleCreate, handleUpdate } = useStaff();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | StaffRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [formValues, setFormValues] = useState<CreateStaffInput>(emptyForm);
  const [formErrors, setFormErrors] = useState<StaffFormErrors>({
    name: "",
    email: "",
  });
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const filteredStaff = useMemo(() => {
    let result = staff;
    if (roleFilter !== "ALL") {
      result = result.filter((user) => user.role === roleFilter);
    }
    if (statusFilter !== "ALL") {
      const active = statusFilter === "ACTIVE";
      result = result.filter((user) => user.isActive === active);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          (user.phone ?? "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [staff, roleFilter, statusFilter, search]);

  const resetForm = () => {
    setFormValues(emptyForm);
    setFormErrors({
      name: "",
      email: "",
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setFormMode("create");
    setEditingUser(null);
    setGeneratedPassword(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user: StaffUser) => {
    setFormValues({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      role: user.role,
      isActive: user.isActive,
    });
    setFormErrors({
      name: "",
      email: "",
    });
    setEditingUser(user);
    setFormMode("edit");
    setDialogOpen(true);
  };

  const validateForm = () => {
    const nextErrors: StaffFormErrors = {
      name: "",
      email: "",
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
    if (!validateForm()) return;

    const payload: CreateStaffInput = {
      ...formValues,
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone?.trim() ?? "",
    };

    try {
      if (formMode === "create") {
        const newUser = await handleCreate(payload);
        setGeneratedPassword(newUser.password ?? null);
        toast.success("Team member added. Copy the generated password below.");
      } else if (editingUser) {
        await handleUpdate(editingUser.id, payload);
        toast.success("Team member updated.");
      }
      setDialogOpen(false);
      setEditingUser(null);
      resetForm();
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Unable to save team member. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleToggleActive = async (user: StaffUser) => {
    try {
      await handleUpdate(user.id, { isActive: !user.isActive });
      toast.success(
        `Team member ${!user.isActive ? "activated" : "deactivated"} successfully.`,
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">Staff & Technicians</h2>


          <p className="text-sm text-muted-foreground">
            Manage team access, roles, and active status for staff and technicians.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={openCreateDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 shadow-soft lg:grid-cols-[2fr_repeat(2,minmax(0,1fr))]">
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
          <Select value={roleFilter} onValueChange={(value) => {
            setRoleFilter(value as typeof roleFilter);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-5 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">All roles</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
              <SelectItem value="TECHNICIAN">Technician</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value as typeof statusFilter);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-5 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">All statuses</SelectItem>
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
        data={filteredStaff}
        columns={[
          {
            key: "name",
            header: "Name",
            className: "min-w-[220px]",
            render: (user) => (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.role === "TECHNICIAN" ? "Technician" : "Staff"}
                </p>
              </div>
            ),
          },
          {
            key: "email",
            header: "Contact",
            className: "min-w-[180px]",
            render: (user) => (
              <div className="space-y-1 text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary/70" />
                  {user.email}
                </div>
                {user.phone ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 text-primary/70" />
                    {user.phone}
                  </div>
                ) : null}
              </div>
            ),
          },
          {
            key: "password",
            header: "Password",
            className: "min-w-[220px]",
            render: (user) =>
              user.password ? (
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold tracking-wide text-foreground">
                    {user.password}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full px-3"
                    onClick={() => {
                      void navigator.clipboard.writeText(user.password ?? "");
                      toast.success("Password copied to clipboard.");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Not stored</span>
              ),
          },
          {
            key: "role",
            header: "Role",
            className: "min-w-[120px]",
            render: (user) => (
              <Badge variant="outline" className="uppercase">
                {roleLabels[user.role]}
              </Badge>
            ),
          },
          {
            key: "status",
            header: "Status",
            className: "min-w-[120px]",
            render: (user) => (
              <Badge variant={user.isActive ? "success" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "min-w-[200px]",
            render: (user) => (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => openEditDialog(user)}
                >
                  Edit
                </Button>
                <Button
                  variant={user.isActive ? "ghost" : "secondary"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleToggleActive(user)}
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ),
          },
        ]}
        emptyMessage={
          loading ? "Loading staff..." : "No team members found. Add one to get started."
        }
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredStaff.length,
          onPageChange: setCurrentPage,
        }}
      />

      <div className="flex flex-col justify-between gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 text-sm text-muted-foreground shadow-soft md:flex-row md:items-center">
        <p>
          Showing{" "}
          <span className="font-semibold text-primary">{filteredStaff.length}</span> team
          member{filteredStaff.length === 1 ? "" : "s"}.
        </p>
        <p className="text-xs text-muted-foreground">
          Adding a staff or technician here automatically generates a Firebase Auth user and
          password.
        </p>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Add Team Member" : "Edit Team Member"}
            </DialogTitle>
            <DialogDescription>
              Capture staff and technician details. Accounts are created automatically in Firebase
              Auth with a generated password.
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
                placeholder="Manoj Kumar"
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
                placeholder="teammate@example.com"
              />
              {formErrors.email ? (
                <p className="text-xs text-destructive">{formErrors.email}</p>
              ) : null}
            </div>

            <div className="grid gap-2 md:grid-cols-2 md:gap-4">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone (optional)
                </label>
                <Input
                  value={formValues.phone ?? ""}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Role
                </label>
                <Select
                  value={formValues.role}
                  onValueChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      role: value as StaffRole,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="TECHNICIAN">Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingUser(null);
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
                    ? "Add Team Member"
                    : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

