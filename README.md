#  SIM Peternakan Ayam Petelur

Sistem Informasi Manajemen Peternakan Ayam Petelur — REST API (Node.js,
Express.js, MySQL) dengan frontend React (Vite).

Project ini dibuat untuk membantu pengelolaan operasional peternakan ayam petelur mulai dari periode pemeliharaan, pemberian pakan, produksi telur, mortalitas, vaksinasi, dashboard performa hingga laporan produksi.

---

##  Features

### Authentication
- Login menggunakan JWT
- Role Based Access Control (Admin & Operator)

### Master Data
- Kandang
- Strain
- Jenis Pakan
- Vaksin
- Standar Strain
- User

### Operasional
- Periode Pemeliharaan (dibuat oleh Admin, kandang bisa punya lebih dari satu operator untuk backup)
- Feed (input total pakan/hari, gram per ekor dihitung otomatis)
- Produksi Telur (per grade: Bagus/Krem/Retak)
- Mortalitas
- Vaksinasi

### Dashboard
- Monitoring kondisi kandang real-time (populasi, produksi hari ini, status kandang, alert)
- Grafik Produksi & Hen Day mingguan
- Performa vs standar strain (Feed Intake, FCR, Berat Telur)

### Laporan
- Ringkasan periode berdasarkan rentang tanggal
- Grafik analisis (produksi per grade, Hen Day & FCR)
- Tabel detail mingguan
- Export laporan (PDF / Excel)

### Analytics
- Analisis Produksi
- Analisis Feed
- Analisis Mortalitas

---

# 🛠 Tech Stack

**Backend**
- Node.js, Express.js
- MySQL (mysql2)
- JWT Authentication, Joi Validation
- Swagger, Morgan, CORS

**Frontend**
- React + Vite
- Tailwind CSS v4
- TanStack React Query
- React Hook Form + Zod
- Recharts

---

#  Project Structure

```
SIM-PETERNAKAN/
├── backend/          # REST API (Express)
│   └── src/
│       ├── config
│       ├── constants
│       ├── controllers
│       ├── docs
│       ├── helpers
│       ├── middleware
│       ├── models
│       ├── routes
│       ├── services
│       ├── validators
│       ├── app.js
│       └── server.js
├── frontend/         # React (Vite) app
│   └── src/
├── database/         # schema.sql + migrations/
└── README.md
```

---

# Installation

Clone repository

```bash
git clone https://github.com/Mustafa710206/sim-peternakan.git
cd sim-peternakan
```

## Database

Buat database MySQL lalu import skema dasar:

```bash
mysql -u root -p -e "CREATE DATABASE sim_peternakan"
mysql -u root -p sim_peternakan < database/schema.sql
```

Lalu jalankan migration tambahan secara berurutan (lihat `database/migrations/`):

```bash
mysql -u root -p sim_peternakan < database/migrations/001_kandang_operators.sql
mysql -u root -p sim_peternakan < database/migrations/002_allow_multiple_daily_entries.sql
```

## Backend

```bash
cd backend
npm install
cp .env.example .env   # lalu isi sesuai environment kamu — lihat bagian Environment
npm run dev
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env   # isi VITE_API_URL kalau backend tidak di localhost:5000
npm run dev
```

---

# Environment

Backend (`backend/.env`, contoh lengkap ada di `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=sim_peternakan
DB_USER=root
DB_PASSWORD=

JWT_SECRET=ganti_dengan_secret_kamu_sendiri
JWT_EXPIRES=1d
```

> `.env` sudah di-gitignore dan **tidak boleh** di-commit — jangan pernah
> menaruh secret asli di file yang ikut ter-commit (README, kode, dll).

Frontend (`frontend/.env`, contoh ada di `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

---

# Running Project

Backend — Development

```bash
npm run dev
```

Backend — Production

```bash
npm start
```

Frontend — Development

```bash
npm run dev
```

Frontend — Build

```bash
npm run build
```

---

# API Documentation

Swagger

```
http://localhost:5000/api-docs
```

Health Check

```
http://localhost:5000/api/health
```

Root

```
http://localhost:5000/
```

---

# Authentication

Semua endpoint (kecuali Login) menggunakan Bearer Token.

Contoh Header

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# Roles

## Admin

- CRUD User
- CRUD Master Data (Strain, Jenis Pakan, Vaksin, Standar Strain)
- Membuat Kandang & Periode, menugaskan/memindahkan Operator ke Kandang
- Melihat Dashboard, Report & Analytics seluruh kandang

## Operator

- Input Data Harian (Mortalitas, Feed, Produksi Telur)
- Input Vaksinasi
- Melihat Dashboard (monitoring real-time kandang yang ditugaskan)
- Melihat Riwayat Data & Laporan

---

# Database

Database menggunakan MySQL. Skema lengkap ada di `database/schema.sql`
(regenerate file ini dari database yang berjalan kalau strukturnya berubah —
jangan edit manual sampai tidak sinkron dengan kode).

Relasi utama

```
Kandang ──< Kandang_Operators >── User (Operator)
   │
   ▼
Periode
 ├── Feed
 ├── Produksi
 ├── Mortalitas
 └── Vaksinasi
```

Master Data

- User
- Strain
- Kandang
- Jenis Pakan
- Vaksin
- Standar Strain

---

# API Modules

- Authentication
- User
- Kandang
- Strain
- Jenis Pakan
- Vaksin
- Standar Strain
- Periode
- Feed
- Produksi
- Mortalitas
- Vaksinasi
- Dashboard
- Analytics
- Report

---

# Response Format

Success

```json
{
  "success": true,
  "message": "Berhasil",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Terjadi kesalahan"
}
```

---

# Author

Nama : **(Mustafa Jafar Abuzaid)**

Universitas : **(Universitas Putra Indonesia)**

Mata Kuliah : **Kerja Praktik**

---

# License

MIT License
