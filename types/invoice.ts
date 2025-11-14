export type InvoiceStatus = "PENDING" | "SENT" | "PAID" | "CANCELLED";

export type Invoice = {
  id: string;
  customId: string;
  orderId: string;
  orderCustomId?: string;
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
  orderId: string;
  orderCustomId?: string;
  customerId: string;
  customerCustomId?: string;
  customerName: string;
  productId: string;
  productCustomId?: string;
  productName: string;
  totalAmount: number;
};


