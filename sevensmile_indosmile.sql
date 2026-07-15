-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 20, 2026 at 11:13 AM
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
  `role` enum('admin','staff') NOT NULL DEFAULT 'staff',
  `status` enum('active','inactive') DEFAULT 'active',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password`, `full_name`, `role`, `status`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@indosmilesouthservices.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'active', '2026-04-10 08:44:58', '2025-12-15 09:23:02', '2026-04-10 01:44:58'),
(2, 'kimaya', 'kimayagnair@indosmilesouthservices.com', '$2y$12$pa/xlvzwi.J3rqCDOJJFWeakkQbYCZc1VAjFfNXyJpIByOsLwH35K', 'Kimaya Gopal Nair', 'admin', 'active', '2026-04-17 09:27:20', '2026-04-03 09:54:51', '2026-04-17 02:27:20'),
(3, 'lay', 'chalantorn2@gmail.com', '$2y$12$53HKB3nwzu9CqP7zBETuY.Uhtgcx1lj1fVIC6vargKZCs7X2WsZwS', 'Chalantorn Manop', 'admin', 'active', '2026-04-20 08:44:13', '2026-04-06 02:40:54', '2026-04-20 01:44:13');

-- --------------------------------------------------------

--
-- Table structure for table `blog_categories`
--

CREATE TABLE `blog_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#010048',
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_categories`
--

INSERT INTO `blog_categories` (`id`, `name`, `slug`, `description`, `color`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Travel Tips', 'travel-tips', 'Helpful tips and advice for travelers visiting Thailand', '#4F46E5', 1, 1, '2026-04-06 03:54:11', '2026-04-06 03:54:11'),
(2, 'Destination Guides', 'destination-guides', 'In-depth guides to popular destinations across Thailand', '#059669', 2, 1, '2026-04-06 03:54:11', '2026-04-06 03:54:11'),
(3, 'Company News', 'company-news', 'Latest news and updates from Indo Smile South Services', '#D97706', 3, 1, '2026-04-06 03:54:11', '2026-04-06 03:54:11'),
(4, 'Culture & Food', 'culture-food', 'Explore Thai culture, traditions, and cuisine', '#DC2626', 4, 1, '2026-04-06 03:54:11', '2026-04-06 03:54:11'),
(5, 'Travel Stories', 'travel-stories', 'Real stories and experiences from our travelers', '#7C3AED', 5, 1, '2026-04-06 03:54:11', '2026-04-06 03:54:11');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `slug` varchar(350) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `excerpt` varchar(500) DEFAULT NULL,
  `content` longtext NOT NULL,
  `cover_image` text DEFAULT NULL,
  `gallery_images` text DEFAULT NULL COMMENT 'JSON array of image URLs',
  `tags` text DEFAULT NULL COMMENT 'JSON array of tags',
  `author_id` int(11) DEFAULT NULL,
  `author_name` varchar(100) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `is_featured` tinyint(1) DEFAULT 0,
  `views` int(11) DEFAULT 0,
  `reading_time` int(11) DEFAULT 0,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` varchar(500) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `slug`, `category_id`, `excerpt`, `content`, `cover_image`, `gallery_images`, `tags`, `author_id`, `author_name`, `status`, `is_featured`, `views`, `reading_time`, `meta_title`, `meta_description`, `published_at`, `created_at`, `updated_at`) VALUES
(1, 'First Time in Phuket: How to Prepare?', 'first-time-in-phuket-travel-guide', 1, 'A guide for travelers planning their first trip to Phuket, covering everything from transportation and accommodation to popular attractions.', '<h2>Complete Phuket Travel Guide</h2><p>\n</p><p>Phuket is the largest island in Thailand, known for its beautiful beaches, delicious food, and a wide range of water activities. This article will help you plan your perfect Phuket trip.</p><p>\n\n</p><h3>1. Best Time to Visit</h3><p>\n</p><p>November to April is the best season to visit, with clear skies, pleasant weather, and calm seas—perfect for all water activities.</p><p>\n\n</p><h3>2. Popular Attractions</h3><p>\n</p><p><br></p><p>\n\n</p><h3>3. Must-Try Food</h3><p>\n</p><p>Don’t miss Phuket Hokkien noodles, O-Aew dessert, Lo Ba, and fresh seafood by the beach.</p><p>\n\n</p><h3>4. Getting Around Phuket</h3><p>\n</p><p>It is recommended to rent a car or motorbike for convenience. Alternatively, you can use Grab or tuk-tuks, but always agree on the price beforehand.</p>', '/backend/uploads/tours/69d33ca8cd3b1_1775451304.jpg', NULL, '[\"Phuket\",\"Phuket travel\",\"travel tips\",\"Thailand\"]', NULL, 'Indo Smile Team', 'published', 1, 32, 1, 'First Time in Phuket: Complete Travel Guide | Indo Smile', 'A complete guide for first-time visitors to Phuket, covering transportation, accommodation, attractions, and must-try food.', '2026-04-01 10:00:00', '2026-04-06 04:07:06', '2026-04-07 08:53:09'),
(2, 'Koh Lipe: The Maldives of Thailand You Must Visit', 'koh-lipe-maldives-of-thailand', 2, 'Discover the beauty of Koh Lipe, a small island in the southern Andaman Sea, often called the Maldives of Thailand.', '<h2>Koh Lipe: Paradise in the Andaman Sea</h2><p>\n</p><p>Koh Lipe is located in Satun Province and is part of Tarutao National Park. With crystal-clear water and soft white sand beaches, it has earned the nickname \"The Maldives of Thailand\".</p><p>\n\n</p><h3>Highlights of Koh Lipe</h3><p>\n</p><p><br></p><p>\n\n</p><h3>Must-Do Activities</h3><p>\n</p><p>Snorkeling at Hin Ngam Island, Adang Island, Rawi Island, and Jabang Island—some of the most beautiful dive spots in Thailand.</p><p>\n\n</p><h3>How to Get There</h3><p>\n</p><p>You can travel by speedboat from Pak Bara Pier in Satun (approximately 1.5 hours) or from Langkawi, Malaysia.</p>', '/backend/uploads/tours/69d33b34d787d_1775450932.jpg', NULL, '[\"Koh Lipe\",\"Satun\",\"Andaman Sea\",\"snorkeling\"]', NULL, 'Indo Smile Team', 'published', 1, 29, 1, 'Koh Lipe Travel Guide: The Maldives of Thailand | Indo Smile', 'Complete Koh Lipe travel guide including attractions, activities, transportation, and accommodation.', '2026-04-03 14:00:00', '2026-04-06 04:07:06', '2026-04-11 09:52:28'),
(3, 'Top 10 Southern Street Foods You Must Try in Hat Yai', 'top-10-street-food-hatyai', 4, 'A list of 10 must-try street foods when visiting Hat Yai, from the famous fried chicken to local milk tea.', '<h2>10 Must-Try Street Foods in Hat Yai</h2><p>\n</p><p>Hat Yai in Songkhla Province is not just a border trade city—it is also a paradise for food lovers. Let’s explore what you must try!</p><p><br></p><p>\n\n</p><h3>1. Hat Yai Fried Chicken</h3><p>\n</p><p>The city’s signature dish—crispy on the outside, juicy inside, served with fried shallots. Famous shops include Je Jim Fried Chicken.</p><p>\n\n</p><h3>2. Chicken Biryani</h3><p>\n</p><p>Southern-style biryani rice with fragrant spices and tender chicken, served with a special dipping sauce and soup.</p><p>\n\n</p><h3>3. Roti Mataba</h3><p>\n</p><p>Crispy thin roti filled with meat, egg, and onions—an iconic local dish.</p><p>\n\n</p><h3>4. Thai Milk Tea (Cha Chak)</h3><p>\n</p><p>Malaysian-style pulled tea, creamy and aromatic, best enjoyed with crispy roti.</p><p>\n\n</p><h3>5. Crab Curry with Rice Noodles</h3><p>\n</p><p>Rich coconut curry with crab meat and spices, served with fresh vegetables.</p><p>\n\n</p><h3>6-10 Other Must-Try Dishes</h3><p>\n</p><p><br></p>', '/backend/uploads/tours/69d33a41a7ebe_1775450689.jpg', NULL, '[\"Hat Yai\",\"street food\",\"southern food\",\"Thai food\"]', NULL, 'Indo Smile Team', 'published', 0, 11, 1, 'Top 10 Street Foods in Hat Yai | Indo Smile', 'Discover 10 must-try street foods in Hat Yai including fried chicken, biryani, roti, tea, and more.', '2026-04-05 09:30:00', '2026-04-06 04:07:06', '2026-04-07 04:58:01');

-- --------------------------------------------------------

--
-- Table structure for table `blog_related_posts`
--

