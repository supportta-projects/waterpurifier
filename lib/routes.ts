import type { UserRole } from "@/types/user";

export function getDashboardPath(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "STAFF":
      return "/staff/dashboard";
    case "TECHNICIAN":
      return "/technician/dashboard";
    default:
      return "/login";
  }
}

