export type UserRole = "ADMIN" | "STAFF" | "TECHNICIAN";

export type UserProfile = {
  uid: string;
  role: UserRole;
  name: string;
  phone?: string;
  isActive: boolean;
};

