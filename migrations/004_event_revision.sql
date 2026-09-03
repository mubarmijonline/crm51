-- Every auto-saved change, so it can be shown and stepped back.
--
-- Saves used to be explicit and each one required a note, which was the audit
-- trail. Now that a change saves itself the moment you make it, the trail has
-- to live somewhere that does not depend on someone typing prose: one row per
-- field change, holding what it was and what it became.
--
-- `undone` marks a revision that has been stepped back, rather than deleting
-- it, so the history still shows that the change happened and was reverted.

CREATE TABLE IF NOT EXISTS event_revision (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  event_id   BIGINT       NULL,             -- null for a change to the client
  client_id  BIGINT       NOT NULL,
  field      VARCHAR(64)  NOT NULL,
  old_value  TEXT,
  new_value  TEXT,
  changed_by VARCHAR(64)  NOT NULL,
  changed_at DATETIME     NOT NULL,
  undone     TINYINT(1)   NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_rev_event  (event_id, id),
  KEY idx_rev_client (client_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
