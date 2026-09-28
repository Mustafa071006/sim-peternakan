import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { TextField, SelectField } from "../../components/ui/Field";
import { toast } from "../../components/ui/toast";
import { useCreateKandang } from "../../hooks/useKandang";
import { getErrorMessage } from "../../lib/http";

const JENIS_KANDANG = ["Battery", "Umbaran"];

const schema = z.object({
  nama: z.string().trim().min(2, "Nama kandang wajib diisi."),
  jenis: z.enum(JENIS_KANDANG, { message: "Jenis kandang wajib dipilih." }),
});

export function KandangFormModal({ open, onClose }) {
  const createKandang = useCreateKandang();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nama: "", jenis: "" },
  });

  const submit = (values) => {
    createKandang.mutate(values, {
      onSuccess: (res) => {
        toast.success(`Kandang ${res?.kode || ""} berhasil dibuat.`);
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
      title="Tambah Kandang"
      description="Kode kandang dibuat otomatis oleh sistem (mis. KDG-001)."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createKandang.isPending}>
            Batal
          </Button>
          <Button onClick={handleSubmit(submit)} loading={createKandang.isPending}>
            Simpan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="grid gap-4">
        <TextField
          label="Nama Kandang"
          required
          placeholder="Kandang A"
          error={errors.nama?.message}
          {...register("nama")}
        />
        <SelectField
          label="Jenis Kandang"
          required
          placeholder="Pilih jenis"
          error={errors.jenis?.message}
          {...register("jenis")}
        >
          {JENIS_KANDANG.map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </SelectField>
      </form>
    </Modal>
  );
}
