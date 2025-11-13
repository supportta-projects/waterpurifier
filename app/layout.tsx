import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Water Purifier Service Platform",
  description:
    "Role-based service management for water purifier products, orders, and technicians.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          "bg-background text-foreground antialiased",
        )}
      >
        <AuthProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
