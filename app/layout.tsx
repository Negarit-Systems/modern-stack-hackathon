"use client";

import { ConvexReactClient } from "convex/react";
import "./globals.css";
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { authClient } from "@/app/lib/auth.client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

export const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
  {
    expectAuth: true,
  }
);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexBetterAuthProvider client={convex} authClient={authClient}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ConvexBetterAuthProvider>
      </body>
    </html>
  );
}
