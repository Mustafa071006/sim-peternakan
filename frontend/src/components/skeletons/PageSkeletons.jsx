import { useLocation } from "react-router-dom";

import { cn } from "../../utils/cn";
import { ROUTES } from "../../routes/routePaths";
import { useAuth } from "../../contexts";
import { isAdmin } from "../../constants/roles";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

/*
 * Skeletons that mirror each page's real layout, so switching pages (lazy
 * chunk loading) and first data loads don't flash an empty screen or a lone
 * spinner. Each `*Skeleton` body is rendered under the page's real header
 * inside the page itself, and under `PageHeaderSkeleton` by `RouteSkeleton`.
 */

export function PageHeaderSkeleton({ action = false }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2.5">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-11 w-40 rounded-xl" />
        {action ? <Skeleton className="h-10 w-36 rounded-xl" /> : null}
      </div>
    </div>
  );
}

export function StatRowSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <Skeleton className="mt-4 h-7 w-28" />
          <Skeleton className="mt-4 h-3 w-32" />
        </Card>
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ className, height = "h-56" }) {
  return (
    <Card className={cn("p-5", className)}>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-3 w-56 max-w-full" />
      <Skeleton className={cn("mt-5 w-full rounded-xl", height)} />
    </Card>
  );
}

export function TableCardSkeleton({ rows = 6, columns = 5 }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="mt-5 space-y-4">
        <Skeleton className="h-3 w-full max-w-xl" />
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-6">
            {Array.from({ length: columns }).map((__, c) => (
              <Skeleton key={c} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

function FilterCardSkeleton() {
  return (
    <Card className="flex flex-wrap items-center gap-3 p-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full max-w-md rounded-xl" />
    </Card>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StatRowSkeleton />
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCardSkeleton className="xl:col-span-2" />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}

export function OperatorDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StatRowSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}

export function InputHarianSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        ))}
      </Card>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
          <ChartCardSkeleton height="h-36" />
          <ChartCardSkeleton height="h-36" />
          <ChartCardSkeleton height="h-40" className="md:col-span-2" />
        </div>
        <ChartCardSkeleton height="h-72" />
      </div>
    </div>
  );
}

export function RiwayatSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="grid gap-4 p-5 lg:grid-cols-[1.3fr_1fr_auto]">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 w-56 rounded-xl" />
      </Card>
      <StatRowSkeleton />
      <TableCardSkeleton rows={8} columns={7} />
    </div>
  );
}

export function LaporanBodySkeleton() {
  return (
    <div className="space-y-6">
      <StatRowSkeleton />
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}

export function LaporanSkeleton() {
  return (
    <div className="space-y-6">
      <FilterCardSkeleton />
      <LaporanBodySkeleton />
    </div>
  );
}

export function ListPageSkeleton() {
  return (
    <div className="space-y-6">
      <StatRowSkeleton />
      <TableCardSkeleton />
    </div>
  );
}

const ROUTE_SKELETONS = [
  { path: ROUTES.inputHarian, body: InputHarianSkeleton },
  { path: ROUTES.riwayat, body: RiwayatSkeleton },
  { path: ROUTES.laporan, body: LaporanSkeleton },
  { path: ROUTES.users, body: ListPageSkeleton, action: true },
  { path: ROUTES.kandang, body: ListPageSkeleton, action: true },
  { path: ROUTES.periode, body: ListPageSkeleton, action: true },
];

/** Suspense fallback for lazy pages inside the dashboard layout. */
export function RouteSkeleton() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const match = ROUTE_SKELETONS.find((r) => pathname.startsWith(r.path));
  const Body =
    match?.body ||
    (isAdmin(user?.role) ? AdminDashboardSkeleton : OperatorDashboardSkeleton);

  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat halaman">
      <PageHeaderSkeleton action={match?.action} />
      <Body />
    </div>
  );
}
