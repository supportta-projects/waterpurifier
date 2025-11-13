export type OrderStatus = "PENDING" | "FULFILLED" | "CANCELLED";

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: OrderStatus;
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

