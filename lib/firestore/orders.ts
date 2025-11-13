import {
  addDoc,
  collection,
  deleteDoc,
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
import { createInvoice, deleteInvoice } from "@/lib/firestore/invoices";
import type { CreateOrderInput, Order, OrderStatus } from "@/types/order";

function mapOrderSnapshot(snapshot: DocumentSnapshot<DocumentData>): Order {
  const data = snapshot.data();

  if (!data) {
    throw new Error("Order not found");
  }

  return {
    id: snapshot.id,
    customerId: data.customerId as string,
    customerName: data.customerName as string,
    productId: data.productId as string,
    productName: data.productName as string,
    quantity: data.quantity as number,
    unitPrice: data.unitPrice as number,
    totalAmount: data.totalAmount as number,
    status: (data.status ?? "PENDING") as OrderStatus,
    invoiceId: data.invoiceId ?? null,
    invoiceNumber: data.invoiceNumber ?? null,
    invoiceStatus: data.invoiceStatus ?? null,
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : "",
  };
}

export async function fetchOrders(): Promise<Order[]> {
  const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(ordersQuery);
  return snapshot.docs.map((docSnapshot) => mapOrderSnapshot(docSnapshot));
}

export async function createOrder(payload: CreateOrderInput): Promise<Order> {
  const totalAmount = payload.unitPrice * payload.quantity;
  const ordersRef = collection(db, "orders");

  const docRef = await addDoc(ordersRef, {
    ...payload,
    totalAmount,
    status: "PENDING" satisfies OrderStatus,
    invoiceId: null,
    invoiceNumber: null,
    invoiceStatus: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const invoice = await createInvoice({
    orderId: docRef.id,
    customerId: payload.customerId,
    customerName: payload.customerName,
    productId: payload.productId,
    productName: payload.productName,
    totalAmount,
  });

  await updateDoc(docRef, {
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    invoiceStatus: invoice.status,
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(docRef);
  return mapOrderSnapshot(snapshot);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const docRef = doc(db, "orders", id);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(docRef);
  return mapOrderSnapshot(snapshot);
}

export async function deleteOrder(id: string, invoiceId?: string | null) {
  await deleteDoc(doc(db, "orders", id));
  if (invoiceId) {
    await deleteInvoice(invoiceId);
  }
}

