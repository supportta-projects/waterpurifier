export type InvoiceStatus = "PENDING" | "SENT" | "PAID" | "CANCELLED";
export type InvoiceType = "ORDER" | "SERVICE";

export type Invoice = {
  id: string;
  customId: string;
  invoiceType: InvoiceType;
  orderId?: string | null;
  orderCustomId?: string | null;
  serviceId?: string | null;
  serviceCustomId?: string | null;
  customerId: string;
  customerCustomId?: string;
  customerName: string;
  productId: string;
  productCustomId?: string;
  productName: string;
  totalAmount: number;
  number: string;
  status: InvoiceStatus;
  shareUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateInvoiceInput = {
  invoiceType: InvoiceType;
  orderId?: string | null;
  orderCustomId?: string | null;
  serviceId?: string | null;
  serviceCustomId?: string | null;
  customerId: string;
  customerCustomId?: string;
  customerName: string;
  productId: string;
  productCustomId?: string;
  productName: string;
  totalAmount: number;
};


