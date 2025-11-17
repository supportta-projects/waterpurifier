"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Copy, Eye, RefreshCcw, Search } from "lucide-react";

import { SimpleTable } from "@/components/data/simple-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoices } from "@/hooks/use-invoices";
import { useCurrentTechnician } from "@/hooks/use-current-technician";
import type { Invoice, InvoiceStatus, InvoiceType } from "@/types/invoice";

const invoiceStatusMeta: Record<
  InvoiceStatus,
  { label: string; variant: "secondary" | "default" | "success" | "destructive" }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  SENT: { label: "Sent", variant: "default" },
  PAID: { label: "Paid", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function shortenUrl(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url;
  return `${url.substring(0, maxLength - 3)}...`;
}

export function InvoiceTable() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/technician")
    ? "/technician"
    : pathname?.startsWith("/staff")
      ? "/staff"
      : "/admin";
  
  // Get technician ID if viewing as technician
  const isTechnician = pathname?.startsWith("/technician");
  const { technicianId: currentTechnicianId } = useCurrentTechnician();
  const technicianId = isTechnician ? currentTechnicianId ?? undefined : undefined;
  
  const { invoices, loading, saving, error, refresh, handleStatusChange, handleResend } =
    useInvoices({ technicianId });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<InvoiceType | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const stats = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        acc.total += 1;
        acc.amount += invoice.totalAmount;
        acc.byStatus[invoice.status] += 1;
        return acc;
      },
      {
        total: 0,
        amount: 0,
        byStatus: {
          PENDING: 0,
          SENT: 0,
          PAID: 0,
          CANCELLED: 0,
        } satisfies Record<InvoiceStatus, number>,
      },
    );
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter;
      const matchesType = typeFilter === "ALL" || invoice.invoiceType === typeFilter;
      const matchesQuery =
        !query ||
        invoice.number.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.productName.toLowerCase().includes(query);

      return matchesStatus && matchesType && matchesQuery;
    });
  }, [invoices, statusFilter, typeFilter, search]);

  const getInvoiceTemplateUrl = (invoiceId: string): string => {
    if (typeof window === "undefined") return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/invoice/${invoiceId}`;
  };

  const handleResendClick = async (invoice: Invoice) => {
    try {
      // Get the invoice template URL (direct link to invoice page)
      const invoiceUrl = getInvoiceTemplateUrl(invoice.id);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(invoiceUrl);
      toast.success("Invoice link copied to clipboard. Share it with the customer.");
    } catch (err) {
      console.error(err);
      toast.error("Unable to copy invoice link. Please try again.");
    }
  };

  const handleStatusUpdate = async (invoice: Invoice, nextStatus: InvoiceStatus) => {
    if (invoice.status === nextStatus) return;
    try {
      await handleStatusChange(invoice.id, nextStatus);
      toast.success(`Invoice marked as ${invoiceStatusMeta[nextStatus].label}.`);
    } catch (err) {
      console.error(err);
      toast.error("Unable to update invoice status.");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-5 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            Monitor invoices generated from orders and re-share payment links with customers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            size="sm"
            onClick={() => {
              void refresh();
              toast.info("Refreshing invoices…");
            }}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-border/40 bg-white/95 p-5 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total invoices
          </p>
          <p className="mt-2 text-2xl font-semibold text-primary">{stats.total}</p>
          <p className="text-xs text-muted-foreground">
            Amount: {formatCurrency(stats.amount)}
          </p>
        </div>
        {(
          Object.keys(invoiceStatusMeta) as Array<keyof typeof invoiceStatusMeta>
        ).map((status) => (
          <div
            key={status}
            className="rounded-3xl border border-border/40 bg-white/95 p-5 shadow-soft"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {invoiceStatusMeta[status].label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-primary">{stats.byStatus[status]}</p>
          </div>
        ))}
      </div>

  <div className="grid gap-3 rounded-[2rem] border border-border/40 bg-white/90 px-6 py-4 shadow-soft lg:grid-cols-[2fr_repeat(2,minmax(0,1fr))]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number, customer, or product…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 rounded-full border-transparent bg-gradient-soft pl-11 text-sm shadow-inner shadow-black/5"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value as typeof typeFilter);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-5 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="ORDER">Order Invoice</SelectItem>
              <SelectItem value="SERVICE">Service Invoice</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as typeof statusFilter);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-11 rounded-full border-transparent bg-gradient-soft px-5 text-sm shadow-inner shadow-black/5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl">
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="hidden items-center justify-end text-xs text-muted-foreground lg:flex">
          {saving ? "Saving changes…" : `Showing ${filteredInvoices.length} invoices`}
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <SimpleTable
        data={filteredInvoices}
        emptyMessage={loading ? "Loading invoices…" : "No invoices found."}
        columns={[
          {
            key: "number",
            header: "Invoice",
            className: "min-w-[200px]",
            render: (invoice) => (
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-primary">{invoice.number}</p>
                  <Badge variant={invoice.invoiceType === "ORDER" ? "default" : "outline"} className="text-xs">
                    {invoice.invoiceType === "ORDER" ? "Order" : "Service"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Created {formatDate(invoice.createdAt)}
                </p>
              </div>
            ),
          },
          {
            key: "customerName",
            header: "Customer",
            className: "min-w-[180px]",
            render: (invoice) => (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{invoice.customerName}</p>
                <p className="text-xs text-muted-foreground">Customer ID: {invoice.customerCustomId ?? invoice.customerId}</p>
              </div>
            ),
          },
          {
            key: "productName",
            header: "Product",
            className: "min-w-[200px]",
            render: (invoice) => (
              <div className="space-y-1">
                <p className="text-sm text-foreground">{invoice.productName}</p>
                <p className="text-xs font-semibold text-primary">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            className: "min-w-[200px]",
            render: (invoice) => (
              <div className="flex items-center gap-3">
                <Badge variant={invoiceStatusMeta[invoice.status].variant}>
                  {invoiceStatusMeta[invoice.status].label}
                </Badge>
                <Select
                  value={invoice.status}
                  onValueChange={(value) => {
                    void handleStatusUpdate(invoice, value as InvoiceStatus);
                  }}
                >
                  <SelectTrigger className="h-9 w-[140px] rounded-full border-border/40 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl">
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "min-w-[200px]",
            render: (invoice) => (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                      onClick={() => router.push(`${basePath}/invoices/${invoice.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => void handleResendClick(invoice)}
                  title="Copy invoice link"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
              </div>
            ),
          },
        ]}
        pagination={{
          currentPage,
          pageSize,
          totalItems: filteredInvoices.length,
          onPageChange: setCurrentPage,
        }}
      />

      <div className="rounded-[2rem] border border-border/40 bg-white/95 px-6 py-4 text-xs text-muted-foreground shadow-soft">
        Click "Copy Link" to copy the invoice template URL. Customers can view, print, or download the invoice from the shared link.
      </div>
    </section>
  );
}


