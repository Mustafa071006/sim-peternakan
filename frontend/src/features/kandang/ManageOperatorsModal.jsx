import { useState } from "react";
import { UserRound } from "lucide-react";

import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/toast";
import { useUserList } from "../../hooks/useUser";
import { useKandangOperators, useSetKandangOperators } from "../../hooks/useKandang";
import { getErrorMessage } from "../../lib/http";

const isActive = (s) => String(s || "").toLowerCase() === "aktif";

/**
 * Admin: pilih operator mana saja yang bertugas di kandang ini (bisa lebih
 * dari satu, untuk backup). Memindahkan operator ke kandang lain tinggal
 * buka modal ini di kandang tujuan lalu centang operatornya — dia otomatis
 * tetap tercatat di kandang asal kecuali dilepas di sana juga.
 */
export function ManageOperatorsModal({ open, onClose, kandang }) {
  const usersQ = useUserList();
  const opsQ = useKandangOperators(kandang?.id);
  const setOperators = useSetKandangOperators();

  const operators = (usersQ.data || []).filter(
    (u) => u.role === "Operator" && isActive(u.status),
  );

  const loading = usersQ.isLoading || opsQ.isLoading;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Kelola Operator — ${kandang?.nama || ""}`}
      description="Centang operator yang bertugas di kandang ini. Bisa lebih dari satu untuk backup."
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <OperatorChecklist
          key={kandang?.id}
          kandang={kandang}
          operators={operators}
          initialSelected={(opsQ.data || []).map((o) => o.id)}
          setOperators={setOperators}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function OperatorChecklist({
  kandang,
  operators,
  initialSelected,
  setOperators,
  onClose,
}) {
  const [selected, setSelected] = useState(initialSelected);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const submit = () => {
    setOperators.mutate(
      { id: kandang.id, userIds: selected },
      {
        onSuccess: () => {
          toast.success(`Operator kandang "${kandang.nama}" diperbarui.`);
          onClose();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <>
      {operators.length === 0 ? (
        <p className="text-sm text-muted">
          Belum ada akun Operator aktif. Tambahkan lewat halaman Manajemen User
          terlebih dahulu.
        </p>
      ) : (
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {operators.map((op) => (
            <label
              key={op.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas"
            >
              <input
                type="checkbox"
                checked={selected.includes(op.id)}
                onChange={() => toggle(op.id)}
                className="size-4 rounded border-line-strong text-brand-600 focus:ring-brand-400"
              />
              <UserRound className="size-4 text-faint" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink">{op.nama}</span>
                <span className="block truncate text-xs text-faint">{op.email}</span>
              </span>
              {op.kandang ? (
                <span className="shrink-0 text-xs text-faint">
                  saat ini: {op.kandang}
                </span>
              ) : null}
            </label>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={setOperators.isPending}>
          Batal
        </Button>
        <Button onClick={submit} loading={setOperators.isPending}>
          Simpan
        </Button>
      </div>
    </>
  );
}
