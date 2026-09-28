import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import { RequireAuth, RequireGuest, RequireRole } from "./guards";
import { ROUTES } from "./routePaths";
import { FullSpinner } from "../components/ui/Spinner";

const Login = lazy(() => import("../pages/auth/Login"));
const NotFound = lazy(() => import("../pages/errors/NotFound"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const InputHarianPage = lazy(() => import("../pages/operator/InputHarianPage"));
const RiwayatPage = lazy(() => import("../pages/operator/RiwayatPage"));
const LaporanPage = lazy(() => import("../pages/LaporanPage"));
const UserListPage = lazy(() => import("../pages/admin/UserListPage"));
const KandangListPage = lazy(() => import("../pages/admin/KandangListPage"));
const PeriodeListPage = lazy(() => import("../pages/admin/PeriodeListPage"));

function Fallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <FullSpinner />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<RequireGuest />}>
          <Route path={ROUTES.login} element={<Login />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
            <Route path={ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={ROUTES.laporan} element={<LaporanPage />} />

            <Route element={<RequireRole role="operator" />}>
              <Route path={ROUTES.inputHarian} element={<InputHarianPage />} />
              <Route path={ROUTES.riwayat} element={<RiwayatPage />} />
            </Route>

            <Route element={<RequireRole role="admin" />}>
              <Route path={ROUTES.users} element={<UserListPage />} />
              <Route path={ROUTES.kandang} element={<KandangListPage />} />
              <Route path={ROUTES.periode} element={<PeriodeListPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
