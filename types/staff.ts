export type StaffRole = "STAFF" | "TECHNICIAN";

export type StaffUser = {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  isActive: boolean;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateStaffInput = {
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  isActive: boolean;
};

export type UpdateStaffInput = Partial<CreateStaffInput>;

