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
    customerId: data.customerId as string,
    customerName: data.customerName as string,
    productId: data.productId as string,
    productName: data.productName as string,
    technicianId: data.technicianId ?? null,
    technicianName: data.technicianName ?? null,
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

  constraints.push(orderBy("scheduledDate", "desc"));
  const servicesQuery = query(collection(db, "services"), ...constraints);
  const snapshot = await getDocs(servicesQuery);
  const services = snapshot.docs.map((docSnapshot) => mapServiceSnapshot(docSnapshot));

  if (options?.limit && options.limit > 0) {
    return services.slice(0, options.limit);
  }

  return services;
}

export async function createService(payload: CreateServiceInput) {
  const docRef = await addDoc(collection(db, "services"), {
    ...payload,
    status: "AVAILABLE" satisfies ServiceStatus,
    technicianId: null,
    technicianName: null,
    completedDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(docRef);
  return mapServiceSnapshot(snapshot);
}

export async function updateService(id: string, payload: UpdateServiceInput) {
  const docRef = doc(db, "services", id);
  await updateDoc(docRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(docRef);
  return mapServiceSnapshot(snapshot);
}

