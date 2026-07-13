-- Database Schema for Indo Smile South Services CRM
-- Created: 2025-12-15

-- ===================================
-- 1. Admin Users Table
-- ===================================
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'staff') DEFAULT 'staff',
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `last_login` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 2. Tours Table
-- ===================================
CREATE TABLE IF NOT EXISTS `tours` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(250) NOT NULL UNIQUE,
  `destination` VARCHAR(100) NOT NULL,
  `type` ENUM('inbound', 'outbound', 'incentive', 'shows') DEFAULT 'inbound',
  `description` TEXT NOT NULL,
  `short_description` VARCHAR(500) NULL,
  `duration_days` INT(11) NOT NULL,
  `duration_nights` INT(11) NOT NULL,
  `duration_label` VARCHAR(50) NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `price_label` VARCHAR(50) NULL,
  `currency` VARCHAR(10) DEFAULT 'THB',
  `rating` DECIMAL(2, 1) DEFAULT 0.0,
  `review_count` INT(11) DEFAULT 0,
  `is_featured` TINYINT(1) DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `max_participants` INT(11) NULL,
  `min_participants` INT(11) DEFAULT 1,
  `difficulty_level` ENUM('easy', 'moderate', 'challenging', 'expert') DEFAULT 'easy',
  `main_image` TEXT NULL,
  `gallery_images` TEXT NULL COMMENT 'JSON array of image URLs',
  `highlights` TEXT NULL COMMENT 'JSON array of highlights',
  `included` TEXT NULL COMMENT 'JSON array of included items',
  `not_included` TEXT NULL COMMENT 'JSON array of not included items',
  `itinerary` TEXT NULL COMMENT 'JSON array of itinerary details',
  `terms_conditions` TEXT NULL,
  `cancellation_policy` TEXT NULL,
  `created_by` INT(11) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_slug` (`slug`),
  INDEX `idx_type` (`type`),
  INDEX `idx_destination` (`destination`),
  INDEX `idx_is_featured` (`is_featured`),
  INDEX `idx_is_active` (`is_active`),
  FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 3. Tour Images Table (Normalized)
-- ===================================
CREATE TABLE IF NOT EXISTS `tour_images` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tour_id` INT(11) NOT NULL,
  `image_url` TEXT NOT NULL,
  `image_type` ENUM('main', 'gallery', 'thumbnail') DEFAULT 'gallery',
  `sort_order` INT(11) DEFAULT 0,
  `caption` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tour_id` (`tour_id`),
  FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 4. Bookings Table
-- ===================================
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `tour_id` INT(11) NOT NULL,
  `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `travel_date` DATE NOT NULL,
  `number_of_guests` INT(11) NOT NULL DEFAULT 1,
  `adults` INT(11) DEFAULT 1,
  `children` INT(11) DEFAULT 0,
  `special_requests` TEXT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'THB',
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'refunded') DEFAULT 'pending',
  `payment_status` ENUM('unpaid', 'partial', 'paid', 'refunded') DEFAULT 'unpaid',
  `payment_method` VARCHAR(50) NULL,
  `payment_date` DATETIME NULL,
  `notes` TEXT NULL COMMENT 'Internal notes from admin',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `confirmed_by` INT(11) NULL,
  `confirmed_at` DATETIME NULL,
  `cancelled_at` DATETIME NULL,
  `cancellation_reason` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_booking_reference` (`booking_reference`),
  INDEX `idx_tour_id` (`tour_id`),
  INDEX `idx_customer_email` (`customer_email`),
  INDEX `idx_travel_date` (`travel_date`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`),
  FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`confirmed_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 5. Customers Table (Optional - for repeat customers)
-- ===================================
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `country` VARCHAR(100) NULL,
  `total_bookings` INT(11) DEFAULT 0,
  `total_spent` DECIMAL(10, 2) DEFAULT 0.00,
  `last_booking_date` DATE NULL,
  `notes` TEXT NULL,
  `status` ENUM('active', 'blocked') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 6. Booking Activity Log Table
-- ===================================
CREATE TABLE IF NOT EXISTS `booking_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `booking_id` INT(11) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `old_status` VARCHAR(50) NULL,
  `new_status` VARCHAR(50) NULL,
  `description` TEXT NULL,
  `performed_by` INT(11) NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_booking_id` (`booking_id`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`performed_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 7. Settings Table (System configurations)
