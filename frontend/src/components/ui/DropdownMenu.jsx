import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

import { cn } from "../../utils/cn";

const MENU_WIDTH = 208; // px — keep fixed so height can be measured before paint
const GAP = 6;
const EDGE = 8;

/**
 * Lightweight kebab / actions menu. Rendered through a portal so it can never
 * be clipped by a scrolling ancestor (e.g. a table's overflow-x wrapper), and
 * flips above the trigger when there isn't room below.
 *
 * items: { label, icon?, onClick, tone?: "default" | "danger", disabled? }
 */
export function DropdownMenu({ items = [], align = "right", trigger }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const computePosition = useCallback(() => {
    const btn = triggerRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;

    const rect = btn.getBoundingClientRect();
    const menuHeight = menu.offsetHeight;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp =
      spaceBelow < menuHeight + GAP && rect.top > menuHeight + GAP;

    const top = openUp ? rect.top - menuHeight - GAP : rect.bottom + GAP;
    let left = align === "right" ? rect.right - MENU_WIDTH : rect.left;
    left = Math.min(
      Math.max(EDGE, left),
      window.innerWidth - MENU_WIDTH - EDGE,
    );

    setCoords({ top, left });
  }, [align]);

  useLayoutEffect(() => {
    if (open) computePosition();
  }, [open, computePosition]);

  useEffect(() => {
    if (!open) return;

    const onDoc = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      )
        return;
      setOpen(false);
    };
    const close = () => setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid size-8 place-items-center rounded-lg text-faint transition-[color,background-color,transform] duration-150 hover:bg-canvas hover:text-ink active:scale-95"
      >
        {trigger || <MoreVertical className="size-4.5" />}
      </button>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{
                position: "fixed",
                top: coords?.top ?? -9999,
                left: coords?.left ?? -9999,
                width: MENU_WIDTH,
                visibility: coords ? "visible" : "hidden",
              }}
              className="z-100 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-(--shadow-pop) animate-[sp-fade-up_0.14s_ease]"
            >
              {items.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onClick?.();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150 disabled:opacity-40",
                    item.tone === "danger"
                      ? "text-down hover:bg-rose-soft"
                      : "text-ink hover:bg-canvas",
                  )}
                >
                  {item.icon ? <item.icon className="size-4" /> : null}
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