CREATE TABLE `blog_related_posts` (
  `post_id` int(11) NOT NULL,
  `related_post_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `infants` int(11) DEFAULT 0,
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

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `tour_id`, `booking_reference`, `customer_name`, `customer_email`, `customer_phone`, `travel_date`, `number_of_guests`, `adults`, `children`, `special_requests`, `total_price`, `currency`, `status`, `payment_status`, `payment_method`, `payment_date`, `notes`, `ip_address`, `user_agent`, `confirmed_by`, `confirmed_at`, `cancelled_at`, `cancellation_reason`, `created_at`, `updated_at`) VALUES
(1, 12, 'INDO177545434275A0', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 2, 1, 1, 'Test', 0.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 05:45:42', '2026-04-06 05:45:42'),
(2, 12, 'INDO17754544100278', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 2, 1, 1, 'Test', 3200.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 05:46:50', '2026-04-06 05:46:50'),
(3, 12, 'INDO1775454419EB0F', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 3, 2, 1, 'Test', 5000.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 05:46:59', '2026-04-06 05:46:59'),
(4, 12, 'INDO1775454431AF74', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 3, 2, 1, 'Test', 5000.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 05:47:11', '2026-04-06 05:47:11'),
(5, 12, 'INDO17754544438D7C', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 4, 2, 2, 'Test', 6400.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 05:47:23', '2026-04-06 05:47:23'),
(6, 12, 'INDO1775458985EDB1', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 2, 1, 1, 'Test', 3200.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 07:03:05', '2026-04-06 07:03:05'),
(7, 12, 'INDO1775459157FD5D', 'Test User', 'test@test.com', '+66123456789', '2026-05-01', 1, 1, 0, NULL, 1800.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'curl/8.12.1', NULL, NULL, NULL, NULL, '2026-04-06 07:05:57', '2026-04-06 07:05:57'),
(8, 12, 'INDO17754592205E87', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 3, 2, 1, 'Test', 5000.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 07:07:00', '2026-04-06 07:07:00'),
(9, 12, 'INDO1775459382B746', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 3, 2, 1, 'Test', 5000.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 07:09:42', '2026-04-06 07:09:42'),
(10, 12, 'INDO1775459529483D', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 3, 2, 1, 'Test', 5000.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 07:12:09', '2026-04-06 07:12:09'),
(11, 12, 'INDO1775460616255C', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 3, 2, 1, 'Test', 5000.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 07:30:16', '2026-04-06 07:30:16'),
(12, 12, 'INDO1775461442C40F', 'Test', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 6, 4, 2, 'TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTest', 10000.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 07:44:02', '2026-04-06 07:44:02'),
(13, 13, 'INDO1776501046448C', 'Chalantorn', 'chalantorn2@gmail.com', 'Manop', '2026-04-18', 5, 4, 1, 'Test', 7200.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', NULL, NULL, NULL, NULL, '2026-04-18 08:30:46', '2026-04-18 08:30:46'),
(14, 13, 'INDO1776501754DD6A', 'Chalantorn', 'chalantorn2@gmail.com', '0622439182', '2026-04-18', 10, 7, 3, 'asdasdsadsa', 14100.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', NULL, NULL, NULL, NULL, '2026-04-18 08:42:34', '2026-04-18 08:42:34'),
(15, 18, 'INDO1776502534ADD6', 'TestChalantorn', 'chalantorn2@gmail.com', '0622439182', '2026-04-18', 3, 2, 1, 'TESTTESTTESTTESTTESTTESTTESTTESTTESTTEST', 3300.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', NULL, NULL, NULL, NULL, '2026-04-18 08:55:34', '2026-04-18 08:55:34'),
(16, 17, 'INDO17765035936BA8', 'TestFormWeb', 'chalantorn2@gmail.com', '0622439182', '2026-04-18', 6, 4, 2, 'TestFormWeb', 8400.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', NULL, NULL, NULL, NULL, '2026-04-18 09:13:13', '2026-04-18 09:13:13'),
(17, 20, 'INDO1776503610F752', 'TestFormWeb', 'chalantorn2@gmail.com', '0622439182', '2026-04-18', 9, 7, 2, 'TestFormWeb', 7700.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', NULL, NULL, NULL, NULL, '2026-04-18 09:13:30', '2026-04-18 09:13:30');

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
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('unread','read','replied','archived') DEFAULT 'unread',
  `admin_notes` text DEFAULT NULL COMMENT 'Internal notes from admin',
  `replied_by` int(11) DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `subject`, `message`, `status`, `admin_notes`, `replied_by`, `replied_at`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 'Test Chalantorn', 'chalantorn2@gmail.com', 'Test Send', 'Testrrrrrrrrrrrrrrrrrrrr', 'unread', NULL, NULL, NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-18 03:42:00', '2026-04-18 03:42:00'),
(2, 'Test Chalantorn', 'chalantorn2@gmail.com', 'Test Send', 'TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTest', 'unread', NULL, NULL, NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-18 03:43:12', '2026-04-18 03:43:12');

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
-- Table structure for table `hotels`
--

CREATE TABLE `hotels` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(250) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `stars` tinyint(1) NOT NULL DEFAULT 4,
  `description` text NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `review_count` int(11) DEFAULT 0,
  `main_image` text DEFAULT NULL,
  `amenities` text DEFAULT NULL COMMENT 'JSON array of amenities',
  `check_in_time` varchar(20) DEFAULT NULL,
  `check_out_time` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotels`
--

INSERT INTO `hotels` (`id`, `name`, `slug`, `destination`, `stars`, `description`, `short_description`, `rating`, `review_count`, `main_image`, `amenities`, `check_in_time`, `check_out_time`, `address`, `contact_phone`, `contact_email`, `website`, `is_featured`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 'Best Western Patong Beach', 'best-western-patong-beach', 'Phuket', 4, 'Best Western Patong Beach is located in the heart of Patong, Phuket, just a short walk from Jungceylon Shopping Center, Bangla Road, and Patong Beach. The hotel offers modern accommodation with free Wi-Fi, rooftop swimming pool, fitness center, restaurant, and bar. Rooms feature air conditioning, flat-screen TVs, minibars, private balconies, and en-suite bathrooms. Guests can also enjoy 24-hour front desk service, tour desk, and airport transfer services.', 'Modern 4-star hotel near Jungceylon, Bangla Road, and Patong Beach with rooftop pool and restaurant.', 4.0, 400, '/backend/uploads/tours/69d5d64650df5_1775621702.jpg', '[\"Free WiFi\",\"Rooftop Pool\",\"Fitness Center\",\"Restaurant\",\"Bar\",\"24-hour Front Desk\",\"Parking\",\"Airport Transfer\",\"Tour Desk\"]', '14:00', '12:00', '190 Phangmuang Sai Gor Road, Patong, Kathu, Phuket 83150, Thailand', '+66 76 360 200', 'info@bestwesternpatongbeach.com', 'https://www.bestwesternpatongbeach.com', 1, 1, NULL, '2026-04-03 08:19:25', '2026-04-08 04:21:41'),
(3, 'The Nature Phuket', 'the-nature-phuket', 'Phuket', 4, 'The Nature Phuket is a contemporary 5-star resort located in Kalim Bay near Patong Beach. Surrounded by lush greenery and overlooking the Andaman Sea, the hotel offers modern rooms and suites with elegant design. Facilities include three outdoor swimming pools, fitness center, spa, restaurants, bars, kids club, and free shuttle service to Patong. Rooms feature air conditioning, flat-screen TVs, private balconies, and en-suite bathrooms.', '4-star resort in Kalim Bay near Patong Beach with pools, spa, and shuttle service.', 4.2, 3000, '/backend/uploads/tours/69d60885c6dc9_1775634565.jpg', '[\"Free WiFi\",\"3 Swimming Pools\",\"Fitness Center\",\"Spa\",\"Restaurant\",\"Bar\",\"Kids Club\",\"Shuttle Service\",\"24-hour Front Desk\",\"Parking\"]', '15:00', '12:00', '322 Prabaramee Road, North Patong Beach, Kathu, Phuket 83150, Thailand', '+66 76 681 789', 'rsvn@thenaturephuket.com', 'https://www.thenaturephuket.com', 1, 1, NULL, '2026-04-03 08:50:02', '2026-04-08 07:49:31'),
(4, 'Pearl Hotel Phuket', 'pearl-hotel-phuket', 'Phuket', 4, 'Pearl Hotel Phuket is a centrally located hotel in Phuket Town, offering convenient access to shopping areas, local markets, and cultural attractions. The hotel features an outdoor swimming pool, fitness center, restaurant, and meeting facilities. Rooms are equipped with air conditioning, flat-screen TVs, minibars, and private bathrooms. Guests can enjoy 24-hour front desk service and easy access to Phuket Old Town.', 'City hotel in Phuket Town near Old Town with pool, restaurant, and meeting facilities.', 3.9, 1500, '/backend/uploads/tours/69d60ae6c334d_1775635174.jpg', '[\"Free WiFi\",\"Swimming Pool\",\"Fitness Center\",\"Restaurant\",\"Meeting Rooms\",\"24-hour Front Desk\",\"Parking\",\"Laundry Service\"]', '14:00', '12:00', '42 Montri Road, Talad Yai, Muang, Phuket 83000, Thailand', '+66 76 211 044', 'info@pearlhotelphuket.com', 'https://www.pearlhotelphuket.com', 0, 1, NULL, '2026-04-03 09:06:09', '2026-04-08 08:00:06'),
(5, 'The Charm Resort Phuket', 'the-charm', 'Patong Beach, Phuket', 4, 'The spacious hotel rooms at the Charm Resort Phuket offer all the comforts of home in a modern and luxury setting with a range of room types to suit your individual travel style. The contemporary interiors of our Patong apartments feature delightful Asian elements creating a serene tropical ambiance perfectly suited to the island location. Sleep easy on the high quality king-size bed, browse the entertainment channels from the comfort of the lounge and take a soothing soak in the bathtub after a fun day on the beach at our Patong hotel.', 'Fulfil all your holiday desires at the Charm Resort Phuket, situated just steps away from the gorgeous Patong Beach.', 4.2, 2312, '/backend/uploads/tours/69d60d5215675_1775635794.JPG', '[\"Rooftop Infinity Pool\",\"Lagoon-Style Pool\",\"Fitness Center\",\"Sauna\",\"Sun Decks\",\"Allure Kitchenn\",\"Sky Bar\",\"Lobby Bar\",\"24-Hour Front Desk\",\"Free Parking\",\"Children\\u2019s Pool\"]', '15:00', '11:00', '212 Thaweewong Road, Patong Beach, Kathu, Phuket 83150', NULL, NULL, 'https://www.thecharmresortphuket.com/', 1, 1, 2, '2026-04-04 06:36:58', '2026-04-17 02:28:31'),
(6, 'Amata Patong', 'amata-patong', 'Patong, Phuket', 4, 'Welcome to Amata Patong: Your Prime Location in Patong Beach. Discover the allure of Amata Patong, a charming 4-star hotel nestled in the lively heart of Patong, Phuket. The hotel offers the perfect blend of excitement and relaxation.', 'Amata Patong The Comfort You Deserve, in the Heart of Patong', 4.0, 2556, '/backend/uploads/tours/69d60fd79dd1d_1775636439.jpg', '[\"Two Outdoor Pools\",\"Fitness Center\",\"Anant Restaurant (international and Thai cuisine)\",\"Bars\",\"Kids\' Club\",\"Spa & Wellness\",\"Business Services\",\"24-Hour Services\",\"Free Parking\",\"Housekeeping: Daily room cleaning.\",\"ATM\\/banking on-site\",\"Laundry\\/dry cleaning services\"]', '15:00', '12:00', '189/29 Rat-U-Thit Songroi Pi Road, Patong, Kathu, Phuket, Thailand 83150', NULL, NULL, NULL, 1, 1, 2, '2026-04-04 08:51:51', '2026-04-17 02:30:01'),
(7, 'Twinpalms Surin Beach Phuket', 'twinpalms-surin-beach-phuket', 'Surin, Phuket', 5, 'Twinpalms Surin Beach Phuket is an independent hotel with trend-setting restaurants, bars and elegant beach clubs.\n\nAs a distinguished member of the Small Luxury Hotels of the World, this tranquil and secluded oasis offers refined accommodations centred around an expansive water garden, just a short stroll from Surin Beach on Phuket’s West Coast.\n\nFeaturing 97 luxurious accommodation choices cocooned amidst lush tropical foliage; rooms and suites encircle the picturesque lagoon pool, while the exclusive lofts and penthouses boast private pools, epitomising luxury.', 'A seamless blend of Thai charm, sophisticated contemporary design and natural beauty.', 0.0, 0, '/backend/uploads/tours/69d73335a9bf7_1775711029.jpg', '[]', '14:00', '12:00', '106/46 Moo 3, Surin Beach Road, Cherng Talay, Phuket 83110, Thailand', NULL, NULL, NULL, 0, 1, 2, '2026-04-09 04:57:24', '2026-04-09 05:03:53');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_images`
--

CREATE TABLE `hotel_images` (
  `id` int(11) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  `image_url` text NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'other',
  `caption` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotel_images`
--

INSERT INTO `hotel_images` (`id`, `hotel_id`, `image_url`, `category`, `caption`, `sort_order`, `created_at`) VALUES
(868, 2, '/backend/uploads/tours/69d5d78ff0bd5_1775622031.jpg', 'Gym', '', 0, '2026-04-08 04:33:36'),
(869, 2, '/backend/uploads/tours/69d5d78ff137a_1775622031.jpg', 'Lobby', '', 1, '2026-04-08 04:33:36'),
(870, 2, '/backend/uploads/tours/69d5d78ff2a8f_1775622031.jpg', 'Lobby', '', 2, '2026-04-08 04:33:36'),
(871, 2, '/backend/uploads/tours/69d5d7a403ef3_1775622052.jpg', 'Lobby', '', 3, '2026-04-08 04:33:36'),
(872, 2, '/backend/uploads/tours/69d5d7a404ed7_1775622052.jpg', 'Lobby', '', 4, '2026-04-08 04:33:36'),
(873, 2, '/backend/uploads/tours/69d5d7a405fa3_1775622052.jpg', 'Lobby', '', 5, '2026-04-08 04:33:36'),
(874, 2, '/backend/uploads/tours/69d5d768ec51e_1775621992.jpg', 'Pool', '', 6, '2026-04-08 04:33:36'),
(875, 2, '/backend/uploads/tours/69d5d7a406e72_1775622052.jpg', 'Pool', '', 7, '2026-04-08 04:33:36'),
(876, 2, '/backend/uploads/tours/69d5d7aa9e1b4_1775622058.jpg', 'Pool', '', 8, '2026-04-08 04:33:36'),
(877, 2, '/backend/uploads/tours/69d5d7b7436d6_1775622071.jpg', 'Pool', '', 9, '2026-04-08 04:33:36'),
(878, 2, '/backend/uploads/tours/69d5d7b744b0d_1775622071.jpg', 'Pool', '', 10, '2026-04-08 04:33:36'),
(879, 2, '/backend/uploads/tours/69d5d7b745bf4_1775622071.jpg', 'Pool', '', 11, '2026-04-08 04:33:36'),
(880, 2, '/backend/uploads/tours/69d5d7b7468bf_1775622071.jpg', 'Pool', '', 12, '2026-04-08 04:33:36'),
(881, 2, '/backend/uploads/tours/69d5d7b747248_1775622071.jpg', 'Pool', '', 13, '2026-04-08 04:33:36'),
(882, 2, '/backend/uploads/tours/69d5d768eef86_1775621992.jpg', 'Restaurant', '', 14, '2026-04-08 04:33:36'),
(883, 2, '/backend/uploads/tours/69d5d78fefcbf_1775622031.jpg', 'Restaurant', '', 15, '2026-04-08 04:33:36'),
(884, 2, '/backend/uploads/tours/69d5d7a408117_1775622052.jpg', 'Restaurant', '', 16, '2026-04-08 04:33:36'),
(885, 2, '/backend/uploads/tours/69d5d7a408ff0_1775622052.jpg', 'Restaurant', '', 17, '2026-04-08 04:33:36'),
(886, 2, '/backend/uploads/tours/69d5d7aa99914_1775622058.jpg', 'Restaurant', '', 18, '2026-04-08 04:33:36'),
(887, 2, '/backend/uploads/tours/69d5d7aa9aa5d_1775622058.jpg', 'Restaurant', '', 19, '2026-04-08 04:33:36'),
(888, 2, '/backend/uploads/tours/69d5d7aa9b97e_1775622058.jpg', 'Restaurant', '', 20, '2026-04-08 04:33:36'),
(889, 2, '/backend/uploads/tours/69d5d7aa9c8b4_1775622058.jpg', 'Restaurant', '', 21, '2026-04-08 04:33:36'),
(890, 2, '/backend/uploads/tours/69d5d7c789301_1775622087.jpg', 'Superior Double Room', '', 22, '2026-04-08 04:33:36'),
(891, 2, '/backend/uploads/tours/69d5d7c788545_1775622087.jpg', 'Superior Double Room', '', 23, '2026-04-08 04:33:36'),
(892, 2, '/backend/uploads/tours/69d5d7c78b09d_1775622087.jpg', 'Superior Double Room', '', 24, '2026-04-08 04:33:36'),
(893, 2, '/backend/uploads/tours/69d5d7c78bd72_1775622087.jpg', 'Superior Double Room', '', 25, '2026-04-08 04:33:36'),
(894, 2, '/backend/uploads/tours/69d5d7c78c6e9_1775622087.jpg', 'Superior Double Room', '', 26, '2026-04-08 04:33:36'),
(895, 2, '/backend/uploads/tours/69d5d7cd26ce6_1775622093.jpg', 'Superior Double Room', '', 27, '2026-04-08 04:33:36'),
(896, 2, '/backend/uploads/tours/69d5d7cd265ce_1775622093.jpg', 'Superior Twin Room', '', 28, '2026-04-08 04:33:36'),
(897, 2, '/backend/uploads/tours/69d5d7c789f2a_1775622087.jpg', 'Superior Twin Room', '', 29, '2026-04-08 04:33:36'),
(898, 2, '/backend/uploads/tours/69d5d7cd25954_1775622093.jpg', 'Superior Twin Room', '', 30, '2026-04-08 04:33:36'),
(899, 2, '/backend/uploads/tours/69d5d7cd25259_1775622093.jpg', 'Superior Twin Room', '', 31, '2026-04-08 04:33:36'),
(900, 2, '/backend/uploads/tours/69d5d7cd26032_1775622093.jpg', 'Superior Twin Room', '', 32, '2026-04-08 04:33:36'),
(901, 2, '/backend/uploads/tours/69d5d7cd27355_1775622093.jpg', 'Superior Twin Room', '', 33, '2026-04-08 04:33:36'),
(902, 2, '/backend/uploads/tours/69d5d78ff209a_1775622031.jpg', 'Uncategorized', '', 34, '2026-04-08 04:33:36'),
(976, 3, '/backend/uploads/tours/69d608e811066_1775634664.jpg', 'Restaurant', '', 0, '2026-04-08 07:58:45'),
(977, 3, '/backend/uploads/tours/69d608e811f04_1775634664.jpg', 'Restaurant', '', 1, '2026-04-08 07:58:45'),
(978, 3, '/backend/uploads/tours/69d608e812b3e_1775634664.jpg', 'Lobby', '', 2, '2026-04-08 07:58:45'),
(979, 3, '/backend/uploads/tours/69d608e8134ee_1775634664.jpg', 'Lobby', '', 3, '2026-04-08 07:58:45'),
(980, 3, '/backend/uploads/tours/69d608e814679_1775634664.jpg', 'Exterior', '', 4, '2026-04-08 07:58:45'),
(981, 3, '/backend/uploads/tours/69d608e81504b_1775634664.jpg', 'Pool', '', 5, '2026-04-08 07:58:45'),
(982, 3, '/backend/uploads/tours/69d608f595e70_1775634677.jpg', 'Bedroom', '', 6, '2026-04-08 07:58:45'),
(983, 3, '/backend/uploads/tours/69d608f596534_1775634677.jpg', 'Exterior', '', 7, '2026-04-08 07:58:45'),
(984, 3, '/backend/uploads/tours/69d608f596fe8_1775634677.jpg', 'Restaurant', '', 8, '2026-04-08 07:58:45'),
(985, 3, '/backend/uploads/tours/69d608f597845_1775634677.jpg', 'Restaurant', '', 9, '2026-04-08 07:58:45'),
(986, 3, '/backend/uploads/tours/69d608f59813e_1775634677.jpg', 'Bedroom', '', 10, '2026-04-08 07:58:45'),
(987, 3, '/backend/uploads/tours/69d608f59878c_1775634677.jpg', 'Pool', '', 11, '2026-04-08 07:58:45'),
(988, 3, '/backend/uploads/tours/69d608f5996b2_1775634677.jpg', 'Bedroom', '', 12, '2026-04-08 07:58:45'),
(989, 3, '/backend/uploads/tours/69d6090510383_1775634693.jpg', 'Gym', '', 13, '2026-04-08 07:58:45'),
(990, 3, '/backend/uploads/tours/69d6090510f07_1775634693.jpg', 'Uncategorized', '', 14, '2026-04-08 07:58:45'),
(991, 3, '/backend/uploads/tours/69d6090511601_1775634693.jpg', 'Uncategorized', '', 15, '2026-04-08 07:58:45'),
(992, 3, '/backend/uploads/tours/69d6090511eaa_1775634693.jpg', 'Pool', '', 16, '2026-04-08 07:58:45'),
(993, 3, '/backend/uploads/tours/69d6090512d3a_1775634693.jpg', 'Bedroom', '', 17, '2026-04-08 07:58:45'),
(994, 3, '/backend/uploads/tours/69d609051343b_1775634693.jpg', 'Pool', '', 18, '2026-04-08 07:58:45'),
(995, 3, '/backend/uploads/tours/69d60905140e7_1775634693.jpg', 'Exterior', '', 19, '2026-04-08 07:58:45'),
(996, 3, '/backend/uploads/tours/69d609144b2aa_1775634708.jpg', 'Bedroom', '', 20, '2026-04-08 07:58:45'),
(997, 3, '/backend/uploads/tours/69d609144ba7f_1775634708.jpg', 'Bedroom', '', 21, '2026-04-08 07:58:45'),
(998, 3, '/backend/uploads/tours/69d609144c0a4_1775634708.jpg', 'Lobby', '', 22, '2026-04-08 07:58:45'),
(999, 3, '/backend/uploads/tours/69d609144c8c5_1775634708.jpg', 'Lobby', '', 23, '2026-04-08 07:58:45'),
(1000, 3, '/backend/uploads/tours/69d609144d186_1775634708.jpg', 'Pool', '', 24, '2026-04-08 07:58:45'),
(1001, 3, '/backend/uploads/tours/69d609144dfb1_1775634708.jpg', 'Pool', '', 25, '2026-04-08 07:58:45'),
(1002, 3, '/backend/uploads/tours/69d609144ea6d_1775634708.jpg', 'Lobby', '', 26, '2026-04-08 07:58:45'),
(1003, 3, '/backend/uploads/tours/69d609408356d_1775634752.jpg', 'Restaurant', '', 27, '2026-04-08 07:58:45'),
(1004, 3, '/backend/uploads/tours/69d6094084441_1775634752.jpg', 'Pool', '', 28, '2026-04-08 07:58:45'),
(1005, 3, '/backend/uploads/tours/69d609408573f_1775634752.jpg', 'Restaurant', '', 29, '2026-04-08 07:58:45'),
(1006, 3, '/backend/uploads/tours/69d6094086710_1775634752.jpg', 'Lobby', '', 30, '2026-04-08 07:58:45'),
(1007, 3, '/backend/uploads/tours/69d6094087695_1775634752.jpg', 'Pool', '', 31, '2026-04-08 07:58:45'),
(1008, 3, '/backend/uploads/tours/69d6094088789_1775634752.jpg', 'Restaurant', '', 32, '2026-04-08 07:58:45'),
(1009, 3, '/backend/uploads/tours/69d609408935c_1775634752.jpg', 'Restaurant', '', 33, '2026-04-08 07:58:45'),
(1010, 3, '/backend/uploads/tours/69d60950a2f30_1775634768.jpg', 'Pool', '', 34, '2026-04-08 07:58:45'),
(1011, 3, '/backend/uploads/tours/69d60950a3ffd_1775634768.jpg', 'Pool', '', 35, '2026-04-08 07:58:45'),
(1012, 3, '/backend/uploads/tours/69d60950a4877_1775634768.jpg', 'Bedroom', '', 36, '2026-04-08 07:58:45'),
(1013, 3, '/backend/uploads/tours/69d60950a4dde_1775634768.jpg', 'Lobby', '', 37, '2026-04-08 07:58:45'),
(1014, 3, '/backend/uploads/tours/69d60950a5798_1775634768.jpg', 'Pool', '', 38, '2026-04-08 07:58:45'),
(1015, 3, '/backend/uploads/tours/69d60950a678e_1775634768.jpg', 'Pool', '', 39, '2026-04-08 07:58:45'),
(1016, 3, '/backend/uploads/tours/69d60950a7535_1775634768.jpg', 'Pool', '', 40, '2026-04-08 07:58:45'),
(1017, 3, '/backend/uploads/tours/69d609601cbde_1775634784.jpg', 'Pool', '', 41, '2026-04-08 07:58:45'),
(1018, 3, '/backend/uploads/tours/69d609601d5a8_1775634784.jpg', 'Pool', '', 42, '2026-04-08 07:58:45'),
(1019, 3, '/backend/uploads/tours/69d609601dcc5_1775634784.jpg', 'Pool', '', 43, '2026-04-08 07:58:45'),
(1020, 3, '/backend/uploads/tours/69d609601e7ab_1775634784.jpg', 'Exterior', '', 44, '2026-04-08 07:58:45'),
(1021, 3, '/backend/uploads/tours/69d609601f07d_1775634784.jpg', 'Exterior', '', 45, '2026-04-08 07:58:45'),
(1022, 3, '/backend/uploads/tours/69d6096020223_1775634784.jpg', 'Pool', '', 46, '2026-04-08 07:58:45'),
(1023, 3, '/backend/uploads/tours/69d6096020c57_1775634784.jpg', 'Pool', '', 47, '2026-04-08 07:58:45'),
(1024, 3, '/backend/uploads/tours/69d6097220d9f_1775634802.jpg', 'Exterior', '', 48, '2026-04-08 07:58:45'),
(1025, 3, '/backend/uploads/tours/69d60972216b8_1775634802.jpg', 'Pool', '', 49, '2026-04-08 07:58:45'),
(1026, 3, '/backend/uploads/tours/69d6097222522_1775634802.jpg', 'Exterior', '', 50, '2026-04-08 07:58:45'),
(1027, 3, '/backend/uploads/tours/69d6097222eec_1775634802.jpg', 'Bathroom', '', 51, '2026-04-08 07:58:45'),
(1028, 3, '/backend/uploads/tours/69d6097223537_1775634802.jpg', 'Bedroom', '', 52, '2026-04-08 07:58:45'),
(1029, 3, '/backend/uploads/tours/69d6097223c2f_1775634802.jpg', 'Bedroom', '', 53, '2026-04-08 07:58:45'),
(1030, 3, '/backend/uploads/tours/69d60972242ee_1775634802.jpg', 'Bedroom', '', 54, '2026-04-08 07:58:45'),
(1031, 3, '/backend/uploads/tours/69d6097f5df4d_1775634815.jpg', 'Lobby', '', 55, '2026-04-08 07:58:45'),
(1032, 3, '/backend/uploads/tours/69d6097f5e80e_1775634815.jpg', 'Spa', '', 56, '2026-04-08 07:58:45'),
(1033, 3, '/backend/uploads/tours/69d6097f5f010_1775634815.jpg', 'Restaurant', '', 57, '2026-04-08 07:58:45'),
(1034, 3, '/backend/uploads/tours/69d6097f5f948_1775634815.jpg', 'Restaurant', '', 58, '2026-04-08 07:58:45'),
(1035, 3, '/backend/uploads/tours/69d6097f601ec_1775634815.jpg', 'Pool', '', 59, '2026-04-08 07:58:45'),
(1036, 3, '/backend/uploads/tours/69d6097f62411_1775634815.jpg', 'Pool', '', 60, '2026-04-08 07:58:45'),
(1037, 4, '/backend/uploads/tours/69d60afa3ea52_1775635194.jpg', 'Uncategorized', '', 0, '2026-04-08 08:00:06'),
(1038, 4, '/backend/uploads/tours/69d60afa3d6b1_1775635194.jpg', 'Uncategorized', '', 1, '2026-04-08 08:00:06'),
(1039, 4, '/backend/uploads/tours/69d60afa3cee6_1775635194.jpg', 'Uncategorized', '', 2, '2026-04-08 08:00:06'),
(1040, 4, '/backend/uploads/tours/69d60afa3e581_1775635194.jpg', 'Uncategorized', '', 3, '2026-04-08 08:00:06'),
(1041, 4, '/backend/uploads/tours/69d60afa3ca6c_1775635194.jpg', 'Uncategorized', '', 4, '2026-04-08 08:00:06'),
(1042, 4, '/backend/uploads/tours/69d60afa3d345_1775635194.jpg', 'Uncategorized', '', 5, '2026-04-08 08:00:06'),
(1043, 4, '/backend/uploads/tours/69d60afa3e03b_1775635194.jpg', 'Uncategorized', '', 6, '2026-04-08 08:00:06'),
(1209, 5, '/backend/uploads/tours/69d60dde80398_1775635934.JPG', 'Exterior', '', 0, '2026-04-17 02:28:31'),
(1210, 5, '/backend/uploads/tours/69d60de54bf82_1775635941.JPG', 'Exterior', '', 1, '2026-04-17 02:28:31'),
(1211, 5, '/backend/uploads/tours/69d60de54c2f9_1775635941.JPG', 'Exterior', '', 2, '2026-04-17 02:28:31'),
(1212, 5, '/backend/uploads/tours/69d60df5a7f3a_1775635957.jpg', 'Exterior', '', 3, '2026-04-17 02:28:31'),
(1213, 5, '/backend/uploads/tours/69d60df5a81bf_1775635957.JPG', 'Exterior', '', 4, '2026-04-17 02:28:31'),
(1214, 5, '/backend/uploads/tours/69d60de54c613_1775635941.JPG', 'Gym', '', 5, '2026-04-17 02:28:31'),
(1215, 5, '/backend/uploads/tours/69d60dde7f9aa_1775635934.jpg', 'Lobby', '', 6, '2026-04-17 02:28:31'),
(1216, 5, '/backend/uploads/tours/69d60de54c92e_1775635941.jpg', 'Lobby', '', 7, '2026-04-17 02:28:31'),
(1217, 5, '/backend/uploads/tours/69d60de54d007_1775635941.jpg', 'Lobby', '', 8, '2026-04-17 02:28:31'),
(1218, 5, '/backend/uploads/tours/69d60de54d481_1775635941.jpg', 'Lobby', '', 9, '2026-04-17 02:28:31'),
(1219, 5, '/backend/uploads/tours/69d60dde80125_1775635934.JPG', 'Pool', '', 10, '2026-04-17 02:28:31'),
(1220, 5, '/backend/uploads/tours/69d60de54d8ef_1775635941.JPG', 'Pool', '', 11, '2026-04-17 02:28:31'),
(1221, 5, '/backend/uploads/tours/69d60de54dcb8_1775635941.JPG', 'Pool', '', 12, '2026-04-17 02:28:31'),
(1222, 5, '/backend/uploads/tours/69d60dee032e4_1775635950.JPG', 'Pool', '', 13, '2026-04-17 02:28:31'),
(1223, 5, '/backend/uploads/tours/69d60dee03681_1775635950.JPG', 'Pool', '', 14, '2026-04-17 02:28:31'),
(1224, 5, '/backend/uploads/tours/69d60dee03981_1775635950.JPG', 'Pool', '', 15, '2026-04-17 02:28:31'),
(1225, 5, '/backend/uploads/tours/69d60dee03ca7_1775635950.jpg', 'Pool', '', 16, '2026-04-17 02:28:31'),
(1226, 5, '/backend/uploads/tours/69d60dee04334_1775635950.JPG', 'Pool', '', 17, '2026-04-17 02:28:31'),
(1227, 5, '/backend/uploads/tours/69d60dee046fc_1775635950.jpg', 'Pool', '', 18, '2026-04-17 02:28:31'),
(1228, 5, '/backend/uploads/tours/69d60dee04e8b_1775635950.jpg', 'Pool', '', 19, '2026-04-17 02:28:31'),
(1229, 5, '/backend/uploads/tours/69d60dee0559c_1775635950.jpg', 'Pool', '', 20, '2026-04-17 02:28:31'),
(1230, 5, '/backend/uploads/tours/69d60dde7fd7a_1775635934.jpg', 'Restaurant', '', 21, '2026-04-17 02:28:31'),
(1231, 5, '/backend/uploads/tours/69d60df5a7b7c_1775635957.JPG', 'Spa', '', 22, '2026-04-17 02:28:31'),
(1232, 5, '/backend/uploads/tours/69d60e5cc7581_1775636060.JPG', 'Uncategorized', '', 23, '2026-04-17 02:28:31'),
(1233, 5, '/backend/uploads/tours/69d60e5cc7849_1775636060.JPG', 'Uncategorized', '', 24, '2026-04-17 02:28:31'),
(1234, 5, '/backend/uploads/tours/69d60e5cc7a7a_1775636060.JPG', 'Uncategorized', '', 25, '2026-04-17 02:28:31'),
(1235, 5, '/backend/uploads/tours/69d60e5cc7ca0_1775636060.JPG', 'Uncategorized', '', 26, '2026-04-17 02:28:31'),
(1236, 5, '/backend/uploads/tours/69d60e5cc7ea2_1775636060.JPG', 'Uncategorized', '', 27, '2026-04-17 02:28:31'),
(1237, 5, '/backend/uploads/tours/69d60e5cc80b6_1775636060.JPG', 'Uncategorized', '', 28, '2026-04-17 02:28:31'),
(1238, 5, '/backend/uploads/tours/69d60e5cc82af_1775636060.JPG', 'Uncategorized', '', 29, '2026-04-17 02:28:31'),
(1239, 5, '/backend/uploads/tours/69d60e6150fb2_1775636065.JPG', 'Uncategorized', '', 30, '2026-04-17 02:28:31'),
(1240, 5, '/backend/uploads/tours/69d60e61512aa_1775636065.JPG', 'Uncategorized', '', 31, '2026-04-17 02:28:31'),
(1241, 5, '/backend/uploads/tours/69d60e61514f5_1775636065.JPG', 'Uncategorized', '', 32, '2026-04-17 02:28:31'),
(1242, 5, '/backend/uploads/tours/69d60e615170b_1775636065.JPG', 'Uncategorized', '', 33, '2026-04-17 02:28:31'),
(1243, 5, '/backend/uploads/tours/69d60e6151910_1775636065.JPG', 'Uncategorized', '', 34, '2026-04-17 02:28:31'),
(1244, 5, '/backend/uploads/tours/69d60e6151b39_1775636065.JPG', 'Uncategorized', '', 35, '2026-04-17 02:28:31'),
(1245, 5, '/backend/uploads/tours/69d60e6151d46_1775636065.JPG', 'Uncategorized', '', 36, '2026-04-17 02:28:31'),
(1246, 5, '/backend/uploads/tours/69d60e66adf77_1775636070.JPG', 'Uncategorized', '', 37, '2026-04-17 02:28:31'),
(1247, 5, '/backend/uploads/tours/69d60e66ae234_1775636070.JPG', 'Uncategorized', '', 38, '2026-04-17 02:28:31'),
(1248, 5, '/backend/uploads/tours/69d60e66ae45d_1775636070.JPG', 'Uncategorized', '', 39, '2026-04-17 02:28:31'),
(1249, 5, '/backend/uploads/tours/69d60e66ae660_1775636070.JPG', 'Uncategorized', '', 40, '2026-04-17 02:28:31'),
(1250, 5, '/backend/uploads/tours/69d60e66ae848_1775636070.JPG', 'Uncategorized', '', 41, '2026-04-17 02:28:31'),
(1251, 5, '/backend/uploads/tours/69d60e66aea91_1775636070.JPG', 'Uncategorized', '', 42, '2026-04-17 02:28:31'),
(1252, 5, '/backend/uploads/tours/69d60e66aecd7_1775636070.JPG', 'Uncategorized', '', 43, '2026-04-17 02:28:31'),
(1253, 5, '/backend/uploads/tours/69d60e6bddd25_1775636075.JPG', 'Uncategorized', '', 44, '2026-04-17 02:28:31'),
(1254, 5, '/backend/uploads/tours/69d60e6bddfcd_1775636075.JPG', 'Uncategorized', '', 45, '2026-04-17 02:28:31'),
(1255, 5, '/backend/uploads/tours/69d60e6bde20e_1775636075.JPG', 'Uncategorized', '', 46, '2026-04-17 02:28:31'),
(1256, 5, '/backend/uploads/tours/69d60e6bde45a_1775636075.JPG', 'Uncategorized', '', 47, '2026-04-17 02:28:31'),
(1257, 5, '/backend/uploads/tours/69d60e6bde68d_1775636075.JPG', 'Uncategorized', '', 48, '2026-04-17 02:28:31'),
(1258, 5, '/backend/uploads/tours/69d60ef9566ee_1775636217.jpg', 'Uncategorized', '', 49, '2026-04-17 02:28:31'),
(1259, 6, '/backend/uploads/tours/69d60fe2bf2c1_1775636450.jpg', 'Uncategorized', '', 0, '2026-04-17 02:30:01'),
(1260, 6, '/backend/uploads/tours/69d60fe2bfc63_1775636450.jpg', 'Uncategorized', '', 1, '2026-04-17 02:30:01'),
(1261, 6, '/backend/uploads/tours/69d60fe2bf7df_1775636450.jpg', 'Uncategorized', '', 2, '2026-04-17 02:30:01'),
(1262, 6, '/backend/uploads/tours/69d60fe2c0684_1775636450.jpg', 'Uncategorized', '', 3, '2026-04-17 02:30:01'),
(1263, 6, '/backend/uploads/tours/69d60fe2c005e_1775636450.jpg', 'Uncategorized', '', 4, '2026-04-17 02:30:01'),
(1264, 6, '/backend/uploads/tours/69d60fe2c0338_1775636450.jpg', 'Uncategorized', '', 5, '2026-04-17 02:30:01'),
(1265, 6, '/backend/uploads/tours/69d60fe2bdf69_1775636450.jpg', 'Uncategorized', '', 6, '2026-04-17 02:30:01'),
(1266, 6, '/backend/uploads/tours/69d60fe2be512_1775636450.jpg', 'Uncategorized', '', 7, '2026-04-17 02:30:01'),
(1267, 6, '/backend/uploads/tours/69d60fe2beac0_1775636450.jpg', 'Uncategorized', '', 8, '2026-04-17 02:30:01'),
(1268, 6, '/backend/uploads/tours/69d60fe2bee86_1775636450.jpg', 'Uncategorized', '', 9, '2026-04-17 02:30:01');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_room_types`
--

CREATE TABLE `hotel_room_types` (
  `id` int(11) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `max_guests` int(11) DEFAULT 2,
  `bed_type` varchar(50) DEFAULT NULL,
  `room_size` decimal(6,1) DEFAULT NULL COMMENT 'Size in square meters',
  `amenities` text DEFAULT NULL COMMENT 'JSON array of room-specific amenities',
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hotel_room_types`
--

INSERT INTO `hotel_room_types` (`id`, `hotel_id`, `name`, `description`, `max_guests`, `bed_type`, `room_size`, `amenities`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(83, 2, 'Superior Double Room', 'Modern room with one double bed, private balcony, air conditioning, flat-screen TV, minibar, and en-suite bathroom.', 2, NULL, 28.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Balcony\",\"Safe\"]', 0, 1, '2026-04-08 04:33:36', '2026-04-08 04:33:36'),
(84, 2, 'Superior Twin Room', 'Modern room with twin beds, private balcony, air conditioning, flat-screen TV, minibar, and en-suite bathroom.', 2, NULL, 28.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Balcony\",\"Safe\"]', 1, 1, '2026-04-08 04:33:36', '2026-04-08 04:33:36'),
(109, 3, 'Deluxe Room', 'Spacious 36 sqm room with forest or garden view, private balcony, air conditioning, flat-screen TV, minibar, and en-suite bathroom.', 2, NULL, 36.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Balcony\",\"Safe\"]', 0, 1, '2026-04-08 07:58:45', '2026-04-08 07:58:45'),
(110, 3, 'Deluxe Pool Access', 'Modern room with direct access to the swimming pool, private balcony, rain shower, smart TV, and full amenities.', 2, NULL, 36.0, '[\"Free WiFi\",\"Smart TV\",\"Pool Access\",\"Balcony\",\"Rain Shower\",\"Safe\"]', 1, 1, '2026-04-08 07:58:45', '2026-04-08 07:58:45'),
(111, 3, 'Junior Suite', 'Large 62 sqm suite with separate living area, elegant design, private balcony, and premium amenities.', 2, NULL, 62.0, '[\"Free WiFi\",\"Living Area\",\"Balcony\",\"Bathtub\",\"Minibar\",\"Safe\"]', 2, 1, '2026-04-08 07:58:45', '2026-04-08 07:58:45'),
(112, 3, 'Grand Suite Two Bedrooms', 'Spacious 100 sqm suite with two bedrooms, living area, and balcony, ideal for families.', 4, NULL, 100.0, '[\"Free WiFi\",\"Living Room\",\"2 Bedrooms\",\"Balcony\",\"Minibar\",\"Safe\"]', 3, 1, '2026-04-08 07:58:45', '2026-04-08 07:58:45'),
(113, 3, 'Deluxe Private Jacuzzi', 'At this delightful Deluxe room you can treat yourself to a soothing soak in your own private dip pool with massaging jet streams anytime you choose. Located on the balcony, the outdoor pool is totally private, the perfect place to unwind with your loved one. The 36m2 room at our resort in Kalim Bay is extremely comfortable with modern amenities at your fingertips making it easy to relax and feel at home in paradise Phuket.(Hot water is unavaialble for Jacuzzi)', 2, NULL, 36.0, '[\"High-speed Wi-Fi Internet\",\"43\\u201d LED Smart TV\",\"Private balcony\",\"Rain shower\",\"Bathrobes & slippers\",\"Hairdryer\",\"Electronic safe\",\"Writing desk\"]', 4, 1, '2026-04-08 07:58:45', '2026-04-08 07:58:45'),
(114, 3, 'Junior Suite Pool Access', 'Make a splash in the refreshing pool just a few steps away from your Junior Suite Pool Access room at our Patong Beach hotel. This contemporary style suite is a haven of relaxation offering 62m2 of space including a living area and separate bedroom. The en-suite bathroom is modern and elegant featuring a rain shower and bathtub to soothe and refresh your skin after a day at the beach or pool. This lovely suite at The Nature Phuket is perfect for couples and small families, with space for an extra bed if required.', 2, NULL, NULL, '[\"Private balcony\",\"Living \\/ dining room\",\"High-speed Wi-Fi Internet\",\"43\\u201d LED Smart TV\",\"Rain shower & bathtub\",\"Bathrobes & slippers\",\"Hairdryer\",\"Electronic safe\",\"Writing desk\"]', 5, 1, '2026-04-08 07:58:45', '2026-04-08 07:58:45'),
(115, 4, 'Superior Room', 'Comfortable room with city view, air conditioning, flat-screen TV, minibar, and en-suite bathroom.', 2, NULL, 28.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Safe\"]', 0, 1, '2026-04-08 08:00:06', '2026-04-08 08:00:06'),
(116, 4, 'Deluxe Room', 'Spacious room with modern decor, seating area, city view, and full amenities.', 2, NULL, 32.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Seating Area\",\"Safe\"]', 1, 1, '2026-04-08 08:00:06', '2026-04-08 08:00:06'),
(117, 4, 'Junior Suite', 'Large suite with separate living area, ideal for business or leisure stays.', 2, NULL, 45.0, '[\"Free WiFi\",\"Living Area\",\"Bathtub\",\"Minibar\",\"Safe\"]', 2, 1, '2026-04-08 08:00:06', '2026-04-08 08:00:06'),
(168, 5, 'Deluxe Pool Access', 'Taking a refreshing dip has never been easier at the Charm Resort Phuket&#039;s Deluxe Pool Access room, featuring an extended balcony that steps down to the lagoon-style swimming pool surrounded by lush foliage. The spacious interiors of our Patong accommodation include a relaxing daybed, work desk, and luxury bathroom where you can soak in the tub while overlooking the room, balcony, and beyond. The quality king-size bed is perfectly positioned to enjoy pool views and in-room entertainment with an LCD TV, and a wide range of satellite channels.', 3, NULL, NULL, '[]', 0, 1, '2026-04-17 02:28:31', '2026-04-17 02:28:31'),
(169, 5, 'Junior Suite', 'The well-appointed Junior Suite at our Phuket beach resort has tasteful modern interiors that feature a separate bedroom and living area, perfect for couples and small families that prefer extra space. The king-size bedroom has an LCD TV, private balcony and contemporary en-suite bathroom with rain shower and bathtub.\n\nAt the Charm Resort Phuket prepare light snacks and refreshments with ease, enjoy room service meals at the dining table and lounge on the sofa with the in-room entertainment. And slide back the living room glass doors to access the spacious private balcony with comfortable furnishings to take in the pleasant views.', 2, NULL, NULL, '[]', 1, 1, '2026-04-17 02:28:31', '2026-04-17 02:28:31'),
(170, 5, 'Executive Suite', 'The Executive Suite at our Thailand hotel adds glamour and style to your stay with two levels of chic contemporary living. A highlight is the extended upper floor deck with loungers and a delightful Jacuzzi tub for two, where romantic couples can share intimate moments while admiring the gorgeous views of Patong Bay.\n\nThe lower floor features the king-size bedroom and beautiful bathroom with a revitalising rain shower and bathtub with a view. Both levels of this duplex hotel room have stylish lounge areas to enjoy the in-room entertainment and free Wi-Fi is available throughout. The upper floor is designed for dining, lounging and above all relaxing, with all the facilities you need within easy reach.', 2, NULL, NULL, '[]', 2, 1, '2026-04-17 02:28:31', '2026-04-17 02:28:31'),
(171, 5, 'Family Two Bedroom Suite', 'The duplex Family Two Bedroom Suite completes the portfolio of stylish rooms at The Charm Resort Phuket. This tastefully designed suite with modern Asian interiors has two floors of amenities for guests, ideal for small groups or families sharing. The lower level has a separate living area and master bedroom, each with an entertainment system and private balcony. The master en-suite has a lavish bathtub with a view across the room and a separate rain shower. The lounge area has comfy furnishings to enjoy a cozy night in with a movie and room service.\n\nUpstairs has an open plan layout featuring a second bedroom. A wonderful feature of the upper floor is the large extended balcony with a delightful Jacuzzi tub and loungers adding a touch of romance and indulgence to your stay. This is the perfect spot for guests at our Patong Beach family hotel to socialize and enjoy the fabulous views with a tropical cocktail as the sun sets over Patong Bay.', 2, NULL, NULL, '[]', 3, 1, '2026-04-17 02:28:31', '2026-04-17 02:28:31'),
(172, 5, 'The Charm Suite', 'This is the most lavish suite at our Patong beachfront resort where couples and families can enjoy an extravagant tropical lifestyle. The two storey Charm Suite offers spacious outdoor areas to admire the prime Andaman Sea views and elegant interiors complete with a full range of modern amenities. A special feature is the luxury Jacuzzi for two on the oversized balcony, the perfect spot for star gazing with a bottle of wine.\n\nThe bedroom and main bathroom are on the lower level, which also features a private balcony, living and dining area separate from the sleeping quarters. The spacious upper floor on this one bedroom suite in Patong is a great place to socialise. The open plan design features a large lounge area with sofa and dining table. There are also two balconies adding extra light to the room making it wonderfully the bright and airy. A second toilet is also on the upper floor for added convenience.', 2, NULL, NULL, '[]', 4, 1, '2026-04-17 02:28:31', '2026-04-17 02:28:31');

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
(1, 'site_name', 'Indo Smile South Services', 'string', 'Website name', 3, '2026-04-07 07:34:19'),
(2, 'site_email', 'info@indosmilesouthservices.com', 'string', 'Contact email', 3, '2026-04-07 07:34:19'),
(3, 'site_phone', '+66 95 268 3663, +66 82 253 6662,+66 95 265 5516', 'string', 'Contact phone', 3, '2026-04-07 08:07:53'),
(4, 'currency_default', 'THB', 'string', 'Default currency', 3, '2026-04-07 07:34:19'),
(5, 'booking_confirmation_auto', '0', 'boolean', 'Auto-confirm bookings', 3, '2026-04-07 07:34:19'),
(6, 'email_notifications_enabled', '1', 'boolean', 'Enable email notifications', 3, '2026-04-07 07:34:19'),
(7, 'site_address', '199/100 Moo 9, Thepkrasattri, Thalang, Phuket 83110', 'string', 'Office address shown on the website', 3, '2026-04-07 07:34:19'),
(8, 'social_facebook', 'https://www.facebook.com/indo.smile.south.services', 'string', 'Facebook page URL', 3, '2026-04-07 07:34:19'),
(9, 'social_instagram', 'https://www.instagram.com/indosmilesouthservices/', 'string', 'Instagram page URL', 3, '2026-04-07 07:34:19'),
(10, 'social_line', 'https://lin.ee/VJcNbWl', 'string', 'LINE Official Account URL', 3, '2026-04-07 07:39:34'),
(11, 'social_whatsapp', 'https://wa.me/+66952683663', 'string', 'WhatsApp link (wa.me/...)', 3, '2026-04-07 07:50:40'),
(12, 'transfer_gallery', '[{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b37f1757d_1775874943.jpg\",\"alt\":\"19717\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b38de7ca3_1775874957.jpg\",\"alt\":\"16581\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b39a29ab5_1775874970.jpg\",\"alt\":\"19839\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b39f90916_1775874975.jpg\",\"alt\":\"21345 0\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b3a97df27_1775874985.jpg\",\"alt\":\"S  2105365 0\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b3e009486_1775875040.jpg\",\"alt\":\"25241\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b4061cc34_1775875078.jpg\",\"alt\":\"26189 0\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b416bc381_1775875094.jpg\",\"alt\":\"S  6111340\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b4fbc8a78_1775875323.jpg\",\"alt\":\"Up6018\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b50e996cc_1775875342.jpg\",\"alt\":\"8836\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b51ba2599_1775875355.jpg\",\"alt\":\"9732\"},{\"src\":\"\\/backend\\/uploads\\/transfers\\/69d9b5e94ad1a_1775875561.jpg\",\"alt\":\"21781\"}]', 'json', 'Transfer page gallery images (JSON array of {src, alt})', NULL, '2026-04-11 02:46:02');

-- --------------------------------------------------------

--
-- Table structure for table `tours`
--

CREATE TABLE `tours` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(250) NOT NULL,
  `destination` varchar(100) NOT NULL,
  `type` enum('inbound','outbound','incentive','shows') DEFAULT 'inbound',
  `description` text NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `duration_days` int(11) NOT NULL,
  `duration_nights` int(11) NOT NULL,
  `duration_label` varchar(50) DEFAULT NULL,
  `adult_price` decimal(10,2) NOT NULL,
  `child_price` decimal(10,2) DEFAULT NULL,
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
  `pickup_time` varchar(50) DEFAULT NULL,
  `pickup_location` varchar(255) DEFAULT NULL,
  `dropoff_time` varchar(50) DEFAULT NULL,
  `dropoff_location` varchar(255) DEFAULT NULL,
  `departure_times` text DEFAULT NULL COMMENT 'JSON array of available departure times',
  `meal_info` varchar(255) DEFAULT NULL,
  `transfer_info` varchar(255) DEFAULT NULL,
  `what_to_bring` text DEFAULT NULL COMMENT 'JSON array of items to bring',
  `important_notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tours`
--

INSERT INTO `tours` (`id`, `name`, `slug`, `destination`, `type`, `description`, `short_description`, `duration_days`, `duration_nights`, `duration_label`, `adult_price`, `child_price`, `currency`, `rating`, `review_count`, `is_featured`, `is_active`, `max_participants`, `min_participants`, `difficulty_level`, `main_image`, `gallery_images`, `highlights`, `included`, `not_included`, `itinerary`, `terms_conditions`, `cancellation_policy`, `pickup_time`, `pickup_location`, `dropoff_time`, `dropoff_location`, `departure_times`, `meal_info`, `transfer_info`, `what_to_bring`, `important_notes`, `created_by`, `created_at`, `updated_at`) VALUES
(12, 'Koh Hey + Sunset Promthep (Catamaran)', 'coral-beach-club-sunset-catamaran', 'Phuket', 'inbound', 'Enjoy a relaxing afternoon at Coral Beach Club on Koh Hey, followed by snorkeling at Hin Dam Bay and a sunset yacht cruise to Promthep Cape with dinner onboard.', 'Coral Beach Club + Sunset Yacht Experience', 1, 0, 'One Day Trip', 1800.00, 1400.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '/backend/uploads/tours/69d610367f0d5_1775636534.jpg', '[\"\\/backend\\/uploads\\/tours\\/69d610401898c_1775636544.jpg\",\"\\/backend\\/uploads\\/tours\\/69d6104017ae9_1775636544.jpg\",\"\\/backend\\/uploads\\/tours\\/69d6104017efb_1775636544.jpg\",\"\\/backend\\/uploads\\/tours\\/69d6104018414_1775636544.jpg\"]', '[\"Yacht Catamaran cruise\",\"Coral Beach Club\",\"Snorkeling at Hin Dam Bay\",\"Sunset at Promthep Cape\",\"Dinner onboard\"]', '[\"Hotel transfer\",\"Catamaran yacht\",\"Dinner onboard\",\"Soft drinks and fruits\",\"Snorkeling equipment\",\"Tour guide\",\"Insurance\"]', '[\"Alcoholic drinks\",\"Personal expenses\",\"Optional activities\",\"Tips\"]', '[{\"day\":1,\"title\":\"Departure from Rawai Pier\",\"time\":\"14:00\",\"description\":\"Board the catamaran and depart to Koh Hey.\",\"activities\":[]},{\"day\":2,\"title\":\"Coral Beach Club\",\"time\":\"14:30\",\"description\":\"Relax on the beach and enjoy activities.\",\"activities\":[]},{\"day\":3,\"title\":\"Snorkeling at Hin Dam Bay\",\"time\":\"16:30\",\"description\":\"Explore coral reefs and marine life.\",\"activities\":[]},{\"day\":4,\"title\":\"Sunset at Promthep Cape\",\"time\":\"18:00\",\"description\":\"Enjoy sunset with dinner onboard.\",\"activities\":[]},{\"day\":5,\"title\":\"Return to Pier\",\"time\":\"19:30\",\"description\":\"Transfer back to hotel.\",\"activities\":[]}]', 'Schedule subject to change depending on weather conditions.', 'Free cancellation 24 hours before departure.', '14:00', 'Hotel in Phuket (Kata, Karon, Patong)', '19:30', 'Return to hotel', '[\"14:00\"]', 'Dinner included', 'Roundtrip hotel transfer', '[\"Swimwear\",\"Towel\",\"Sunscreen\",\"Sunglasses\",\"Camera\"]', 'Program may change depending on weather and sea conditions. Free transfer only in selected areas.', NULL, '2026-04-02 09:19:56', '2026-04-08 08:22:29'),
(13, 'Phi Phi Island (Speed Boat)', 'phi-phi-island-speedboat', 'Krabi', 'inbound', 'Explore the world-famous Phi Phi Islands by speed boat. Visit Maya Bay, Pileh Lagoon, Viking Cave, Monkey Bay, Phi Phi Don Island, Hin Pae, and Bamboo Island. Enjoy snorkeling, swimming, sightseeing, and a delicious lunch on the island.', 'Phi Phi Islands Day Trip by Speed Boat', 1, 0, 'One Day Trip', 1500.00, 1200.00, 'THB', 4.8, 0, 1, 1, 50, 1, 'easy', '/backend/uploads/tours/69d37c5f19208_1775467615.jpg', '[\"\\/backend\\/uploads\\/tours\\/69d37cf70f72b_1775467767.jpg\",\"\\/backend\\/uploads\\/tours\\/69d37cf70fc75_1775467767.jpg\",\"\\/backend\\/uploads\\/tours\\/69d37cf70ffc8_1775467767.jpg\",\"\\/backend\\/uploads\\/tours\\/69d37cf71055b_1775467767.jpg\",\"\\/backend\\/uploads\\/tours\\/69d37cf710a17_1775467767.jpg\",\"\\/backend\\/uploads\\/tours\\/69d37cf7138bb_1775467767.jpg\",\"\\/backend\\/uploads\\/tours\\/69d37cf713db3_1775467767.jpg\",\"\\/backend\\/uploads\\/tours\\/69d37cf714324_1775467767.jpg\",\"\\/backend\\/uploads\\/tours\\/69d37cf7147a9_1775467767.jpg\",\"\\/backend\\/uploads\\/tours\\/69d37cf714bc3_1775467767.jpg\"]', '[\"Maya Bay\",\"Pileh Lagoon\",\"Viking Cave\",\"Monkey Bay\",\"Phi Phi Don Island\",\"Hin Pae snorkeling\",\"Bamboo Island\"]', '[\"Hotel transfer\",\"Speed boat\",\"Drinking water and fruits\",\"Snorkeling equipment\",\"Life jackets\",\"Lunch on Phi Phi Don\",\"Tour guide\",\"Insurance\"]', '[\"Alcoholic drinks\",\"Personal expenses\",\"Tips\",\"Optional activities\"]', '[{\"day\":1,\"title\":\"Hotel Pickup\",\"time\":\"08:00\",\"description\":\"Pick up from your hotel\",\"activities\":[\"Hotel transfer\"]},{\"day\":2,\"title\":\"Departure to Phi Phi Islands\",\"time\":\"09:15\",\"description\":\"Depart by speed boat\",\"activities\":[\"Speed boat\"]},{\"day\":3,\"title\":\"Maya Bay\",\"time\":\"10:00\",\"description\":\"A famous beach from the movie The Beach\",\"activities\":[\"Sightseeing\",\"Photo\"]},{\"day\":4,\"title\":\"Pileh Bay\",\"time\":\"11:00\",\"description\":\"Swim in crystal clear lagoon surrounded by cliffs\",\"activities\":[\"Swimming\"]},{\"day\":5,\"title\":\"Viking Cave & Monkey Bay\",\"time\":\"11:45\",\"description\":\"View Viking Cave and see monkeys from the boat\",\"activities\":[\"Sightseeing\"]},{\"day\":6,\"title\":\"Lunch at Phi Phi Don\",\"time\":\"12:30\",\"description\":\"Buffet lunch on the island\",\"activities\":[\"Lunch\"]},{\"day\":7,\"title\":\"Snorkeling at Hin Pae\",\"time\":\"13:30\",\"description\":\"Enjoy snorkeling with marine life\",\"activities\":[\"Snorkeling\"]},{\"day\":8,\"title\":\"Bamboo Island\",\"time\":\"15:00\",\"description\":\"Relax on white sandy beach\",\"activities\":[\"Relax\",\"Swimming\"]},{\"day\":9,\"title\":\"Return to Pier\",\"time\":\"16:30\",\"description\":\"Return by speed boat\",\"activities\":[\"Transfer\"]},{\"day\":10,\"title\":\"Hotel Drop-off\",\"time\":\"17:00\",\"description\":\"Transfer back to hotel\",\"activities\":[\"Hotel transfer\"]}]', '', '', '08:00', 'Hotel in Phuket (Patong, Kata, Karon)', '17:00', 'Return to hotel', '[\"09:00\"]', 'Lunch included', 'Roundtrip hotel transfer', '[\"Sunscreen\",\"Swimming suit\",\"Towel\",\"Camera\"]', 'Program is subject to change depending on weather and sea conditions. Not recommended for pregnant women. Monkey interaction should be done from boat only for safety.', NULL, '2026-04-06 09:24:58', '2026-04-07 08:39:00'),
(14, 'James Bond Island (Speed Boat)', 'james-bond-island-speedboat', 'Phuket', 'inbound', 'Explore Phang Nga Bay by speed boat. Enjoy canoeing at Hong Island or Talu Island, visit the famous James Bond Island and Khao Ping Kan, explore Ice Cream Cave, visit Panyee Island and relax at Lawa or Naka Island.', 'James Bond Island Day Trip by Speed Boat', 1, 0, 'One Day Trip', 1600.00, 1200.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '/backend/uploads/tours/69d4891960773_1775536409.jpg', '[\"\\/backend\\/uploads\\/tours\\/69d4895e3f7f9_1775536478.jpg\",\"\\/backend\\/uploads\\/tours\\/69d489660f0d8_1775536486.jpg\",\"\\/backend\\/uploads\\/tours\\/69d48969de389_1775536489.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4896d33b56_1775536493.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4896f36226_1775536495.jpg\",\"\\/backend\\/uploads\\/tours\\/69d489711de20_1775536497.jpg\",\"\\/backend\\/uploads\\/tours\\/69d48a4014191_1775536704.jpg\"]', '[\"James Bond Island\",\"Canoeing at Hong Island\",\"Panyee Island\",\"Ice Cream Cave\",\"Lawa Island or Naka Island\"]', '[\"Roundtrip hotel transfer\",\"English speaking guide\",\"Soft drinks and fresh fruits\",\"Thai buffet lunch\",\"Insurance\",\"Life jacket\",\"National park fee\"]', '[\"Personal expenses\",\"Tips\",\"Optional activities\"]', '[{\"day\":1,\"title\":\"Hotel Pickup\",\"time\":\"08:00 - 08:30\",\"description\":\"Pick up from your hotel to the pier\",\"activities\":[\"Hotel transfer\"]},{\"day\":2,\"title\":\"Canoeing at Hong Island or Talu Island\",\"time\":\"09:30\",\"description\":\"Enjoy canoeing to enter the cave\",\"activities\":[\"Canoeing\"]},{\"day\":3,\"title\":\"Panyee Island & Lunch\",\"time\":\"12:00\",\"description\":\"Visit Muslim Village and enjoy Thai buffet lunch (Vegetarian on request)\",\"activities\":[\"Lunch\"]},{\"day\":4,\"title\":\"James Bond Island\",\"time\":\"13:30\",\"description\":\"Visit James Bond Island and Khao Ping Kan\",\"activities\":[\"Sightseeing\"]},{\"day\":5,\"title\":\"Lawa or Naka Island\",\"time\":\"15:00\",\"description\":\"Relax, swim and enjoy the beach\",\"activities\":[\"Swimming\"]},{\"day\":6,\"title\":\"Return to Pier\",\"time\":\"16:00\",\"description\":\"Arrive at the pier\",\"activities\":[\"Return\"]}]', '', '', '08:00', 'Hotel in Phuket', '16:30', 'Return to hotel', '[\"09:00\"]', 'Lunch included', 'Roundtrip hotel transfer', '[\"Swimwear\",\"Towel\",\"Sunglasses\",\"Sun hat\",\"Camera\",\"Sunblock lotion\"]', 'Program is subject to change depending on weather conditions. Not recommended for pregnant women or people who underwent surgery.', NULL, '2026-04-07 04:31:23', '2026-04-07 04:38:24'),
(15, 'Similan Islands (Speed Boat)', 'similan-islands-speedboat', 'Phuket', 'inbound', 'Explore the world-class Similan Islands by speed boat. Snorkel at Islands No.5, No.6 and No.9, relax at Koh Miang, and visit the famous Sailing Rock viewpoint at Koh Similan.', 'Similan Islands Day Trip by Speed Boat', 1, 0, 'One Day Trip', 2900.00, 2400.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '/backend/uploads/tours/69d48c7621a60_1775537270.jpg', '[\"\\/backend\\/uploads\\/tours\\/69d48cec79f1c_1775537388.jpg\",\"\\/backend\\/uploads\\/tours\\/69d48cec78736_1775537388.jpg\",\"\\/backend\\/uploads\\/tours\\/69d48cec78ae9_1775537388.jpg\",\"\\/backend\\/uploads\\/tours\\/69d48cec7956c_1775537388.jpg\",\"\\/backend\\/uploads\\/tours\\/69d48cec79835_1775537388.jpg\",\"\\/backend\\/uploads\\/tours\\/69d48cec79bc5_1775537388.jpg\",\"\\/backend\\/uploads\\/tours\\/69d48cec78eaa_1775537388.jpg\"]', '[\"Similan Islands\",\"Snorkeling at Island No.5 and No.6\",\"Koh Miang (Island No.4)\",\"Koh Ba Ngu (Island No.9)\",\"Sailing Rock at Koh Similan\"]', '[\"Hotel transfer\",\"Speed boat transfer\",\"3 meals (breakfast, lunch, dinner)\",\"Fresh fruits and beverages\",\"Snorkeling mask\",\"Flipper and towel\",\"Accident insurance\",\"Tour guide\"]', '[\"Personal expenses\",\"Tips\"]', '[{\"day\":1,\"title\":\"Seastar Pier Check-in\",\"time\":\"08:00\",\"description\":\"Ready at Seastar private pier (Thap-lamu), welcome with hot drinks and bakery, check-in and pick up snorkeling gear\",\"activities\":[\"Check-in\",\"Breakfast\"]},{\"day\":2,\"title\":\"Departure to Similan Islands\",\"time\":\"09:00\",\"description\":\"Depart to Similan Islands by speed boat\",\"activities\":[\"Speed boat\"]},{\"day\":3,\"title\":\"Snorkeling at Island No.5 and No.6\",\"time\":\"10:30\",\"description\":\"Explore underwater world with colorful fish and coral reefs\",\"activities\":[\"Snorkeling\"]},{\"day\":4,\"title\":\"Koh Miang (Island No.4)\",\"time\":\"12:00\",\"description\":\"Relax on the beach and enjoy lunch box\",\"activities\":[\"Lunch\",\"Relax\"]},{\"day\":5,\"title\":\"Koh Ba Ngu (Island No.9)\",\"time\":\"13:30\",\"description\":\"Snorkel at famous coral reef area\",\"activities\":[\"Snorkeling\"]},{\"day\":6,\"title\":\"Koh Similan & Sailing Rock\",\"time\":\"14:30\",\"description\":\"Visit Sailing Rock viewpoint, swim, relax and take photos\",\"activities\":[\"Sightseeing\",\"Photo\"]},{\"day\":7,\"title\":\"Return to Pier\",\"time\":\"16:50\",\"description\":\"Return to Seastar private pier and transfer back to hotel\",\"activities\":[\"Return transfer\"]}]', '', '', '08:00', 'Hotel in Phuket / Khaolak', '17:30', 'Return to hotel', '[\"09:00\"]', 'Meals included', 'Roundtrip hotel transfer', '[\"Swimwear\",\"Towel\",\"Sunglasses\",\"Sun hat\",\"Camera\",\"Sunblock\"]', 'Similan Islands are open from October 15th to May 15th only. Program is subject to change depending on weather conditions. Not suitable for pregnant women, elderly people or children under 1 year old.', NULL, '2026-04-07 04:47:32', '2026-04-07 04:52:34'),
(16, 'Surin Islands (Speed Boat)', 'surin-islands-speedboat', 'Phuket', 'inbound', 'Discover the pristine Surin Islands, one of the best snorkeling destinations in the Andaman Sea. Visit Moken Village, enjoy multiple snorkeling spots, and relax on beautiful beaches.', 'Surin Islands Day Trip by Speed Boat', 1, 0, 'One Day Trip', 2900.00, 2400.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '/backend/uploads/tours/69d4be638fbeb_1775550051.jpg', '[\"\\/backend\\/uploads\\/tours\\/69d4be767b088_1775550070.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4be767abd1_1775550070.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4be7cab1d0_1775550076.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4be767a066_1775550070.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4be767a4c1_1775550070.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4be767a83c_1775550070.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4be767b407_1775550070.jpg\"]', '[\"Surin Islands National Park\",\"Moken Village\",\"Snorkeling at Chong Kad Channel\",\"Bon Bay or Mae Yai Bay\",\"Pineapple Bay or Turtle Bay\"]', '[\"Complete snorkeling equipment\",\"Towel\",\"3 meals\",\"First-aid staff\",\"Short fins\",\"Hotel transfer\",\"Accident insurance\",\"National park fee\",\"Roundtrip boat transfer\",\"Tour guide\"]', '[\"Personal expenses\",\"Tips\"]', '[{\"day\":1,\"title\":\"Seastar Pier Check-in\",\"time\":\"08:00\",\"description\":\"Ready at Seastar private pier (Namkhem Marina), welcome with hot drinks and bakery, check-in and pick up snorkeling equipment\",\"activities\":[\"Check-in\",\"Breakfast\"]},{\"day\":2,\"title\":\"Departure to Surin Islands\",\"time\":\"09:00\",\"description\":\"Depart to Surin Islands by speed boat\",\"activities\":[\"Speed boat\"]},{\"day\":3,\"title\":\"Chong Kad Channel & Moken Village\",\"time\":\"10:30\",\"description\":\"Arrive at Surin Islands National Park, snorkel at Chong Kad Channel and visit Moken Village\",\"activities\":[\"Snorkeling\",\"Village visit\"]},{\"day\":4,\"title\":\"Lunch at National Park\",\"time\":\"12:00\",\"description\":\"Enjoy buffet lunch with beverages and Thai seasonal fruits\",\"activities\":[\"Lunch\"]},{\"day\":5,\"title\":\"Snorkeling Spots\",\"time\":\"13:30\",\"description\":\"Second snorkeling at Bon Bay or Mae Yai Bay and third snorkeling at Pineapple Bay or Turtle Bay\",\"activities\":[\"Snorkeling\"]},{\"day\":6,\"title\":\"Return to Pier\",\"time\":\"17:00\",\"description\":\"Return to Seastar private pier (Namkhem Marina) and transfer back to hotel\",\"activities\":[\"Return transfer\"]}]', '', '', '08:00', 'Hotel in Phuket / Khaolak', '17:30', 'Return to hotel', '[\"09:00\"]', 'Meals included', 'Roundtrip hotel transfer', '[\"Sunscreen\",\"Hat\",\"Sunglasses\",\"Camera\",\"Cash\",\"Waterproof bag\"]', 'Surin Islands are open from October 15th to May 15th only. Program may change depending on weather conditions. Not suitable for pregnant women, children under 1 year old, elderly people, or individuals with chronic diseases.', NULL, '2026-04-07 08:19:12', '2026-04-07 08:21:27'),
(17, 'The Coral Beach Club + Racha Island (Speed Boat)', 'coral-beach-club-racha-island', 'Phuket', 'inbound', 'Enjoy a relaxing day at The Coral Beach Club on Koh Hey and explore the beautiful Racha Island. Swim, snorkel, and relax on white sandy beaches with crystal clear water.', 'Coral Beach Club + Racha Island Day Trip', 1, 0, 'One Day Trip', 1500.00, 1200.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '/backend/uploads/tours/69d4c0985dc12_1775550616.jpg', '[\"\\/backend\\/uploads\\/tours\\/69d4c0fb31175_1775550715.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4c0fb316d5_1775550715.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4c0fb319d7_1775550715.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4c0fb31d49_1775550715.jpg\"]', '[\"Coral Beach Club (Koh Hey)\",\"Racha Island\",\"Snorkeling\",\"Beach relaxation\"]', '[\"Roundtrip hotel transfer\",\"Lunch\",\"Soft drinks and seasonal fruits\",\"Beach chair\",\"Snorkeling equipment\",\"Tour guide\",\"Accident insurance\"]', '[\"Personal expenses\",\"Optional activities at Coral Beach Club\"]', '[{\"day\":1,\"title\":\"Hotel Pickup\",\"time\":\"08:00\",\"description\":\"Pick up customers from the hotel and transfer to Nonthasak Pier Rawai\",\"activities\":[\"Hotel transfer\"]},{\"day\":2,\"title\":\"Check-in & Briefing\",\"time\":\"08:30\",\"description\":\"Check-in with tea, coffee and snacks. Tour guide briefing before departure\",\"activities\":[\"Check-in\"]},{\"day\":3,\"title\":\"Departure to Koh Hey\",\"time\":\"09:00\",\"description\":\"Depart from Nonthasak Pier Rawai heading to Koh Hey\",\"activities\":[\"Speed boat\"]},{\"day\":4,\"title\":\"Coral Beach Club\",\"time\":\"09:30\",\"description\":\"Relax at The Coral Beach Club, enjoy beach activities and free time\",\"activities\":[\"Relax\",\"Beach\"]},{\"day\":5,\"title\":\"Lunch\",\"time\":\"12:00\",\"description\":\"Enjoy lunch at the island\",\"activities\":[\"Lunch\"]},{\"day\":6,\"title\":\"Racha Island\",\"time\":\"13:30\",\"description\":\"Snorkel and relax at Racha Island with clear water and marine life\",\"activities\":[\"Snorkeling\",\"Swimming\"]},{\"day\":7,\"title\":\"Return to Pier\",\"time\":\"16:00\",\"description\":\"Return to Nonthasak Pier Rawai\",\"activities\":[\"Return\"]}]', '', '', '08:00', 'Hotel in Phuket', '16:30', 'Return to hotel', '[\"09:00\"]', 'Lunch included', 'Roundtrip hotel transfer', '[\"Swimwear\",\"Towel\",\"Sunglasses\",\"Sunblock\",\"Camera\"]', 'Program is subject to change depending on weather conditions. Free hotel transfer only in selected areas. Additional charges may apply outside service zones.', NULL, '2026-04-07 08:25:22', '2026-04-07 08:33:50'),
(18, 'The Coral Beach Club + Hin Dam Bay (Speed Boat)', 'coral-beach-club-hindam-bay', 'Phuket', 'inbound', 'Relax at The Coral Beach Club on Koh Hey and enjoy snorkeling at Hin Dam Bay. Perfect for beach lovers who want both relaxation and underwater experience.', 'Coral Beach Club + Hin Dam Bay Snorkeling', 1, 0, 'One Day Trip', 1200.00, 900.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '/backend/uploads/tours/69d4d36926ed0_1775555433.jpg', '[\"\\/backend\\/uploads\\/tours\\/69d4d3724e309_1775555442.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4d3724d6aa_1775555442.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4d3724dc11_1775555442.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4d3724df86_1775555442.jpg\"]', '[\"Coral Beach Club (Koh Hey)\",\"Hin Dam Bay Snorkeling\",\"Beach relaxation\",\"Clear kayak activity\"]', '[\"Roundtrip hotel transfer\",\"Lunch\",\"Soft drinks and seasonal fruits\",\"Beach chair\",\"Snorkeling equipment\",\"Tour guide\",\"Accident insurance\"]', '[\"Personal expenses\",\"Optional activities\"]', '[{\"day\":1,\"title\":\"Hotel Pickup\",\"time\":\"08:00\",\"description\":\"Pick up customers from the hotel and transfer to Nonthasak Pier Rawai\",\"activities\":[\"Hotel transfer\"]},{\"day\":2,\"title\":\"Check-in & Briefing\",\"time\":\"08:30\",\"description\":\"Check-in with tea, coffee and snacks and briefing before departure\",\"activities\":[\"Check-in\"]},{\"day\":3,\"title\":\"Departure to Koh Hey\",\"time\":\"09:00\",\"description\":\"Depart from Nonthasak Pier Rawai to Koh Hey\",\"activities\":[\"Speed boat\"]},{\"day\":4,\"title\":\"Coral Beach Club\",\"time\":\"09:30\",\"description\":\"Relax at The Coral Beach Club and enjoy beach activities\",\"activities\":[\"Beach\",\"Relax\"]},{\"day\":5,\"title\":\"Lunch\",\"time\":\"12:00\",\"description\":\"Enjoy lunch at the island\",\"activities\":[\"Lunch\"]},{\"day\":6,\"title\":\"Hin Dam Bay Snorkeling\",\"time\":\"13:00\",\"description\":\"Snorkel at Hin Dam Bay and explore coral reefs\",\"activities\":[\"Snorkeling\"]},{\"day\":7,\"title\":\"Return to Pier\",\"time\":\"14:00\",\"description\":\"Return to Nonthasak Pier Rawai\",\"activities\":[\"Return\"]}]', '', '', '08:00', 'Hotel in Phuket', '14:30', 'Return to hotel', '[\"09:00\"]', 'Lunch included', 'Roundtrip hotel transfer', '[\"Swimwear\",\"Towel\",\"Sunglasses\",\"Sunblock\",\"Camera\"]', 'Program is subject to change depending on weather conditions. Free transfer only in selected areas. Additional charges may apply outside service zones.', NULL, '2026-04-07 08:38:42', '2026-04-07 09:50:45'),
(19, '4 Islands (Longtail Boat)', '4-islands-longtail-krabi', 'Krabi', 'inbound', 'Explore the famous 4 Islands in Krabi by longtail boat. Visit Phra Nang Cave, Tup Island, Chicken Island and Poda Island. Enjoy snorkeling, swimming and relaxing on beautiful beaches.', '4 Islands Krabi by Longtail Boat', 1, 0, 'One Day Trip', 800.00, 600.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '/backend/uploads/tours/69d4c93f14572_1775552831.jpg', '[\"\\/backend\\/uploads\\/tours\\/69d4c94a2e4b7_1775552842.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4c94a2e9f4_1775552842.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4c94a2ee95_1775552842.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4c94a2f3f8_1775552842.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4c94a2f755_1775552842.jpg\",\"\\/backend\\/uploads\\/tours\\/69d4c94a2fe15_1775552842.jpg\"]', '[\"Phra Nang Cave\",\"Tup Island\",\"Chicken Island\",\"Poda Island\"]', '[\"Hotel transfer\",\"Longtail boat\",\"Drinking water and fruits\",\"Snorkeling equipment\",\"Life jackets\",\"Lunch\",\"Tour guide\",\"Insurance\"]', '[\"National park fee\",\"Personal expenses\",\"Tips\"]', '[{\"day\":1,\"title\":\"Hotel Pickup\",\"time\":\"08:00 - 08:30\",\"description\":\"Pick up from your hotel\",\"activities\":[\"Hotel transfer\"]},{\"day\":2,\"title\":\"Departure\",\"time\":\"09:00 - 09:15\",\"description\":\"Depart for 4 Islands by longtail boat\",\"activities\":[\"Boat transfer\"]},{\"day\":3,\"title\":\"Phra Nang Cave\",\"time\":\"09:30\",\"description\":\"Visit Phra Nang Cave at Railay Beach with beautiful limestone formations\",\"activities\":[\"Sightseeing\",\"Photo\"]},{\"day\":4,\"title\":\"Tup Island\",\"time\":\"10:30\",\"description\":\"Walk on the sandbank connecting Tup Island, Mor Island and Chicken Island during low tide\",\"activities\":[\"Walk\",\"Photo\"]},{\"day\":5,\"title\":\"Chicken Island\",\"time\":\"11:30\",\"description\":\"Snorkeling spot with coral reefs and unique rock shape like a chicken\",\"activities\":[\"Snorkeling\"]},{\"day\":6,\"title\":\"Poda Island & Lunch\",\"time\":\"12:30\",\"description\":\"Relax on the beach and enjoy lunch at Poda Island\",\"activities\":[\"Lunch\",\"Relax\"]},{\"day\":7,\"title\":\"Return to Pier\",\"time\":\"14:00\",\"description\":\"Return to the pier and transfer back to hotel\",\"activities\":[\"Return\"]}]', '', '', '08:00', 'Hotel in Krabi', '14:30', 'Return to hotel', '[\"09:00\"]', 'Lunch included', 'Roundtrip hotel transfer', '[\"Sunscreen\",\"Swimming suit\",\"Towel\",\"Camera\"]', 'Program is subject to change depending on weather and sea conditions. Not recommended for pregnant women.', NULL, '2026-04-07 08:41:45', '2026-04-07 09:07:24'),
(20, 'Hong Island (Longtail Boat)', 'hong-island-longtail-krabi', 'Krabi', 'inbound', 'Explore Hong Island by longtail boat. Visit Hong Lagoon, Pakbia Island, Lading Island and enjoy a panoramic 360 viewpoint. Perfect for swimming, snorkeling and relaxing.', 'Hong Island Krabi by Longtail Boat', 1, 0, 'One Day Trip', 900.00, 700.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '/backend/uploads/tours/69d9fb83e4bf6_1775893379.jpg', '[\"\\/backend\\/uploads\\/tours\\/69d9fba1485ca_1775893409.jpg\",\"\\/backend\\/uploads\\/tours\\/69d9fba148ace_1775893409.jpg\",\"\\/backend\\/uploads\\/tours\\/69d9fba148e32_1775893409.jpg\",\"\\/backend\\/uploads\\/tours\\/69d9fba1491e0_1775893409.jpg\",\"\\/backend\\/uploads\\/tours\\/69d9fba14941c_1775893409.jpg\",\"\\/backend\\/uploads\\/tours\\/69d9fba14968f_1775893409.jpg\",\"\\/backend\\/uploads\\/tours\\/69d9fba149905_1775893409.jpg\"]', '[\"Hong Lagoon\",\"Pakbia Island\",\"Lading Island\",\"360 Viewpoint\"]', '[\"Hotel transfer\",\"Longtail boat\",\"Drinking water and fruits\",\"Snorkeling equipment\",\"Life jackets\",\"Lunch\",\"Tour guide\",\"Insurance\"]', '[\"National park fee\",\"Personal expenses\",\"Tips\"]', '[{\"day\":1,\"title\":\"Hotel Pickup\",\"time\":\"08:00 - 08:30\",\"description\":\"Pick up from your hotel\",\"activities\":[\"Hotel transfer\"]},{\"day\":2,\"title\":\"Departure\",\"time\":\"09:00 - 09:15\",\"description\":\"Depart for Hong Island by longtail boat\",\"activities\":[\"Boat transfer\"]},{\"day\":3,\"title\":\"Pakbia Island\",\"time\":\"09:30\",\"description\":\"Relax on the beach and enjoy beautiful limestone scenery\",\"activities\":[\"Relax\",\"Photo\"]},{\"day\":4,\"title\":\"Lading Island\",\"time\":\"10:30\",\"description\":\"Small island with bird nest concession and stunning nature\",\"activities\":[\"Sightseeing\"]},{\"day\":5,\"title\":\"Hong Lagoon\",\"time\":\"11:30\",\"description\":\"Explore the hidden lagoon surrounded by cliffs\",\"activities\":[\"Boat sightseeing\"]},{\"day\":6,\"title\":\"Hong Island Beach & Lunch\",\"time\":\"12:30\",\"description\":\"Enjoy lunch, swimming and relaxing at Hong Island beach\",\"activities\":[\"Lunch\",\"Swimming\"]},{\"day\":7,\"title\":\"360 Viewpoint\",\"time\":\"13:30\",\"description\":\"Walk up to viewpoint for panoramic view of Hong archipelago\",\"activities\":[\"Hiking\",\"Photo\"]},{\"day\":8,\"title\":\"Return to Pier\",\"time\":\"15:00\",\"description\":\"Return to pier and transfer back to hotel\",\"activities\":[\"Return\"]}]', '', '', '08:00', 'Hotel in Krabi', '15:30', 'Return to hotel', '[\"09:00\"]', 'Lunch included', 'Roundtrip hotel transfer', '[\"Sunscreen\",\"Swimming suit\",\"Towel\",\"Camera\"]', 'Program is subject to change depending on weather and sea conditions. Not recommended for pregnant women.', NULL, '2026-04-08 08:45:57', '2026-04-11 07:43:34'),
(21, 'Hong Islands Sunset &amp; View Point (Catamaran)', 'hong-islands-sunset-catamaran-krabi', 'Krabi', 'inbound', 'Experience a premium catamaran cruise to Hong Islands with kayaking, snorkeling and a breathtaking sunset. Enjoy lunch onboard and relax with stunning views of the Andaman Sea.', 'Hong Islands Sunset Catamaran Experience', 1, 0, 'One Day Trip', 2500.00, 1800.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '', '[]', '[\"Catamaran cruise\",\"Hong Islands\",\"Kayaking and paddle board\",\"Sunset experience\",\"Viewpoint hiking\"]', '[\"Hotel transfer\",\"Welcome drink\",\"Afternoon refreshment\",\"Lunch onboard\",\"Snorkeling equipment\",\"Kayak and paddle board\",\"Beach towel\",\"Life jacket\",\"Tour guide\",\"Insurance\"]', '[\"National park fee\",\"Personal expenses\",\"Tips\"]', '[{\"day\":1,\"title\":\"Hotel Pickup\",\"time\":\"10:00\",\"description\":\"Pick up from hotel depending on area\",\"activities\":[\"Transfer\"]},{\"day\":2,\"title\":\"Check-in & Briefing\",\"time\":\"11:00\",\"description\":\"Check-in at pier, enjoy welcome snack and trip briefing\",\"activities\":[\"Welcome drink\"]},{\"day\":3,\"title\":\"Board Catamaran\",\"time\":\"11:30\",\"description\":\"Board catamaran and cruise past Railay and Phra Nang Bay\",\"activities\":[\"Cruising\"]},{\"day\":4,\"title\":\"Kayak & Paddle\",\"time\":\"13:30\",\"description\":\"Enjoy kayaking and paddle boarding at Hong Islands\",\"activities\":[\"Kayak\",\"Paddle board\"]},{\"day\":5,\"title\":\"Lunch & Relax\",\"time\":\"14:30\",\"description\":\"Lunch onboard, followed by snorkeling and relaxing on the beach\",\"activities\":[\"Lunch\",\"Snorkeling\"]},{\"day\":6,\"title\":\"Sunset Cruise\",\"time\":\"16:30\",\"description\":\"Relax on catamaran and enjoy stunning sunset views\",\"activities\":[\"Sunset\"]},{\"day\":7,\"title\":\"Return\",\"time\":\"19:00\",\"description\":\"Return to pier and transfer back to hotel\",\"activities\":[\"Return\"]}]', '', '', '10:00', 'Hotel in Krabi', '19:30', 'Return to hotel', '[\"11:30\"]', 'Lunch onboard', 'Roundtrip hotel transfer', '[\"Slipper\",\"Sunscreen\",\"Sunglasses\",\"Camera\",\"Pocket money\"]', 'Program is subject to change depending on weather and sea conditions. Not recommended for pregnant women.', NULL, '2026-04-08 08:51:48', '2026-04-11 03:41:55');

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

-- --------------------------------------------------------

--
-- Table structure for table `transfer_bookings`
--

CREATE TABLE `transfer_bookings` (
  `id` int(11) NOT NULL,
  `booking_reference` varchar(50) NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_email` varchar(150) NOT NULL,
  `customer_phone` varchar(50) NOT NULL,
  `trip_type` enum('one-way','return') DEFAULT 'one-way',
  `pickup_location` varchar(200) NOT NULL,
  `dropoff_location` varchar(200) NOT NULL,
  `pickup_date` date NOT NULL,
  `pickup_time` time NOT NULL,
  `return_date` date DEFAULT NULL,
  `return_time` time DEFAULT NULL,
  `adults` int(11) DEFAULT 1,
  `children` int(11) DEFAULT 0,
  `infants` int(11) DEFAULT 0,
  `special_requests` text DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transfer_bookings`
--

INSERT INTO `transfer_bookings` (`id`, `booking_reference`, `customer_name`, `customer_email`, `customer_phone`, `trip_type`, `pickup_location`, `dropoff_location`, `pickup_date`, `pickup_time`, `return_date`, `return_time`, `adults`, `children`, `infants`, `special_requests`, `status`, `admin_notes`, `ip_address`, `user_agent`, `created_at`, `updated_at`) VALUES
(1, 'TRF177581407781C5', 'TestT', 'chalantorn2@gmail.com', 'Test', 'one-way', 'Phuket Airport (HKT)', 'Patong Beach', '2026-04-10', '07:41:00', NULL, NULL, 4, 2, 0, 'Test', 'pending', NULL, '171.97.237.156', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-10 09:41:17', '2026-04-10 09:41:17'),
(2, 'TRF177587291433EB', 'Chalantorn', 'chalantorn2@gmail.com', 'Manop', 'return', 'Patong Beach', 'Phuket Old Town', '2026-04-15', '09:59:00', '2026-04-15', '09:04:00', 1, 0, 0, 'TestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTestTest', 'pending', NULL, '171.97.236.115', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', '2026-04-11 02:01:54', '2026-04-11 02:01:54'),
(3, 'TRF1776481683019F', 'Chalantorn', 'chalantorn2@gmail.com', 'Manop', 'one-way', 'Patong Beach', 'Phuket Old Town', '2026-04-18', '11:08:00', NULL, NULL, 4, 2, 0, 'Test', 'pending', NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-18 03:08:03', '2026-04-18 03:08:03'),
(4, 'TRF17765024090889', 'Chalantorn', 'chalantorn2@gmail.com', '0622439182', 'one-way', 'Patong Beach', 'Phuket Old Town', '2026-04-18', '17:53:00', NULL, NULL, 4, 1, 0, 'AAAAA', 'pending', NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-18 08:53:29', '2026-04-18 08:53:29'),
(5, 'TRF1776503639E41C', 'TestFormWeb', 'chalantorn2@gmail.com', '0622439182', 'one-way', 'Patong Beach', 'Phuket Old Town', '2026-04-18', '18:13:00', NULL, NULL, 11, 0, 0, 'TestFormWeb', 'pending', NULL, '171.97.230.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-18 09:13:59', '2026-04-18 09:13:59'),
(6, 'TRF17766532604B70', 'TestFormWeb', 'chalantorn2@gmail.com', '0622439182', 'one-way', 'Krabi Airport (KBV)', 'Patong Beach', '2026-04-20', '10:48:00', NULL, NULL, 3, 1, 0, 'Vehicle: Van — 3,900 THB\nTest', 'pending', NULL, '171.97.222.106', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-20 02:47:40', '2026-04-20 02:47:40'),
(7, 'TRF1776655368D430', 'TestFormWeb', 'chalantorn2@gmail.com', '0622439182', 'one-way', 'Khao Lak', 'Kata Beach', '2026-04-23', '10:25:00', NULL, NULL, 7, 4, 0, 'Vehicle: SUV — 3,000 THB\nTest', 'pending', NULL, '171.97.222.106', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0', '2026-04-20 03:22:48', '2026-04-20 03:22:48');

-- --------------------------------------------------------

--
-- Table structure for table `transfer_locations`
--

CREATE TABLE `transfer_locations` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transfer_locations`
--

INSERT INTO `transfer_locations` (`id`, `name`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Phuket Airport (HKT)', 1, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(2, 'Patong Beach', 1, 2, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(3, 'Karon Beach', 1, 3, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(4, 'Kata Beach', 1, 4, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(5, 'Phuket Old Town', 1, 5, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(6, 'Rawai Beach', 1, 6, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(7, 'Krabi Airport (KBV)', 1, 7, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(8, 'Khao Lak', 1, 8, '2026-04-20 02:43:55', '2026-04-20 02:43:55');

-- --------------------------------------------------------

--
-- Table structure for table `transfer_routes`
--

CREATE TABLE `transfer_routes` (
  `id` int(11) NOT NULL,
  `origin_id` int(11) NOT NULL,
  `destination_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transfer_routes`
--

INSERT INTO `transfer_routes` (`id`, `origin_id`, `destination_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(2, 1, 3, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(3, 1, 4, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(4, 1, 5, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(5, 1, 6, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(6, 1, 7, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(7, 1, 8, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(8, 2, 3, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(9, 2, 4, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(10, 2, 5, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(11, 2, 6, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(12, 2, 7, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(13, 2, 8, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(14, 3, 4, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(15, 3, 5, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(16, 3, 6, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(17, 3, 7, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(18, 3, 8, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(19, 4, 5, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(20, 4, 6, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(21, 4, 7, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(22, 4, 8, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(23, 5, 6, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(24, 5, 7, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(25, 5, 8, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(26, 6, 7, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(27, 6, 8, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(28, 7, 8, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55');

-- --------------------------------------------------------

--
-- Table structure for table `transfer_route_prices`
--

CREATE TABLE `transfer_route_prices` (
  `id` int(11) NOT NULL,
  `route_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transfer_route_prices`
--

INSERT INTO `transfer_route_prices` (`id`, `route_id`, `vehicle_id`, `price`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 800.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(2, 1, 2, 1100.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(3, 1, 3, 1300.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(4, 2, 1, 900.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(5, 2, 2, 1200.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(6, 2, 3, 1400.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(7, 3, 1, 1000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(8, 3, 2, 1300.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(9, 3, 3, 1500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(10, 4, 1, 700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(11, 4, 2, 1000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(12, 4, 3, 1200.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(13, 5, 1, 1100.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(14, 5, 2, 1400.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(15, 5, 3, 1600.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(16, 6, 1, 2800.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(17, 6, 2, 3200.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(18, 6, 3, 3600.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(19, 7, 1, 1800.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(20, 7, 2, 2200.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(21, 7, 3, 2500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(22, 8, 1, 500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(23, 8, 2, 700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(24, 8, 3, 900.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(25, 9, 1, 600.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(26, 9, 2, 800.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(27, 9, 3, 1000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(28, 10, 1, 600.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(29, 10, 2, 800.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(30, 10, 3, 1000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(31, 11, 1, 800.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(32, 11, 2, 1000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(33, 11, 3, 1300.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(34, 12, 1, 3000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(35, 12, 2, 3500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(36, 12, 3, 3900.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(37, 13, 1, 2200.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(38, 13, 2, 2700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(39, 13, 3, 3000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(40, 14, 1, 400.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(41, 14, 2, 500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(42, 14, 3, 700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(43, 15, 1, 700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(44, 15, 2, 900.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(45, 15, 3, 1100.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(46, 16, 1, 600.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(47, 16, 2, 800.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(48, 16, 3, 1000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(49, 17, 1, 3100.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(50, 17, 2, 3600.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(51, 17, 3, 4000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(52, 18, 1, 2400.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(53, 18, 2, 2900.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(54, 18, 3, 3200.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(55, 19, 1, 700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(56, 19, 2, 900.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(57, 19, 3, 1100.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(58, 20, 1, 500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(59, 20, 2, 700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(60, 20, 3, 900.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(61, 21, 1, 3200.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(62, 21, 2, 3700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(63, 21, 3, 4100.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(64, 22, 1, 2500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(65, 22, 2, 3000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(66, 22, 3, 3300.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(67, 23, 1, 700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(68, 23, 2, 900.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(69, 23, 3, 1100.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(70, 24, 1, 2900.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(71, 24, 2, 3300.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(72, 24, 3, 3700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(73, 25, 1, 2000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(74, 25, 2, 2500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(75, 25, 3, 2800.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(76, 26, 1, 3300.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(77, 26, 2, 3800.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(78, 26, 3, 4200.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(79, 27, 1, 2700.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(80, 27, 2, 3200.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(81, 27, 3, 3500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(82, 28, 1, 4000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(83, 28, 2, 4500.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(84, 28, 3, 5000.00, '2026-04-20 02:43:55', '2026-04-20 02:43:55');

-- --------------------------------------------------------

--
-- Table structure for table `transfer_vehicles`
--

CREATE TABLE `transfer_vehicles` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `max_passengers` int(11) DEFAULT 1,
  `max_luggage` int(11) DEFAULT 2,
  `image_url` text DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transfer_vehicles`
--

INSERT INTO `transfer_vehicles` (`id`, `name`, `max_passengers`, `max_luggage`, `image_url`, `description`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Sedan', 3, 2, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 'Comfortable sedan ideal for couples or solo travelers with light luggage.', 1, 1, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(2, 'SUV', 5, 4, 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80', 'Spacious SUV suitable for small families with extra luggage room.', 1, 2, '2026-04-20 02:43:55', '2026-04-20 02:43:55'),
(3, 'Van', 9, 7, 'https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&w=800&q=80', 'Roomy van for groups, families, and travelers with plenty of luggage.', 1, 3, '2026-04-20 02:43:55', '2026-04-20 02:43:55');

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
-- Indexes for table `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_is_featured` (`is_featured`),
  ADD KEY `idx_published_at` (`published_at`),
  ADD KEY `author_id` (`author_id`);

--
-- Indexes for table `blog_related_posts`
--
ALTER TABLE `blog_related_posts`
  ADD PRIMARY KEY (`post_id`,`related_post_id`),
  ADD KEY `related_post_id` (`related_post_id`);

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
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `replied_by` (`replied_by`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `hotels`
--
ALTER TABLE `hotels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_destination` (`destination`),
  ADD KEY `idx_stars` (`stars`),
  ADD KEY `idx_is_featured` (`is_featured`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `hotel_images`
--
ALTER TABLE `hotel_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hotel_id` (`hotel_id`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `hotel_room_types`
--
ALTER TABLE `hotel_room_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hotel_id` (`hotel_id`);

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
-- Indexes for table `transfer_bookings`
--
ALTER TABLE `transfer_bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_reference` (`booking_reference`),
  ADD KEY `idx_booking_ref` (`booking_reference`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_pickup_date` (`pickup_date`);

--
-- Indexes for table `transfer_locations`
--
ALTER TABLE `transfer_locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_name` (`name`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `transfer_routes`
--
ALTER TABLE `transfer_routes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_pair` (`origin_id`,`destination_id`),
  ADD KEY `idx_origin` (`origin_id`),
  ADD KEY `idx_destination` (`destination_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `transfer_route_prices`
--
ALTER TABLE `transfer_route_prices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_route_vehicle` (`route_id`,`vehicle_id`),
  ADD KEY `idx_route` (`route_id`),
  ADD KEY `idx_vehicle` (`vehicle_id`);

--
-- Indexes for table `transfer_vehicles`
--
ALTER TABLE `transfer_vehicles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_name` (`name`),
  ADD KEY `idx_active` (`is_active`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `booking_logs`
--
ALTER TABLE `booking_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hotels`
--
ALTER TABLE `hotels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `hotel_images`
--
ALTER TABLE `hotel_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1269;

--
-- AUTO_INCREMENT for table `hotel_room_types`
--
ALTER TABLE `hotel_room_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=173;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `tours`
--
ALTER TABLE `tours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `tour_images`
--
ALTER TABLE `tour_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transfer_bookings`
--
ALTER TABLE `transfer_bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `transfer_locations`
--
ALTER TABLE `transfer_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `transfer_routes`
--
ALTER TABLE `transfer_routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `transfer_route_prices`
--
ALTER TABLE `transfer_route_prices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `transfer_vehicles`
--
ALTER TABLE `transfer_vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `blog_posts_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `blog_related_posts`
--
ALTER TABLE `blog_related_posts`
  ADD CONSTRAINT `blog_related_posts_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blog_related_posts_ibfk_2` FOREIGN KEY (`related_post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `contact_messages_ibfk_1` FOREIGN KEY (`replied_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hotels`
--
ALTER TABLE `hotels`
  ADD CONSTRAINT `hotels_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hotel_images`
--
ALTER TABLE `hotel_images`
  ADD CONSTRAINT `hotel_images_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hotel_room_types`
--
ALTER TABLE `hotel_room_types`
  ADD CONSTRAINT `hotel_room_types_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE;

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

--
-- Constraints for table `transfer_routes`
--
ALTER TABLE `transfer_routes`
  ADD CONSTRAINT `fk_route_destination` FOREIGN KEY (`destination_id`) REFERENCES `transfer_locations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_route_origin` FOREIGN KEY (`origin_id`) REFERENCES `transfer_locations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transfer_route_prices`
--
ALTER TABLE `transfer_route_prices`
  ADD CONSTRAINT `fk_price_route` FOREIGN KEY (`route_id`) REFERENCES `transfer_routes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_price_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `transfer_vehicles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
