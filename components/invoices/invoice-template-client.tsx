"use client";

import { useEffect, useState } from "react";
import { fetchInvoiceById } from "@/lib/firestore/invoices";
import type { Invoice } from "@/types/invoice";
import { Loader2, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type InvoiceTemplateClientProps = {
  invoiceId: string;
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
  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function InvoiceTemplateClient({ invoiceId }: InvoiceTemplateClientProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      try {
        const invoiceData = await fetchInvoiceById(invoiceId);
        if (!invoiceData) {
          setError("Invoice not found");
          setLoading(false);
          return;
        }
        setInvoice(invoiceData);
      } catch (err) {
        console.error(err);
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }

    void loadInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Trigger print dialog which can be saved as PDF
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading invoice…
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="rounded-[2rem] border border-border/40 bg-white p-10 text-center shadow-soft">
          <p className="text-sm text-muted-foreground">{error ?? "Invoice not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="mx-auto max-w-3xl">
        {/* Action buttons - hidden when printing */}
        <div className="mb-6 flex flex-wrap gap-3 print:hidden">
          <Button onClick={handlePrint} className="rounded-full">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload} variant="outline" className="rounded-full">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Invoice Template - Proper Bill Format */}
        <div className="invoice-container bg-white print:shadow-none">
          {/* Header Section */}
          <div className="invoice-header border-b-2 border-gray-800 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">WATER PURIFIER SERVICE</h1>
                <p className="mt-1 text-sm text-gray-600">Professional Water Purification Solutions</p>
                <p className="mt-2 text-xs text-gray-500">Invoice #: {invoice.number}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900">TAX INVOICE</h2>
                <p className="mt-1 text-sm text-gray-600">Date: {formatDate(invoice.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Bill To and From Section */}
          <div className="invoice-details grid grid-cols-2 gap-6 border-b border-gray-300 py-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">Bill To:</h3>
              <p className="text-sm font-semibold text-gray-900">{invoice.customerName}</p>
              <p className="text-xs text-gray-600 mt-1">Customer ID: {invoice.customerCustomId ?? invoice.customerId}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">From:</h3>
              <p className="text-sm font-semibold text-gray-900">Water Purifier Service</p>
              <p className="text-xs text-gray-600 mt-1">Professional Water Solutions</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="invoice-items border-b border-gray-300">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-800 bg-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-900">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-900">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">{invoice.productName}</p>
                    <p className="text-xs text-gray-600 mt-1">Product ID: {invoice.productCustomId ?? invoice.productId}</p>
                    <p className="text-xs text-gray-600">Order ID: {invoice.orderCustomId ?? invoice.orderId}</p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Section */}
          <div className="invoice-totals flex justify-end border-b border-gray-300 py-4">
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-gray-700">Tax (GST):</span>
                <span className="font-semibold text-gray-900">Included</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-gray-800 pt-2 mt-2">
                <span className="text-base font-bold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="invoice-footer py-4">
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">
                Payment Instructions:
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Please make payment within 7 days of invoice date</li>
                <li>• Payment can be made via UPI, Bank Transfer, or Cash</li>
                <li>• For payment queries, contact our support team</li>
              </ul>
            </div>
            <div className="border-t border-gray-300 pt-4 text-center">
              <p className="text-xs text-gray-500">
                This is a computer-generated invoice and does not require a signature.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Invoice #{invoice.number} | Generated on {formatDate(invoice.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .invoice-container {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .invoice-header,
          .invoice-details,
          .invoice-items,
          .invoice-totals,
          .invoice-footer {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .invoice-items table {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .invoice-items tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

