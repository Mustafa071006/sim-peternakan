import { useState } from "react";
import { createPortal } from "react-dom";

/**
 * Small label shown to the right of its child on hover/focus. Rendered in a
 * portal so scroll containers (e.g. the sidebar nav) don't clip it.
 */
export function Tooltip({ label, disabled = false, children }) {
  const [pos, setPos] = useState(null);

  const show = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
  };
  const hide = () => setPos(null);

  return (
    <div onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {pos && !disabled
        ? createPortal(
            <div
              role="tooltip"
              style={{ top: pos.top, left: pos.left }}
              className="pointer-events-none fixed z-100 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-white shadow-(--shadow-pop) animate-[sp-fade-in_0.12s_ease]"
            >
              {label}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
