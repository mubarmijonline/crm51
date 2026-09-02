-- event_assignation's primary key was (client_id, user_id), so a person could
-- be assigned to a client exactly once. That was fine when a client had one
-- lead; now a client has many events and the same person may well own two of
-- them, which the old key rejected as a duplicate:
--   Duplicate entry '131-1' for key 'event_assignation.PRIMARY'
--
-- `id` becomes the primary key, and the real rule - one row per person per
-- event - becomes its own unique constraint.
--
-- Order matters: MySQL will not drop the unique index on `id` while that is
-- the only key on the auto-increment column, so the new primary key goes on
-- first.
ALTER TABLE event_assignation ADD PRIMARY KEY (`id`);
ALTER TABLE event_assignation DROP INDEX `id`;
ALTER TABLE event_assignation ADD UNIQUE KEY uq_event_user (`event_id`, `user_id`);
