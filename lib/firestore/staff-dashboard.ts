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
  customId?: string;
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
    customId?: string;
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

export async function fetchStaffDashboardMetrics(staffUid?: string): Promise<StaffDashboardMetrics> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ordersCol = collection(db, "orders");
  const servicesCol = collection(db, "services");
  const invoicesCol = collection(db, "invoices");

  // Orders created in last 7 days by this staff member
  // Fetch all orders and filter in memory to avoid index requirements
  let ordersCreated7d = 0;
  if (staffUid) {
    const allOrdersSnapshot = await getDocs(query(ordersCol, limit(1000)));
    ordersCreated7d = allOrdersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate?.() ?? null;
      const createdBy = data.createdBy as string | null;
      return (
        createdBy === staffUid &&
        createdAt &&
        createdAt >= sevenDaysAgo
      );
    }).length;
  } else {
    const ordersQuery = query(ordersCol, where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo)));
    ordersCreated7d = await safeCount(ordersQuery);
  }

  // Fetch all services once and reuse for multiple calculations
  const allServicesSnapshot = await getDocs(query(servicesCol, limit(1000)));

  // Services created by this staff member (all statuses except COMPLETED)
  let servicesCreated = 0;
  
  if (staffUid) {
    // Filter by createdBy or assignedBy for this staff member
    servicesCreated = allServicesSnapshot.docs.filter(
      (doc) => {
        const data = doc.data();
        const status = (data.status as ServiceStatus) ?? "AVAILABLE";
        return (data.createdBy === staffUid || data.assignedBy === staffUid) && status !== "COMPLETED";
      }
    ).length;
  } else {
    // For admin view, count all assigned and in-progress services
    servicesCreated = allServicesSnapshot.docs.filter(
      (doc) => {
        const data = doc.data();
        const status = (data.status as ServiceStatus) ?? "AVAILABLE";
        return status === "ASSIGNED" || status === "IN_PROGRESS";
      }
    ).length;
  }

  // Pending follow-ups (services scheduled for today or future, not completed)

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

    // Filter by staff member if provided
    const isStaffService = !staffUid || data.createdBy === staffUid || data.assignedBy === staffUid;

    // Only include services that are not completed, scheduled for today or future, and belong to this staff member
    if (
      isStaffService &&
      status !== "COMPLETED" &&
      scheduled &&
      scheduled >= today
    ) {
      upcomingFollowUpsRaw.push({
        id: doc.id,
        customId: (data.customId as string) ?? undefined,
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

  // Active orders (PENDING status) created by this staff member
  const activeOrdersQuery = staffUid
    ? query(
        ordersCol,
        where("status", "==", "PENDING"),
        where("createdBy", "==", staffUid),
        limit(50),
      )
    : query(ordersCol, where("status", "==", "PENDING"), limit(50));
  const activeOrdersSnapshot = await getDocs(activeOrdersQuery);

  const activeOrders = activeOrdersSnapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        customId: (data.customId as string) ?? undefined,
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

  // Invoices awaiting share (PENDING or SENT status) for orders created by this staff member
  let invoicesAwaitingShare = 0;
  let readyToShare = 0;
  let pendingPayments = 0;
  let remindersSentToday = 0;

  if (staffUid) {
    // Get all orders created by this staff member
    const staffOrdersSnapshot = await getDocs(
      query(ordersCol, where("createdBy", "==", staffUid), limit(500))
    );
    const staffOrderIds = new Set(staffOrdersSnapshot.docs.map(doc => doc.id));

    // Get all invoices and filter by orderId
    const allInvoicesSnapshot = await getDocs(
      query(invoicesCol, orderBy("createdAt", "desc"), limit(500)),
    );

    allInvoicesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const orderId = data.orderId as string | null;
      const status = (data.status as InvoiceStatus) ?? "PENDING";
      const updatedAt = data.updatedAt?.toDate?.() ?? null;

      // Only count invoices for orders created by this staff member
      if (orderId && staffOrderIds.has(orderId)) {
        if (status === "PENDING" || status === "SENT") {
          invoicesAwaitingShare += 1;
          readyToShare += 1;
        }

        if (status === "SENT") {
          pendingPayments += 1;
        }

        // Count invoices updated today (as a proxy for reminders sent)
        if (updatedAt && updatedAt >= startOfToday && status === "SENT") {
          remindersSentToday += 1;
        }
      }
    });
  } else {
    // For admin view, show all invoices
    invoicesAwaitingShare = await safeCount(
      query(invoicesCol, where("status", "in", ["PENDING", "SENT"])),
    );

    const allInvoicesSnapshot = await getDocs(
      query(invoicesCol, orderBy("createdAt", "desc"), limit(100)),
    );

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

      if (updatedAt && updatedAt >= startOfToday && status === "SENT") {
        remindersSentToday += 1;
      }
    });
  }

  return {
    totals: {
      ordersCreated7d,
      servicesAssigned: servicesCreated,
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

