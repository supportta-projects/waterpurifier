import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";

import { db, getSecondaryAuth } from "@/lib/firebase";
import type { CreateStaffInput, StaffRole, StaffUser, UpdateStaffInput } from "@/types/staff";

const COLLECTION = "users";

function mapStaffSnapshot(snapshot: DocumentSnapshot<DocumentData>): StaffUser {
  const data = snapshot.data();

  if (!data) {
    throw new Error("Staff user not found");
  }

  return {
    id: snapshot.id,
    uid: data.uid ?? "",
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    role: (data.role ?? "STAFF") as StaffRole,
    isActive: Boolean(data.isActive ?? true),
    password: data.password ?? "",
    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : undefined,
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : undefined,
  };
}

export async function fetchStaff(): Promise<StaffUser[]> {
  const staffQuery = query(
    collection(db, COLLECTION),
    where("role", "in", ["STAFF", "TECHNICIAN"]),
  );
  const snapshot = await getDocs(staffQuery);
  return snapshot.docs
    .map((docSnapshot) => mapStaffSnapshot(docSnapshot))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function generatePassword() {
  const length = 12;
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * charset.length);
    password += charset[index];
  }
  return password;
}

export async function createStaff(payload: CreateStaffInput) {
  const password = generatePassword();
  const secondaryAuth = getSecondaryAuth();
  const userCredential = await createUserWithEmailAndPassword(
    secondaryAuth,
    payload.email,
    password,
  );
  const uid = userCredential.user.uid;
  await signOut(secondaryAuth);

  const ref = await addDoc(collection(db, COLLECTION), {
    ...payload,
    uid,
    password,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(ref);
  return mapStaffSnapshot(snapshot);
}

export async function updateStaff(id: string, payload: UpdateStaffInput) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  const snapshot = await getDoc(ref);
  return mapStaffSnapshot(snapshot);
}

