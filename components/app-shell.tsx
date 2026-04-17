import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { PanicButton } from "@/components/panic-button";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col gap-4 px-3 py-3 sm:px-4 lg:flex-row lg:items-start lg:px-5 lg:py-5">
      <Sidebar />
      <main className="page-fade min-w-0 flex-1 space-y-4 pb-28">{children}</main>
      <PanicButton />
    </div>
  );
}
