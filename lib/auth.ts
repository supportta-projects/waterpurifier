"use client";

import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import type { FirebaseError } from "firebase/app";

import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

const USERS_COLLECTION = "users";

export function listenToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function fetchUserProfile(uid: string) {
  // First try to get the document with uid as document ID (new approach)
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (userDoc.exists()) {
    return { uid, ...(userDoc.data() as Omit<UserProfile, "uid">) } as UserProfile;
  }

  // If document doesn't exist with uid as ID, try querying by uid field (for backward compatibility with old records)
  const usersQuery = query(
    collection(db, USERS_COLLECTION),
    where("uid", "==", uid),
  );
  const snapshot = await getDocs(usersQuery);
  if (snapshot.empty) {
    return null;
  }
  const docData = snapshot.docs[0].data();
  return { uid, ...(docData as Omit<UserProfile, "uid">) } as UserProfile;
}

export async function ensureUserProfile(uid: string, profile: UserProfile) {
  await setDoc(
    doc(db, USERS_COLLECTION, uid),
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function loginWithEmailPassword(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

export function mapFirebaseError(error: FirebaseError | Error) {
  if ("code" in error && typeof error.code === "string") {
    switch (error.code) {
      case "auth/user-not-found":
        return "No user found with those credentials.";
      case "auth/wrong-password":
        return "Incorrect password. Try again.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/user-disabled":
        return "This account has been disabled. Contact an administrator.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait and try again.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      default:
        return `Login failed: ${error.code}. Please try again.`;
    }
  }

  return error.message || "Something went wrong. Please try again.";
}

