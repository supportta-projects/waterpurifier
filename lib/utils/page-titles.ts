/**
 * Maps route paths to page titles and descriptions
 */
export function getPageTitle(pathname: string, role: "ADMIN" | "STAFF" | "TECHNICIAN"): { title: string; description?: string } {
  // Remove leading slash and split path
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  
  // Skip role prefix (admin, staff, technician)
  if (segments.length > 0 && ["admin", "staff", "technician"].includes(segments[0])) {
    segments.shift();
  }
  
  const page = segments[0] || "dashboard";
  const subPage = segments[1];
  const id = segments[2];

  // Handle specific pages with IDs
  if (id) {
    if (page === "customers") return { title: "Customer Details", description: "View customer information" };
    if (page === "products") return { title: "Product Details", description: "View product information" };
    if (page === "orders") return { title: "Order Details", description: "View order information" };
    if (page === "services") return { title: "Service Details", description: "View service information" };
    if (page === "invoices") return { title: "Invoice Details", description: "View invoice information" };
  }

  // Handle sub-pages
  if (subPage) {
    if (page === "services") {
      if (subPage === "create") return { title: "Create Manual Service", description: "Schedule a new service" };
      if (subPage === "create-quarterly") return { title: "Create Quarterly Service", description: "Schedule quarterly service" };
      if (subPage === "available") return { title: "Available Services", description: "Services ready to accept" };
      if (subPage === "assigned") return { title: "Assigned Work", description: "Your assigned services" };
      if (subPage === "completed") return { title: "Completed Services", description: "Your completed work" };
      if (subPage === "all") return { title: "All Services", description: "View all services" };
    }
  }

  // Main pages
  const pageTitles: Record<string, { title: string; description?: string }> = {
    dashboard: {
      title: "Dashboard",
      description: role === "STAFF" 
        ? "Manage services, customers, and invoices"
        : role === "TECHNICIAN"
        ? "View your assigned services and manage your work"
        : "Monitor services, orders, and team operations",
    },
    services: { title: "Services", description: "Manage service schedules and assignments" },
    orders: { title: "Orders", description: "View and manage customer orders" },
    products: { title: "Products", description: "Manage product catalog" },
    customers: { title: "Customers", description: "Manage customer information" },
    technicians: { title: "Technicians", description: "View technician availability and status" },
    staff: { title: "Staff & Technicians", description: "Manage team members" },
    invoices: { title: "Invoices", description: "View and manage invoices" },
  };

  return pageTitles[page] || { title: "Page", description: "" };
}

