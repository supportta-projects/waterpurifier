import {
  Timestamp,
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
  type Query,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { ServiceStatus } from "@/types/service";
import type { InvoiceStatus } from "@/types/invoice";

type ServiceSnapshotItem = {
  id: string;
  customId?: string;
  customerName: string;
  productName: string;
  technicianName: string | null;
  status: ServiceStatus;
  scheduledDate: string;
  createdAt: string;
};

export type AdminDashboardMetrics = {
  totals: {
    services30d: number;
    openOrders: number;
    technicianUtilization: number;
    monthlyRevenue: number;
    monthlyRevenueFormatted: string;
  };
  serviceStatusCounts: Record<ServiceStatus, number>;
  latestServices: ServiceSnapshotItem[];
  counts: {
    customers: number;
    staff: number;
    technicians: number;
    subscriptions: number;
  };
  orderFunnel: {
    newOrders7d: number;
    servicesCreated7d: number;
    invoicesGenerated7d: number;
  };
  invoiceStatusCounts: Record<InvoiceStatus, number>;
  generatedAt: string;
};

async function safeCount(queryRef: Query<DocumentData>) {
  const snapshot = await getCountFromServer(queryRef);
  return snapshot.data().count;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function fetchAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const servicesCol = collection(db, "services");
  const ordersCol = collection(db, "orders");
  const invoicesCol = collection(db, "invoices");
  const usersCol = collection(db, "users");
  const customersCol = collection(db, "customers");
  const subscriptionsCol = collection(db, "subscriptions");

  const statuses: ServiceStatus[] = ["AVAILABLE", "ASSIGNED", "IN_PROGRESS", "COMPLETED"];

  const serviceStatusCounts = Object.fromEntries(
    await Promise.all(
      statuses.map(async (status) => [
        status,
        await safeCount(query(servicesCol, where("status", "==", status))),
      ]),
    ),
  ) as Record<ServiceStatus, number>;

  const services30d = await safeCount(
    query(servicesCol, where("createdAt", ">=", Timestamp.fromDate(thirtyDaysAgo))),
  );

  const latestServicesSnapshot = await getDocs(
    query(servicesCol, orderBy("createdAt", "desc"), limit(5)),
  );

  const latestServices: ServiceSnapshotItem[] = latestServicesSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      customId: (data.customId as string) ?? undefined,
      customerName: (data.customerName as string) ?? "Unknown customer",
      productName: (data.productName as string) ?? "Unknown product",
      technicianName: (data.technicianName as string) ?? null,
      status: (data.status as ServiceStatus) ?? "AVAILABLE",
      scheduledDate:
        typeof data.scheduledDate === "string"
          ? data.scheduledDate
          : data.scheduledDate?.toDate?.().toISOString?.() ?? "",
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
    };
  });

  const openOrders = await safeCount(query(ordersCol, where("status", "==", "PENDING")));
  const newOrders7d = await safeCount(
    query(ordersCol, where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))),
  );

  const servicesCreated7d = await safeCount(
    query(servicesCol, where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))),
  );

  const invoicesGenerated7d = await safeCount(
    query(invoicesCol, where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))),
  );

  const customers = await safeCount(customersCol);
  const staff = await safeCount(query(usersCol, where("role", "==", "STAFF")));
  const technicians = await safeCount(query(usersCol, where("role", "==", "TECHNICIAN")));

  let subscriptions = 0;
  try {
    subscriptions = await safeCount(subscriptionsCol);
  } catch (error) {
    console.warn("Subscriptions collection not found, defaulting to zero.", error);
  }

  const invoicesThisMonthSnapshot = await getDocs(
    query(invoicesCol, where("createdAt", ">=", Timestamp.fromDate(startOfMonth))),
  );

  let monthlyRevenue = 0;
  const invoiceStatusCounts: Record<InvoiceStatus, number> = {
    PENDING: 0,
    SENT: 0,
    PAID: 0,
    CANCELLED: 0,
  };

  invoicesThisMonthSnapshot.forEach((doc) => {
    const data = doc.data();
    const totalAmount = typeof data.totalAmount === "number" ? data.totalAmount : 0;
    const status = (data.status as InvoiceStatus) ?? "PENDING";

    if (status !== "CANCELLED") {
      monthlyRevenue += totalAmount;
    }

    if (invoiceStatusCounts[status] !== undefined) {
      invoiceStatusCounts[status] += 1;
    }
  });

  const technicianUtilizationBase = technicians === 0 ? 1 : technicians;
  const activeAssignments =
    (serviceStatusCounts.ASSIGNED ?? 0) + (serviceStatusCounts.IN_PROGRESS ?? 0);
  const technicianUtilization = Math.min(
    100,
    Math.round((activeAssignments / technicianUtilizationBase) * 100),
  );

  return {
    totals: {
      services30d,
      openOrders,
      technicianUtilization,
      monthlyRevenue,
      monthlyRevenueFormatted: formatCurrency(monthlyRevenue),
    },
    serviceStatusCounts,
    latestServices,
    counts: {
      customers,
      staff,
      technicians,
      subscriptions,
    },
    orderFunnel: {
      newOrders7d,
      servicesCreated7d,
      invoicesGenerated7d,
    },
    invoiceStatusCounts,
    generatedAt: new Date().toISOString(),
  };
}


