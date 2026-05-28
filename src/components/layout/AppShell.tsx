import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { MobileSheet } from "./MobileSheet";
import { ReconnectBanner } from "@/components/sync/ReconnectBanner";

export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setMobileSheetOpen(true)} />
        <ReconnectBanner />

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <MobileNav onMoreClick={() => setMobileSheetOpen(true)} />
      <MobileSheet
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
      />
    </div>
  );
}
