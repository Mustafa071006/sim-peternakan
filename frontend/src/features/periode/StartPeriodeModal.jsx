import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { TextField, SelectField } from "../../components/ui/Field";
import { toast } from "../../components/ui/toast";
import { useStrains } from "../../hooks/useMasters";
import { useCreatePeriode } from "../../hooks/usePeriode";
import { useKandangList } from "../../hooks/useKandang";
import { getErrorMessage } from "../../lib/http";
import { toApiDate } from "../../utils/format";

const schema = z.object({
  kandang_id: z.coerce.number().int().positive("Kandang wajib dipilih."),
  strain_id: z.coerce.number().int().positive("Strain wajib dipilih."),
  tanggal_masuk: z.string().min(1, "Tanggal masuk wajib diisi."),
  jumlah_awal: z.coerce.number().int().positive("Jumlah ayam harus lebih dari 0."),
  umur_awal_vendor: z.coerce
    .number()
    .min(0, "Umur tidak valid.")
    .max(20, "Umur maksimal 20 minggu."),
});

/**
 * Admin only: mulai periode baru untuk kandang yang sudah ada. Populasi awal
 * dan strain ditentukan di sini oleh admin.
 */
export function StartPeriodeModal({ open, onClose }) {
  const strainsQ = useStrains();
  const kandangQ = useKandangList({ limit: 100 });
  const createPeriode = useCreatePeriode();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      kandang_id: "",
      strain_id: "",
      tanggal_masuk: toApiDate(new Date()),
      jumlah_awal: "",
      umur_awal_vendor: "",
    },
  });

  const submit = (values) => {
    createPeriode.mutate(values, {
      onSuccess: () => {
        toast.success("Periode baru berhasil dibuat.");
        reset();
        onClose();
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mulai Periode Baru"
      description="Tentukan kandang, strain, dan populasi awal untuk periode produksi baru."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createPeriode.isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit(submit)} loading={createPeriode.isPending}>
            Buat Periode
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Kandang"
          required
          placeholder="Pilih kandang"
          error={errors.kandang_id?.message}
          {...register("kandang_id")}
        >
          {(kandangQ.data?.rows || []).map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama} ({k.kode})
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Strain Ayam"
          required
          placeholder="Pilih strain"
          error={errors.strain_id?.message}
          {...register("strain_id")}
        >
          {(strainsQ.data || []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.nama_strain || s.nama}
            </option>
          ))}
        </SelectField>

        <TextField
          label="Tanggal Masuk"
          type="date"
          required
          max={toApiDate(new Date())}
          error={errors.tanggal_masuk?.message}
          {...register("tanggal_masuk")}
        />

        <TextField
          label="Jumlah Ayam"
          type="number"
          inputMode="numeric"
          required
          suffix="ekor"
          placeholder="0"
          error={errors.jumlah_awal?.message}
          {...register("jumlah_awal")}
        />

        <TextField
          label="Umur Ayam (dari vendor)"
          type="number"
          inputMode="numeric"
          required
          suffix="minggu"
          placeholder="0"
          error={errors.umur_awal_vendor?.message}
          {...register("umur_awal_vendor")}
        />
      </form>
    </Modal>
  );
}
