import { Search, X } from "lucide-react";

import { cn } from "../../utils/cn";

export function SearchInput({ value, onChange, placeholder = "Cari…", className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-line-strong bg-surface px-3.5 transition-[border-color,box-shadow] duration-150 focus-within:border-brand-400 focus-within:ring-[3px] focus-within:ring-brand-100",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-faint" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-faint"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="shrink-0 text-faint transition-colors hover:text-ink"
          aria-label="Bersihkan pencarian"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
