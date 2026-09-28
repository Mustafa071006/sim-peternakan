import { Card } from "../ui/Card";

export function ChartLegend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5 text-xs text-muted">
          <span
            className="size-2.5 rounded-full"
            style={{
              background: it.dashed ? "transparent" : it.color,
              border: it.dashed ? `2px dashed ${it.color}` : "none",
            }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function ChartCard({ title, subtitle, legend, right, children, className }) {
  return (
    <Card className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-0">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {legend ? <ChartLegend items={legend} /> : null}
          {right}
        </div>
      </div>
      <div className="p-3 pt-4">{children}</div>
    </Card>
  );
}
