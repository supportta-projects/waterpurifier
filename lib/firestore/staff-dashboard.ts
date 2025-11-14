import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
  type Query,
  type DocumentData,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { InvoiceStatus } from "@/types/invoice";
import type { OrderStatus } from "@/types/order";
import type { ServiceStatus } from "@/types/service";

type ServiceSnapshotItem = {
  id: string;
  customerName: string;
  productName: string;
  technicianName: string | null;
  status: ServiceStatus;
  scheduledDate: string;
  createdAt: string;
};

export type StaffDashboardMetrics = {
  totals: {
    ordersCreated7d: number;
    servicesAssigned: number;
    pendingFollowUps: number;
    invoicesAwaitingShare: number;
  };
  upcomingFollowUps: ServiceSnapshotItem[];
  activeOrders: Array<{
    id: string;
    customerName: string;
    productName: string;
    createdAt: string;
    status: OrderStatus;
  }>;
  invoiceActions: {
    readyToShare: number;
    pendingPayments: number;
    remindersSentToday: number;
  };
  generatedAt: string;
};

async function safeCount(queryRef: Query<DocumentData>) {
  const snapshot = await getCountFromServer(queryRef);
  return snapshot.data().count;
}

export async function fetchStaffDashboardMetrics(): Promise<StaffDashboardMetrics> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ordersCol = collection(db, "orders");
  const servicesCol = collection(db, "services");
  const invoicesCol = collection(db, "invoices");

  // Orders created in last 7 days
  const ordersCreated7d = await safeCount(
    query(ordersCol, where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))),
  );

  // Services assigned (ASSIGNED + IN_PROGRESS)
  // Count separately to avoid index requirements
  const assignedCount = await safeCount(
    query(servicesCol, where("status", "==", "ASSIGNED")),
  );
  const inProgressCount = await safeCount(
    query(servicesCol, where("status", "==", "IN_PROGRESS")),
  );
  const assignedServices = assignedCount + inProgressCount;

  // Pending follow-ups (services scheduled for today or future, not completed)
  // Fetch all services and filter in memory to avoid index requirements
  const allServicesSnapshot = await getDocs(query(servicesCol, limit(100)));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingFollowUpsRaw: ServiceSnapshotItem[] = [];
  
  allServicesSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const status = (data.status as ServiceStatus) ?? "AVAILABLE";
    const scheduledDate =
      typeof data.scheduledDate === "string"
        ? data.scheduledDate
        : data.scheduledDate?.toDate?.()?.toISOString?.() ?? "";
    const scheduled = scheduledDate ? new Date(scheduledDate) : null;

    // Only include services that are not completed and scheduled for today or future
    if (
      status !== "COMPLETED" &&
      scheduled &&
      scheduled >= today
    ) {
      upcomingFollowUpsRaw.push({
        id: doc.id,
        customerName: (data.customerName as string) ?? "Unknown customer",
        productName: (data.productName as string) ?? "Unknown product",
        technicianName: (data.technicianName as string) ?? null,
        status,
        scheduledDate,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
      });
    }
  });

  const upcomingFollowUps: ServiceSnapshotItem[] = upcomingFollowUpsRaw
    .sort((a, b) => {
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();
      return dateA - dateB; // Ascending order (earliest first)
    })
    .slice(0, 5);

  const pendingFollowUps = upcomingFollowUps.length;

  // Active orders (PENDING status)
  // Fetch without orderBy to avoid index requirement, then sort in memory
  const activeOrdersSnapshot = await getDocs(
    query(ordersCol, where("status", "==", "PENDING"), limit(50)),
  );

  const activeOrders = activeOrdersSnapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        customerName: (data.customerName as string) ?? "Unknown customer",
        productName: (data.productName as string) ?? "Unknown product",
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
        status: (data.status as OrderStatus) ?? "PENDING",
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    })
    .slice(0, 10);

  // Invoices awaiting share (PENDING or SENT status)
  const invoicesAwaitingShare = await safeCount(
    query(invoicesCol, where("status", "in", ["PENDING", "SENT"])),
  );

  // Invoice actions
  const allInvoicesSnapshot = await getDocs(
    query(invoicesCol, orderBy("createdAt", "desc"), limit(100)),
  );

  let readyToShare = 0;
  let pendingPayments = 0;
  let remindersSentToday = 0;

  allInvoicesSnapshot.forEach((doc) => {
    const data = doc.data();
    const status = (data.status as InvoiceStatus) ?? "PENDING";
    const updatedAt = data.updatedAt?.toDate?.() ?? null;

    if (status === "PENDING" || status === "SENT") {
      readyToShare += 1;
    }

    if (status === "SENT") {
      pendingPayments += 1;
    }

    // Count invoices updated today (as a proxy for reminders sent)
    if (updatedAt && updatedAt >= startOfToday && status === "SENT") {
      remindersSentToday += 1;
    }
  });

  return {
    totals: {
      ordersCreated7d,
      servicesAssigned: assignedServices,
      pendingFollowUps,
      invoicesAwaitingShare,
    },
    upcomingFollowUps,
    activeOrders,
    invoiceActions: {
      readyToShare,
      pendingPayments,
      remindersSentToday,
    },
    generatedAt: new Date().toISOString(),
  };
}

