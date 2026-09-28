import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART } from "./chartTheme";

const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fill: CHART.axis, fontSize: 11 },
};

function TooltipBox({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-(--shadow-pop)]">
      <div className="mb-1 font-semibold text-ink">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-muted">
          <span
            className="size-2 rounded-full"
            style={{ background: p.color || p.fill }}
          />
          <span>{p.name}:</span>
          <span className="font-semibold text-ink">
            {formatter ? formatter(p.value, p.dataKey) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

const commonMargin = { top: 8, right: 12, bottom: 4, left: -12 };

export function BarSeriesChart({
  data,
  dataKey,
  height = 220,
  color = CHART.brand,
  highlightLast = false,
  tooltipFormatter,
  yDomain,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={commonMargin} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} domain={yDomain} width={44} />
        <Tooltip
          cursor={{ fill: "rgba(31,157,97,0.06)" }}
          content={<TooltipBox formatter={tooltipFormatter} />}
        />
        <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} maxBarSize={44}>
          {data.map((entry, i) => (
            <Cell
              key={entry.iso || i}
              fill={
                highlightLast && i === data.length - 1 ? color : `${color}66`
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StackedGradeChart({ data, height = 240, tooltipFormatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={commonMargin} barCategoryGap="26%">
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} width={52} />
        <Tooltip
          cursor={{ fill: "rgba(31,157,97,0.06)" }}
          content={<TooltipBox formatter={tooltipFormatter} />}
        />
        <Bar dataKey="krem" name="Telur Krem" stackId="g" fill={CHART.krem} maxBarSize={46} />
        <Bar dataKey="bagus" name="Telur Bagus" stackId="g" fill={CHART.bagus} maxBarSize={46} />
        <Bar
          dataKey="retak"
          name="Telur Retak"
          stackId="g"
          fill={CHART.retak}
          maxBarSize={46}
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendAreaChart({
  data,
  dataKey,
  name,
  height = 220,
  color = CHART.brand,
  standard = null,
  yDomain,
  tooltipFormatter,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={commonMargin}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} domain={yDomain} width={44} />
        <Tooltip content={<TooltipBox formatter={tooltipFormatter} />} />
        {standard != null ? (
          <ReferenceLine
            y={standard}
            stroke={color}
            strokeDasharray="5 5"
            strokeOpacity={0.55}
          />
        ) : null}
        <Area
          type="monotone"
          dataKey={dataKey}
          name={name}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#grad-${dataKey})`}
          dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DualLineChart({ data, left, right, height = 260, tooltipFormatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ ...commonMargin, right: 4 }}>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis yAxisId="l" {...axisProps} width={40} domain={left.domain} />
        <YAxis
          yAxisId="r"
          orientation="right"
          {...axisProps}
          width={40}
          domain={right.domain}
        />
        <Tooltip content={<TooltipBox formatter={tooltipFormatter} />} />
        <Line
          yAxisId="l"
          type="monotone"
          dataKey={left.key}
          name={left.name}
          stroke={CHART.brand}
          strokeWidth={2.5}
          dot={{ r: 2.5 }}
        />
        <Line
          yAxisId="r"
          type="monotone"
          dataKey={right.key}
          name={right.name}
          stroke={CHART.amber}
          strokeWidth={2.5}
          dot={{ r: 2.5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
