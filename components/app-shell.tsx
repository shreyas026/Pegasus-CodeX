import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { PanicButton } from "@/components/panic-button";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col gap-5 px-3 py-3 sm:px-4 lg:flex-row lg:items-start lg:px-6 lg:py-6">
      <Sidebar />
      <main className="page-fade flex-1 space-y-5 pb-24">{children}</main>
      <PanicButton />
    </div>
  );
}
