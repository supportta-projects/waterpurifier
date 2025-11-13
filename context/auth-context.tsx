"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "firebase/auth";

import { fetchUserProfile, listenToAuthChanges, logout } from "@/lib/auth";
import type { UserProfile, UserRole } from "@/types/user";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isActive: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const handleProfileFetch = useCallback(
    async (currentUser: User | null) => {
      if (!currentUser) {
        setProfile(null);
        setStatus("unauthenticated");
        return;
      }

      try {
        const result = await fetchUserProfile(currentUser.uid);
        setProfile(result);
        setStatus("authenticated");
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        setProfile(null);
        setStatus("authenticated");
      }
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(async (currentUser) => {
      setUser(currentUser);
      await handleProfileFetch(currentUser);
    });

    return () => unsubscribe();
  }, [handleProfileFetch]);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      return;
    }
    await handleProfileFetch(user);
  }, [handleProfileFetch, user]);

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
    setProfile(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profile,
      role: profile?.role ?? null,
      isActive: profile?.isActive ?? false,
      signOut,
      refreshProfile,
    }),
    [status, user, profile, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

