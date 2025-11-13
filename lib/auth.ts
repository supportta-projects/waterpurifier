"use client";

import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { FirebaseError } from "firebase/app";

import { auth, db } from "@/lib/firebase";
import type { UserProfile } from "@/types/user";

const USERS_COLLECTION = "users";

export function listenToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function fetchUserProfile(uid: string) {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!userDoc.exists()) {
    return null;
  }

  return { uid, ...(userDoc.data() as Omit<UserProfile, "uid">) } as UserProfile;
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
      case "auth/too-many-requests":
        return "Too many failed attempts. Please wait and try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  return error.message || "Something went wrong. Please try again.";
}

