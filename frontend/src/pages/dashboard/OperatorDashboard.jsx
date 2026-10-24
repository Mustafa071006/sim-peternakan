import { Link } from "react-router-dom";
import {
  Bird,
  ChevronRight,
  Egg,
  FileSpreadsheet,
  HeartPulse,
  Leaf,
  Scale,
  Warehouse,
  TrendingUp,
} from "lucide-react";

import { PageHeader, DatePill } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Card } from "../../components/ui/Card";
import { Badge, TrendBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { OperatorDashboardSkeleton } from "../../components/skeletons/PageSkeletons";
import { ChartCard } from "../../components/charts/ChartCard";
import {
  BarSeriesChart,
  TrendAreaChart,
} from "../../components/charts/primitives";
import { CHART } from "../../components/charts/chartTheme";
import { PerfStatCard } from "../../components/dashboard/PerfStatCard";
import { usePeriodeAnalytics } from "../../features/analytics/usePeriodeAnalytics";
import { useActivePeriode } from "../../hooks/usePeriode";
import { cn } from "../../utils/cn";
import { formatInt, formatNumber, formatPercent } from "../../utils/format";

// Ambang batas status kandang harian (heuristik operasional, bukan standar
// medis) — dipakai untuk badge "Status Kandang" dan alert di bawah header.
const MORTALITY_CRITICAL_PCT = 1;
const MORTALITY_WARNING_PCT = 0.3;
const HEN_DAY_WARNING_GAP = 5;

const STATUS_TONE = {
  normal: { badge: "green", label: "Normal" },
  warning: { badge: "amber", label: "Perlu Perhatian" },
  critical: { badge: "rose", label: "Kritis" },
};

const ALERT_STYLE = {
  critical: "bg-rose-soft text-rose-ink",
  warning: "bg-amber-soft text-amber-ink",
  info: "bg-sky-soft text-sky-ink",
};

export default function OperatorDashboard() {
  const {
    activePeriode,
    activePeriodes,
    selectedKandangId,
    setSelectedKandangId,
    isLoading: periodeLoading,
    isError: periodeError,
    refetch,
  } = useActivePeriode();
  const analytics = usePeriodeAnalytics(activePeriode);

  const kandangName = activePeriode?.kandang || "Kandang";

  const kandangSwitcher =
    activePeriodes.length > 1 ? (
      <select
        value={String(activePeriode?.kandang_id ?? selectedKandangId ?? "")}
        onChange={(e) => setSelectedKandangId(e.target.value)}
        className="field-input w-auto"
      >
        {activePeriodes.map((p) => (
          <option key={p.kandang_id} value={p.kandang_id}>
            {p.kandang}
          </option>
        ))}
      </select>
    ) : null;

  const header = (
    <PageHeader
      eyebrow="Selamat datang,"
      title={`Operator ${kandangName}`}
      description="Pastikan data harian diinput secara rutin untuk menjaga performa kandang."
      aside={
        <div className="flex items-center gap-2">
          {kandangSwitcher}
          <DatePill />
        </div>
      }
    />
  );

  if (periodeLoading) {
    return (
      <div className="space-y-6">
        {header}
        <OperatorDashboardSkeleton />
      </div>
    );
  }

  if (periodeError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <ErrorState error="Gagal memuat periode." onRetry={refetch} />
        </Card>
      </div>
    );
  }

  if (!activePeriode) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <EmptyState
            icon={Warehouse}
            title="Belum ada kandang atau periode aktif"
            description="Anda belum ditugaskan ke kandang, atau kandang Anda belum memiliki periode produksi yang berjalan. Hubungi admin untuk penugasan kandang dan mulai periode baru."
          />
        </Card>
      </div>
    );
  }

  const v = analytics.data;

  if (analytics.isLoading || !v) {
    return (
      <div className="space-y-6">
        {header}
        <OperatorDashboardSkeleton />
      </div>
    );
  }

  const { today, weekly, standar, cumulative } = v;
  const populationPct =
    cumulative.initialPopulation > 0
      ? (today.population / cumulative.initialPopulation) * 100
      : 0;

  // Status kandang saat ini + alert tindakan — dihitung dari kondisi hari ini
  // saja (bukan rata-rata periode), sesuai peran dashboard sebagai monitoring
  // real-time.
  const mortalityRateToday =
    today.population > 0 ? (today.mati / today.population) * 100 : 0;
  const henDayGap =
    standar.henDay != null && today.eggs > 0 ? today.henDay - standar.henDay : null;

  let statusLevel = "normal";
  if (mortalityRateToday >= MORTALITY_CRITICAL_PCT) statusLevel = "critical";
  else if (
    mortalityRateToday >= MORTALITY_WARNING_PCT ||
    (henDayGap != null && henDayGap < -HEN_DAY_WARNING_GAP)
  )
    statusLevel = "warning";
  const status = STATUS_TONE[statusLevel];

  const alerts = [];
  if (!today.hasInput) {
    alerts.push({
      level: "info",
      icon: FileSpreadsheet,
      message:
        "Belum ada data yang diinput hari ini. Input data harian untuk memantau kondisi kandang secara akurat.",
    });
  }
  if (mortalityRateToday >= MORTALITY_CRITICAL_PCT) {
    alerts.push({
      level: "critical",
      icon: HeartPulse,
      message: `Mortalitas hari ini ${formatPercent(mortalityRateToday, 2)} dari populasi — di atas ambang wajar, segera periksa kondisi kandang.`,
    });
  } else if (mortalityRateToday >= MORTALITY_WARNING_PCT) {
    alerts.push({
      level: "warning",
      icon: HeartPulse,
      message: `Mortalitas hari ini ${formatPercent(mortalityRateToday, 2)} dari populasi — perlu dipantau.`,
    });
  }
  if (henDayGap != null && henDayGap < -HEN_DAY_WARNING_GAP) {
    alerts.push({
      level: "warning",
      icon: TrendingUp,
      message: `Hen Day hari ini ${formatPercent(today.henDay)} — ${formatPercent(Math.abs(henDayGap))} di bawah standar minggu ini.`,
    });
  }

  return (
    <div className="space-y-6">
      {header}

      {/* Status kandang saat ini */}
      <div className="flex items-center gap-2">
        <Badge tone={status.badge} dot>
          Status Kandang: {status.label}
        </Badge>
      </div>

      {/* Alerts: hal yang perlu ditindaklanjuti operator hari ini */}
      {alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-[13px] font-medium",
                ALERT_STYLE[a.level],
              )}
            >
              <a.icon className="size-4.5 shrink-0" />
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      ) : null}

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Populasi Ayam"
          value={formatInt(today.population)}
          unit="ekor"
          icon={Bird}
          tone="green"
          hint={`dari ${formatInt(cumulative.initialPopulation)} ekor`}
          progress={{ value: populationPct, label: formatPercent(populationPct) }}
        />
        <StatCard
          label="Produksi Telur Hari Ini"
          value={formatInt(today.eggs)}
          unit="butir"
          icon={Egg}
          tone="amber"
          badge={
            today.eggs > 0 && standar.henDay ? (
              <TrendBadge value={today.henDay - standar.henDay} suffix="%" />
            ) : null
          }
          hint={today.eggs > 0 ? "tercatat hari ini" : "belum ada input"}
        />
        <StatCard
          label="Hen Day (HD)"
          value={formatPercent(today.henDay)}
          icon={TrendingUp}
          tone="sky"
          badge={
            standar.henDay ? (
              <span className="text-xs text-muted">
                Target {formatPercent(standar.henDay)}
              </span>
            ) : null
          }
          hint={
            standar.henDay
              ? today.henDay >= standar.henDay
                ? "di atas target"
                : "di bawah target"
              : undefined
          }
        />
        <StatCard
          label="Ayam Mati Hari Ini"
          value={formatInt(today.mati)}
          unit="ekor"
          icon={HeartPulse}
          tone="rose"
          hint={`${formatPercent(
            today.population > 0 ? (today.mati / today.population) * 100 : 0,
            2,
          )} dari populasi`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Produksi Telur"
          subtitle="Jumlah telur yang dihasilkan per hari"
        >
          <BarSeriesChart
            data={v.series}
            dataKey="eggs"
            highlightLast
            tooltipFormatter={(val) => `${formatInt(val)} butir`}
          />
        </ChartCard>

        <ChartCard
          title="Hen Day (HD)"
          subtitle="Persentase produksi telur harian"
          legend={
            standar.henDay
              ? [
                  { label: "Aktual", color: CHART.brand },
                  { label: "Standar", color: CHART.brand, dashed: true },
                ]
              : undefined
          }
        >
          <TrendAreaChart
            data={v.series}
            dataKey="henDay"
            name="Hen Day"
            yDomain={[0, 100]}
            standard={standar.henDay}
            tooltipFormatter={(val) => `${formatNumber(val)}%`}
          />
        </ChartCard>
      </div>

      {/* Performance row + CTA */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PerfStatCard
          icon={Leaf}
          tone="green"
          label="Feed Intake"
          value={today.feedGram}
          unit="gram/ekor"
          standard={standar.feedGram}
          standardUnit="g"
          betterWhen="lower"
        />
        <PerfStatCard
          icon={Scale}
          tone="sky"
          label="Feed Conversion (FCR)"
          value={today.fcr}
          decimals={2}
          deltaDecimals={2}
          betterWhen="lower"
        />
        <PerfStatCard
          icon={Egg}
          tone="green"
          label="Berat Telur"
          value={today.avgEggWeight}
          unit="g/butir"
          decimals={1}
          standard={standar.eggWeight}
          standardUnit="g"
        />

        <Card className="flex flex-col justify-between gap-3 bg-brand-50 p-4">
          <div>
            <span className="grid size-8 place-items-center rounded-lg bg-brand-100 text-brand-700">
              <FileSpreadsheet className="size-4" />
            </span>
            <p className="mt-2 text-[13px] font-semibold text-ink">
              Input Data Harian
            </p>
            <p className="mt-1 text-xs text-muted">
              {today.hasInput
                ? "Data hari ini sudah masuk. Anda masih bisa memperbaruinya."
                : "Belum input data hari ini."}
            </p>
          </div>
          <Button
            as={Link}
            to="/input-harian"
            size="sm"
            variant={today.hasInput ? "secondary" : "primary"}
            iconRight={ChevronRight}
            className="w-full"
          >
            {today.hasInput ? "Lihat / Ubah" : "Input Sekarang"}
          </Button>
        </Card>
      </div>

      {/* Weekly summary */}
      <Card className="p-5">
        <h3 className="text-[15px] font-semibold text-ink">Ringkasan Mingguan</h3>
        <dl className="mt-4 divide-y divide-line">
          {[
            {
              icon: Egg,
              label: "Total Produksi Telur",
              value: `${formatInt(weekly.eggs)} butir`,
            },
            {
              icon: TrendingUp,
              label: "Rata-rata Hen Day",
              value: formatPercent(weekly.avgHenDay),
            },
            {
              icon: HeartPulse,
              label: "Total Ayam Mati",
              value: `${formatInt(weekly.mati)} ekor (${formatPercent(
                weekly.mortalityPct,
                2,
              )})`,
            },
            {
              icon: Leaf,
              label: "Rata-rata Feed Intake",
              value: `${formatInt(weekly.avgFeedGram)} gram`,
            },
            {
              icon: Scale,
              label: "Rata-rata FCR",
              value: formatNumber(weekly.avgFcr, 2),
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 py-3 text-sm"
            >
              <dt className="flex items-center gap-2.5 text-muted">
                <row.icon className="size-4 text-brand-500" />
                {row.label}
              </dt>
              <dd className="font-semibold text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Badge tone="green" dot>
          Periode {activePeriode.kode_periode}
        </Badge>
        <span>
          Strain {activePeriode.strain} · Umur {standar.week} minggu
        </span>
      </div>
    </div>
  );
}
