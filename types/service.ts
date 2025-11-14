export type ServiceStatus = "AVAILABLE" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";

export type ServiceType = "MANUAL" | "QUARTERLY";

export type Service = {
  id: string;
  customId?: string;
  customerId: string;
  customerCustomId?: string;
  customerName: string;
  productId: string;
  productCustomId?: string;
  productName: string;
  technicianId?: string | null;
  technicianName?: string | null;
  serviceType: ServiceType;
  status: ServiceStatus;
  scheduledDate: string;
  completedDate?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateServiceInput = {
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  serviceType: ServiceType;
  scheduledDate: string;
  notes?: string;
};

export type UpdateServiceInput = Partial<
  Pick<
    Service,
    | "technicianId"
    | "technicianName"
    | "status"
    | "scheduledDate"
    | "completedDate"
    | "notes"
  >
>;

