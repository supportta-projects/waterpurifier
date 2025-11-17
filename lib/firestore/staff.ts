import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import type { FirebaseError } from "firebase/app";

import { db, getSecondaryAuth } from "@/lib/firebase";
import type { CreateStaffInput, StaffRole, StaffUser, UpdateStaffInput } from "@/types/staff";

const COLLECTION = "users";

/**
 * Checks if an email already exists in the users collection
 */
async function checkEmailExists(email: string, excludeId?: string): Promise<boolean> {
  const emailQuery = query(
    collection(db, COLLECTION),
    where("email", "==", email.toLowerCase().trim()),
  );
  const snapshot = await getDocs(emailQuery);
  
  // If checking for update, exclude the current user's document
  if (excludeId) {
    return snapshot.docs.some((doc) => doc.id !== excludeId);
  }
  
  return !snapshot.empty;
}

/**
 * Maps Firebase auth errors to user-friendly messages
 */
function mapFirebaseAuthError(error: FirebaseError | Error): string {
  if ("code" in error && typeof error.code === "string") {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "This email is already registered. Each email can only have one role (either Staff or Technician).";
      case "auth/invalid-email":
        return "Invalid email address. Please enter a valid email.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled. Please contact an administrator.";
      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password.";
      default:
        return `Unable to create user account: ${error.code}. Please try again.`;
    }
  }
  return error.message || "Unable to create user account. Please try again.";
}

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
  const staff = snapshot.docs.map((docSnapshot) => mapStaffSnapshot(docSnapshot));
  
  // Deduplicate by uid to handle any old records that might have duplicates
  // Prefer documents where id === uid (new approach with single document)
  const uniqueStaff = new Map<string, StaffUser>();
  for (const user of staff) {
    if (!user.uid) continue; // Skip if no uid
    
    const existing = uniqueStaff.get(user.uid);
    if (!existing) {
      uniqueStaff.set(user.uid, user);
    } else {
      // Prefer the document where id === uid (the new single document approach)
      if (user.id === user.uid && existing.id !== existing.uid) {
        uniqueStaff.set(user.uid, user);
      }
    }
  }
  
  const deduplicatedStaff = Array.from(uniqueStaff.values());
  
  // Sort by createdAt descending (newest first)
  return deduplicatedStaff.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA; // Descending order (newest first)
  });
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
  const email = payload.email.toLowerCase().trim();
  
  // Check if email already exists (one email = one role)
  const emailExists = await checkEmailExists(email);
  if (emailExists) {
    throw new Error("This email is already registered. Each email can only have one role (either Staff or Technician).");
  }

  const password = generatePassword();
  const secondaryAuth = getSecondaryAuth();
  
  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );
    const uid = userCredential.user.uid;
    await signOut(secondaryAuth);

    // Store only one document with uid as the document ID
    // This works for both login (fetchUserProfile) and the staff table
    const userRef = doc(db, COLLECTION, uid);
    await setDoc(userRef, {
      ...payload,
      email, // Store normalized email
      uid,
      password,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const snapshot = await getDoc(userRef);
    return mapStaffSnapshot(snapshot);
  } catch (error) {
    await signOut(secondaryAuth);
    // Map Firebase auth errors to user-friendly messages
    throw new Error(mapFirebaseAuthError(error as FirebaseError));
  }
}

export async function updateStaff(id: string, payload: UpdateStaffInput) {
  // The id is the uid (document ID) for new records, but could be a generated ID for old records
  const ref = doc(db, COLLECTION, id);
  const currentDoc = await getDoc(ref);
  if (!currentDoc.exists()) {
    throw new Error("Staff user not found");
  }
  const currentData = currentDoc.data();
  const uid = currentData.uid as string;
  const currentEmail = (currentData.email as string)?.toLowerCase().trim();

  // If email is being changed, check if the new email already exists
  if (payload.email && payload.email.toLowerCase().trim() !== currentEmail) {
    const newEmail = payload.email.toLowerCase().trim();
    const emailExists = await checkEmailExists(newEmail, id);
    if (emailExists) {
      throw new Error("This email is already registered. Each email can only have one role (either Staff or Technician).");
    }
    // Normalize email before storing
    payload.email = newEmail;
  }

  // Update the document
  await updateDoc(ref, {
    ...payload,
    updatedAt: serverTimestamp(),
  });

  // If this is an old record with a generated ID, also update the document with uid as document ID
  // This ensures backward compatibility with old records that might have duplicates
  if (uid && id !== uid) {
    const userRef = doc(db, COLLECTION, uid);
    const uidDoc = await getDoc(userRef);
    if (uidDoc.exists()) {
      await updateDoc(userRef, {
        ...payload,
        updatedAt: serverTimestamp(),
      });
    }
  }

  const snapshot = await getDoc(ref);
  return mapStaffSnapshot(snapshot);
}

