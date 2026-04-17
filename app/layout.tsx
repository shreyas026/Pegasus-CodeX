import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import { CaseProvider } from "@/components/case-provider";
import { CursorRotor } from "@/components/cursor-rotor";

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
        <div aria-hidden className="background-shell">
          <div className="video-bg">
            <div className="video-bg-layer" />
          </div>
          <div className="grid-overlay" />
        </div>
        <CursorRotor />
        <div className="app-shell">
          <CaseProvider>{children}</CaseProvider>
        </div>
      </body>
    </html>
  );
}
