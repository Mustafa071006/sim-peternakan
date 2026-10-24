import { useMemo, useState } from "react";
import {
  Bird,
  CalendarRange,
  ChevronDown,
  Egg,
  HeartPulse,
  Layers,
  Syringe,
  TrendingUp,
  Warehouse,
} from "lucide-react";

import { PageHeader, DatePill } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Card } from "../../components/ui/Card";
import { Badge, TrendBadge } from "../../components/ui/Badge";
import { EmptyState, ErrorState } from "../../components/ui/States";
import {
  AdminDashboardSkeleton,
  ChartCardSkeleton,
  StatRowSkeleton,
} from "../../components/skeletons/PageSkeletons";
import { ChartCard } from "../../components/charts/ChartCard";
import {
  BarSeriesChart,
  StackedGradeChart,
  TrendAreaChart,
} from "../../components/charts/primitives";
import { CHART } from "../../components/charts/chartTheme";
import { PerformaCompareCard } from "../../components/dashboard/PerformaCompareCard";
import { usePeriodeAnalytics } from "../../features/analytics/usePeriodeAnalytics";
import { usePeriodeList } from "../../hooks/usePeriode";
import { useVaksinasiList } from "../../hooks/useDailyRecords";
import { byPeriode } from "../../features/analytics/compute";
import {
  formatDate,
  formatInt,
  formatNumber,
  formatPercent,
} from "../../utils/format";

function FieldPill({ icon: Icon, label, children }) {
  return (
    <Card className="flex items-center gap-3 px-4 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
          {label}
        </div>
        {children}
      </div>
    </Card>
  );
}

const pctChange = (curr, prev) => (prev ? ((curr - prev) / prev) * 100 : null);

