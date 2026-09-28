-- Migration: allow multiple mortalitas/feed/produksi entries per periode per
-- day. Previously each was capped at one row per day (produksi at two, via
-- pengambilan_ke 1/2), which blocked operators from logging e.g. a second
-- mortality event discovered later the same day.

ALTER TABLE mortalitas DROP INDEX uk_mortalitas_harian;
ALTER TABLE feeds DROP INDEX uk_feed;
ALTER TABLE produksis DROP INDEX uk_produksi;
