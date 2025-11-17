export type OrderStatus = "PENDING" | "FULFILLED" | "CANCELLED";

export type Order = {
  id: string;
  customId: string;
  customerId: string;
  customerCustomId?: string;
  customerName: string;
  productId: string;
  productCustomId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
  createdBy?: string | null; // UID of staff/admin who created the order
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  invoiceStatus?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  createdBy?: string | null; // UID of staff/admin who created the order
};

export type UpdateOrderInput = Partial<
  Pick<
    Order,
    | "customerId"
    | "customerName"
    | "productId"
    | "productName"
    | "quantity"
    | "unitPrice"
    | "totalAmount"
    | "status"
    | "invoiceId"
    | "invoiceNumber"
    | "invoiceStatus"
  >
>;

