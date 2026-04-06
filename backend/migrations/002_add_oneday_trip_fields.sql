-- Migration: Add One Day Trip specific fields to tours table
-- Date: 2026-04-02

ALTER TABLE `tours`
  ADD COLUMN `pickup_time` VARCHAR(50) NULL AFTER `cancellation_policy`,
  ADD COLUMN `pickup_location` VARCHAR(255) NULL AFTER `pickup_time`,
  ADD COLUMN `dropoff_time` VARCHAR(50) NULL AFTER `pickup_location`,
  ADD COLUMN `dropoff_location` VARCHAR(255) NULL AFTER `dropoff_time`,
  ADD COLUMN `departure_times` TEXT NULL COMMENT 'JSON array of available departure times' AFTER `dropoff_location`,
  ADD COLUMN `meal_info` VARCHAR(255) NULL AFTER `departure_times`,
  ADD COLUMN `transfer_info` VARCHAR(255) NULL AFTER `meal_info`,
  ADD COLUMN `what_to_bring` TEXT NULL COMMENT 'JSON array of items to bring' AFTER `transfer_info`,
  ADD COLUMN `important_notes` TEXT NULL AFTER `what_to_bring`;
