-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 01, 2026 at 09:26 AM
-- Server version: 10.6.22-MariaDB-log
-- PHP Version: 8.4.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sevensmile_indosmile`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('super_admin','admin','staff') DEFAULT 'staff',
  `status` enum('active','inactive') DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password`, `full_name`, `role`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@indosmilesouthservices.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'super_admin', 'active', '2026-04-01 09:24:52', '2025-12-15 09:23:02', '2026-04-01 02:24:52');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `tour_id` int(11) NOT NULL,
  `booking_reference` varchar(50) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `customer_email` varchar(100) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `travel_date` date NOT NULL,
  `number_of_guests` int(11) NOT NULL DEFAULT 1,
  `adults` int(11) DEFAULT 1,
  `children` int(11) DEFAULT 0,
  `special_requests` text DEFAULT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'THB',
  `status` enum('pending','confirmed','cancelled','completed','refunded') DEFAULT 'pending',
  `payment_status` enum('unpaid','partial','paid','refunded') DEFAULT 'unpaid',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL COMMENT 'Internal notes from admin',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `confirmed_by` int(11) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking_logs`
--

CREATE TABLE `booking_logs` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `performed_by` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `total_bookings` int(11) DEFAULT 0,
  `total_spent` decimal(10,2) DEFAULT 0.00,
  `last_booking_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','blocked') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` varchar(255) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES
(1, 'site_name', 'Indo Smile South Services', 'string', 'Website name', NULL, '2025-12-15 09:23:02'),
(2, 'site_email', 'info@indosmilesouthservices.com', 'string', 'Contact email', NULL, '2025-12-15 09:23:02'),
(3, 'site_phone', '+66 XX XXX XXXX', 'string', 'Contact phone', NULL, '2025-12-15 09:23:02'),
(4, 'currency_default', 'THB', 'string', 'Default currency', NULL, '2025-12-15 09:23:02'),
(5, 'booking_confirmation_auto', '0', 'boolean', 'Auto-confirm bookings', NULL, '2025-12-15 09:23:02'),
(6, 'email_notifications_enabled', '1', 'boolean', 'Enable email notifications', NULL, '2025-12-15 09:23:02');

-- --------------------------------------------------------

--
-- Table structure for table `tours`
--

