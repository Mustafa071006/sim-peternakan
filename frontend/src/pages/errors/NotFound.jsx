import { Link } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { ROUTES } from "../../routes/routePaths";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
      <div>
        <p className="text-[80px] font-bold leading-none text-brand-500">404</p>
        <h1 className="mt-2 text-xl font-semibold text-ink">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm text-muted">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Button as={Link} to={ROUTES.dashboard} className="mt-6">
          Kembali ke Dashboard
        </Button>
      </div>
    </div>
  );
}
