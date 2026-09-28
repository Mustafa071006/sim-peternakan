import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/Field";
import { BrandMark } from "../../components/layout/BrandMark";
import { useLoginMutation } from "../../hooks/useAuthActions";
import { getErrorMessage } from "../../lib/http";
import { loginSchema } from "../../features/auth/loginSchema";
import { ROUTES } from "../../routes/routePaths";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values) => {
    setFormError("");
    login.mutate(values, {
      onSuccess: () => {
        const to = location.state?.from?.pathname || ROUTES.dashboard;
        navigate(to, { replace: true });
      },
      onError: (error) => setFormError(getErrorMessage(error)),
    });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-50 p-12 lg:flex">
        <div
          aria-hidden
          className="absolute -bottom-40 -right-40 size-[520px] rounded-full border border-brand-200/60"
          style={{ boxShadow: "0 0 0 48px rgba(172,230,196,0.28), 0 0 0 96px rgba(172,230,196,0.14)" }}
        />
        <BrandMark />
        <div className="relative max-w-md">
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-500 text-white">
            <ShieldCheck className="size-6" />
          </span>
          <h1 className="mt-6 text-[2.4rem] font-bold leading-tight text-ink">
            Operasional kandang, dalam satu layar.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Pantau performa periode aktif, catat data harian, dan ambil keputusan
            yang lebih baik untuk setiap kandang.
          </p>
        </div>
        <div className="relative flex gap-10">
          {[
            ["Real-time", "Performa kandang"],
            ["2 peran", "Akses terkontrol"],
            ["Akurat", "Data terpusat"],
          ].map(([a, b]) => (
            <div key={a}>
              <div className="text-lg font-bold text-ink">{a}</div>
              <div className="text-xs text-muted">{b}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="grid place-items-center bg-surface px-6 py-12">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm"
          noValidate
        >
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-brand-600 lg:mt-0">
            Selamat datang
          </p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Masuk ke workspace</h2>
          <p className="mt-1.5 text-sm text-muted">
            Gunakan akun yang diberikan administrator.
          </p>

          <div className="mt-7 space-y-4">
            <TextField
              label="Alamat email"
              type="email"
              autoComplete="email"
              placeholder="nama@hascamafarm.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label="Kata sandi"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-faint transition-colors hover:text-ink"
                  aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
              {...register("password")}
            />
          </div>

          {formError ? (
            <p className="mt-4 rounded-xl bg-rose-soft px-3.5 py-2.5 text-[13px] font-medium text-down">
              {formError}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full"
            loading={login.isPending}
            iconRight={ArrowRight}
          >
            Masuk
          </Button>
        </form>
      </div>
    </div>
  );
}
