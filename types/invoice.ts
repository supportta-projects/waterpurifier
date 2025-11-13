export type InvoiceStatus = "PENDING" | "SENT" | "PAID" | "CANCELLED";

export type Invoice = {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  totalAmount: number;
  number: string;
  status: InvoiceStatus;
  shareUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInvoiceInput = {
  orderId: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  totalAmount: number;
};


