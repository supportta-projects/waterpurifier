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
import type { ServiceStatus } from "@/types/service";

type ServiceSnapshotItem = {
  id: string;
  customerName: string;
  productName: string;
  status: ServiceStatus;
  scheduledDate: string;
  createdAt: string;
  address?: string;
};

export type TechnicianDashboardMetrics = {
  totals: {
    assignedToday: number;
    completedThisWeek: number;
    invoicesPending: number;
  };
  todaySchedule: ServiceSnapshotItem[];
  recentCompletions: ServiceSnapshotItem[];
  serviceStatusCounts: {
    available: number;
    inProgress: number;
    completedAwaitingInvoice: number;
  };
  generatedAt: string;
};

async function safeCount(queryRef: Query<DocumentData>) {
  const snapshot = await getCountFromServer(queryRef);
  return snapshot.data().count;
}

export async function fetchTechnicianDashboardMetrics(
  technicianId: string,
): Promise<TechnicianDashboardMetrics> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfTodayTimestamp = Timestamp.fromDate(startOfToday);

  const servicesCol = collection(db, "services");
  const invoicesCol = collection(db, "invoices");

  // Services assigned to this technician
  // Fetch separately to avoid index requirements
  const assignedSnapshot = await getDocs(
    query(servicesCol, where("technicianId", "==", technicianId), where("status", "==", "ASSIGNED"), limit(100)),
  );
  const inProgressSnapshot = await getDocs(
    query(servicesCol, where("technicianId", "==", technicianId), where("status", "==", "IN_PROGRESS"), limit(100)),
  );
  
  // Combine both snapshots
  const assignedTodaySnapshot = {
    docs: [...assignedSnapshot.docs, ...inProgressSnapshot.docs],
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assignedToday = assignedTodaySnapshot.docs.filter((doc) => {
    const data = doc.data();
    const scheduledDate = data.scheduledDate
      ? (typeof data.scheduledDate === "string"
          ? new Date(data.scheduledDate)
          : data.scheduledDate.toDate())
      : null;
    return scheduledDate && scheduledDate >= today;
  }).length;

  // Today's schedule - services assigned to this technician scheduled for today
  const todayScheduleRaw: ServiceSnapshotItem[] = [];
  assignedTodaySnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const scheduledDate =
      typeof data.scheduledDate === "string"
        ? data.scheduledDate
        : data.scheduledDate?.toDate?.()?.toISOString?.() ?? "";
    const scheduled = scheduledDate ? new Date(scheduledDate) : null;

    if (scheduled && scheduled >= today) {
      todayScheduleRaw.push({
        id: doc.id,
        customerName: (data.customerName as string) ?? "Unknown customer",
        productName: (data.productName as string) ?? "Unknown product",
        status: (data.status as ServiceStatus) ?? "ASSIGNED",
        scheduledDate,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
        address: (data.address as string) ?? undefined,
      });
    }
  });

  const todaySchedule = todayScheduleRaw
    .sort((a, b) => {
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();
      return dateA - dateB; // Ascending order (earliest first)
    })
    .slice(0, 10);

  // Completed this week
  const completedThisWeekSnapshot = await getDocs(
    query(
      servicesCol,
      where("technicianId", "==", technicianId),
      where("status", "==", "COMPLETED"),
      limit(100),
    ),
  );

  const completedThisWeek = completedThisWeekSnapshot.docs.filter((doc) => {
    const data = doc.data();
    const completedDate = data.completedDate
      ? (typeof data.completedDate === "string"
          ? new Date(data.completedDate)
          : data.completedDate.toDate())
      : null;
    return completedDate && completedDate >= startOfWeek;
  }).length;

  // Recent completions
  const recentCompletionsRaw: ServiceSnapshotItem[] = [];
  completedThisWeekSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const completedDate = data.completedDate
      ? (typeof data.completedDate === "string"
          ? new Date(data.completedDate)
          : data.completedDate.toDate())
      : null;

    if (completedDate && completedDate >= startOfWeek) {
      recentCompletionsRaw.push({
        id: doc.id,
        customerName: (data.customerName as string) ?? "Unknown customer",
        productName: (data.productName as string) ?? "Unknown product",
        status: "COMPLETED" as ServiceStatus,
        scheduledDate: data.scheduledDate
          ? (typeof data.scheduledDate === "string"
              ? data.scheduledDate
              : data.scheduledDate.toDate().toISOString())
          : "",
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
      });
    }
  });

  const recentCompletions = recentCompletionsRaw
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    })
    .slice(0, 5);

  // Service status counts
  const availableServices = await safeCount(
    query(servicesCol, where("status", "==", "AVAILABLE")),
  );

  const inProgressServices = await safeCount(
    query(
      servicesCol,
      where("technicianId", "==", technicianId),
      where("status", "==", "IN_PROGRESS"),
    ),
  );

  // Completed services awaiting invoice (completed but no invoice linked)
  const completedAwaitingInvoiceSnapshot = await getDocs(
    query(
      servicesCol,
      where("technicianId", "==", technicianId),
      where("status", "==", "COMPLETED"),
      limit(50),
    ),
  );

  // Count completed services that might need invoices
  // This is a simplified check - in a real app, you'd check if an invoice exists for the service
  const completedAwaitingInvoice = completedAwaitingInvoiceSnapshot.docs.length;

  // Invoices pending (related to this technician's services)
  // Count separately to avoid index requirements
  const pendingInvoices = await safeCount(
    query(invoicesCol, where("status", "==", "PENDING")),
  );
  const sentInvoices = await safeCount(
    query(invoicesCol, where("status", "==", "SENT")),
  );
  const invoicesPending = pendingInvoices + sentInvoices;

  return {
    totals: {
      assignedToday,
      completedThisWeek,
      invoicesPending,
    },
    todaySchedule,
    recentCompletions,
    serviceStatusCounts: {
      available: availableServices,
      inProgress: inProgressServices,
      completedAwaitingInvoice,
    },
    generatedAt: new Date().toISOString(),
  };
}

