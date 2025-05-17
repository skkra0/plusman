import type { Metadata } from "next";
import { hind } from "@/lib/fonts";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
