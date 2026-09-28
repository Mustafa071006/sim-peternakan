-- SIM Peternakan — database schema
--
-- Reconstructed 2026-09-28 from live-DB introspection (DESCRIBE / SHOW CREATE
-- TABLE run against the project's own MySQL instance during development).
-- The previous version of this file predated several schema changes
-- (the kandang_operators join table, the users.kandang_id removal, the
-- dropped one-entry-per-day unique constraints on feeds/mortalitas/produksis)
-- and no longer matched what the backend actually reads/writes — do not
-- trust an old copy of this file over the backend/src/models/*.js code.
--
-- Column types, defaults, nullability, PKs and unique keys below are copied
-- verbatim from live introspection. The FK actions on `periodes`,
-- `standar_strains` and `vaksinasi_lama` were NOT individually re-confirmed
-- against the live DB at authoring time (MySQL wasn't reachable) — they
-- follow this codebase's own consistent convention, confirmed live on every
-- other FK in the schema: ON DELETE RESTRICT ON UPDATE CASCADE. If you need
-- to verify them exactly, run `SHOW CREATE TABLE <table>` against the real
-- database and diff against this file.
--
-- This project has no stored procedures or triggers — all business logic
-- (e.g. decrementing populasi_aktif on a mortalitas insert) lives in the
-- backend service layer (see backend/src/services/*.js).

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------
-- users
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Operator') NOT NULL DEFAULT 'Operator',
  `status` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- strains
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `strains`;
CREATE TABLE `strains` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_strain_nama` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- jenis_pakan
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `jenis_pakan`;
CREATE TABLE `jenis_pakan` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `deskripsi` text,
  `status` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- vaksin
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `vaksin`;
CREATE TABLE `vaksin` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `deskripsi` text,
  `status` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- kandangs
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `kandangs`;
CREATE TABLE `kandangs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `kode` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `jenis` enum('Umbaran','Battery') NOT NULL DEFAULT 'Battery',
  `kapasitas` int NOT NULL DEFAULT '0',
  `status` enum('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kandang_kode` (`kode`),
  KEY `idx_kandang_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- kandang_operators (many-to-many: a kandang can have several backup
-- operators, an operator can be assigned to several kandangs)
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `kandang_operators`;
CREATE TABLE `kandang_operators` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `kandang_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_kandang_operator` (`kandang_id`,`user_id`),
  KEY `fk_ko_user` (`user_id`),
  CONSTRAINT `fk_ko_kandang` FOREIGN KEY (`kandang_id`) REFERENCES `kandangs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ko_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- standar_strains (per-strain, per-age-week targets: feed intake, hen day
-- %, egg weight — used to compare actual daily performance against)
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `standar_strains`;
CREATE TABLE `standar_strains` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `strain_id` bigint NOT NULL,
  `umur_minggu` int NOT NULL,
  `produksi_persen` decimal(5,2) NOT NULL,
  `feed_gram` decimal(8,2) NOT NULL,
  `berat_telur` decimal(5,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_standar_strain_umur` (`strain_id`,`umur_minggu`),
  CONSTRAINT `fk_standar_strain` FOREIGN KEY (`strain_id`) REFERENCES `strains` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- periodes (one rearing/laying cycle for a kandang)
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `periodes`;
CREATE TABLE `periodes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `kandang_id` bigint NOT NULL,
  `strain_id` bigint NOT NULL,
  `kode_periode` varchar(30) NOT NULL,
  `tanggal_masuk` date NOT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `umur_awal_vendor` int NOT NULL DEFAULT '0',
  `jumlah_awal` int NOT NULL,
  `populasi_aktif` int NOT NULL,
  `status` enum('Aktif','Selesai') NOT NULL DEFAULT 'Aktif',
  `created_by` bigint NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_periode_kode` (`kode_periode`),
  KEY `idx_periode_kandang` (`kandang_id`),
  KEY `idx_periode_strain` (`strain_id`),
  KEY `idx_periode_status` (`status`),
  KEY `idx_periode_tanggal` (`tanggal_masuk`),
  KEY `fk_periode_user` (`created_by`),
  CONSTRAINT `fk_periode_kandang` FOREIGN KEY (`kandang_id`) REFERENCES `kandangs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_periode_strain` FOREIGN KEY (`strain_id`) REFERENCES `strains` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_periode_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- feeds (daily feed given — operator inputs total_kg, gram_per_ekor is
-- derived server-side; multiple entries per periode/day are allowed)
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `feeds`;
CREATE TABLE `feeds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `periode_id` bigint NOT NULL,
  `pakan_id` bigint NOT NULL,
  `tanggal` date NOT NULL,
  `gram_per_ekor` decimal(8,2) NOT NULL,
  `total_kg` decimal(10,2) NOT NULL,
  `created_by` bigint NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_feed_periode` (`periode_id`),
  KEY `idx_feed_tanggal` (`tanggal`),
  KEY `idx_feed_pakan` (`pakan_id`),
  KEY `fk_feed_user` (`created_by`),
  CONSTRAINT `fk_feed_pakan` FOREIGN KEY (`pakan_id`) REFERENCES `jenis_pakan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_feed_periode` FOREIGN KEY (`periode_id`) REFERENCES `periodes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_feed_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- produksis (daily egg production by grade; pengambilan_ke is assigned
-- automatically server-side — multiple entries per periode/day allowed)
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `produksis`;
CREATE TABLE `produksis` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `periode_id` bigint NOT NULL,
  `tanggal` date NOT NULL,
  `pengambilan_ke` tinyint NOT NULL DEFAULT '1',
  `telur_bagus` int NOT NULL DEFAULT '0',
  `berat_bagus` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rata_bagus` decimal(8,2) NOT NULL DEFAULT '0.00',
  `telur_krem` int NOT NULL DEFAULT '0',
  `berat_krem` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rata_krem` decimal(8,2) NOT NULL DEFAULT '0.00',
  `telur_retak` int NOT NULL DEFAULT '0',
  `berat_retak` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rata_retak` decimal(8,2) NOT NULL DEFAULT '0.00',
  `telur_total` int NOT NULL DEFAULT '0',
  `berat_total` decimal(10,2) NOT NULL DEFAULT '0.00',
  `rata_total` decimal(8,2) NOT NULL DEFAULT '0.00',
  `created_by` bigint NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_produksi_periode` (`periode_id`),
  KEY `idx_produksi_tanggal` (`tanggal`),
  KEY `fk_produksi_user` (`created_by`),
  CONSTRAINT `fk_produksi_periode` FOREIGN KEY (`periode_id`) REFERENCES `periodes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_produksi_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- mortalitas (daily deaths/culls; multiple entries per periode/day
-- allowed — each insert atomically decrements periodes.populasi_aktif)
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `mortalitas`;
CREATE TABLE `mortalitas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `periode_id` bigint NOT NULL,
  `tanggal` date NOT NULL,
  `jumlah` int unsigned NOT NULL,
  `penyebab` text,
  `foto` varchar(255) DEFAULT NULL,
  `created_by` bigint NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mortalitas_periode` (`periode_id`),
  KEY `idx_mortalitas_tanggal` (`tanggal`),
  KEY `fk_mortalitas_user` (`created_by`),
  CONSTRAINT `fk_mortalitas_periode` FOREIGN KEY (`periode_id`) REFERENCES `periodes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_mortalitas_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------
-- vaksinasi_lama (vaccination log; UI is currently hidden per client
-- decision but the resource is still live server-side)
-- ----------------------------------------------------------------------
DROP TABLE IF EXISTS `vaksinasi_lama`;
CREATE TABLE `vaksinasi_lama` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `periode_id` bigint NOT NULL,
  `tanggal` date NOT NULL,
  `nama_vaksin` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_vaksinasi_periode` (`periode_id`),
  KEY `idx_vaksinasi_tanggal` (`tanggal`),
  CONSTRAINT `fk_vaksinasi_periode` FOREIGN KEY (`periode_id`) REFERENCES `periodes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