CREATE TABLE `tours` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(250) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `type` enum('inbound','outbound','incentive') DEFAULT 'inbound',
  `description` text NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `duration_days` int(11) NOT NULL,
  `duration_nights` int(11) NOT NULL,
  `duration_label` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `price_label` varchar(50) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'THB',
  `rating` decimal(2,1) DEFAULT 0.0,
  `review_count` int(11) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `max_participants` int(11) DEFAULT NULL,
  `min_participants` int(11) DEFAULT 1,
  `difficulty_level` enum('easy','moderate','challenging','expert') DEFAULT 'easy',
  `main_image` text DEFAULT NULL,
  `gallery_images` text DEFAULT NULL COMMENT 'JSON array of image URLs',
  `highlights` text DEFAULT NULL COMMENT 'JSON array of highlights',
  `included` text DEFAULT NULL COMMENT 'JSON array of included items',
  `not_included` text DEFAULT NULL COMMENT 'JSON array of not included items',
  `itinerary` text DEFAULT NULL COMMENT 'JSON array of itinerary details',
  `terms_conditions` text DEFAULT NULL,
  `cancellation_policy` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tours`
--

INSERT INTO `tours` (`id`, `name`, `slug`, `destination`, `type`, `description`, `short_description`, `duration_days`, `duration_nights`, `duration_label`, `price`, `price_label`, `currency`, `rating`, `review_count`, `is_featured`, `is_active`, `max_participants`, `min_participants`, `difficulty_level`, `main_image`, `gallery_images`, `highlights`, `included`, `not_included`, `itinerary`, `terms_conditions`, `cancellation_policy`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Phuket Island Hopping', 'phuket-island-hopping', 'Phuket', 'inbound', 'Experience the stunning beauty of Phuket islands with our exclusive island hopping tour. Visit pristine beaches, snorkel in crystal-clear waters, and enjoy authentic Thai cuisine.', 'Explore pristine beaches and crystal-clear waters', 3, 2, '3 Days / 2 Nights', 15000.00, '15,000 THB', 'THB', 4.8, 124, 1, 1, NULL, 1, 'easy', 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80', NULL, '[\"Phi Phi Islands\", \"Snorkeling\", \"Beach BBQ\", \"Sunset Cruise\"]', '[\"Hotel accommodation\", \"All meals\", \"Speed boat transfers\", \"Snorkeling equipment\", \"Professional guide\", \"Travel insurance\"]', '[\"International flights\", \"Personal expenses\", \"Tips\", \"Alcoholic beverages\"]', NULL, NULL, NULL, NULL, '2025-12-15 09:23:02', '2025-12-15 09:23:02'),
(2, 'Krabi Adventure', 'krabi-adventure', 'Krabi', 'inbound', 'Discover the breathtaking landscapes of Krabi, featuring stunning limestone cliffs, emerald pools, and pristine beaches.', 'Limestone cliffs and emerald pools adventure', 4, 3, '4 Days / 3 Nights', 18000.00, '18,000 THB', 'THB', 4.9, 98, 1, 1, NULL, 1, 'easy', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80', NULL, '[\"Rock Climbing\", \"Kayaking\", \"Hot Springs\", \"Tiger Cave Temple\"]', '[\"3-star hotel\", \"Breakfast daily\", \"All activities\", \"Transportation\", \"English guide\"]', '[\"Lunch & Dinner\", \"Travel insurance\", \"Personal expenses\"]', NULL, NULL, NULL, NULL, '2025-12-15 09:23:02', '2025-12-15 09:23:02'),
(3, 'Cultural Phuket Tour', 'cultural-phuket-tour', 'Phuket', 'inbound', 'Immerse yourself in Phuket rich culture and heritage. Visit ancient temples, local markets, and experience authentic Thai traditions.', 'Temples, markets, and Thai traditions', 2, 1, '2 Days / 1 Night', 8000.00, '8,000 THB', 'THB', 4.6, 87, 0, 1, NULL, 1, 'easy', 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=800&q=80', NULL, '[\"Wat Chalong Temple\", \"Old Phuket Town\", \"Local Market\", \"Thai Cooking Class\"]', '[\"Hotel stay\", \"Breakfast\", \"Temple entrance fees\", \"Cooking class\", \"Guide\"]', '[\"Lunch & Dinner\", \"Shopping\", \"Tips\"]', NULL, NULL, NULL, NULL, '2025-12-15 09:23:02', '2025-12-15 09:23:02'),
(4, 'Bangkok City Explorer', 'bangkok-city-explorer', 'Bangkok', 'inbound', 'Explore Thailand vibrant capital city. Visit grand palaces, floating markets, and experience the bustling street life of Bangkok.', 'Grand palaces and vibrant street life', 3, 2, '3 Days / 2 Nights', 12000.00, '12,000 THB', 'THB', 4.7, 156, 1, 1, NULL, 1, 'easy', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', NULL, '[\"Grand Palace\", \"Floating Market\", \"Wat Arun\", \"Night Market\"]', '[\"Hotel accommodation\", \"Daily breakfast\", \"All entrance fees\", \"Private transfers\", \"Guide\"]', '[\"Meals not mentioned\", \"Shopping\", \"Personal expenses\"]', NULL, NULL, NULL, NULL, '2025-12-15 09:23:02', '2025-12-15 09:23:02'),
(5, 'Chiang Mai Highland', 'chiang-mai-highland', 'Chiang Mai', 'inbound', 'Journey through the mountains of Northern Thailand. Visit hill tribe villages, elephant sanctuaries, and ancient temples.', 'Mountains, elephants, and hill tribes', 5, 4, '5 Days / 4 Nights', 22000.00, '22,000 THB', 'THB', 4.9, 143, 1, 1, NULL, 1, 'easy', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80', NULL, '[\"Elephant Sanctuary\", \"Doi Suthep Temple\", \"Hill Tribe Villages\", \"Bamboo Rafting\"]', '[\"4-star hotel\", \"All meals\", \"Activities\", \"4WD transport\", \"Guide\", \"Insurance\"]', '[\"Flights\", \"Tips\", \"Personal shopping\"]', NULL, NULL, NULL, NULL, '2025-12-15 09:23:02', '2025-12-15 09:23:02'),
(6, 'Ayutthaya Heritage', 'ayutthaya-heritage', 'Ayutthaya', 'inbound', 'Step back in time to explore the ancient capital of Siam. Visit UNESCO World Heritage temples and ruins.', 'UNESCO temples and ancient ruins', 1, 0, '1 Day', 4500.00, '4,500 THB', 'THB', 4.5, 76, 0, 1, NULL, 1, 'easy', 'https://images.unsplash.com/photo-1563492065120-f9ab7c5bb2af?auto=format&fit=crop&w=800&q=80', NULL, '[\"Wat Mahathat\", \"Wat Phra Si Sanphet\", \"Bang Pa-In Palace\", \"River Cruise\"]', '[\"Round-trip transport\", \"Lunch\", \"All entrance fees\", \"Guide\"]', '[\"Personal expenses\", \"Tips\", \"Drinks\"]', NULL, NULL, NULL, NULL, '2025-12-15 09:23:02', '2025-12-15 09:23:02'),
(7, 'Pattaya Beach Escape', 'pattaya-beach-escape', 'Pattaya', 'inbound', 'Relax and unwind at Pattaya beautiful beaches. Enjoy water sports, vibrant nightlife, and fresh seafood.', 'Beach relaxation and water sports', 2, 1, '2 Days / 1 Night', 9500.00, '9,500 THB', 'THB', 4.4, 92, 0, 1, NULL, 1, 'easy', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80', NULL, '[\"Beach Activities\", \"Water Sports\", \"Seafood Dinner\", \"Shopping\"]', '[\"Beach resort stay\", \"Breakfast\", \"Beach transfers\", \"Welcome drink\"]', '[\"Meals\", \"Water sports\", \"Shopping\", \"Tips\"]', NULL, NULL, NULL, NULL, '2025-12-15 09:23:02', '2025-12-15 09:23:02'),
(8, 'Koh Samui Luxury', 'koh-samui-luxury', 'Koh Samui', 'inbound', 'Indulge in luxury at Koh Samui. Stay at 5-star resorts, enjoy spa treatments, and experience world-class dining.', 'Luxury resorts and spa experiences', 5, 4, '5 Days / 4 Nights', 28000.00, '28,000 THB', 'THB', 5.0, 67, 1, 1, NULL, 1, 'easy', 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80', NULL, '[\"5-Star Resort\", \"Spa Treatment\", \"Private Beach\", \"Fine Dining\"]', '[\"Luxury villa\", \"All meals\", \"Spa sessions\", \"Private transfers\", \"Butler service\", \"Airport transfers\"]', '[\"Flights\", \"Alcoholic drinks\", \"Personal shopping\"]', NULL, NULL, NULL, NULL, '2025-12-15 09:23:02', '2025-12-15 09:23:02');

-- --------------------------------------------------------

--
-- Table structure for table `tour_images`
--

CREATE TABLE `tour_images` (
  `id` int(11) NOT NULL,
  `tour_id` int(11) NOT NULL,
  `image_url` text NOT NULL,
  `image_type` enum('main','gallery','thumbnail') DEFAULT 'gallery',
  `sort_order` int(11) DEFAULT 0,
  `caption` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_reference` (`booking_reference`),
  ADD KEY `idx_booking_reference` (`booking_reference`),
  ADD KEY `idx_tour_id` (`tour_id`),
  ADD KEY `idx_customer_email` (`customer_email`),
  ADD KEY `idx_travel_date` (`travel_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `confirmed_by` (`confirmed_by`);

--
-- Indexes for table `booking_logs`
--
ALTER TABLE `booking_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `performed_by` (`performed_by`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `tours`
--
ALTER TABLE `tours`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_destination` (`destination`),
  ADD KEY `idx_is_featured` (`is_featured`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `tour_images`
--
ALTER TABLE `tour_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tour_id` (`tour_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking_logs`
--
ALTER TABLE `booking_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tours`
--
ALTER TABLE `tours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tour_images`
--
ALTER TABLE `tour_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`confirmed_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `booking_logs`
--
ALTER TABLE `booking_logs`
  ADD CONSTRAINT `booking_logs_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_logs_ibfk_2` FOREIGN KEY (`performed_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `settings`
--
ALTER TABLE `settings`
  ADD CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tours`
--
ALTER TABLE `tours`
  ADD CONSTRAINT `tours_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tour_images`
--
ALTER TABLE `tour_images`
  ADD CONSTRAINT `tour_images_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
