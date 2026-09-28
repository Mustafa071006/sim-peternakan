import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { cn } from "../../utils/cn";
import { formatDelta } from "../../utils/format";

const TONES = {
  neutral: "bg-canvas text-muted",
  brand: "bg-brand-50 text-brand-700",
  green: "bg-brand-50 text-brand-700",
  amber: "bg-amber-soft text-amber-ink",
  sky: "bg-sky-soft text-sky-ink",
  rose: "bg-rose-soft text-rose-ink",
  up: "bg-brand-50 text-up",
  down: "bg-rose-soft text-down",
};

export function Badge({ tone = "neutral", dot = false, className, children }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        TONES[tone] || TONES.neutral,
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

/**
 * Trend delta pill, e.g. ↑ +1.6%  /  ↓ -25%.
 * `value` is the numeric delta; `positiveIsGood` flips the colour semantics
 * (mortality going down is good).
 */
export function TrendBadge({
  value,
  suffix = "%",
  decimals = 1,
  positiveIsGood = true,
  className,
}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const isUp = n > 0;
  const good = isUp === positiveIsGood || n === 0;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
        good ? "bg-brand-50 text-up" : "bg-rose-soft text-down",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {formatDelta(n, decimals)}
      {suffix}
    </span>
  );
}
