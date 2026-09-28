import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "../../utils/cn";
import { Button } from "./Button";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, size = "md", footer, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
      <div
        className="fixed inset-0 bg-ink/35 backdrop-blur-[2px] animate-[sp-fade-up_0.15s_ease]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full rounded-2xl bg-surface p-6 shadow-[var(--shadow-pop)] animate-[sp-fade-up_0.18s_var(--ease-out-soft)]",
          SIZES[size],
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-canvas hover:text-ink"
          aria-label="Tutup"
        >
          <X className="size-4" />
        </button>

        {title ? (
          <h2 className="pr-8 text-lg font-semibold text-ink">{title}</h2>
        ) : null}
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}

        <div className={cn(title || description ? "mt-5" : "")}>{children}</div>

        {footer ? (
          <div className="mt-6 flex justify-end gap-2">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "Konfirmasi",
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  tone = "primary",
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {null}
    </Modal>
  );
}
