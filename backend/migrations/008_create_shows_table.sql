-- Migration 008: Create shows table for Shows & Adventures
-- Splits Shows & Adventures out of the `tours` table into its own `shows` table.
-- Adds show-specific fields: venue, show_times, seat_zones.

-- 1. Remove any leftover rows that were tagged as shows in tours (no production data)
DELETE FROM `tours` WHERE `type` = 'shows';

-- 2. Revert tours.type enum (drop 'shows')
ALTER TABLE `tours`
    MODIFY `type` ENUM('inbound','outbound','incentive') DEFAULT 'inbound';

-- 3. Create shows table
CREATE TABLE IF NOT EXISTS `shows` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(250) NOT NULL UNIQUE,
  `destination` VARCHAR(100) NOT NULL,
  `venue` VARCHAR(255) NULL,
  `description` TEXT NOT NULL,
  `short_description` VARCHAR(500) NULL,
  `duration_days` INT(11) NOT NULL DEFAULT 1,
  `duration_nights` INT(11) NOT NULL DEFAULT 0,
  `duration_label` VARCHAR(50) NULL,
  `adult_price` DECIMAL(10, 2) NOT NULL,
  `child_price` DECIMAL(10, 2) DEFAULT NULL,
  `currency` VARCHAR(10) DEFAULT 'THB',
  `rating` DECIMAL(2, 1) DEFAULT 0.0,
  `review_count` INT(11) DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `max_participants` INT(11) NULL,
  `min_participants` INT(11) DEFAULT 1,
  `main_image` TEXT NULL,
  `gallery_images` TEXT NULL COMMENT 'JSON array of image URLs',
  `highlights` TEXT NULL COMMENT 'JSON array of highlights',
  `included` TEXT NULL COMMENT 'JSON array of included items',
  `not_included` TEXT NULL COMMENT 'JSON array of not included items',
  `show_times` TEXT NULL COMMENT 'JSON array of showtime strings (e.g. ["18:00","20:30"])',
  `seat_zones` TEXT NULL COMMENT 'JSON array of {name, price, capacity}',
  `pickup_time` VARCHAR(50) NULL,
  `pickup_location` VARCHAR(255) NULL,
  `dropoff_time` VARCHAR(50) NULL,
  `dropoff_location` VARCHAR(255) NULL,
  `meal_info` VARCHAR(255) NULL,
  `transfer_info` VARCHAR(255) NULL,
  `what_to_bring` TEXT NULL COMMENT 'JSON array of items to bring',
  `important_notes` TEXT NULL,
  `terms_conditions` TEXT NULL,
  `cancellation_policy` TEXT NULL,
  `created_by` INT(11) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_destination` (`destination`),
  INDEX `idx_is_featured` (`is_featured`),
  INDEX `idx_is_active` (`is_active`),
  FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
