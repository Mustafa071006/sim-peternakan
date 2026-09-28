import { Card } from "../ui/Card";
import { cn } from "../../utils/cn";
import { formatNumber } from "../../utils/format";

function status(value, target, lowerBetter) {
  if (target == null || !Number.isFinite(Number(target)))
    return { label: "—", tone: "neutral" };
  const diff = ((Number(value) - Number(target)) / Number(target)) * 100;
  const gap = lowerBetter ? diff : -diff;
  if (gap <= 0.5) return { label: "Tercapai", tone: "green" };
  if (gap <= 6) return { label: "Mendekati", tone: "amber" };
  return { label: "Belum Tercapai", tone: "rose" };
}

const TONES = {
  green: "bg-brand-50 text-up",
  amber: "bg-amber-soft text-amber-ink",
  rose: "bg-rose-soft text-down",
  neutral: "bg-canvas text-muted",
};

export function MetricTargetCard({
  label,
  value,
  unit,
  decimals = 1,
  target,
  targetUnit,
  lowerBetter = false,
}) {
  const s = status(value, target, lowerBetter);
  return (
    <Card className="p-4">
      <div className="text-[13px] font-medium text-muted">{label}</div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-xl font-bold tracking-tight text-ink">
          {formatNumber(value, decimals)}
        </span>
        {unit ? (
          <span className="pb-0.5 text-xs font-medium text-faint">{unit}</span>
        ) : null}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-muted">
          {target != null
            ? `Target ${formatNumber(target, decimals)}${
                targetUnit ? ` ${targetUnit}` : ""
              }`
            : "Target —"}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            TONES[s.tone],
          )}
        >
          {s.label}
        </span>
      </div>
    </Card>
  );
}
