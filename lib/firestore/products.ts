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
import { generateCustomId } from "@/lib/utils/custom-id";
import type { Product, ProductInput, ProductStatus } from "@/types/product";

const COLLECTION = "products";

function mapProductSnapshot(productDoc: DocumentSnapshot<DocumentData>): Product {
  const data = productDoc.data();

  if (!data) {
    throw new Error("Product not found");
  }

  return {
    id: productDoc.id,
    customId: (data.customId as string) ?? productDoc.id,
    name: data.name as string,
    model: data.model as string,
    description: data.description as string,
    price: data.price as number,
    status: (data.status ?? "ACTIVE") as ProductStatus,
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : "",
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : "",
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const productsQuery = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(productsQuery);
  return snapshot.docs.map((docSnapshot) => mapProductSnapshot(docSnapshot));
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const productRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(productRef);
  if (!snapshot.exists()) {
    return null;
  }
  return mapProductSnapshot(snapshot);
}

export async function createProduct(payload: ProductInput) {
  const customId = generateCustomId("PROD");
  const productRef = collection(db, COLLECTION);
  const docRef = await addDoc(productRef, {
    ...payload,
    customId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(docRef);
  return mapProductSnapshot(snapshot);
}

export async function updateProduct(id: string, payload: Partial<ProductInput>) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(docRef);
  return mapProductSnapshot(snapshot);
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}

