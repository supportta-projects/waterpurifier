import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { generateCustomId } from "@/lib/utils/custom-id";
import { fetchCustomerById } from "./customers";
import { fetchProduct } from "./products";
import { fetchOrderById } from "./orders";
import type {
  CreateServiceInput,
  Service,
  ServiceStatus,
  ServiceType,
  UpdateServiceInput,
} from "@/types/service";

function mapServiceSnapshot(snapshot: DocumentSnapshot<DocumentData>): Service {
  const data = snapshot.data();

  if (!data) {
    throw new Error("Service not found");
  }

  return {
    id: snapshot.id,
    customId: (data.customId as string) ?? undefined,
    customerId: data.customerId as string,
    customerCustomId: data.customerCustomId as string | undefined,
    customerName: data.customerName as string,
    productId: data.productId as string,
    productCustomId: data.productCustomId as string | undefined,
    productName: data.productName as string,
    orderId: data.orderId ?? null,
    orderCustomId: data.orderCustomId ?? null,
    technicianId: data.technicianId ?? null,
    technicianName: data.technicianName ?? null,
    createdBy: data.createdBy ?? null,
    assignedBy: data.assignedBy ?? null,
    serviceType: (data.serviceType ?? "MANUAL") as ServiceType,
    status: (data.status ?? "AVAILABLE") as ServiceStatus,
    scheduledDate: data.scheduledDate ?? "",
    completedDate: data.completedDate ?? null,
    notes: data.notes ?? "",
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : "",
  };
}

export async function fetchServices(options?: {
  status?: ServiceStatus;
  technicianId?: string;
  limit?: number;
}) {
  const constraints = [];

  if (options?.status) {
    constraints.push(where("status", "==", options.status));
  }

  if (options?.technicianId) {
    constraints.push(where("technicianId", "==", options.technicianId));
  }

  // Remove orderBy to avoid index requirements and improve performance
  // Sort in memory instead
  const servicesQuery = query(collection(db, "services"), ...constraints);
  const snapshot = await getDocs(servicesQuery);
  let services = snapshot.docs.map((docSnapshot) => mapServiceSnapshot(docSnapshot));

  // Sort by createdAt descending in memory (newest first)
  services = services.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA; // Descending order (newest first)
  });

  if (options?.limit && options.limit > 0) {
    return services.slice(0, options.limit);
  }

  return services;
}

export async function createService(payload: CreateServiceInput) {
  // Fetch customer, product, and order (if orderId provided) to get their custom IDs
  const [customer, product, order] = await Promise.all([
    fetchCustomerById(payload.customerId).catch(() => null),
    fetchProduct(payload.productId).catch(() => null),
    payload.orderId ? fetchOrderById(payload.orderId).catch(() => null) : Promise.resolve(null),
  ]);

  const customId = generateCustomId("SRV");
  const status: ServiceStatus = payload.technicianId ? "ASSIGNED" : "AVAILABLE";
  const docRef = await addDoc(collection(db, "services"), {
    ...payload,
    customId,
    customerCustomId: customer?.customId,
    productCustomId: product?.customId,
    orderId: payload.orderId ?? null,
    orderCustomId: order?.customId ?? null,
    status,
    technicianId: payload.technicianId ?? null,
    technicianName: payload.technicianName ?? null,
    createdBy: payload.createdBy ?? null,
    assignedBy: payload.assignedBy ?? (payload.technicianId ? payload.createdBy : null),
    completedDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(docRef);
  return mapServiceSnapshot(snapshot);
}

export async function updateService(id: string, payload: UpdateServiceInput) {
  const docRef = doc(db, "services", id);
  const updateData: Record<string, unknown> = {
    ...payload,
    updatedAt: serverTimestamp(),
  };
  // If technician is being assigned and assignedBy is not provided, set it from the payload
  if (payload.technicianId && !payload.assignedBy && payload.assignedBy !== null) {
    // Keep existing assignedBy if technician is being updated but assignedBy is not in payload
    const currentDoc = await getDoc(docRef);
    if (currentDoc.exists()) {
      const currentData = currentDoc.data();
      if (!currentData.assignedBy && payload.assignedBy === undefined) {
        // Don't update assignedBy if it's not in the payload
        delete updateData.assignedBy;
      }
    }
  }
  await updateDoc(docRef, updateData);
  const snapshot = await getDoc(docRef);
  return mapServiceSnapshot(snapshot);
}

export async function fetchServicesByCustomerAndProduct(
  customerId: string,
  productId: string,
): Promise<Service[]> {
  // Query without orderBy to avoid index requirement, then sort in memory
  const servicesQuery = query(
    collection(db, "services"),
    where("customerId", "==", customerId),
    where("productId", "==", productId),
  );
  const snapshot = await getDocs(servicesQuery);
  const services = snapshot.docs.map((docSnapshot) => mapServiceSnapshot(docSnapshot));
  
  // Sort by createdAt descending in memory
  return services.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA; // Descending order (newest first)
  });
}

