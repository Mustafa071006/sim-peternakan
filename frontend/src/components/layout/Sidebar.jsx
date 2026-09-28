import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";

import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts";
import { navFor } from "../../config/navigation";
import { ROLES } from "../../constants/roles";
import { Avatar } from "../ui/Avatar";
import { ConfirmDialog } from "../ui/Modal";
import { BrandMark } from "./BrandMark";

function NavItem({ item, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors",
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-muted hover:bg-canvas hover:text-ink",
        )
      }
    >
      <Icon className="size-4.5 shrink-0" />
      {item.label}
    </NavLink>
  );
}

export function SidebarContent({ onNavigate }) {
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
      <div className="px-5 pb-5 pt-6">
        <BrandMark />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <p className="px-3.5 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-widest text-faint">
          Menu
        </p>
        {nav.map((item) => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user?.nama || roleLabel} size="md" />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px] font-semibold text-ink">
              {user?.nama || roleLabel}
            </div>
            <div className="truncate text-[11px] text-muted">{subLabel}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-muted transition-colors hover:bg-rose-soft hover:text-down"
        >
          <LogOut className="size-4.5" />
          Keluar
        </button>
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

export function Sidebar() {
  return (
    <aside className="hidden w-66 shrink-0 border-r border-line bg-surface lg:block">
      <div className="sticky top-0 h-screen">
        <SidebarContent />
      </div>
    </aside>
  );
}
