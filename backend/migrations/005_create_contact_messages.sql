-- Migration: Create contact_messages table
-- Created: 2026-04-11

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('unread', 'read', 'replied', 'archived') DEFAULT 'unread',
  `admin_notes` TEXT NULL COMMENT 'Internal notes from admin',
  `replied_by` INT(11) NULL,
  `replied_at` DATETIME NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_email` (`email`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`replied_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
