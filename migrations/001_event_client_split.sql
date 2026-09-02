-- Split event_leads into a client and its events.
--
-- Before: one row held the client (name, mobile, email) and one event's worth
-- of data (status, money, requirements, file), so a client could only ever
-- have one event.
--
-- After: event_client holds the person, event_event holds each event they
-- booked, and the checklist and assignation hang off the event rather than the
-- client. Every existing lead becomes one client plus one event named
-- "Event 1", which is safe because all 122 leads have distinct mobiles - there
-- is nothing to merge.
--
-- event_leads is left in place untouched. Nothing reads it after the cutover,
-- but it is the fastest way back if something is wrong.

CREATE TABLE IF NOT EXISTS event_client (
  client_id     BIGINT       NOT NULL,
  client_name   VARCHAR(128),
  client_mobile VARCHAR(16),
  client_email  VARCHAR(100),
  added_date    DATETIME,
  added_by      VARCHAR(64),
  modified_date DATETIME,
  modified_by   VARCHAR(64),
  PRIMARY KEY (client_id),
  KEY idx_client_mobile (client_mobile),
  KEY idx_client_name (client_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_event (
  event_id             BIGINT       NOT NULL AUTO_INCREMENT,
  client_id            BIGINT       NOT NULL,
  event_name           VARCHAR(128) NOT NULL DEFAULT 'Event 1',
  status               VARCHAR(32),
  temperature          VARCHAR(32),
  recall_date          DATE,
  not_interested_notes VARCHAR(512),
  payment_status       VARCHAR(64),
  deposit_flag         TINYINT(1)   DEFAULT 0,
  deposit              INT          DEFAULT 0,
  total                INT          DEFAULT 0,
  remaining            INT          DEFAULT 0,
  assets_list          VARCHAR(256),
  done                 TINYINT(1)   DEFAULT 0,
  file_name            VARCHAR(128),
  added_date           DATETIME,
  added_by             VARCHAR(64),
  modified_date        DATETIME,
  modified_by          VARCHAR(64),
  PRIMARY KEY (event_id),
  KEY idx_event_client (client_id),
  KEY idx_event_status (status),
  CONSTRAINT fk_event_client FOREIGN KEY (client_id)
    REFERENCES event_client (client_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One client per existing lead. Ids are carried across unchanged, so every
-- link that already points at a client_id still resolves.
INSERT INTO event_client
  (client_id, client_name, client_mobile, client_email,
   added_date, added_by, modified_date, modified_by)
SELECT client_id, client_name, client_mobile, client_email,
       added_date, added_by, modified_date, modified_by
FROM event_leads
ON DUPLICATE KEY UPDATE client_id = event_client.client_id;

-- One event per existing lead, carrying everything that was event-shaped.
INSERT INTO event_event
  (client_id, event_name, status, temperature, recall_date, not_interested_notes,
   payment_status, deposit_flag, deposit, total, remaining, assets_list, done,
   file_name, added_date, added_by, modified_date, modified_by)
SELECT client_id, 'Event 1', status, temperature, recall_date,
       client_not_interested_notes, client_payment_status, client_deposit_flag,
       client_deposit, client_total, client_remaining, client_assets_list, done,
       file_name, added_date, added_by, modified_date, modified_by
FROM event_leads
WHERE NOT EXISTS (SELECT 1 FROM event_event e WHERE e.client_id = event_leads.client_id);

-- The checklist and the assignation belong to an event now. Each existing row
-- points at the client's one and only event.
-- MySQL 8 has no ADD COLUMN IF NOT EXISTS (that is MariaDB), so the check goes
-- through information_schema to keep this script re-runnable.
SET @db := DATABASE();

SET @sql := (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE event_check_list ADD COLUMN event_id BIGINT NULL AFTER client_id',
  'DO 0') FROM information_schema.columns
  WHERE table_schema = @db AND table_name = 'event_check_list' AND column_name = 'event_id');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

SET @sql := (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE event_assignation ADD COLUMN event_id BIGINT NULL AFTER client_id',
  'DO 0') FROM information_schema.columns
  WHERE table_schema = @db AND table_name = 'event_assignation' AND column_name = 'event_id');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

UPDATE event_check_list c
  JOIN event_event e ON e.client_id = c.client_id
   SET c.event_id = e.event_id
 WHERE c.event_id IS NULL;

UPDATE event_assignation a
  JOIN event_event e ON e.client_id = a.client_id
   SET a.event_id = e.event_id
 WHERE a.event_id IS NULL;

SET @sql := (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE event_check_list ADD KEY idx_cl_event (event_id)',
  'DO 0') FROM information_schema.statistics
  WHERE table_schema = @db AND table_name = 'event_check_list' AND index_name = 'idx_cl_event');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

SET @sql := (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE event_assignation ADD KEY idx_as_event (event_id)',
  'DO 0') FROM information_schema.statistics
  WHERE table_schema = @db AND table_name = 'event_assignation' AND index_name = 'idx_as_event');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;
