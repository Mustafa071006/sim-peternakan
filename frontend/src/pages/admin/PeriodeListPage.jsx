import { useMemo, useState } from "react";
import { CalendarRange, CheckCircle2, CircleDashed, Plus, Users } from "lucide-react";

import { PageHeader, DatePill } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { ErrorState } from "../../components/ui/States";
import { usePeriodeList } from "../../hooks/usePeriode";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDate, formatInt } from "../../utils/format";
import { StartPeriodeModal } from "../../features/periode/StartPeriodeModal";

const PAGE_SIZE = 10;
const isAktif = (s) => String(s || "").toUpperCase() === "AKTIF";

export default function PeriodeListPage() {
  const periodeQ = usePeriodeList();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const debounced = useDebounce(search, 250);
  const periodes = useMemo(() => periodeQ.data || [], [periodeQ.data]);

  const stats = useMemo(
    () => ({
      total: periodes.length,
      aktif: periodes.filter((p) => isAktif(p.status)).length,
      selesai: periodes.filter((p) => !isAktif(p.status)).length,
      populasiAktif: periodes
        .filter((p) => isAktif(p.status))
        .reduce((t, p) => t + (Number(p.populasi_aktif) || 0), 0),
    }),
    [periodes],
  );

  const filtered = useMemo(() => {
    let rows = [...periodes].sort(
      (a, b) => new Date(b.tanggal_masuk) - new Date(a.tanggal_masuk),
    );
    const q = debounced.trim().toLowerCase();
    if (q)
      rows = rows.filter(
        (p) =>
          p.kode_periode?.toLowerCase().includes(q) ||
          p.kandang?.toLowerCase().includes(q) ||
          p.strain?.toLowerCase().includes(q),
      );
    if (statusFilter !== "all")
      rows = rows.filter((p) =>
        statusFilter === "aktif" ? isAktif(p.status) : !isAktif(p.status),
      );
    return rows;
  }, [periodes, debounced, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered
    .slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    .map((p, i) => ({ ...p, _no: (safePage - 1) * PAGE_SIZE + i + 1 }));

  const columns = [
    { key: "_no", header: "No", width: 56 },
    {
      key: "kode_periode",
      header: "Kode Periode",
      render: (p) => (
        <span className="font-medium text-ink">{p.kode_periode}</span>
      ),
    },
    { key: "kandang", header: "Kandang" },
    { key: "strain", header: "Strain" },
    {
      key: "jumlah_awal",
      header: "Populasi Awal",
      align: "right",
      render: (p) => formatInt(p.jumlah_awal ?? p.populasi_awal),
    },
    {
      key: "populasi_aktif",
      header: "Populasi Aktif",
      align: "right",
      render: (p) => (
        <span className="font-semibold text-ink">
          {formatInt(p.populasi_aktif)}
        </span>
      ),
    },
    {
      key: "tanggal_masuk",
      header: "Tanggal Masuk",
      render: (p) => formatDate(p.tanggal_masuk),
    },
    {
      key: "tanggal_selesai",
      header: "Tanggal Selesai",
      render: (p) =>
        p.tanggal_selesai ? formatDate(p.tanggal_selesai) : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <Badge tone={isAktif(p.status) ? "green" : "neutral"} dot>
          {isAktif(p.status) ? "Aktif" : "Selesai"}
        </Badge>
      ),
    },
  ];

  const header = (
    <PageHeader
      title="Manajemen Periode"
      description="Pantau dan mulai periode produksi di seluruh kandang."
      aside={
        <div className="flex items-center gap-2">
          <DatePill />
          <Button icon={Plus} onClick={() => setFormOpen(true)}>
            Tambah Periode
          </Button>
        </div>
      }
    />
  );

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

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Periode" value={formatInt(stats.total)} icon={CalendarRange} tone="green" />
        <StatCard label="Sedang Berjalan" value={formatInt(stats.aktif)} icon={CircleDashed} tone="sky" />
        <StatCard label="Selesai" value={formatInt(stats.selesai)} icon={CheckCircle2} tone="amber" />
        <StatCard
          label="Total Populasi Aktif"
          value={formatInt(stats.populasiAktif)}
          unit="ekor"
          icon={Users}
          tone="rose"
        />
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari kode, kandang, atau strain…"
            className="flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="field-input w-auto"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        <div className="mt-4">
          <DataTable columns={columns} rows={pageRows} loading={periodeQ.isLoading} />
        </div>

        {filtered.length > PAGE_SIZE ? (
          <div className="mt-4">
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        ) : null}
      </Card>

      <StartPeriodeModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
