import { Component } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "./ui/Button";

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI crash:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
        <div className="max-w-md">
          <p className="text-[64px] font-bold leading-none text-brand-500">!</p>
          <h1 className="mt-2 text-xl font-semibold text-ink">
            Terjadi kesalahan pada aplikasi
          </h1>
          <p className="mt-2 text-sm text-muted">
            Muat ulang halaman untuk melanjutkan. Jika masalah berlanjut,
            hubungi administrator.
          </p>
          <Button
            className="mt-6"
            icon={RefreshCw}
            onClick={() => window.location.reload()}
          >
            Muat Ulang
          </Button>
        </div>
      </div>
    );
  }
}
