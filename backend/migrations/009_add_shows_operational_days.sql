-- Migration 009: Add operational_days to shows table
-- Stores JSON array of weekday keys: ["mon","tue","wed","thu","fri","sat","sun"]
-- Replaces the unused tour-style "itinerary" concept for Shows & Adventures.

ALTER TABLE `shows`
    ADD COLUMN `operational_days` TEXT NULL COMMENT 'JSON array of weekday keys (mon,tue,wed,thu,fri,sat,sun)' AFTER `seat_zones`;

-- Backfill the two sample shows that were seeded by 008a
UPDATE `shows`
   SET `operational_days` = '["mon","wed","sat"]'
 WHERE `slug` = 'carnival-magic';

UPDATE `shows`
   SET `operational_days` = '["tue","fri","sun"]'
 WHERE `slug` = 'phuket-fantasea';
