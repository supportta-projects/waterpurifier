"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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

function shortenUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  return `${url.substring(0, maxLength - 3)}...`;
}

export function InvoiceDetailClient({ invoiceId }: InvoiceDetailClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname?.startsWith("/technician")
    ? "/technician"
    : pathname?.startsWith("/staff")
      ? "/staff"
      : "/admin";
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
          onClick={() => router.push(`${basePath}/invoices`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to invoices
        </Button>
      </div>
    );
  }

  const statusConfig = invoiceStatusMeta[invoice.status];

  const getInvoiceTemplateUrl = (invoiceId: string): string => {
    if (typeof window === "undefined") return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/invoice/${invoiceId}`;
  };

  const handleCopyShareLink = async () => {
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

  const handleShareViaWhatsApp = async () => {
    setResending(true);
    try {
      const url = await handleResend(invoice.id);
      if (url) {
        await navigator.clipboard.writeText(url);
        window.open(url, "_blank");
        toast.success("WhatsApp link copied and opened.");
      } else {
        toast.error("Unable to generate WhatsApp link.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unable to generate WhatsApp link. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="space-y-6">
      <Button
        variant="ghost"
        className="rounded-full text-sm text-primary hover:bg-primary/10"
        onClick={() => router.push(`${basePath}/invoices`)}
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
                <Badge variant={invoice.invoiceType === "ORDER" ? "default" : "outline"} className="ml-2">
                  {invoice.invoiceType === "ORDER" ? "Order" : "Service"}
                </Badge>
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
                <p className="text-xs text-muted-foreground">Customer ID: {invoice.customerCustomId ?? invoice.customerId}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-white/90 p-5 shadow-inner shadow-black/5">
              <div className="flex items-center gap-3 text-sm font-semibold text-primary">
                <Droplet className="h-4 w-4" />
                Product
              </div>
              <div className="mt-3 text-sm text-foreground">
                <p>{invoice.productName}</p>
                <p className="text-xs text-muted-foreground">Product ID: {invoice.productCustomId ?? invoice.productId}</p>
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
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Invoice Template Link:</p>
                <a
                  href={getInvoiceTemplateUrl(invoice.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-xs text-primary underline hover:text-primary/80"
                  title={getInvoiceTemplateUrl(invoice.id)}
                >
                  {shortenUrl(getInvoiceTemplateUrl(invoice.id), 50)}
                </a>
              </div>
              {invoice.shareUrl ? (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">WhatsApp Share Link:</p>
                  <a
                    href={invoice.shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-xs text-primary underline hover:text-primary/80"
                    title={invoice.shareUrl}
                  >
                    {shortenUrl(invoice.shareUrl, 50)}
                  </a>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={handleCopyShareLink}
                >
                  <ClipboardCopy className="mr-2 h-4 w-4" />
                  Copy Invoice Link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={handleShareViaWhatsApp}
                  disabled={resending}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {resending ? "Generating…" : "Share via WhatsApp"}
                </Button>
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
                {invoice.invoiceType === "ORDER" ? (
                  <>
                    Order ID:{" "}
                    <span className="font-semibold text-foreground">
                      {invoice.orderCustomId ?? invoice.orderId ?? "—"}
                    </span>
                  </>
                ) : (
                  <>
                    Service ID:{" "}
                    <span className="font-semibold text-foreground">
                      {invoice.serviceCustomId ?? invoice.serviceId ?? "—"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


