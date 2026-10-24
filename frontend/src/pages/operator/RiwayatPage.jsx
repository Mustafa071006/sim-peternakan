import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bird,
  CalendarDays,
  Download,
  Egg,
  Filter,
  HeartPulse,
  Leaf,
  RotateCcw,
} from "lucide-react";
import { startOfMonth } from "date-fns";

import { PageHeader, DatePill } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { RiwayatSkeleton } from "../../components/skeletons/PageSkeletons";
import { useActivePeriode } from "../../hooks/usePeriode";
import { useDailyLog } from "../../features/riwayat/useDailyLog";
import { downloadCsv } from "../../utils/export";
import {
  formatDate,
  formatInt,
  formatNumber,
  formatPercent,
  toApiDate,
} from "../../utils/format";
import { ROUTES } from "../../routes/routePaths";

const PAGE_SIZE = 10;

const DATA_TYPES = [
  { value: "all", label: "Semua Data" },
  { value: "produksi", label: "Produksi Telur" },
  { value: "pakan", label: "Data Pakan" },
  { value: "mortalitas", label: "Data Mortalitas" },
  { value: "populasi", label: "Data Populasi" },
];

export default function RiwayatPage() {
  const { activePeriode, isLoading: periodeLoading, isError, refetch } =
    useActivePeriode();

  const [draft, setDraft] = useState({
    from: toApiDate(startOfMonth(new Date())),
    to: toApiDate(new Date()),
    type: "all",
  });
  const [applied, setApplied] = useState(draft);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const log = useDailyLog(activePeriode, {
    from: applied.from,
    to: applied.to,
  });

  const filtered = useMemo(() => {
    let rows = log.rows;
    if (applied.type !== "all" && applied.type !== "populasi") {
      rows = rows.filter((r) => r.has[applied.type]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.iso.includes(q) ||
          formatDate(r.iso).toLowerCase().includes(q),
      );
    }
    return rows.map((r, i) => ({ ...r, no: i + 1 }));
  }, [log.rows, applied.type, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const applyFilter = () => {
    setApplied(draft);
    setPage(1);
  };
  const resetFilter = () => {
    const next = {
      from: toApiDate(startOfMonth(new Date())),
      to: toApiDate(new Date()),
      type: "all",
    };
    setDraft(next);
    setApplied(next);
    setSearch("");
    setPage(1);
  };

  const exportCsv = () => {
    downloadCsv(
      `riwayat-${activePeriode?.kode_periode || "data"}`,
      [
        { header: "Tanggal", value: (r) => r.iso },
        { header: "Umur (minggu)", value: (r) => Math.floor(r.umurHari / 7) },
        { header: "Umur (hari)", value: (r) => r.umurHari % 7 },
        { header: "Kematian (ekor)", value: (r) => r.mati },
        { header: "Total Pakan Diberikan (kg)", value: (r) => r.feedKg },
        { header: "Pakan (gram/ekor)", value: (r) => r.feedGram },
        { header: "FCR", value: (r) => r.fcr },
        { header: "Telur Krem", value: (r) => r.krem },
        { header: "Telur Bagus", value: (r) => r.bagus },
        { header: "Telur Retak", value: (r) => r.retak },
        { header: "Total Telur", value: (r) => r.totalTelur },
        { header: "Hen Day (%)", value: (r) => r.henDay },
        { header: "Berat Telur (kg)", value: (r) => r.beratTelurKg },
        { header: "Berat Rata-rata/Butir (g)", value: (r) => r.avgEggWeight },
      ],
      filtered,
    );
  };

  const header = (
    <PageHeader
      title="Riwayat Data"
      description="Lihat dan pastikan kembali data yang sudah diinput."
      aside={<DatePill />}
    />
  );

  if (periodeLoading) {
    return (
      <div className="space-y-6">
        {header}
        <RiwayatSkeleton />
      </div>
    );
  }

  if (isError) {
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
            icon={CalendarDays}
            title="Belum ada periode aktif"
            description="Riwayat akan muncul setelah periode berjalan dan data harian diinput."
            action={
              <Button as={Link} to={ROUTES.dashboard}>
                Ke Dashboard
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Warna header per kelompok kolom supaya kelompok pakan, mortalitas, telur,
  // dan identitas/umur langsung terlihat beda saat dipindai.
  const GROUP = {
    identitas: "bg-brand-50 text-brand-700",
    mortalitas: "bg-rose-soft text-rose-ink",
    pakan: "bg-sky-soft text-sky-ink",
    telur: "bg-amber-soft text-amber-ink",
  };

  const columns = [
    { key: "no", header: "No", width: 56 },
    {
      key: "iso",
      header: "Tanggal",
      headerClassName: GROUP.identitas,
      render: (r) => (
        <span className="font-medium text-ink">{formatDate(r.iso)}</span>
      ),
    },
    {
      key: "umur",
      header: "Umur (minggu/hari)",
      headerClassName: GROUP.identitas,
      align: "right",
      render: (r) =>
        `${Math.floor(r.umurHari / 7)} mgg ${r.umurHari % 7} hr`,
    },
    {
      key: "mati",
      header: "Kematian",
      headerClassName: GROUP.mortalitas,
      align: "right",
      render: (r) => formatInt(r.mati),
    },
    {
      key: "feedKg",
      header: "Total Pakan (kg)",
      headerClassName: GROUP.pakan,
      align: "right",
      render: (r) => (r.feedKg ? formatNumber(r.feedKg) : "—"),
    },
    {
      key: "feedGram",
      header: "Pakan (g/ekor)",
      headerClassName: GROUP.pakan,
      align: "right",
      render: (r) => (r.feedGram ? formatInt(r.feedGram) : "—"),
    },
    {
      key: "fcr",
      header: "FCR",
      headerClassName: GROUP.pakan,
      align: "right",
      render: (r) => (r.fcr ? formatNumber(r.fcr, 2) : "—"),
    },
    {
      key: "krem",
      header: "Krem",
      headerClassName: GROUP.telur,
      align: "right",
      render: (r) => formatInt(r.krem),
    },
    {
      key: "bagus",
      header: "Bagus",
      headerClassName: GROUP.telur,
      align: "right",
      render: (r) => formatInt(r.bagus),
    },
    {
      key: "retak",
      header: "Retak",
      headerClassName: GROUP.telur,
      align: "right",
      render: (r) => formatInt(r.retak),
    },
    {
      key: "totalTelur",
      header: "Total Telur",
      headerClassName: GROUP.telur,
      align: "right",
      render: (r) => (
        <span className="font-semibold text-ink">{formatInt(r.totalTelur)}</span>
      ),
    },
    {
      key: "henDay",
      header: "Hen Day",
      headerClassName: GROUP.telur,
      align: "right",
      render: (r) => (r.henDay ? formatPercent(r.henDay) : "—"),
    },
    {
      key: "beratTelurKg",
      header: "Berat Telur (kg)",
      headerClassName: GROUP.telur,
      align: "right",
      render: (r) => (r.beratTelurKg ? formatNumber(r.beratTelurKg) : "—"),
    },
    {
      key: "avgEggWeight",
      header: "Berat Rata-rata/Butir",
      headerClassName: GROUP.telur,
      align: "right",
      render: (r) =>
        r.avgEggWeight ? `${formatNumber(r.avgEggWeight, 1)} g` : "—",
    },
  ];

  return (
    <div className="space-y-6">
      {header}

      {/* Filter bar */}
      <Card className="grid gap-4 p-5 lg:grid-cols-[1.3fr_1fr_auto]">
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">
            Periode
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={draft.from}
              max={draft.to}
              onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
              className="field-input"
            />
            <span className="text-faint">–</span>
            <input
              type="date"
              value={draft.to}
              max={toApiDate(new Date())}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
              className="field-input"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-ink">
            Jenis Data
          </label>
          <select
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
            className="field-input"
          >
            {DATA_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end justify-end gap-2">
          <Button variant="outline" icon={RotateCcw} onClick={resetFilter}>
            Reset
          </Button>
          <Button icon={Filter} onClick={applyFilter}>
            Terapkan Filter
          </Button>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rata-rata Populasi"
          value={formatInt(log.totals.avgPopulasi)}
          unit="ekor"
          icon={Bird}
          tone="green"
        />
        <StatCard
          label="Total Produksi Telur"
          value={formatInt(log.totals.totalTelur)}
          unit="butir"
          icon={Egg}
          tone="amber"
        />
        <StatCard
          label="Total Pakan"
          value={formatNumber(log.totals.totalPakanKg)}
          unit="kg"
          icon={Leaf}
          tone="sky"
        />
        <StatCard
          label="Total Ayam Mati"
          value={formatInt(log.totals.totalMati)}
          unit="ekor"
          icon={HeartPulse}
          tone="rose"
        />
      </div>

      {/* Table */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-ink">Data Harian</h3>
            <p className="text-[13px] text-muted">
              Daftar data harian yang telah diinput.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari tanggal…"
              className="w-48"
            />
            <Button
              variant="outline"
              icon={Download}
              onClick={exportCsv}
              disabled={!filtered.length}
            >
              Unduh Data
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={pageRows}
            loading={log.isLoading}
            empty={
              <EmptyState
                icon={CalendarDays}
                title="Tidak ada data pada rentang ini"
                description="Ubah rentang tanggal atau jenis data lalu terapkan filter."
              />
            }
          />
        </div>

        {filtered.length > PAGE_SIZE ? (
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
