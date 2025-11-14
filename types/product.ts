export type ProductStatus = "ACTIVE" | "DISCONTINUED" | "COMING_SOON";

export type Product = {
  id: string;
  customId: string;
  name: string;
  model: string;
  description: string;
  price: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  model: string;
  description: string;
  price: number;
  status: ProductStatus;
};

