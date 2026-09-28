import { cn } from "../../utils/cn";
import { Card } from "./Card";

const ICON_TONES = {
  green: "bg-brand-50 text-brand-600",
  amber: "bg-amber-soft text-amber-ink",
  sky: "bg-sky-soft text-sky-ink",
  rose: "bg-rose-soft text-rose-ink",
};

/**
 * KPI tile used across Dashboard / Laporan / Riwayat.
 *
 * props:
 *  - label, value, unit
 *  - icon, tone ("green" | "amber" | "sky" | "rose")
 *  - badge      → ReactNode rendered under the value (e.g. <TrendBadge/>)
 *  - hint       → small muted line under the badge
 *  - footer     → ReactNode pinned to the card bottom (divider + content)
 *  - progress   → { value:number (0-100), label?:string }
 */
export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = "green",
  badge,
  hint,
  footer,
  progress,
  className,
}) {
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <div className="flex items-center gap-3">
        {Icon ? (
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl",
              ICON_TONES[tone] || ICON_TONES.green,
            )}
          >
            <Icon className="size-5" />
          </span>
        ) : null}
        <span className="text-[13px] font-medium text-muted">{label}</span>
      </div>

      <div className="mt-3 flex items-end gap-1.5">
        <span className="text-[26px] font-bold leading-none tracking-tight text-ink">
          {value}
        </span>
        {unit ? (
          <span className="pb-0.5 text-[13px] font-medium text-faint">{unit}</span>
        ) : null}
      </div>

      {badge || hint ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {badge}
          {hint ? <span className="text-xs text-muted">{hint}</span> : null}
        </div>
      ) : null}

      {progress ? (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
            />
          </div>
          {progress.label ? (
            <div className="mt-1.5 text-right text-xs font-semibold text-muted">
              {progress.label}
            </div>
          ) : null}
        </div>
      ) : null}

      {footer ? (
        <div className="mt-auto border-t border-line pt-3 text-xs text-muted">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
