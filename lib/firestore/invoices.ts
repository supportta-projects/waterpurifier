import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
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
import type { CreateInvoiceInput, Invoice, InvoiceStatus, InvoiceType } from "@/types/invoice";

const shareBaseUrl = process.env.NEXT_PUBLIC_INVOICE_SHARE_BASE_URL ?? "";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildInvoiceShareUrl(invoice: {
  id: string;
  number: string;
  customerName: string;
  productName: string;
  totalAmount: number;
}) {
  const amount = formatCurrency(invoice.totalAmount);
  const messageLines = [
    `Water Purifier Service Invoice ${invoice.number}`,
    `Customer: ${invoice.customerName}`,
    `Product: ${invoice.productName}`,
    `Amount: ${amount}`,
  ];

  if (shareBaseUrl) {
    const normalizedBase = shareBaseUrl.endsWith("/")
      ? shareBaseUrl.slice(0, -1)
      : shareBaseUrl;
    messageLines.push(`View invoice: ${normalizedBase}/invoice/${invoice.id}`);
  }

  messageLines.push("Thank you for choosing our service.");
  const message = messageLines.join("\n");

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function mapInvoiceSnapshot(snapshot: DocumentSnapshot<DocumentData>): Invoice {
  const data = snapshot.data();

  if (!data) {
    throw new Error("Invoice not found");
  }

  return {
    id: snapshot.id,
    customId: (data.customId as string) ?? snapshot.id,
    invoiceType: (data.invoiceType ?? "ORDER") as InvoiceType, // Default to ORDER for backward compatibility
    orderId: data.orderId ?? null,
    orderCustomId: data.orderCustomId as string | undefined,
    serviceId: data.serviceId ?? null,
    serviceCustomId: data.serviceCustomId as string | undefined,
    customerId: data.customerId as string,
    customerCustomId: data.customerCustomId as string | undefined,
    customerName: data.customerName as string,
    productId: data.productId as string,
    productCustomId: data.productCustomId as string | undefined,
    productName: data.productName as string,
    totalAmount: data.totalAmount as number,
    number: data.number as string,
    status: (data.status ?? "PENDING") as InvoiceStatus,
    shareUrl: data.shareUrl ?? null,
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : "",
  };
}

export async function fetchInvoices(options?: { technicianId?: string }): Promise<Invoice[]> {
  const invoicesQuery = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(invoicesQuery);
  let invoices = snapshot.docs.map((docSnapshot) => mapInvoiceSnapshot(docSnapshot));

  // If technicianId is provided, filter invoices by services assigned to this technician
  if (options?.technicianId) {
    const servicesCol = collection(db, "services");
    const servicesSnapshot = await getDocs(
      query(servicesCol, where("technicianId", "==", options.technicianId), limit(1000))
    );
    const technicianServiceIds = new Set(servicesSnapshot.docs.map(doc => doc.id));
    
    invoices = invoices.filter((invoice) => {
      // Include invoices for services assigned to this technician
      return invoice.serviceId && technicianServiceIds.has(invoice.serviceId);
    });
  }

  return invoices;
}

export async function fetchInvoiceById(id: string): Promise<Invoice | null> {
  const snapshot = await getDoc(doc(db, "invoices", id));
  return snapshot.exists() ? mapInvoiceSnapshot(snapshot) : null;
}

export async function createInvoice(payload: CreateInvoiceInput) {
  const customId = generateCustomId("INV");
  const invoiceNumber = customId; // Use customId as invoice number
  const invoicesRef = collection(db, "invoices");

  const docRef = await addDoc(invoicesRef, {
    ...payload,
    customId,
    number: invoiceNumber,
    status: "PENDING" satisfies InvoiceStatus,
    shareUrl: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const shareUrl = buildInvoiceShareUrl({
    id: docRef.id,
    number: invoiceNumber,
    customerName: payload.customerName,
    productName: payload.productName,
    totalAmount: payload.totalAmount,
  });

  await updateDoc(docRef, {
    shareUrl,
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(docRef);
  return mapInvoiceSnapshot(snapshot);
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const docRef = doc(db, "invoices", id);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(docRef);
  return mapInvoiceSnapshot(snapshot);
}

export async function refreshInvoiceShareUrl(id: string) {
  const docRef = doc(db, "invoices", id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    throw new Error("Invoice not found");
  }

  const invoice = mapInvoiceSnapshot(snapshot);
  const shareUrl = buildInvoiceShareUrl(invoice);

  await updateDoc(docRef, {
    shareUrl,
    updatedAt: serverTimestamp(),
  });

  const updatedSnapshot = await getDoc(docRef);
  return mapInvoiceSnapshot(updatedSnapshot);
}

export async function deleteInvoice(id: string) {
  await deleteDoc(doc(db, "invoices", id));
}

