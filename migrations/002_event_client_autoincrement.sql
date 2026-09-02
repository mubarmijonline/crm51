-- event_client.client_id was created as a plain BIGINT so the existing ids
-- could be carried across from event_leads unchanged. That left new clients
-- with no id to use: "Field 'client_id' doesn't have a default value".
--
-- The foreign key has to come off first: MySQL will not alter a column that a
-- constraint points at, even when the type is unchanged.
ALTER TABLE event_event DROP FOREIGN KEY fk_event_client;
ALTER TABLE event_client MODIFY client_id BIGINT NOT NULL AUTO_INCREMENT;
ALTER TABLE event_event
  ADD CONSTRAINT fk_event_client FOREIGN KEY (client_id)
  REFERENCES event_client (client_id) ON DELETE CASCADE;