export default function AdminDashboard() {
  const periodeQ = usePeriodeList();
  const vaksinasiQ = useVaksinasiList();
  const [kandangId, setKandangId] = useState(null);
  const [periodeId, setPeriodeId] = useState(null);

  const periodes = useMemo(() => periodeQ.data || [], [periodeQ.data]);

  const activePeriodes = useMemo(
    () => periodes.filter((p) => String(p.status).toUpperCase() === "AKTIF"),
    [periodes],
  );

  const kandangOptions = useMemo(() => {
    const map = new Map();
    activePeriodes.forEach((p) => {
      if (!map.has(p.kandang_id))
        map.set(p.kandang_id, { id: p.kandang_id, name: p.kandang });
    });
    return [...map.values()];
  }, [activePeriodes]);

  const currentKandangId = kandangId ?? kandangOptions[0]?.id ?? null;

  const kandangPeriodes = useMemo(
    () =>
      periodes
        .filter((p) => String(p.kandang_id) === String(currentKandangId))
        .sort((a, b) => new Date(b.tanggal_masuk) - new Date(a.tanggal_masuk)),
    [periodes, currentKandangId],
  );

  const selectedPeriode = useMemo(() => {
    if (periodeId)
      return kandangPeriodes.find((p) => String(p.id) === String(periodeId));
    return (
      kandangPeriodes.find(
        (p) => String(p.status).toUpperCase() === "AKTIF",
      ) || kandangPeriodes[0]
    );
  }, [kandangPeriodes, periodeId]);

  const analytics = usePeriodeAnalytics(selectedPeriode);

  const header = (
    <PageHeader
      title="Dashboard"
      description="Pantau performa kandang secara real-time dan menyeluruh."
      aside={<DatePill />}
    />
  );

  if (periodeQ.isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <AdminDashboardSkeleton />
      </div>
    );
  }

  if (periodeQ.isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <ErrorState error={periodeQ.error} onRetry={periodeQ.refetch} />
        </Card>
      </div>
    );
  }

  if (!selectedPeriode) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <EmptyState
            icon={CalendarRange}
            title="Belum ada periode aktif"
            description="Belum ada kandang dengan periode produksi yang berjalan."
          />
        </Card>
      </div>
    );
  }

  const v = analytics.data;
  const loadingMetrics = analytics.isLoading || !v;

  const yesterdayEggs = v?.series?.[v.series.length - 2]?.eggs ?? 0;
  const yesterdayMati = v?.series?.[v.series.length - 2]?.mati ?? 0;
  const popDelta =
    v && v.cumulative.initialPopulation > 0
      ? ((v.cumulative.population - v.cumulative.initialPopulation) /
          v.cumulative.initialPopulation) *
        100
      : 0;

  const latestVaksin = byPeriode(vaksinasiQ.data, selectedPeriode.id).sort(
    (a, b) => new Date(b.tanggal) - new Date(a.tanggal),
  )[0];

  return (
    <div className="space-y-6">
      {header}

      {/* Context bar */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FieldPill icon={Warehouse} label="Pilih Kandang">
          <div className="relative">
            <select
              value={currentKandangId ?? ""}
              onChange={(e) => {
                setKandangId(e.target.value);
                setPeriodeId(null);
              }}
              className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-ink outline-none"
            >
              {kandangOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-faint" />
          </div>
        </FieldPill>

        <FieldPill icon={CalendarRange} label="Periode">
          <div className="relative">
            <select
              value={selectedPeriode.id}
              onChange={(e) => setPeriodeId(e.target.value)}
              className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-ink outline-none"
            >
              {kandangPeriodes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.kode_periode}
                  {p.tanggal_masuk ? ` · ${formatDate(p.tanggal_masuk)}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-faint" />
          </div>
        </FieldPill>

        <FieldPill icon={Layers} label="Strain">
          <div className="text-sm font-semibold text-ink">
            {selectedPeriode.strain || "-"}
          </div>
        </FieldPill>

        <FieldPill icon={TrendingUp} label="Status">
          <div className="text-sm font-semibold text-ink">
            {String(selectedPeriode.status).toUpperCase() === "AKTIF"
              ? "Aktif · Periode berjalan"
              : "Selesai"}
          </div>
        </FieldPill>
      </div>

      {/* KPI row */}
      {loadingMetrics ? (
        <StatRowSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Populasi Ayam"
            value={formatInt(v.cumulative.population)}
            unit="ekor"
            icon={Bird}
            tone="green"
            badge={<TrendBadge value={popDelta} suffix="%" />}
            footer={
              <>
                Awal: {formatInt(v.cumulative.initialPopulation)} ekor · Saat ini:{" "}
                {formatInt(v.cumulative.population)} ekor
              </>
            }
          />
          <StatCard
            label="Produksi Telur Hari Ini"
            value={formatInt(v.today.eggs)}
            unit="butir"
            icon={Egg}
            tone="amber"
            badge={
              <TrendBadge
                value={pctChange(v.today.eggs, yesterdayEggs) ?? 0}
                suffix="%"
              />
            }
            footer={<>Total periode: {formatInt(v.cumulative.eggs)} butir</>}
          />
          <StatCard
            label="Hen Day (HD)"
            value={formatPercent(v.today.henDay)}
            icon={TrendingUp}
            tone="sky"
            badge={
              v.standar.henDay ? (
                <TrendBadge
                  value={v.today.henDay - v.standar.henDay}
                  suffix="%"
                />
              ) : null
            }
            footer={
              v.standar.henDay ? (
                <>Standar minggu ini: {formatPercent(v.standar.henDay)}</>
              ) : (
                <>Standar minggu ini belum tersedia</>
              )
            }
          />
          <StatCard
            label="Ayam Mati Hari Ini"
            value={formatInt(v.today.mati)}
            unit="ekor"
            icon={HeartPulse}
            tone="rose"
            badge={
              <TrendBadge
                value={pctChange(v.today.mati, yesterdayMati) ?? 0}
                suffix="%"
                positiveIsGood={false}
              />
            }
            footer={
              <>
                Total periode: {formatInt(v.cumulative.mati)} ekor (
                {formatPercent(v.cumulative.mortalityPct, 2)})
              </>
            }
          />
        </div>
      )}

      {/* Charts + performance */}
      {loadingMetrics ? (
        <div className="grid gap-4 xl:grid-cols-3">
          <ChartCardSkeleton className="xl:col-span-2" />
          <ChartCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          <ChartCard
            title="Grafik Hen Day (HD)"
            subtitle="Persentase produksi telur harian"
            className="xl:col-span-2"
            legend={[
              { label: "Aktual", color: CHART.brand },
              ...(v.standar.henDay
                ? [{ label: "Standar", color: CHART.brand, dashed: true }]
                : []),
            ]}
          >
            <TrendAreaChart
              data={v.series}
              dataKey="henDay"
              name="Hen Day"
              yDomain={[0, 100]}
              standard={v.standar.henDay}
              tooltipFormatter={(val) => `${formatNumber(val)}%`}
            />
          </ChartCard>

          <PerformaCompareCard
            title={`Performa ${selectedPeriode.kandang}`}
            subtitle="Perbandingan dengan standar minggu ini"
            className="xl:row-span-2"
            rows={[
              {
                label: "Hen Day (HD)",
                value: v.today.henDay,
                unit: "%",
                decimals: 1,
                standard: v.standar.henDay,
                standardUnit: "%",
              },
              {
                label: "Feed Intake",
                value: v.today.feedGram,
                unit: "g/ekor",
                standard: v.standar.feedGram,
                standardUnit: "g",
                betterWhen: "lower",
              },
              {
                label: "Berat Telur",
                value: v.today.avgEggWeight,
                unit: "g",
                decimals: 1,
                standard: v.standar.eggWeight,
                standardUnit: "g",
              },
              {
                label: "FCR",
                value: v.today.fcr,
                decimals: 2,
                deltaDecimals: 2,
                betterWhen: "lower",
              },
            ]}
          />

          <ChartCard
            title="Grafik Produksi Telur"
            subtitle="Jumlah telur yang dihasilkan per hari"
            legend={[
              { label: "Telur Bagus", color: CHART.bagus },
              { label: "Telur Krem", color: CHART.krem },
              { label: "Telur Retak", color: CHART.retak },
            ]}
          >
            <StackedGradeChart
              data={v.series}
              tooltipFormatter={(val) => `${formatInt(val)} butir`}
            />
          </ChartCard>

          <ChartCard title="Grafik Ayam Mati" subtitle="Jumlah ayam mati per hari">
            <BarSeriesChart
              data={v.series}
              dataKey="mati"
              color={CHART.rose}
              tooltipFormatter={(val) => `${formatInt(val)} ekor`}
            />
          </ChartCard>

          <ChartCard
            title="Grafik Intake Pakan"
            subtitle="Konsumsi pakan per ekor per hari"
            className="xl:col-span-2"
            legend={[
              { label: "Aktual", color: CHART.brand },
              ...(v.standar.feedGram
                ? [{ label: "Standar", color: CHART.brand, dashed: true }]
                : []),
            ]}
          >
            <TrendAreaChart
              data={v.series}
              dataKey="feedGram"
              name="Feed Intake"
              standard={v.standar.feedGram}
              tooltipFormatter={(val) => `${formatInt(val)} g/ekor`}
            />
          </ChartCard>

          <Card className="p-5">
            <h3 className="text-[15px] font-semibold text-ink">
              Informasi Periode
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Kode Periode", selectedPeriode.kode_periode],
                ["Tanggal Masuk", formatDate(selectedPeriode.tanggal_masuk)],
                [
                  "Tanggal Selesai",
                  selectedPeriode.tanggal_selesai
                    ? formatDate(selectedPeriode.tanggal_selesai)
                    : "Masih berjalan",
                ],
                ["Umur Ayam", `${v.week} minggu`],
                [
                  "Populasi",
                  `${formatInt(v.cumulative.initialPopulation)} → ${formatInt(
                    v.cumulative.population,
                  )} ekor`,
                ],
              ].map(([k, val]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="font-semibold text-ink">{val}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-canvas px-3.5 py-3">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Syringe className="size-4.5" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
                  Vaksinasi Terakhir
                </div>
                {latestVaksin ? (
                  <div className="text-sm font-semibold text-ink">
                    {latestVaksin.nama_vaksin} · {formatDate(latestVaksin.tanggal)}
                  </div>
                ) : (
                  <div className="text-sm text-muted">Belum ada catatan</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <Badge tone="green" dot>
          {selectedPeriode.kode_periode}
        </Badge>
        <span>
          {selectedPeriode.kandang} · Strain {selectedPeriode.strain}
        </span>
      </div>
    </div>
  );
}
