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
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { generateCustomId } from "@/lib/utils/custom-id";
import type { Customer } from "@/types/customer";

function mapCustomerSnapshot(snapshot: DocumentSnapshot<DocumentData>): Customer {
  const data = snapshot.data();

  if (!data) {
    throw new Error("Customer not found");
  }

  return {
    id: snapshot.id,
    customId: (data.customId as string) ?? snapshot.id,
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    isActive: Boolean(data.isActive ?? true),
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : undefined,
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : undefined,
  };
}

export async function fetchCustomers(): Promise<Customer[]> {
  const customersQuery = query(collection(db, "customers"), orderBy("name", "asc"));
  const snapshot = await getDocs(customersQuery);
  return snapshot.docs.map((docSnapshot) => mapCustomerSnapshot(docSnapshot));
}

export async function fetchCustomerById(id: string): Promise<Customer | null> {
  const snapshot = await getDoc(doc(db, "customers", id));
  if (!snapshot.exists()) {
    return null;
  }
  return mapCustomerSnapshot(snapshot);
}

export async function createCustomer(payload: Omit<Customer, "id" | "customId" | "createdAt" | "updatedAt">) {
  const customId = generateCustomId("CUST");
  const ref = await addDoc(collection(db, "customers"), {
    ...payload,
    customId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(ref);
  return mapCustomerSnapshot(snapshot);
}

export async function updateCustomer(
  id: string,
  payload: Partial<Omit<Customer, "id" | "createdAt" | "updatedAt">>,
) {
  const ref = doc(db, "customers", id);
  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(ref);
  return mapCustomerSnapshot(snapshot);
}

