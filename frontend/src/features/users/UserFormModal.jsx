import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { TextField, SelectField } from "../../components/ui/Field";
import { toast } from "../../components/ui/toast";
import { useUserMutations } from "../../hooks/useUser";
import { userService } from "../../services";
import { getErrorMessage } from "../../lib/http";
import { ROLES } from "../../constants/roles";

const base = {
  nama: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().min(1, "Email wajib diisi.").email("Format email tidak valid."),
  role: z.enum([ROLES.ADMIN, ROLES.OPERATOR]),
};

const createSchema = z.object({
  ...base,
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
});

const editSchema = z.object(base);

export function UserFormModal({ open, onClose, userId }) {
  const isEdit = Boolean(userId);
  const { create, update } = useUserMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: { nama: "", email: "", role: ROLES.OPERATOR, password: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (!isEdit) {
      reset({ nama: "", email: "", role: ROLES.OPERATOR, password: "" });
      return;
    }
    userService
      .get(userId)
      .then((u) =>
        reset({
          nama: u?.nama || "",
          email: u?.email || "",
          role: u?.role || ROLES.OPERATOR,
        }),
      )
      .catch((e) => toast.error(getErrorMessage(e)));
  }, [open, isEdit, userId, reset]);

  const onSubmit = (values) => {
    const mutation = isEdit ? update : create;
    const args = isEdit
      ? { id: userId, body: { nama: values.nama, email: values.email, role: values.role } }
      : {
          nama: values.nama,
          email: values.email,
          role: values.role,
          password: values.password,
        };

    mutation.mutate(args, {
      onSuccess: () => {
        toast.success(isEdit ? "User diperbarui." : "User ditambahkan.");
        onClose();
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const pending = create.isPending || update.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Ubah User" : "Tambah User"}
      description={
        isEdit
          ? "Perbarui data akun dan peran pengguna."
          : "Buat akun baru untuk Admin atau Operator. Penugasan kandang dilakukan terpisah di halaman Kandang."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={pending}>
            Simpan
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <TextField
          label="Nama Lengkap"
          required
          error={errors.nama?.message}
          {...register("nama")}
        />
        <TextField
          label="Email"
          type="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <SelectField
          label="Role"
          required
          error={errors.role?.message}
          {...register("role")}
        >
          <option value={ROLES.OPERATOR}>Operator</option>
          <option value={ROLES.ADMIN}>Admin</option>
        </SelectField>
        {!isEdit ? (
          <TextField
            label="Kata Sandi Sementara"
            type="password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
        ) : null}
      </form>
    </Modal>
  );
}
