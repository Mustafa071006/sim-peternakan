import {
  LayoutGrid,
  ClipboardList,
  History,
  FileBarChart2,
  Users,
  Warehouse,
  CalendarRange,
} from "lucide-react";

import { ROUTES } from "../routes/routePaths";

export const OPERATOR_NAV = [
  { label: "Dashboard", to: ROUTES.dashboard, icon: LayoutGrid, end: true },
  { label: "Input Harian", to: ROUTES.inputHarian, icon: ClipboardList },
  { label: "Riwayat Data", to: ROUTES.riwayat, icon: History },
  { label: "Laporan", to: ROUTES.laporan, icon: FileBarChart2 },
];

export const ADMIN_NAV = [
  { label: "Dashboard", to: ROUTES.dashboard, icon: LayoutGrid, end: true },
  { label: "Manajemen User", to: ROUTES.users, icon: Users },
  { label: "Manajemen Kandang", to: ROUTES.kandang, icon: Warehouse },
  { label: "Manajemen Periode", to: ROUTES.periode, icon: CalendarRange },
  { label: "Laporan", to: ROUTES.laporan, icon: FileBarChart2 },
];

export const navFor = (isAdmin) => (isAdmin ? ADMIN_NAV : OPERATOR_NAV);
