import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "../../utils/cn";

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export function Pagination({ page, totalPages, totalItems, pageSize, onChange }) {
  const total = Math.max(1, totalPages || 1);
  const from = totalItems ? (page - 1) * pageSize + 1 : 0;
  const to = totalItems ? Math.min(page * pageSize, totalItems) : 0;

  const btn =
    "grid size-9 place-items-center rounded-lg border border-line-strong bg-surface text-sm font-medium text-muted transition-[color,border-color,transform] duration-150 hover:border-brand-400 hover:text-brand-700 not-disabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
      <p className="text-[13px] text-muted">
        {totalItems
          ? `Menampilkan ${from} - ${to} dari ${totalItems} data`
          : `Halaman ${page} dari ${total}`}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={btn}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pageWindow(page, total).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-faint">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "grid size-9 place-items-center rounded-lg text-sm font-semibold transition-[color,background-color,border-color,transform] duration-150 active:scale-95",
                p === page
                  ? "bg-brand-500 text-white"
                  : "border border-line-strong bg-surface text-muted hover:border-brand-400 hover:text-brand-700",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          className={btn}
          disabled={page >= total}
          onClick={() => onChange(page + 1)}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
