import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Sidebar, SidebarContent } from "../components/layout/Sidebar";
import { BrandMark } from "../components/layout/BrandMark";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/35" onClick={closeMobile} />
          <div className="absolute left-0 top-0 h-full w-66 bg-surface shadow-(--shadow-pop)]">
            <button
              type="button"
              onClick={closeMobile}
              className="absolute right-3 top-4 grid size-8 place-items-center rounded-lg text-faint hover:bg-canvas"
              aria-label="Tutup menu"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={closeMobile} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
          <BrandMark compact />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid size-9 place-items-center rounded-lg border border-line-strong text-muted"
            aria-label="Buka menu"
          >
            <Menu className="size-5" />
          </button>
        </div>

        <main className="mx-auto w-full max-w-360 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
