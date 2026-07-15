-- Add infant tracking to tour bookings.
-- Infants travel free and are NOT counted in `number_of_guests`.
-- Run once against the live database.

ALTER TABLE `bookings`
  ADD COLUMN `infants` INT(11) DEFAULT 0 AFTER `children`;
