import { CalendarDays } from "lucide-react";

import { cn } from "../../utils/cn";
import { formatDateLong } from "../../utils/format";

export function DatePill({ label = "Hari ini", value, className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2",
        className,
      )}
    >
      <CalendarDays className="size-4 text-brand-500" />
      <div className="leading-tight">
        <div className="text-[11px] text-faint">{label}</div>
        <div className="text-[13px] font-semibold text-ink">
          {value || formatDateLong(new Date())}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  eyebrow,
  description,
  breadcrumb,
  actions,
  aside,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-sm font-medium text-muted">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
        {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
        {aside}
        {breadcrumb ? (
          <nav className="text-[13px] text-faint">{breadcrumb}</nav>
        ) : null}
      </div>
    </div>
  );
}
