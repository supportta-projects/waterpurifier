"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function assertConfig(config: FirebaseConfig) {
  const requiredKeys: Array<keyof FirebaseConfig> = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ];

  const missing = requiredKeys.filter((key) => !config[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase configuration values: ${missing.join(
        ", ",
      )}. Ensure environment variables are set.`,
    );
  }
}

let firebaseApp: FirebaseApp;
let secondaryApp: FirebaseApp | null = null;

export function getFirebaseApp() {
  if (!firebaseApp) {
    assertConfig(firebaseConfig);
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return firebaseApp;
}

export const auth = getAuth(getFirebaseApp());
export const db = getFirestore(getFirebaseApp());
export const storage = getStorage(getFirebaseApp());

export function getSecondaryAuth() {
  assertConfig(firebaseConfig);
  if (!secondaryApp) {
    secondaryApp = initializeApp(firebaseConfig, "secondary");
  }
  return getAuth(secondaryApp);
}

