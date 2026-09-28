# SIM Peternakan — Frontend

Modern SaaS dashboard for a layer-hen farm management system. React 19 + Vite +
Tailwind CSS v4 + React Query. Consumes the existing Express/MySQL backend — no
mock data.

## Getting started

```bash
npm install
cp .env.example .env      # point VITE_API_URL at your backend
npm run dev               # http://localhost:5173
```

The backend must be running (default `http://localhost:5000/api`).

## Scripts

| command | purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | production build to `dist/` |
| `npm run preview` | serve the production build |
| `npm run lint` | ESLint |

## Structure

```
src/
  components/
    ui/          reusable Tailwind primitives (Button, Card, DataTable, Modal, …)
    charts/      Recharts wrappers (bar / area / stacked / dual-axis / donut)
    dashboard/   KPI + performance tiles
    layout/      Sidebar, BrandMark
  contexts/      AuthContext (session state)
  features/      screen-scoped logic (analytics, input-harian, laporan, users, …)
  hooks/         React Query hooks, one module per backend resource
  lib/           axios instance, queryClient, response-envelope helpers
  pages/         route components (auth, dashboard, operator, admin, errors)
  routes/        AppRouter + auth/role guards + path table
  services/      thin API wrappers, one per backend resource
  utils/         formatting, CSV export, className helper
```

## Roles

- **Operator** — Dashboard, Input Harian, Riwayat Data, Laporan. Sees only the
  active periode of their own kandang.
- **Admin** — Dashboard, Manajemen User / Kandang / Periode, Laporan. Sees all
  kandang; periode creation is operator-only (admin view is read-only).

## Notes on backend integration

Some backend aggregate endpoints are incomplete, so a few screens compose their
series from the raw daily endpoints (`/produksi`, `/feed`, `/mortalitas`) using
the formulas documented in the project brief. All figures still come from the
API — see `src/lib/http.js` (`pickPayload`) for the response-envelope handling
and `src/features/analytics/compute.js` for the display formulas.
