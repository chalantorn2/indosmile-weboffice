-- Migration 003: Create Hotels Tables
-- Created: 2026-04-03

-- ===================================
-- 1. Hotels Table
-- ===================================
CREATE TABLE IF NOT EXISTS `hotels` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(250) NOT NULL UNIQUE,
  `destination` VARCHAR(100) NOT NULL,
  `stars` TINYINT(1) NOT NULL DEFAULT 4,
  `description` TEXT NOT NULL,
  `short_description` VARCHAR(500) NULL,
  `rating` DECIMAL(2, 1) DEFAULT 0.0,
  `review_count` INT(11) DEFAULT 0,
  `main_image` TEXT NULL,
  `amenities` TEXT NULL COMMENT 'JSON array of amenities',
  `check_in_time` VARCHAR(20) NULL,
  `check_out_time` VARCHAR(20) NULL,
  `address` TEXT NULL,
  `contact_phone` VARCHAR(50) NULL,
  `contact_email` VARCHAR(100) NULL,
  `website` VARCHAR(255) NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` INT(11) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_destination` (`destination`),
  INDEX `idx_stars` (`stars`),
  INDEX `idx_is_featured` (`is_featured`),
  INDEX `idx_is_active` (`is_active`),
  FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 2. Hotel Images Table
-- ===================================
CREATE TABLE IF NOT EXISTS `hotel_images` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `hotel_id` INT(11) NOT NULL,
  `image_url` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'other',
  `caption` VARCHAR(255) NULL,
  `sort_order` INT(11) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_hotel_id` (`hotel_id`),
  INDEX `idx_category` (`category`),
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 3. Hotel Room Types Table
-- ===================================
CREATE TABLE IF NOT EXISTS `hotel_room_types` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `hotel_id` INT(11) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `max_guests` INT(11) DEFAULT 2,
  `bed_type` VARCHAR(50) NULL,
  `room_size` DECIMAL(6, 1) NULL COMMENT 'Size in square meters',
  `amenities` TEXT NULL COMMENT 'JSON array of room-specific amenities',
  `sort_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_hotel_id` (`hotel_id`),
  FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
