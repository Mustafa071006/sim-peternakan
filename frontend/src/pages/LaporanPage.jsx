import { useMemo, useState } from "react";
import { startOfMonth } from "date-fns";
import {
  Bird,
  CalendarRange,
  Download,
  Egg,
  FileDown,
  HeartPulse,
  Leaf,
} from "lucide-react";

import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { EmptyState, ErrorState } from "../components/ui/States";
import { Skeleton } from "../components/ui/Skeleton";
import { ChartCard } from "../components/charts/ChartCard";
import {
  StackedGradeChart,
  DualLineChart,
} from "../components/charts/primitives";
import { CHART } from "../components/charts/chartTheme";
import { DonutChart } from "../components/charts/DonutChart";
import { MetricTargetCard } from "../components/dashboard/MetricTargetCard";
import { usePeriodeList } from "../hooks/usePeriode";
import { useLaporan } from "../features/laporan/useLaporan";
import { downloadCsv, printPage } from "../utils/export";
import {
  formatDate,
  formatInt,
  formatNumber,
  toApiDate,
} from "../utils/format";

function SectionHeading({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p> : null}
    </div>
  );
}

export default function LaporanPage() {
  const periodeQ = usePeriodeList();
  const periodes = useMemo(() => periodeQ.data || [], [periodeQ.data]);

  const [periodeId, setPeriodeId] = useState(null);
  const [range, setRange] = useState({
    from: toApiDate(startOfMonth(new Date())),
    to: toApiDate(new Date()),
  });

  const sortedPeriodes = useMemo(
    () =>
      [...periodes].sort(
        (a, b) => new Date(b.tanggal_masuk) - new Date(a.tanggal_masuk),
      ),
    [periodes],
  );

  const selectedPeriode = useMemo(() => {
    if (periodeId)
      return sortedPeriodes.find((p) => String(p.id) === String(periodeId));
    return (
      sortedPeriodes.find(
        (p) => String(p.status).toUpperCase() === "AKTIF",
      ) || sortedPeriodes[0]
    );
  }, [sortedPeriodes, periodeId]);

  const report = useLaporan(selectedPeriode, range);

  const header = (
    <PageHeader
      title="Laporan"
      description="Evaluasi dan analisis performa kandang pada periode dan rentang tanggal yang dipilih."
      aside={
        <Card className="flex items-center gap-3 px-4 py-2.5">
          <CalendarRange className="size-4 text-brand-500" />
          <div className="flex items-center gap-2 text-[13px]">
            <input
              type="date"
              value={range.from}
              max={range.to}
              onChange={(e) =>
                setRange((r) => ({ ...r, from: e.target.value }))
              }
              className="bg-transparent font-semibold text-ink outline-none"
            />
            <span className="text-faint">–</span>
            <input
              type="date"
              value={range.to}
              max={toApiDate(new Date())}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="bg-transparent font-semibold text-ink outline-none"
            />
          </div>
        </Card>
      }
    />
  );

  if (periodeQ.isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (periodeQ.isError || report.isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <ErrorState
            error={periodeQ.error || report.error}
            onRetry={report.refetch}
          />
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
            title="Belum ada periode"
            description="Belum ada periode produksi yang bisa dianalisis."
          />
        </Card>
      </div>
    );
  }

  const d = report.data;

  const exportCsv = () => {
    if (!d) return;
    downloadCsv(
      `laporan-${selectedPeriode.kode_periode}`,
      [
        { header: "Minggu", value: (w) => w.index },
        { header: "Periode", value: (w) => w.label },
        { header: "Produksi Telur (butir)", value: (w) => w.eggs },
        { header: "Pakan (kg)", value: (w) => w.pakanKg },
        { header: "Hen Day (%)", value: (w) => w.henDay },
        { header: "Berat Telur (g)", value: (w) => w.beratTelur },
        { header: "FCR", value: (w) => w.fcr },
        { header: "Ayam Mati (ekor)", value: (w) => w.mati },
      ],
      d.weeks,
    );
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {header}

      {/* Periode selector */}
      <Card className="flex flex-wrap items-center gap-3 p-4 print:hidden">
        <span className="text-[13px] font-semibold text-ink">Periode</span>
        <select
          value={selectedPeriode.id}
          onChange={(e) => setPeriodeId(e.target.value)}
          className="field-input max-w-md"
        >
          {sortedPeriodes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.kandang} · {p.kode_periode} ·{" "}
              {formatDate(p.tanggal_masuk)}
              {String(p.status).toUpperCase() === "AKTIF" ? " (Aktif)" : ""}
            </option>
          ))}
        </select>
      </Card>

      {report.isLoading || !d ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : !d.hasData ? (
        <Card>
          <EmptyState
            icon={CalendarRange}
            title="Belum ada data pada rentang ini"
            description="Ubah rentang tanggal laporan untuk melihat data yang tersedia."
          />
        </Card>
      ) : (
        <>
          {/* Ringkasan Periode */}
          <SectionHeading
            title="Ringkasan Periode"
            subtitle="Total dan rata-rata performa pada rentang tanggal yang dipilih."
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Produksi Telur"
              value={formatInt(d.totals.totalTelur)}
              unit="butir"
              icon={Egg}
              tone="amber"
            />
            <StatCard
              label="Total Pakan"
              value={formatNumber(d.totals.totalPakanKg)}
              unit="kg"
              icon={Leaf}
              tone="green"
            />
            <StatCard
              label="Total Ayam Mati"
              value={formatInt(d.totals.totalMati)}
              unit="ekor"
              icon={HeartPulse}
              tone="rose"
            />
            <StatCard
              label="Rata-rata Populasi"
              value={formatInt(d.totals.avgPopulasi)}
              unit="ekor"
              icon={Bird}
              tone="sky"
            />
          </div>

          {/* Averages vs target */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricTargetCard
              label="Rata-rata Hen Day (HD)"
              value={d.averages.henDay}
              unit="%"
              target={d.targets.henDay}
              targetUnit="%"
            />
            <MetricTargetCard
              label="Rata-rata Berat Telur"
              value={d.averages.beratTelur}
              unit="g/butir"
              target={d.targets.beratTelur}
              targetUnit="g"
            />
            <MetricTargetCard
              label="Rata-rata Feed Intake"
              value={d.averages.feedIntake}
              unit="g/ekor"
              decimals={0}
              target={d.targets.feedIntake}
              targetUnit="g"
              lowerBetter
            />
            <MetricTargetCard
              label="Rata-rata FCR"
              value={d.averages.fcr}
              decimals={2}
              target={d.targets.fcr}
              lowerBetter
            />
          </div>

          {/* Grafik Analisis */}
          <SectionHeading
            title="Grafik Analisis"
            subtitle="Tren dan distribusi performa harian pada rentang tanggal ini."
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard
              title="Produksi Telur per Grade"
              subtitle="Distribusi grade telur harian"
              legend={[
                { label: "Bagus", color: CHART.bagus },
                { label: "Krem", color: CHART.krem },
                { label: "Retak", color: CHART.retak },
              ]}
            >
              <StackedGradeChart
                data={d.series}
                height={260}
                tooltipFormatter={(v) => `${formatInt(v)} butir`}
              />
            </ChartCard>

            <ChartCard
              title="Hen Day dan FCR"
              subtitle="Tren performa harian"
              legend={[
                { label: "Hen Day (HD)", color: CHART.brand },
                { label: "FCR", color: CHART.amber },
              ]}
            >
              <DualLineChart
                data={d.series}
                left={{ key: "henDay", name: "Hen Day", domain: [0, 100] }}
                right={{ key: "fcr", name: "FCR", domain: [0, "auto"] }}
                tooltipFormatter={(v, key) =>
                  key === "henDay" ? `${formatNumber(v)}%` : formatNumber(v, 2)
                }
              />
            </ChartCard>
          </div>

          {/* Tabel Detail — fokus utama halaman laporan */}
          <SectionHeading
            title="Tabel Detail Mingguan"
            subtitle="Rincian data per minggu yang menjadi dasar ringkasan dan grafik di atas."
          />
          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="p-5 xl:col-span-2">
              <div>
                <DataTable
                  columns={[
                    { key: "index", header: "Minggu", width: 72 },
                    { key: "label", header: "Periode" },
                    {
                      key: "eggs",
                      header: "Telur (butir)",
                      align: "right",
                      render: (w) => formatInt(w.eggs),
                    },
                    {
                      key: "pakanKg",
                      header: "Pakan (kg)",
                      align: "right",
                      render: (w) => formatNumber(w.pakanKg),
                    },
                    {
                      key: "henDay",
                      header: "Hen Day (%)",
                      align: "right",
                      render: (w) => formatNumber(w.henDay),
                    },
                    {
                      key: "beratTelur",
                      header: "Berat Telur (g)",
                      align: "right",
                      render: (w) => formatNumber(w.beratTelur),
                    },
                    {
                      key: "fcr",
                      header: "FCR",
                      align: "right",
                      render: (w) => formatNumber(w.fcr, 2),
                    },
                    {
                      key: "mati",
                      header: "Ayam Mati",
                      align: "right",
                      render: (w) => formatInt(w.mati),
                    },
                  ]}
                  rows={d.weeks}
                  rowKey={(w) => w.index}
                  footer={
                    <>
                      <td className="px-3 py-3" colSpan={2}>
                        Total
                      </td>
                      <td className="px-3 py-3 text-right">
                        {formatInt(d.totals.totalTelur)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {formatNumber(d.totals.totalPakanKg)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {formatNumber(d.averages.henDay)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {formatNumber(d.averages.beratTelur)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {formatNumber(d.averages.fcr, 2)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {formatInt(d.totals.totalMati)}
                      </td>
                    </>
                  }
                />
              </div>
            </Card>

            <Card className="flex flex-col p-5">
              <h3 className="text-[15px] font-semibold text-ink">
                Distribusi Produksi Telur
              </h3>
              <div className="mt-4 flex-1">
                <DonutChart
                  centerValue={formatInt(d.totals.totalTelur)}
                  centerLabel="butir"
                  segments={[
                    { label: "Krem", value: d.grades.krem, color: CHART.krem },
                    { label: "Bagus", value: d.grades.bagus, color: CHART.bagus },
                    { label: "Retak", value: d.grades.retak, color: CHART.retak },
                  ]}
                />
              </div>
              <div className="mt-5 border-t border-line pt-4 print:hidden">
                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-faint">
                  Export Laporan
                </p>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" icon={FileDown} onClick={printPage}>
                    Unduh Laporan (PDF)
                  </Button>
                  <Button icon={Download} onClick={exportCsv}>
                    Unduh Laporan (Excel)
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
