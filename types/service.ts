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
  orderId?: string | null;
  orderCustomId?: string | null;
  technicianId?: string | null;
  technicianName?: string | null;
  createdBy?: string | null; // UID of staff/admin who created the service
  assignedBy?: string | null; // UID of staff/admin who assigned the technician
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
  orderId?: string | null;
  orderCustomId?: string | null;
  serviceType: ServiceType;
  scheduledDate: string;
  notes?: string;
  technicianId?: string | null;
  technicianName?: string | null;
  createdBy?: string | null; // UID of staff/admin who created the service
  assignedBy?: string | null; // UID of staff/admin who assigned the technician
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
    | "assignedBy"
  >
>;

