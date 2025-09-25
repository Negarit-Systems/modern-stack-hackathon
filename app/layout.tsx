"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import "./globals.css";
import { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexProvider client={convex}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ConvexProvider>
      </body>
    </html>
  );
}