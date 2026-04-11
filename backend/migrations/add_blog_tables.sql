-- ===================================
-- Blog System Migration
-- Database: sevensmile_indosmile
-- Created: 2026-04-06
-- ===================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ===================================
-- 1. Blog Categories Table
-- ===================================
CREATE TABLE IF NOT EXISTS `blog_categories` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` VARCHAR(500) NULL,
  `color` VARCHAR(7) DEFAULT '#010048',
  `sort_order` INT(11) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 2. Blog Posts Table
-- ===================================
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(300) NOT NULL,
  `slug` VARCHAR(350) NOT NULL UNIQUE,
  `category_id` INT(11) NULL,
  `excerpt` VARCHAR(500) NULL,
  `content` LONGTEXT NOT NULL,
  `cover_image` TEXT NULL,
  `gallery_images` TEXT NULL COMMENT 'JSON array of image URLs',
  `tags` TEXT NULL COMMENT 'JSON array of tags',
  `author_id` INT(11) NULL,
  `author_name` VARCHAR(100) NULL,
  `status` ENUM('draft','published','archived') DEFAULT 'draft',
  `is_featured` TINYINT(1) DEFAULT 0,
  `views` INT(11) DEFAULT 0,
  `reading_time` INT(11) DEFAULT 0,
  `meta_title` VARCHAR(200) NULL,
  `meta_description` VARCHAR(500) NULL,
  `published_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_is_featured` (`is_featured`),
  INDEX `idx_published_at` (`published_at`),
  FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`author_id`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 3. Blog Related Posts Table (Many-to-Many)
-- ===================================
CREATE TABLE IF NOT EXISTS `blog_related_posts` (
  `post_id` INT(11) NOT NULL,
  `related_post_id` INT(11) NOT NULL,
  PRIMARY KEY (`post_id`, `related_post_id`),
  FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`related_post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- Insert Default Blog Categories
-- ===================================
INSERT INTO `blog_categories` (`name`, `slug`, `description`, `color`, `sort_order`) VALUES
('Travel Tips', 'travel-tips', 'Helpful tips and advice for travelers visiting Thailand', '#4F46E5', 1),
('Destination Guides', 'destination-guides', 'In-depth guides to popular destinations across Thailand', '#059669', 2),
('Company News', 'company-news', 'Latest news and updates from Indo Smile South Services', '#D97706', 3),
('Culture & Food', 'culture-food', 'Explore Thai culture, traditions, and cuisine', '#DC2626', 4),
('Travel Stories', 'travel-stories', 'Real stories and experiences from our travelers', '#7C3AED', 5)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- End of Blog Migration
