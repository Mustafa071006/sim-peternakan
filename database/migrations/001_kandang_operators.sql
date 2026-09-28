-- Migration: replace strict 1:1 users.kandang_id with a many-to-many
-- kandang_operators join table, so a kandang can have multiple backup
-- operators and an operator can be reassigned between kandangs by an admin.

CREATE TABLE IF NOT EXISTS kandang_operators (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  kandang_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ko_kandang FOREIGN KEY (kandang_id) REFERENCES kandangs(id) ON DELETE CASCADE,
  CONSTRAINT fk_ko_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_kandang_operator (kandang_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backfill any existing users.kandang_id assignment before dropping it.
INSERT IGNORE INTO kandang_operators (kandang_id, user_id)
SELECT kandang_id, id FROM users WHERE kandang_id IS NOT NULL;

-- Two duplicate FK constraints exist on users.kandang_id from an earlier
-- migration attempt (fk_user_kandang, fk_users_kandang) — drop both before
-- dropping the column itself.
ALTER TABLE users DROP FOREIGN KEY fk_user_kandang;
ALTER TABLE users DROP FOREIGN KEY fk_users_kandang;
ALTER TABLE users DROP COLUMN kandang_id;
