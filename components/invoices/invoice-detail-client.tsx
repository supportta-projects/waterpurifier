"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardCopy,
  Droplet,
  Link2,
  Receipt,
  Share2,
  User2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInvoices } from "@/hooks/use-invoices";
import type { InvoiceStatus } from "@/types/invoice";

const invoiceStatusMeta: Record<
  InvoiceStatus,
  { label: string; description: string; variant: "secondary" | "default" | "success" | "destructive" }
> = {
  PENDING: {
    label: "Pending",
    description: "Invoice created but not yet shared with the customer.",
    variant: "secondary",
  },
  SENT: {
    label: "Sent",
    description: "Invoice link has been shared with the customer.",
    variant: "default",
  },
  PAID: {
    label: "Paid",
    description: "Payment recorded and the invoice is complete.",
    variant: "success",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Invoice voided and should not be paid.",
    variant: "destructive",
  },
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

type InvoiceDetailClientProps = {
  invoiceId: string;
};

export function InvoiceDetailClient({ invoiceId }: InvoiceDetailClientProps) {
  const router = useRouter();
  const { invoices, loading, error, handleResend } = useInvoices();
  const [resending, setResending] = useState(false);

  const invoice = useMemo(
    () => invoices.find((item) => item.id === invoiceId) ?? null,
    [invoices, invoiceId],
  );

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center text-sm text-muted-foreground">
        Loading invoice details…
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[2rem] border border-border/40 bg-white/90 p-10 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">
          {error ?? "Invoice not found in Firestore."}
        </p>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => router.push("/admin/invoices")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to invoices
        </Button>
      </div>
    );
  }

  const statusConfig = invoiceStatusMeta[invoice.status];

  const handleCopyShareLink = async () => {
    setResending(true);
    try {
      const url = await handleResend(invoice.id);
      if (url) {
        await navigator.clipboard.writeText(url);
        toast.success("Invoice link copied. Share via WhatsApp or email.");
      } else {
        toast.error("Unable to generate share link.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to generate share link. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="space-y-6">
      <Button
        variant="ghost"
        className="rounded-full text-sm text-primary hover:bg-primary/10"
        onClick={() => router.push("/admin/invoices")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to invoices
      </Button>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-[2rem] border border-border/40 bg-white/90 shadow-soft">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl text-primary">
                Invoice {invoice.number}
              </CardTitle>
              <CardDescription>
                Created {formatDate(invoice.createdAt)}
              </CardDescription>
            </div>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground">
            <div className="rounded-2xl border border-border/40 bg-white/90 p-5 shadow-inner shadow-black/5">
              <div className="flex items-center gap-3 text-sm font-semibold text-primary">
                <User2 className="h-4 w-4" />
                Customer
              </div>
              <div className="mt-3 text-sm text-foreground">
                <p>{invoice.customerName}</p>
                <p className="text-xs text-muted-foreground">Customer ID: {invoice.customerId}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-white/90 p-5 shadow-inner shadow-black/5">
              <div className="flex items-center gap-3 text-sm font-semibold text-primary">
                <Droplet className="h-4 w-4" />
                Product
              </div>
              <div className="mt-3 text-sm text-foreground">
                <p>{invoice.productName}</p>
                <p className="text-xs text-muted-foreground">Product ID: {invoice.productId}</p>
                <p className="mt-2 font-semibold text-primary">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-white/90 p-5 shadow-inner shadow-black/5">
              <div className="flex items-center gap-3 text-sm font-semibold text-primary">
                <Receipt className="h-4 w-4" />
                Invoice status
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{statusConfig.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border border-border/40 bg-white/90 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Share invoice</CardTitle>
            <CardDescription>
              Copy the latest share link or review timestamps for the invoice lifecycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-foreground">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link2 className="h-4 w-4 text-primary/80" />
              Share link
            </div>
            <div className="rounded-2xl border border-border/40 bg-white/95 p-4 shadow-inner shadow-black/5">
              <p className="break-all text-xs text-muted-foreground">
                {invoice.shareUrl ?? "Share link will appear once generated."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={handleCopyShareLink}
                  disabled={resending}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {resending ? "Generating…" : "Copy share link"}
                </Button>
                {invoice.shareUrl ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(invoice.shareUrl ?? "");
                        toast.success("Share link copied to clipboard.");
                      } catch (err) {
                        console.error(err);
                        toast.error("Unable to copy share link.");
                      }
                    }}
                  >
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copy current link
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/40 bg-white/95 p-4 shadow-inner shadow-black/5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary/80" />
                Created:{" "}
                <span className="font-semibold text-foreground">{formatDate(invoice.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary/80" />
                Updated:{" "}
                <span className="font-semibold text-foreground">{formatDate(invoice.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary/80" />
                Order ID:{" "}
                <span className="font-semibold text-foreground">{invoice.orderId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


