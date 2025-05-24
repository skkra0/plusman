export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { hind } from "@/lib/fonts";
import "./globals.css";
import KeyProvider from "@/components/key-provider";

export const metadata: Metadata = {
  title: "Plusman",
  description: "Password manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={hind.className}>
      <body>
        <KeyProvider>{children}</KeyProvider>
      </body>
    </html>
  );
}
