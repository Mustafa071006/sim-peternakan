import { useMemo, useState } from "react";
import {
  Layers,
  Plus,
  PowerOff,
  Power,
  UserRound,
  Users,
  Warehouse,
} from "lucide-react";

import { PageHeader, DatePill } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { DropdownMenu } from "../../components/ui/DropdownMenu";
import { ConfirmDialog } from "../../components/ui/Modal";
import { toast } from "../../components/ui/toast";
import { ErrorState } from "../../components/ui/States";
import { useKandangList, useSetKandangStatus } from "../../hooks/useKandang";
import { useDebounce } from "../../hooks/useDebounce";
import { getErrorMessage } from "../../lib/http";
import { formatInt } from "../../utils/format";
import { KandangFormModal } from "../../features/kandang/KandangFormModal";
import { ManageOperatorsModal } from "../../features/kandang/ManageOperatorsModal";

const PAGE_SIZE = 10;
const isActive = (s) => String(s || "").toLowerCase() === "aktif";

export default function KandangListPage() {
  const kandangQ = useKandangList({ limit: 1000 });
  const setStatus = useSetKandangStatus();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toToggle, setToToggle] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [managing, setManaging] = useState(null);

  const debounced = useDebounce(search, 250);
  const rows = useMemo(() => kandangQ.data?.rows || [], [kandangQ.data]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      aktif: rows.filter((k) => isActive(k.status)).length,
      nonaktif: rows.filter((k) => !isActive(k.status)).length,
      tanpaOperator: rows.filter((k) => !k.operator_nama).length,
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (k) =>
        k.kode?.toLowerCase().includes(q) ||
        k.nama?.toLowerCase().includes(q) ||
        k.jenis?.toLowerCase().includes(q) ||
        k.operator_nama?.toLowerCase().includes(q),
    );
  }, [rows, debounced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered
    .slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    .map((k, i) => ({ ...k, _no: (safePage - 1) * PAGE_SIZE + i + 1 }));

  const columns = [
    { key: "_no", header: "No", width: 56 },
    {
      key: "kode",
      header: "Kode",
      render: (k) => <span className="font-medium text-ink">{k.kode}</span>,
    },
    { key: "nama", header: "Nama" },
    { key: "jenis", header: "Jenis", render: (k) => k.jenis || "—" },
    {
      key: "operator",
      header: "Operator",
      render: (k) =>
        k.operator_nama ? (
          <span className="flex items-center gap-1.5 text-ink">
            <UserRound className="size-3.5 text-faint" />
            {k.operator_nama}
          </span>
        ) : (
          <span className="text-faint">Belum ditugaskan</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (k) => (
        <Badge tone={isActive(k.status) ? "green" : "rose"} dot>
          {isActive(k.status) ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      key: "aksi",
      header: "",
      align: "right",
      render: (k) => (
        <DropdownMenu
          items={[
            {
              label: "Kelola Operator",
              icon: Users,
              onClick: () => setManaging(k),
            },
            {
              label: isActive(k.status) ? "Nonaktifkan" : "Aktifkan",
              icon: isActive(k.status) ? PowerOff : Power,
              onClick: () => setToToggle(k),
            },
          ]}
        />
      ),
    },
  ];

  const header = (
    <PageHeader
      title="Manajemen Kandang"
      description="Buat kandang dan tugaskan operator. Satu kandang bisa punya lebih dari satu operator (backup)."
      aside={
        <div className="flex items-center gap-2">
          <DatePill />
          <Button icon={Plus} onClick={() => setFormOpen(true)}>
            Tambah Kandang
          </Button>
        </div>
      }
    />
  );

  if (kandangQ.isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <ErrorState error={kandangQ.error} onRetry={kandangQ.refetch} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Kandang" value={formatInt(stats.total)} icon={Warehouse} tone="green" />
        <StatCard label="Kandang Aktif" value={formatInt(stats.aktif)} icon={Layers} tone="sky" />
        <StatCard label="Kandang Nonaktif" value={formatInt(stats.nonaktif)} icon={PowerOff} tone="amber" />
        <StatCard
          label="Tanpa Operator"
          value={formatInt(stats.tanpaOperator)}
          icon={UserRound}
          tone="rose"
        />
      </div>

      <Card className="p-5">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari kode, nama, jenis, atau operator…"
          className="max-w-md"
        />
        <div className="mt-4">
          <DataTable columns={columns} rows={pageRows} loading={kandangQ.isLoading} />
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

      <ConfirmDialog
        open={Boolean(toToggle)}
        onClose={() => setToToggle(null)}
        onConfirm={() =>
          setStatus.mutate(
            {
              id: toToggle.id,
              status: isActive(toToggle.status) ? "Nonaktif" : "Aktif",
            },
            {
              onSuccess: () => {
                toast.success("Status kandang diperbarui.");
                setToToggle(null);
              },
              onError: (e) => {
                toast.error(getErrorMessage(e));
                setToToggle(null);
              },
            },
          )
        }
        loading={setStatus.isPending}
        title={
          isActive(toToggle?.status) ? "Nonaktifkan kandang?" : "Aktifkan kandang?"
        }
        description={`Status kandang "${toToggle?.nama}" akan diubah menjadi ${
          isActive(toToggle?.status) ? "Nonaktif" : "Aktif"
        }.`}
        confirmLabel="Lanjutkan"
      />

      <KandangFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      <ManageOperatorsModal
        open={Boolean(managing)}
        onClose={() => setManaging(null)}
        kandang={managing}
      />
    </div>
  );
}