-- ===================================
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NULL,
  `setting_type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  `description` VARCHAR(255) NULL,
  `updated_by` INT(11) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_setting_key` (`setting_key`),
  FOREIGN KEY (`updated_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- Insert Default Admin User
-- ===================================
-- Password: admin123 (hashed with PASSWORD function, you should change this!)
INSERT INTO `admin_users` (`username`, `email`, `password`, `full_name`, `role`, `status`)
VALUES ('admin', 'admin@indosmilesouthservices.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'super_admin', 'active')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- ===================================
-- Insert Default Settings
-- ===================================
INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('site_name', 'Indo Smile South Services', 'string', 'Website name'),
('site_email', 'info@indosmilesouthservices.com', 'string', 'Contact email'),
('site_phone', '+66 XX XXX XXXX', 'string', 'Contact phone'),
('site_address', '199/100 Moo 9, Thepkrasattri, Thalang, Phuket 83110', 'string', 'Office address'),
('currency_default', 'THB', 'string', 'Default currency'),
('booking_confirmation_auto', '0', 'boolean', 'Auto-confirm bookings'),
('email_notifications_enabled', '1', 'boolean', 'Enable email notifications'),
('social_facebook', '', 'string', 'Facebook page URL'),
('social_instagram', '', 'string', 'Instagram page URL'),
('social_line', '', 'string', 'LINE Official Account URL'),
('social_whatsapp', '', 'string', 'WhatsApp link')
ON DUPLICATE KEY UPDATE `setting_key` = `setting_key`;

-- ===================================
-- Sample Tours Data (from current React app)
-- ===================================
INSERT INTO `tours` (
  `name`, `slug`, `destination`, `type`, `description`, `short_description`,
  `duration_days`, `duration_nights`, `duration_label`, `price`, `price_label`,
  `rating`, `review_count`, `is_featured`, `is_active`, `main_image`,
  `highlights`, `included`, `not_included`
) VALUES
(
  'Phuket Island Hopping',
  'phuket-island-hopping',
  'Phuket',
  'inbound',
  'Experience the stunning beauty of Phuket islands with our exclusive island hopping tour. Visit pristine beaches, snorkel in crystal-clear waters, and enjoy authentic Thai cuisine.',
  'Explore pristine beaches and crystal-clear waters',
  3,
  2,
  '3 Days / 2 Nights',
  15000.00,
  '15,000 THB',
  4.8,
  124,
  1,
  1,
  'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
  '["Phi Phi Islands", "Snorkeling", "Beach BBQ", "Sunset Cruise"]',
  '["Hotel accommodation", "All meals", "Speed boat transfers", "Snorkeling equipment", "Professional guide", "Travel insurance"]',
  '["International flights", "Personal expenses", "Tips", "Alcoholic beverages"]'
),
(
  'Krabi Adventure',
  'krabi-adventure',
  'Krabi',
  'inbound',
  'Discover the breathtaking landscapes of Krabi, featuring stunning limestone cliffs, emerald pools, and pristine beaches.',
  'Limestone cliffs and emerald pools adventure',
  4,
  3,
  '4 Days / 3 Nights',
  18000.00,
  '18,000 THB',
  4.9,
  98,
  1,
  1,
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
  '["Rock Climbing", "Kayaking", "Hot Springs", "Tiger Cave Temple"]',
  '["3-star hotel", "Breakfast daily", "All activities", "Transportation", "English guide"]',
  '["Lunch & Dinner", "Travel insurance", "Personal expenses"]'
),
(
  'Cultural Phuket Tour',
  'cultural-phuket-tour',
  'Phuket',
  'inbound',
  'Immerse yourself in Phuket rich culture and heritage. Visit ancient temples, local markets, and experience authentic Thai traditions.',
  'Temples, markets, and Thai traditions',
  2,
  1,
  '2 Days / 1 Night',
  8000.00,
  '8,000 THB',
  4.6,
  87,
  0,
  1,
  'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=800&q=80',
  '["Wat Chalong Temple", "Old Phuket Town", "Local Market", "Thai Cooking Class"]',
  '["Hotel stay", "Breakfast", "Temple entrance fees", "Cooking class", "Guide"]',
  '["Lunch & Dinner", "Shopping", "Tips"]'
),
(
  'Bangkok City Explorer',
  'bangkok-city-explorer',
  'Bangkok',
  'inbound',
  'Explore Thailand vibrant capital city. Visit grand palaces, floating markets, and experience the bustling street life of Bangkok.',
  'Grand palaces and vibrant street life',
  3,
  2,
  '3 Days / 2 Nights',
  12000.00,
  '12,000 THB',
  4.7,
  156,
  1,
  1,
  'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
  '["Grand Palace", "Floating Market", "Wat Arun", "Night Market"]',
  '["Hotel accommodation", "Daily breakfast", "All entrance fees", "Private transfers", "Guide"]',
  '["Meals not mentioned", "Shopping", "Personal expenses"]'
),
(
  'Chiang Mai Highland',
  'chiang-mai-highland',
  'Chiang Mai',
  'inbound',
  'Journey through the mountains of Northern Thailand. Visit hill tribe villages, elephant sanctuaries, and ancient temples.',
  'Mountains, elephants, and hill tribes',
  5,
  4,
  '5 Days / 4 Nights',
  22000.00,
  '22,000 THB',
  4.9,
  143,
  1,
  1,
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
  '["Elephant Sanctuary", "Doi Suthep Temple", "Hill Tribe Villages", "Bamboo Rafting"]',
  '["4-star hotel", "All meals", "Activities", "4WD transport", "Guide", "Insurance"]',
  '["Flights", "Tips", "Personal shopping"]'
),
(
  'Ayutthaya Heritage',
  'ayutthaya-heritage',
  'Ayutthaya',
  'inbound',
  'Step back in time to explore the ancient capital of Siam. Visit UNESCO World Heritage temples and ruins.',
  'UNESCO temples and ancient ruins',
  1,
  0,
  '1 Day',
  4500.00,
  '4,500 THB',
  4.5,
  76,
  0,
  1,
  'https://images.unsplash.com/photo-1563492065120-f9ab7c5bb2af?auto=format&fit=crop&w=800&q=80',
  '["Wat Mahathat", "Wat Phra Si Sanphet", "Bang Pa-In Palace", "River Cruise"]',
  '["Round-trip transport", "Lunch", "All entrance fees", "Guide"]',
  '["Personal expenses", "Tips", "Drinks"]'
),
(
  'Pattaya Beach Escape',
  'pattaya-beach-escape',
  'Pattaya',
  'inbound',
  'Relax and unwind at Pattaya beautiful beaches. Enjoy water sports, vibrant nightlife, and fresh seafood.',
  'Beach relaxation and water sports',
  2,
  1,
  '2 Days / 1 Night',
  9500.00,
  '9,500 THB',
  4.4,
  92,
  0,
  1,
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80',
  '["Beach Activities", "Water Sports", "Seafood Dinner", "Shopping"]',
  '["Beach resort stay", "Breakfast", "Beach transfers", "Welcome drink"]',
  '["Meals", "Water sports", "Shopping", "Tips"]'
),
(
  'Koh Samui Luxury',
  'koh-samui-luxury',
  'Koh Samui',
  'inbound',
  'Indulge in luxury at Koh Samui. Stay at 5-star resorts, enjoy spa treatments, and experience world-class dining.',
  'Luxury resorts and spa experiences',
  5,
  4,
  '5 Days / 4 Nights',
  28000.00,
  '28,000 THB',
  5.0,
  67,
  1,
  1,
  'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
  '["5-Star Resort", "Spa Treatment", "Private Beach", "Fine Dining"]',
  '["Luxury villa", "All meals", "Spa sessions", "Private transfers", "Butler service", "Airport transfers"]',
  '["Flights", "Alcoholic drinks", "Personal shopping"]'
);

-- End of schema

-- ===================================
-- 8. Transfers Table
-- ===================================
CREATE TABLE IF NOT EXISTS `transfers` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `origin` VARCHAR(150) NOT NULL,
  `destination` VARCHAR(150) NOT NULL,
  `vehicle_name` VARCHAR(150) NOT NULL,
  `max_passengers` INT(11) DEFAULT 1,
  `price` DECIMAL(10, 2) NOT NULL,
  `image_url` TEXT NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_origin_dest` (`origin`, `destination`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 9. Transfer Page Gallery (stored in settings as JSON)
-- ===================================
-- Gallery images for the "Our Services in Action" section on the Transfer page.
-- Managed via Admin Panel > Transfers > Page Gallery.
-- Format: JSON array of {src, alt} objects.
INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('transfer_gallery', '[{"src":"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80","alt":"VIP Van Transfer"},{"src":"https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80","alt":"Luxury Coach Service"},{"src":"https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80","alt":"Airport Transfer"},{"src":"https://images.unsplash.com/photo-1549317661-a47734bbd828?w=600&q=80","alt":"Private Sedan"},{"src":"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80","alt":"Airport Pickup Service"},{"src":"https://images.unsplash.com/photo-1609520505218-7421df70a75b?w=600&q=80","alt":"Group Transfer"}]', 'json', 'Transfer page gallery images (JSON array of {src, alt})')
ON DUPLICATE KEY UPDATE `setting_key` = `setting_key`;
