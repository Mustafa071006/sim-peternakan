import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts";
import { navFor } from "../../config/navigation";
import { ROLES } from "../../constants/roles";
import { Avatar } from "../ui/Avatar";
import { ConfirmDialog } from "../ui/Modal";
import { Tooltip } from "../ui/Tooltip";
import { BrandMark } from "./BrandMark";

// Labels fade out (and are clipped by the narrowing sidebar) instead of
// unmounting, so icons stay put while the width animates.
const labelClass = (collapsed) =>
  cn(
    "truncate transition-opacity duration-150",
    collapsed ? "opacity-0" : "opacity-100",
  );

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  return (
    <Tooltip label={item.label} disabled={!collapsed}>
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onNavigate}
        aria-label={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            "group relative flex items-center gap-3 overflow-hidden whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors duration-150",
            isActive ? "text-brand-700" : "text-muted hover:bg-canvas hover:text-ink",
          )
        }
      >
        <Icon className="size-4.5 shrink-0 transition-transform duration-200 ease-(--ease-out-soft) group-hover:scale-110 group-active:scale-95" />
        <span className={labelClass(collapsed)}>{item.label}</span>
      </NavLink>
    </Tooltip>
  );
}

/**
 * Nav list with one shared "active" pill that slides to the active item
 * instead of each item toggling its own background.
 */
function NavList({ items, collapsed, onNavigate }) {
  const { pathname } = useLocation();
  const listRef = useRef(null);
  const pillRef = useRef(null);

  useLayoutEffect(() => {
    const pill = pillRef.current;
    const active = listRef.current?.querySelector('[aria-current="page"]');
    if (!pill) return;
    if (!active) {
      pill.style.opacity = "0";
      return;
    }
    pill.style.opacity = "1";
    pill.style.transform = `translateY(${active.offsetTop}px)`;
    pill.style.height = `${active.offsetHeight}px`;
    // Skip the transition on first placement so it doesn't fly in from the top.
    if (!pill.dataset.ready) {
      requestAnimationFrame(() => {
        pill.dataset.ready = "true";
      });
    }
  }, [pathname, items]);

  return (
    <div ref={listRef} className="relative space-y-1">
      <span
        ref={pillRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 rounded-xl bg-brand-50 opacity-0 duration-200 ease-(--ease-out-soft) data-ready:transition-[transform,height,opacity]"
      >
        <span className="absolute left-0 top-1/2 h-4 w-0.75 -translate-y-1/2 rounded-full bg-brand-500" />
      </span>
      {items.map((item) => (
        <NavItem
          key={item.to}
          item={item}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export function SidebarContent({ onNavigate, collapsed = false, onToggle }) {
  const { user, logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const nav = navFor(String(user?.role).toLowerCase() === "admin");

  const roleLabel = user?.role === ROLES.ADMIN ? "Admin" : "Operator";
  const subLabel =
    user?.role === ROLES.ADMIN ? "Admin" : user?.kandang_nama || "Operator";

  const confirmLogout = () => {
    setConfirmOpen(false);
    onNavigate?.();
    logout();
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex pb-5 pt-6",
          collapsed ? "flex-col items-center gap-3 px-3" : "items-center justify-between gap-2 px-5",
        )}
      >
        <BrandMark compact={collapsed} />
        {onToggle ? (
          <Tooltip label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}>
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
              aria-expanded={!collapsed}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-faint transition-[color,background-color,transform] duration-150 hover:bg-canvas hover:text-ink active:scale-95"
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4.5" />
              ) : (
                <PanelLeftClose className="size-4.5" />
              )}
            </button>
          </Tooltip>
        ) : null}
      </div>

      <nav className="scrollbar-slim flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
        <p
          className={cn(
            "whitespace-nowrap px-3.5 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-widest text-faint",
            labelClass(collapsed),
          )}
        >
          Menu
        </p>
        <NavList items={nav} collapsed={collapsed} onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 overflow-hidden rounded-xl px-1.5 py-2">
          <Avatar name={user?.nama || roleLabel} size="md" />
          <div className={cn("min-w-0 leading-tight", labelClass(collapsed))}>
            <div className="truncate text-[13px] font-semibold text-ink">
              {user?.nama || roleLabel}
            </div>
            <div className="truncate text-[11px] text-muted">{subLabel}</div>
          </div>
        </div>
        <Tooltip label="Keluar" disabled={!collapsed}>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label={collapsed ? "Keluar" : undefined}
            className="group mt-1 flex w-full items-center gap-3 overflow-hidden whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-muted transition-colors duration-150 hover:bg-rose-soft hover:text-down"
          >
            <LogOut className="size-4.5 shrink-0 transition-transform duration-200 ease-(--ease-out-soft) group-hover:translate-x-0.5" />
            <span className={labelClass(collapsed)}>Keluar</span>
          </button>
        </Tooltip>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmLogout}
        tone="danger"
        title="Yakin mau keluar?"
        description="Anda perlu masuk kembali dengan email dan kata sandi untuk mengakses workspace ini."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
      />
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-line bg-surface transition-[width] duration-200 ease-(--ease-out-soft) lg:block",
        collapsed ? "w-18" : "w-66",
      )}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </div>
    </aside>
  );
}
