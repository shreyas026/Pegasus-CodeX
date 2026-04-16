import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-5 px-4 py-5 lg:flex-row lg:items-start lg:px-6 lg:py-6">
      <Sidebar />
      <main className="page-fade flex-1 space-y-5 pb-8">{children}</main>
    </div>
  );
}
