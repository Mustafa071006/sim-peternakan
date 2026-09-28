import { Card } from "../ui/Card";
import { cn } from "../../utils/cn";
import { formatDelta, formatNumber } from "../../utils/format";

/**
 * rows: { label, value, unit, decimals, standard, standardUnit, betterWhen }
 */
export function PerformaCompareCard({ title, subtitle, rows, className }) {
  return (
    <Card className={cn("flex flex-col p-5", className)}>
      <div>
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-4 divide-y divide-line">
        {rows.map((row) => {
          const hasStd =
            row.standard != null && Number.isFinite(Number(row.standard));
          const delta = hasStd ? Number(row.value) - Number(row.standard) : null;
          const good =
            delta == null
              ? true
              : row.betterWhen === "lower"
                ? delta <= 0
                : delta >= 0;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-ink">
                  {row.label}
                </div>
                <div className="text-xs text-faint">
                  {hasStd
                    ? `Standar ${formatNumber(row.standard, row.decimals ?? 0)}${
                        row.standardUnit ? ` ${row.standardUnit}` : ""
                      }`
                    : "Standar —"}
                </div>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-sm font-semibold text-ink">
                  {formatNumber(row.value, row.decimals ?? 0)}
                  {row.unit ? (
                    <span className="ml-0.5 text-xs font-normal text-faint">
                      {row.unit}
                    </span>
                  ) : null}
                </span>
                {delta != null ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      good ? "bg-brand-50 text-up" : "bg-rose-soft text-down",
                    )}
                  >
                    {formatDelta(delta, row.deltaDecimals ?? 1)}
                    {row.standardUnit ? ` ${row.standardUnit}` : ""}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
