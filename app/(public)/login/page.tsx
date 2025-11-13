import type { Metadata } from "next";

import { LoginScreen } from "@/components/auth/login-screen";

export const metadata: Metadata = {
  title: "Login | Water Purifier Service Platform",
  description: "Sign in to manage products, services, orders, and invoices.",
};

export default function LoginPage() {
  return <LoginScreen />;
}

