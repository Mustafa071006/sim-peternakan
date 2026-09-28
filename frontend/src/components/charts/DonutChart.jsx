import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

/**
 * segments: [{ label, value, color }]
 */
export function DonutChart({ segments, centerValue, centerLabel, height = 240 }) {
  const total = segments.reduce((t, s) => t + s.value, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {segments.map((s) => (
                <Cell key={s.label} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-lg font-bold text-ink">{centerValue}</div>
            <div className="text-xs text-faint">{centerLabel}</div>
          </div>
        </div>
      </div>

      <ul className="flex-1 space-y-2.5">
        {segments.map((s) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-muted">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <span className="flex items-baseline gap-2">
                <span className="font-semibold text-ink">
                  {pct.toFixed(1)}%
                </span>
                <span className="text-xs text-faint">
                  {new Intl.NumberFormat("en-US").format(s.value)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
