-- A draft calendar per client, kept apart from the real room calendar.
--
-- The real calendar (`appointment`) is 7740 rows scoped only by room, with no
-- idea which client a booking is for. Drafts are the pencilled-in dates you
-- work through with a client before anything is committed: they live in their
-- own table, never appear on /calendar and never hold a room, so they cannot
-- clash with a real booking or with each other.
--
-- Confirming a draft is what crosses the line - it checks the room, writes a
-- real appointment, and records which appointment it became.

CREATE TABLE IF NOT EXISTS event_draft_appointment (
  draft_id       BIGINT       NOT NULL AUTO_INCREMENT,
  client_id      BIGINT       NOT NULL,
  event_id       BIGINT       NULL,          -- which event it is for, once known
  title          VARCHAR(120) NOT NULL,
  room           VARCHAR(20)  NULL,          -- a preference until confirmed
  start          VARCHAR(50)  NOT NULL,      -- same "YYYY-MM-DDTHH:MM" the real table uses
  end            VARCHAR(50)  NOT NULL,
  notes          VARCHAR(500) NULL,
  status         VARCHAR(16)  NOT NULL DEFAULT 'draft',   -- draft | confirmed
  appointment_id INT          NULL,          -- set when it becomes a real booking
  created_by     VARCHAR(64)  NOT NULL,
  created_at     DATETIME     NOT NULL,
  PRIMARY KEY (draft_id),
  KEY idx_draft_client (client_id),
  KEY idx_draft_event  (event_id),
  CONSTRAINT fk_draft_client FOREIGN KEY (client_id)
    REFERENCES event_client (client_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- The real calendar gains a nullable link back, so an event can list the
-- bookings that came from it. Existing rows keep NULL and behave exactly as
-- they did; nothing reads these columns unless they are set.
SET @db := DATABASE();

SET @sql := (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE appointment ADD COLUMN client_id BIGINT NULL',
  'DO 0') FROM information_schema.columns
  WHERE table_schema = @db AND table_name = 'appointment' AND column_name = 'client_id');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

SET @sql := (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE appointment ADD COLUMN event_id BIGINT NULL',
  'DO 0') FROM information_schema.columns
  WHERE table_schema = @db AND table_name = 'appointment' AND column_name = 'event_id');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;

SET @sql := (SELECT IF(COUNT(*) = 0,
  'ALTER TABLE appointment ADD KEY idx_appt_event (event_id)',
  'DO 0') FROM information_schema.statistics
  WHERE table_schema = @db AND table_name = 'appointment' AND index_name = 'idx_appt_event');
PREPARE st FROM @sql; EXECUTE st; DEALLOCATE PREPARE st;
