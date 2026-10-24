import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { cn } from "../utils/cn";
import { Sidebar, SidebarContent } from "../components/layout/Sidebar";
import { BrandMark } from "../components/layout/BrandMark";
import { RouteSkeleton } from "../components/skeletons/PageSkeletons";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const { collapsed, toggle } = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar collapsed={collapsed} onToggle={toggle} />

      {/* Mobile drawer — always mounted so it can animate both ways */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", !mobileOpen && "pointer-events-none")}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink/35 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={closeMobile}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-66 bg-surface shadow-(--shadow-pop) transition-transform duration-200 ease-(--ease-out-soft)",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={closeMobile}
            className="absolute right-3 top-4 z-10 grid size-8 place-items-center rounded-lg text-faint transition-[color,background-color,transform] duration-150 hover:bg-canvas hover:text-ink active:scale-95"
            aria-label="Tutup menu"
          >
            <X className="size-4" />
          </button>
          <SidebarContent onNavigate={closeMobile} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
          <BrandMark compact />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid size-9 place-items-center rounded-lg border border-line-strong text-muted transition-[color,border-color,transform] duration-150 hover:border-brand-400 hover:text-brand-700 active:scale-95"
            aria-label="Buka menu"
          >
            <Menu className="size-5" />
          </button>
        </div>

        <main className="mx-auto w-full max-w-360 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {/* Sidebar stays visible while the next page's chunk loads */}
          <Suspense fallback={<RouteSkeleton />}>
            <div key={pathname} className="animate-[sp-fade-in_0.18s_ease-out]">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
