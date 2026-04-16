import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import { CaseProvider } from "@/components/case-provider";

export const metadata: Metadata = {
  title: "Domestic Violence Case Analyzer",
  description: "Legal-tech frontend prototype for case intake and risk analysis"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CaseProvider>{children}</CaseProvider>
      </body>
    </html>
  );
}
