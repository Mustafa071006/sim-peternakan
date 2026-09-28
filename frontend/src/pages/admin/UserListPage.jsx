import { useMemo, useState } from "react";
import { startOfMonth } from "date-fns";
import {
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  UserRound,
  UserX,
} from "lucide-react";

import { PageHeader, DatePill } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { DataTable } from "../../components/ui/DataTable";
import { Pagination } from "../../components/ui/Pagination";
import { SearchInput } from "../../components/ui/SearchInput";
import { DropdownMenu } from "../../components/ui/DropdownMenu";
import { ConfirmDialog } from "../../components/ui/Modal";
import { toast } from "../../components/ui/toast";
import { ErrorState } from "../../components/ui/States";
import { useUserList, useUserMutations } from "../../hooks/useUser";
import { useDebounce } from "../../hooks/useDebounce";
import { UserFormModal } from "../../features/users/UserFormModal";
import { getErrorMessage } from "../../lib/http";
import { formatDate, formatInt } from "../../utils/format";
import { ROLES } from "../../constants/roles";

const PAGE_SIZE = 10;

const isActive = (s) => String(s || "").toLowerCase() === "aktif";

export default function UserListPage() {
  const usersQ = useUserList();
  const { setStatus, resetPassword, remove } = useUserMutations();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type, user }

  const debounced = useDebounce(search, 250);
  const users = useMemo(() => usersQ.data || [], [usersQ.data]);

  const stats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    return {
      total: users.length,
      admin: users.filter((u) => u.role === ROLES.ADMIN).length,
      operator: users.filter((u) => u.role === ROLES.OPERATOR).length,
      inactive: users.filter((u) => !isActive(u.status)).length,
      newThisMonth: users.filter(
        (u) => u.created_at && new Date(u.created_at) >= monthStart,
      ).length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    let rows = users;
    const q = debounced.trim().toLowerCase();
    if (q)
      rows = rows.filter(
        (u) =>
          u.nama?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q),
      );
    if (roleFilter !== "all") rows = rows.filter((u) => u.role === roleFilter);
    if (statusFilter !== "all")
      rows = rows.filter((u) =>
        statusFilter === "active" ? isActive(u.status) : !isActive(u.status),
      );

    rows = [...rows].sort((a, b) => {
      if (sort === "name") return (a.nama || "").localeCompare(b.nama || "");
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    return rows;
  }, [users, debounced, roleFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered
    .slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
    .map((u, i) => ({ ...u, _no: (safePage - 1) * PAGE_SIZE + i + 1 }));

  const runConfirm = () => {
    if (!confirm) return;
    const { type, user } = confirm;
    const done = (msg) => {
      toast.success(msg);
      setConfirm(null);
    };
    const fail = (e) => {
      toast.error(getErrorMessage(e));
      setConfirm(null);
    };

    if (type === "delete")
      remove.mutate(user.id, { onSuccess: () => done("User dihapus."), onError: fail });
    if (type === "toggle")
      setStatus.mutate(
        { id: user.id, status: isActive(user.status) ? "Nonaktif" : "Aktif" },
        { onSuccess: () => done("Status user diperbarui."), onError: fail },
      );
    if (type === "reset")
      resetPassword.mutate(
        { id: user.id, password: "operator123" },
        {
          onSuccess: () => done("Kata sandi direset ke: operator123"),
          onError: fail,
        },
      );
  };

  const columns = [
    { key: "_no", header: "No", width: 56 },
    {
      key: "nama",
      header: "Nama",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.nama} size="sm" />
          <span className="font-medium text-ink">{u.nama}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (u) => <span className="text-muted">{u.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <Badge tone={u.role === ROLES.ADMIN ? "sky" : "green"}>
          {u.role === ROLES.ADMIN ? (
            <ShieldCheck className="size-3.5" />
          ) : (
            <UserRound className="size-3.5" />
          )}
          {u.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge tone={isActive(u.status) ? "green" : "rose"} dot>
          {isActive(u.status) ? "Aktif" : "Tidak Aktif"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Bergabung",
      render: (u) => (
        <span className="text-muted">
          {u.created_at ? formatDate(u.created_at) : "—"}
        </span>
      ),
    },
    {
      key: "aksi",
      header: "",
      align: "right",
      render: (u) => (
        <DropdownMenu
          items={[
            {
              label: "Ubah",
              icon: Pencil,
              onClick: () => {
                setEditId(u.id);
                setFormOpen(true);
              },
            },
            {
              label: isActive(u.status) ? "Nonaktifkan" : "Aktifkan",
              icon: isActive(u.status) ? UserX : UserCheck,
              onClick: () => setConfirm({ type: "toggle", user: u }),
            },
            {
              label: "Reset Kata Sandi",
              icon: KeyRound,
              onClick: () => setConfirm({ type: "reset", user: u }),
            },
            {
              label: "Hapus",
              icon: Trash2,
              tone: "danger",
              onClick: () => setConfirm({ type: "delete", user: u }),
            },
          ]}
        />
      ),
    },
  ];

  const header = (
    <PageHeader
      title="Manajemen User"
      description="Kelola data pengguna sistem, atur role, dan akses mereka."
      aside={<DatePill />}
      actions={
        <Button
          icon={Plus}
          onClick={() => {
            setEditId(null);
            setFormOpen(true);
          }}
        >
          Tambah User
        </Button>
      }
    />
  );

  if (usersQ.isError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <ErrorState error={usersQ.error} onRetry={usersQ.refetch} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total User"
          value={formatInt(stats.total)}
          icon={UserRound}
          tone="green"
          hint={
            stats.newThisMonth
              ? `+${stats.newThisMonth} bulan ini`
              : "tidak ada penambahan bulan ini"
          }
        />
        <StatCard
          label="Admin"
          value={formatInt(stats.admin)}
          icon={ShieldCheck}
          tone="sky"
          hint="Memiliki akses penuh"
        />
        <StatCard
          label="Operator"
          value={formatInt(stats.operator)}
          icon={UserCog}
          tone="amber"
          hint="Mengelola data harian"
        />
        <StatCard
          label="Tidak Aktif"
          value={formatInt(stats.inactive)}
          icon={UserX}
          tone="rose"
          hint="User nonaktif"
        />
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari nama, email, atau role…"
            className="flex-1"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="field-input w-auto"
            >
              <option value="all">Semua Role</option>
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.OPERATOR}>Operator</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="field-input w-auto"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="field-input w-auto"
            >
              <option value="recent">Urutkan: Terbaru</option>
              <option value="name">Urutkan: Nama</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <DataTable columns={columns} rows={pageRows} loading={usersQ.isLoading} />
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

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        userId={editId}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={runConfirm}
        loading={remove.isPending || setStatus.isPending || resetPassword.isPending}
        tone={confirm?.type === "delete" ? "danger" : "primary"}
        title={
          confirm?.type === "delete"
            ? "Hapus user ini?"
            : confirm?.type === "toggle"
              ? "Ubah status user?"
              : "Reset kata sandi?"
        }
        description={
          confirm?.type === "delete"
            ? `Akun "${confirm?.user?.nama}" akan dihapus permanen.`
            : confirm?.type === "toggle"
              ? `Status "${confirm?.user?.nama}" akan diubah.`
              : `Kata sandi "${confirm?.user?.nama}" akan direset ke sandi sementara.`
        }
        confirmLabel={confirm?.type === "delete" ? "Hapus" : "Lanjutkan"}
      />
    </div>
  );
}
