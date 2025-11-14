export type Customer = {
  id: string;
  customId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerLite = {
  id: string;
  name: string;
  email: string;
};

