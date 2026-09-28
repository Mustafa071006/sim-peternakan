import { Inbox, RefreshCw, TriangleAlert } from "lucide-react";

import { cn } from "../../utils/cn";
import { getErrorMessage } from "../../lib/http";
import { Button } from "./Button";

export function EmptyState({
  icon: Icon = Inbox,
  title = "Belum ada data",
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "grid place-items-center px-6 py-14 text-center",
        className,
      )}
    >
      <div className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }) {
  return (
    <div
      className={cn(
        "grid place-items-center px-6 py-14 text-center",
        className,
      )}
    >
      <div className="grid size-16 place-items-center rounded-2xl bg-rose-soft text-rose-ink">
        <TriangleAlert className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink">
        Gagal memuat data
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted">
        {getErrorMessage(error)}
      </p>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          className="mt-5"
          onClick={onRetry}
        >
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
