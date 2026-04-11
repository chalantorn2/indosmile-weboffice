-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 06, 2026 at 02:04 PM
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
(1, 'admin', 'admin@indosmilesouthservices.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'active', '2026-04-06 09:40:15', '2025-12-15 09:23:02', '2026-04-06 02:40:15'),
(2, 'kimaya', 'kimayagnair@indosmilesouthservices.com', '$2y$12$pa/xlvzwi.J3rqCDOJJFWeakkQbYCZc1VAjFfNXyJpIByOsLwH35K', 'Kimaya Gopal Nair', 'admin', 'active', '2026-04-04 15:11:26', '2026-04-03 09:54:51', '2026-04-04 08:11:26'),
(3, 'lay', 'chalantorn2@gmail.com', '$2y$12$53HKB3nwzu9CqP7zBETuY.Uhtgcx1lj1fVIC6vargKZCs7X2WsZwS', 'Chalantorn Manop', 'admin', 'active', NULL, '2026-04-06 02:40:54', '2026-04-06 02:41:05');

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
(1, 'First Time in Phuket: How to Prepare?', 'first-time-in-phuket-travel-guide', 1, 'A guide for travelers planning their first trip to Phuket, covering everything from transportation and accommodation to popular attractions.', '<h2>Complete Phuket Travel Guide</h2><p>\n</p><p>Phuket is the largest island in Thailand, known for its beautiful beaches, delicious food, and a wide range of water activities. This article will help you plan your perfect Phuket trip.</p><p>\n\n</p><h3>1. Best Time to Visit</h3><p>\n</p><p>November to April is the best season to visit, with clear skies, pleasant weather, and calm seas—perfect for all water activities.</p><p>\n\n</p><h3>2. Popular Attractions</h3><p>\n</p><p><br></p><p>\n\n</p><h3>3. Must-Try Food</h3><p>\n</p><p>Don’t miss Phuket Hokkien noodles, O-Aew dessert, Lo Ba, and fresh seafood by the beach.</p><p>\n\n</p><h3>4. Getting Around Phuket</h3><p>\n</p><p>It is recommended to rent a car or motorbike for convenience. Alternatively, you can use Grab or tuk-tuks, but always agree on the price beforehand.</p>', '/backend/uploads/tours/69d33ca8cd3b1_1775451304.jpg', NULL, '[\"Phuket\",\"Phuket travel\",\"travel tips\",\"Thailand\"]', NULL, 'Indo Smile Team', 'published', 1, 14, 1, 'First Time in Phuket: Complete Travel Guide | Indo Smile', 'A complete guide for first-time visitors to Phuket, covering transportation, accommodation, attractions, and must-try food.', '2026-04-01 10:00:00', '2026-04-06 04:07:06', '2026-04-06 05:14:15'),
(2, 'Koh Lipe: The Maldives of Thailand You Must Visit', 'koh-lipe-maldives-of-thailand', 2, 'Discover the beauty of Koh Lipe, a small island in the southern Andaman Sea, often called the Maldives of Thailand.', '<h2>Koh Lipe: Paradise in the Andaman Sea</h2><p>\n</p><p>Koh Lipe is located in Satun Province and is part of Tarutao National Park. With crystal-clear water and soft white sand beaches, it has earned the nickname \"The Maldives of Thailand\".</p><p>\n\n</p><h3>Highlights of Koh Lipe</h3><p>\n</p><p><br></p><p>\n\n</p><h3>Must-Do Activities</h3><p>\n</p><p>Snorkeling at Hin Ngam Island, Adang Island, Rawi Island, and Jabang Island—some of the most beautiful dive spots in Thailand.</p><p>\n\n</p><h3>How to Get There</h3><p>\n</p><p>You can travel by speedboat from Pak Bara Pier in Satun (approximately 1.5 hours) or from Langkawi, Malaysia.</p>', '/backend/uploads/tours/69d33b34d787d_1775450932.jpg', NULL, '[\"Koh Lipe\",\"Satun\",\"Andaman Sea\",\"snorkeling\"]', NULL, 'Indo Smile Team', 'published', 1, 24, 1, 'Koh Lipe Travel Guide: The Maldives of Thailand | Indo Smile', 'Complete Koh Lipe travel guide including attractions, activities, transportation, and accommodation.', '2026-04-03 14:00:00', '2026-04-06 04:07:06', '2026-04-06 05:36:27'),
(3, 'Top 10 Southern Street Foods You Must Try in Hat Yai', 'top-10-street-food-hatyai', 4, 'A list of 10 must-try street foods when visiting Hat Yai, from the famous fried chicken to local milk tea.', '<h2>10 Must-Try Street Foods in Hat Yai</h2><p>\n</p><p>Hat Yai in Songkhla Province is not just a border trade city—it is also a paradise for food lovers. Let’s explore what you must try!</p><p><br></p><p>\n\n</p><h3>1. Hat Yai Fried Chicken</h3><p>\n</p><p>The city’s signature dish—crispy on the outside, juicy inside, served with fried shallots. Famous shops include Je Jim Fried Chicken.</p><p>\n\n</p><h3>2. Chicken Biryani</h3><p>\n</p><p>Southern-style biryani rice with fragrant spices and tender chicken, served with a special dipping sauce and soup.</p><p>\n\n</p><h3>3. Roti Mataba</h3><p>\n</p><p>Crispy thin roti filled with meat, egg, and onions—an iconic local dish.</p><p>\n\n</p><h3>4. Thai Milk Tea (Cha Chak)</h3><p>\n</p><p>Malaysian-style pulled tea, creamy and aromatic, best enjoyed with crispy roti.</p><p>\n\n</p><h3>5. Crab Curry with Rice Noodles</h3><p>\n</p><p>Rich coconut curry with crab meat and spices, served with fresh vegetables.</p><p>\n\n</p><h3>6-10 Other Must-Try Dishes</h3><p>\n</p><p><br></p>', '/backend/uploads/tours/69d33a41a7ebe_1775450689.jpg', NULL, '[\"Hat Yai\",\"street food\",\"southern food\",\"Thai food\"]', NULL, 'Indo Smile Team', 'published', 0, 10, 1, 'Top 10 Street Foods in Hat Yai | Indo Smile', 'Discover 10 must-try street foods in Hat Yai including fried chicken, biryani, roti, tea, and more.', '2026-04-05 09:30:00', '2026-04-06 04:07:06', '2026-04-06 04:44:51');

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
(6, 12, 'INDO1775458985EDB1', 'Chalantorn Manop', 'chalantorn2@gmail.com', '0622439182', '2026-04-06', 2, 1, 1, 'Test', 3200.00, 'THB', 'pending', 'unpaid', NULL, NULL, NULL, '171.97.237.47', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-04-06 07:03:05', '2026-04-06 07:03:05');

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
(2, 'Best Western Patong Beach', 'best-western-patong-beach', 'Phuket', 4, 'Best Western Patong Beach is located in the heart of Patong, Phuket, just a short walk from Jungceylon Shopping Center, Bangla Road, and Patong Beach. The hotel offers modern accommodation with free Wi-Fi, rooftop swimming pool, fitness center, restaurant, and bar. Rooms feature air conditioning, flat-screen TVs, minibars, private balconies, and en-suite bathrooms. Guests can also enjoy 24-hour front desk service, tour desk, and airport transfer services.', 'Modern 4-star hotel near Jungceylon, Bangla Road, and Patong Beach with rooftop pool and restaurant.', 4.0, 400, '/backend/uploads/tours/69cf78be0ed71_1775204542.jpg', '[\"Free WiFi\",\"Rooftop Pool\",\"Fitness Center\",\"Restaurant\",\"Bar\",\"24-hour Front Desk\",\"Parking\",\"Airport Transfer\",\"Tour Desk\"]', '14:00', '12:00', '190 Phangmuang Sai Gor Road, Patong, Kathu, Phuket 83150, Thailand', '+66 76 360 200', 'info@bestwesternpatongbeach.com', 'https://www.bestwesternpatongbeach.com', 1, 1, NULL, '2026-04-03 08:19:25', '2026-04-03 08:22:23'),
(3, 'The Nature Phuket', 'the-nature-phuket', 'Phuket', 4, 'The Nature Phuket is a contemporary 5-star resort located in Kalim Bay near Patong Beach. Surrounded by lush greenery and overlooking the Andaman Sea, the hotel offers modern rooms and suites with elegant design. Facilities include three outdoor swimming pools, fitness center, spa, restaurants, bars, kids club, and free shuttle service to Patong. Rooms feature air conditioning, flat-screen TVs, private balconies, and en-suite bathrooms.', '4-star resort in Kalim Bay near Patong Beach with pools, spa, and shuttle service.', 4.2, 3000, '/backend/uploads/tours/69cf7f9f5679a_1775206303.jpg', '[\"Free WiFi\",\"3 Swimming Pools\",\"Fitness Center\",\"Spa\",\"Restaurant\",\"Bar\",\"Kids Club\",\"Shuttle Service\",\"24-hour Front Desk\",\"Parking\"]', '15:00', '12:00', '322 Prabaramee Road, North Patong Beach, Kathu, Phuket 83150, Thailand', '+66 76 681 789', 'rsvn@thenaturephuket.com', 'https://www.thenaturephuket.com', 1, 1, NULL, '2026-04-03 08:50:02', '2026-04-03 09:56:00'),
(4, 'Pearl Hotel Phuket', 'pearl-hotel-phuket', 'Phuket', 4, 'Pearl Hotel Phuket is a centrally located hotel in Phuket Town, offering convenient access to shopping areas, local markets, and cultural attractions. The hotel features an outdoor swimming pool, fitness center, restaurant, and meeting facilities. Rooms are equipped with air conditioning, flat-screen TVs, minibars, and private bathrooms. Guests can enjoy 24-hour front desk service and easy access to Phuket Old Town.', 'City hotel in Phuket Town near Old Town with pool, restaurant, and meeting facilities.', 3.9, 1500, '/backend/uploads/tours/69cf834beedba_1775207243.jpg', '[\"Free WiFi\",\"Swimming Pool\",\"Fitness Center\",\"Restaurant\",\"Meeting Rooms\",\"24-hour Front Desk\",\"Parking\",\"Laundry Service\"]', '14:00', '12:00', '42 Montri Road, Talad Yai, Muang, Phuket 83000, Thailand', '+66 76 211 044', 'info@pearlhotelphuket.com', 'https://www.pearlhotelphuket.com', 0, 1, NULL, '2026-04-03 09:06:09', '2026-04-03 09:07:39'),
(5, 'The Charm', 'the-charm', 'Patong Beach, Phuket', 4, 'The spacious hotel rooms at the Charm Resort Phuket offer all the comforts of home in a modern and luxury setting with a range of room types to suit your individual travel style. The contemporary interiors of our Patong apartments feature delightful Asian elements creating a serene tropical ambiance perfectly suited to the island location. Sleep easy on the high quality king-size bed, browse the entertainment channels from the comfort of the lounge and take a soothing soak in the bathtub after a fun day on the beach at our Patong hotel.', 'Fulfil all your holiday desires at the Charm Resort Phuket, situated just steps away from the gorgeous Patong Beach.', 4.2, 2312, '/backend/uploads/tours/69d0b1e4e87eb_1775284708.JPG', '[\"Leisure & Wellness\",\"Rooftop Infinity Pool: Overlooking the Andaman Sea.\",\"Lagoon-Style Pool: A ground-floor pool winding through the resort.\",\"Fitness Center: Modern gym equipment.\",\"Sauna: Located within the fitness area.\",\"Sun Decks: Lounge areas at both the rooftop and lagoon pools.\",\"Dining & Drinks\",\"Allure Kitchen: Main restaurant for buffet breakfast and all-day dining.\",\"Sky Bar: Rooftop bar for cocktails and snacks with sunset views.\",\"Lobby Bar: Open-air lounge for drinks.\",\"Services & Logistics\",\"24-Hour Front Desk: For check-in and laundry services.\",\"Free Parking: Available on-site.\",\"Children\\u2019s Pool: Dedicated section for kids.\"]', '15:00', '11:00', '212 Thaweewong Road, Patong Beach, Kathu, Phuket 83150', NULL, NULL, 'https://www.thecharmresortphuket.com/', 1, 1, 2, '2026-04-04 06:36:58', '2026-04-04 08:46:00'),
(6, 'Amata Patong', 'amata-patong', 'Patong, Phuket', 4, 'Welcome to Amata Patong: Your Prime Location in Patong Beach. Discover the allure of Amata Patong, a charming 4-star hotel nestled in the lively heart of Patong, Phuket. The hotel offers the perfect blend of excitement and relaxation.', 'Amata Patong The Comfort You Deserve, in the Heart of Patong', 4.0, 2556, '/backend/uploads/tours/69d0d09d76101_1775292573.jpg', '[\"Two Outdoor Pools: A ground-level pool (Sala Pool) and a rooftop pool with 360\\u00b0 views.\",\"Fitness Center: A \\\"Body Fit Room\\\" featuring cardio and resistance equipment.\",\"Dining: Anant Restaurant (international and Thai cuisine) and a coffee shop\\/caf\\u00e9.\",\"Bars: Multiple options, including two poolside bars and a rooftop bar.\",\"Kids\' Club: A dedicated daily activity space for children.\",\"Spa & Wellness: On-site massage services and spa treatments.\",\"Business Services: Meeting and banquet rooms with audio-visual equipment.\",\"24-Hour Services: Front desk, lobby, and security.\",\"Parking: Free on-site self-parking.\",\"Housekeeping: Daily room cleaning.\",\"Other: ATM\\/banking on-site, laundry\\/dry cleaning services, and tour\\/ticket assistance.\"]', '15:00', '12:00', '189/29 Rat-U-Thit Songroi Pi Road, Patong, Kathu, Phuket, Thailand 83150', NULL, NULL, NULL, 1, 1, 2, '2026-04-04 08:51:51', '2026-04-04 08:58:17');

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
(114, 2, '/backend/uploads/tours/69cf796ea2139_1775204718.jpg', 'Gym', '', 4, '2026-04-03 08:50:46'),
(115, 2, '/backend/uploads/tours/69cf798eed538_1775204750.jpg', 'Lobby', '', 6, '2026-04-03 08:50:46'),
(116, 2, '/backend/uploads/tours/69cf798eedd2f_1775204750.jpg', 'Lobby', '', 7, '2026-04-03 08:50:46'),
(117, 2, '/backend/uploads/tours/69cf798eee60f_1775204750.jpg', 'Lobby', '', 8, '2026-04-03 08:50:46'),
(118, 2, '/backend/uploads/tours/69cf798eef05a_1775204750.jpg', 'Lobby', '', 9, '2026-04-03 08:50:46'),
(119, 2, '/backend/uploads/tours/69cf796e9eb83_1775204718.jpg', 'Pool', '', 1, '2026-04-03 08:50:46'),
(120, 2, '/backend/uploads/tours/69cf798ef1163_1775204750.jpg', 'Pool', '', 10, '2026-04-03 08:50:46'),
(121, 2, '/backend/uploads/tours/69cf79b188971_1775204785.jpg', 'Pool', '', 18, '2026-04-03 08:50:46'),
(122, 2, '/backend/uploads/tours/69cf79b1895ab_1775204785.jpg', 'Pool', '', 19, '2026-04-03 08:50:46'),
(123, 2, '/backend/uploads/tours/69cf79b18a048_1775204785.jpg', 'Pool', '', 20, '2026-04-03 08:50:46'),
(124, 2, '/backend/uploads/tours/69cf79b18aaca_1775204785.jpg', 'Pool', '', 21, '2026-04-03 08:50:46'),
(125, 2, '/backend/uploads/tours/69cf79b18b6c8_1775204785.jpg', 'Pool', '', 22, '2026-04-03 08:50:46'),
(126, 2, '/backend/uploads/tours/69cf79b18c03e_1775204785.jpg', 'Pool', '', 23, '2026-04-03 08:50:46'),
(127, 2, '/backend/uploads/tours/69cf79b18c82c_1775204785.jpg', 'Pool', '', 24, '2026-04-03 08:50:46'),
(128, 2, '/backend/uploads/tours/69cf796ea0729_1775204718.jpg', 'Restaurant', '', 2, '2026-04-03 08:50:46'),
(129, 2, '/backend/uploads/tours/69cf796ea1402_1775204718.jpg', 'Restaurant', '', 3, '2026-04-03 08:50:46'),
(130, 2, '/backend/uploads/tours/69cf798ef1ce7_1775204750.jpg', 'Restaurant', '', 11, '2026-04-03 08:50:46'),
(131, 2, '/backend/uploads/tours/69cf798ef263c_1775204750.jpg', 'Restaurant', '', 12, '2026-04-03 08:50:46'),
(132, 2, '/backend/uploads/tours/69cf799b2209f_1775204763.jpg', 'Restaurant', '', 13, '2026-04-03 08:50:46'),
(133, 2, '/backend/uploads/tours/69cf799b22f1b_1775204763.jpg', 'Restaurant', '', 14, '2026-04-03 08:50:46'),
(134, 2, '/backend/uploads/tours/69cf799b23931_1775204763.jpg', 'Restaurant', '', 15, '2026-04-03 08:50:46'),
(135, 2, '/backend/uploads/tours/69cf799b24334_1775204763.jpg', 'Restaurant', '', 16, '2026-04-03 08:50:46'),
(136, 2, '/backend/uploads/tours/69cf79c3b7387_1775204803.jpg', 'Superior Double Room', '', 25, '2026-04-03 08:50:46'),
(137, 2, '/backend/uploads/tours/69cf79c3b7bd9_1775204803.jpg', 'Superior Double Room', '', 26, '2026-04-03 08:50:46'),
(138, 2, '/backend/uploads/tours/69cf79c3b88e3_1775204803.jpg', 'Superior Double Room', '', 28, '2026-04-03 08:50:46'),
(139, 2, '/backend/uploads/tours/69cf79c3b9004_1775204803.jpg', 'Superior Double Room', '', 29, '2026-04-03 08:50:46'),
(140, 2, '/backend/uploads/tours/69cf79c3b953e_1775204803.jpg', 'Superior Double Room', '', 30, '2026-04-03 08:50:46'),
(141, 2, '/backend/uploads/tours/69cf79d40199e_1775204820.jpg', 'Superior Double Room', '', 35, '2026-04-03 08:50:46'),
(142, 2, '/backend/uploads/tours/69cf79c3b82e5_1775204803.jpg', 'Superior Twin Room', '', 27, '2026-04-03 08:50:46'),
(143, 2, '/backend/uploads/tours/69cf79d3f39b1_1775204819.jpg', 'Superior Twin Room', '', 31, '2026-04-03 08:50:46'),
(144, 2, '/backend/uploads/tours/69cf79d3f40b5_1775204819.jpg', 'Superior Twin Room', '', 32, '2026-04-03 08:50:46'),
(145, 2, '/backend/uploads/tours/69cf79d4006f0_1775204820.jpg', 'Superior Twin Room', '', 33, '2026-04-03 08:50:46'),
(146, 2, '/backend/uploads/tours/69cf79d400e82_1775204820.jpg', 'Superior Twin Room', '', 34, '2026-04-03 08:50:46'),
(147, 2, '/backend/uploads/tours/69cf79d4022bb_1775204820.jpg', 'Superior Twin Room', '', 36, '2026-04-03 08:50:46'),
(148, 2, '/backend/uploads/tours/69cf79d4028b5_1775204820.jpg', 'Superior Twin Room', '', 37, '2026-04-03 08:50:46'),
(149, 2, '/backend/uploads/tours/69cf796ea28e7_1775204718.jpg', 'Uncategorized', '', 5, '2026-04-03 08:50:46'),
(150, 2, '/backend/uploads/tours/69cf796ea35c1_1775204718.jpg', 'Uncategorized', '', 6, '2026-04-03 08:50:46'),
(273, 4, '/backend/uploads/tours/69cf8359e58f6_1775207257.jpg', 'Uncategorized', '', 0, '2026-04-03 09:07:39'),
(274, 4, '/backend/uploads/tours/69cf8359e5e00_1775207257.jpg', 'Uncategorized', '', 1, '2026-04-03 09:07:39'),
(275, 4, '/backend/uploads/tours/69cf8359e75ba_1775207257.jpg', 'Uncategorized', '', 2, '2026-04-03 09:07:39'),
(276, 4, '/backend/uploads/tours/69cf8359e79cd_1775207257.jpg', 'Uncategorized', '', 3, '2026-04-03 09:07:39'),
(277, 4, '/backend/uploads/tours/69cf8359e7f0b_1775207257.jpg', 'Uncategorized', '', 4, '2026-04-03 09:07:39'),
(278, 4, '/backend/uploads/tours/69cf8359e8356_1775207257.jpg', 'Uncategorized', '', 5, '2026-04-03 09:07:39'),
(279, 4, '/backend/uploads/tours/69cf8359e8679_1775207257.jpg', 'Uncategorized', '', 6, '2026-04-03 09:07:39'),
(463, 3, '/backend/uploads/tours/69cf7fb0ab2a1_1775206320.jpg', 'Pool', '', 5, '2026-04-04 06:31:28'),
(464, 3, '/backend/uploads/tours/69cf7fcc6fa5a_1775206348.jpg', 'Pool', '', 16, '2026-04-04 06:31:28'),
(465, 3, '/backend/uploads/tours/69cf7fcc71044_1775206348.jpg', 'Pool', '', 18, '2026-04-04 06:31:28'),
(466, 3, '/backend/uploads/tours/69cf8016d9847_1775206422.jpg', 'Pool', '', 25, '2026-04-04 06:31:28'),
(467, 3, '/backend/uploads/tours/69cf80244e2ad_1775206436.jpg', 'Pool', '', 28, '2026-04-04 06:31:28'),
(468, 3, '/backend/uploads/tours/69cf8024503fe_1775206436.jpg', 'Pool', '', 31, '2026-04-04 06:31:28'),
(469, 3, '/backend/uploads/tours/69cf803981ac4_1775206457.jpg', 'Pool', '', 35, '2026-04-04 06:31:28'),
(470, 3, '/backend/uploads/tours/69cf803983b25_1775206457.jpg', 'Pool', '', 38, '2026-04-04 06:31:28'),
(471, 3, '/backend/uploads/tours/69cf803984cd8_1775206457.jpg', 'Pool', '', 39, '2026-04-04 06:31:28'),
(472, 3, '/backend/uploads/tours/69cf803985a45_1775206457.jpg', 'Pool', '', 40, '2026-04-04 06:31:28'),
(473, 3, '/backend/uploads/tours/69cf804729055_1775206471.jpg', 'Pool', '', 47, '2026-04-04 06:31:28'),
(474, 3, '/backend/uploads/tours/69cf8055a54c4_1775206485.jpg', 'Pool', '', 49, '2026-04-04 06:31:28'),
(475, 3, '/backend/uploads/tours/69cf807831da1_1775206520.jpg', 'Pool', '', 59, '2026-04-04 06:31:28'),
(476, 3, '/backend/uploads/tours/69cf8078328f0_1775206520.jpg', 'Pool', '', 60, '2026-04-04 06:31:28'),
(477, 3, '/backend/uploads/tours/69cf7fb0a7e5c_1775206320.jpg', 'Restaurant', '', 0, '2026-04-04 06:31:28'),
(478, 3, '/backend/uploads/tours/69cf7fb0a8e2e_1775206320.jpg', 'Restaurant', '', 1, '2026-04-04 06:31:28'),
(479, 3, '/backend/uploads/tours/69cf7fbeb821b_1775206334.jpg', 'Restaurant', '', 8, '2026-04-04 06:31:28'),
(480, 3, '/backend/uploads/tours/69cf7fbeb8a98_1775206334.jpg', 'Restaurant', '', 9, '2026-04-04 06:31:28'),
(481, 3, '/backend/uploads/tours/69cf80244ef86_1775206436.jpg', 'Restaurant', '', 29, '2026-04-04 06:31:28'),
(482, 3, '/backend/uploads/tours/69cf802450f3a_1775206436.jpg', 'Restaurant', '', 32, '2026-04-04 06:31:28'),
(483, 3, '/backend/uploads/tours/69cf8024516f4_1775206436.jpg', 'Restaurant', '', 33, '2026-04-04 06:31:28'),
(484, 3, '/backend/uploads/tours/69cf807830bb6_1775206520.jpg', 'Restaurant', '', 57, '2026-04-04 06:31:28'),
(485, 3, '/backend/uploads/tours/69cf8078314f0_1775206520.jpg', 'Restaurant', '', 58, '2026-04-04 06:31:28'),
(486, 3, '/backend/uploads/tours/69cf7fb0a96ac_1775206320.jpg', 'Uncategorized', '', 2, '2026-04-04 06:31:28'),
(487, 3, '/backend/uploads/tours/69cf7fb0a9dfa_1775206320.jpg', 'Uncategorized', '', 3, '2026-04-04 06:31:28'),
(488, 3, '/backend/uploads/tours/69cf7fb0aa99d_1775206320.jpg', 'Uncategorized', '', 4, '2026-04-04 06:31:28'),
(489, 3, '/backend/uploads/tours/69cf7fbeb6e3d_1775206334.jpg', 'Uncategorized', '', 6, '2026-04-04 06:31:28'),
(490, 3, '/backend/uploads/tours/69cf7fbeb757b_1775206334.jpg', 'Uncategorized', '', 7, '2026-04-04 06:31:28'),
(491, 3, '/backend/uploads/tours/69cf7fbeb960f_1775206334.jpg', 'Uncategorized', '', 10, '2026-04-04 06:31:28'),
(492, 3, '/backend/uploads/tours/69cf7fbeb9c8b_1775206334.jpg', 'Uncategorized', '', 11, '2026-04-04 06:31:28'),
(493, 3, '/backend/uploads/tours/69cf7fbebacab_1775206334.jpg', 'Uncategorized', '', 12, '2026-04-04 06:31:28'),
(494, 3, '/backend/uploads/tours/69cf7fcc6ded3_1775206348.jpg', 'Uncategorized', '', 13, '2026-04-04 06:31:28'),
(495, 3, '/backend/uploads/tours/69cf7fcc6eb0f_1775206348.jpg', 'Uncategorized', '', 14, '2026-04-04 06:31:28'),
(496, 3, '/backend/uploads/tours/69cf7fcc6f1a9_1775206348.jpg', 'Uncategorized', '', 15, '2026-04-04 06:31:28'),
(497, 3, '/backend/uploads/tours/69cf7fcc7090c_1775206348.jpg', 'Uncategorized', '', 17, '2026-04-04 06:31:28'),
(498, 3, '/backend/uploads/tours/69cf7fcc71d12_1775206348.jpg', 'Uncategorized', '', 19, '2026-04-04 06:31:28'),
(499, 3, '/backend/uploads/tours/69cf8016d4dcd_1775206422.jpg', 'Uncategorized', '', 20, '2026-04-04 06:31:28'),
(500, 3, '/backend/uploads/tours/69cf8016d5935_1775206422.jpg', 'Uncategorized', '', 21, '2026-04-04 06:31:28'),
(501, 3, '/backend/uploads/tours/69cf8016d635a_1775206422.jpg', 'Uncategorized', '', 22, '2026-04-04 06:31:28'),
(502, 3, '/backend/uploads/tours/69cf8016d7110_1775206422.jpg', 'Uncategorized', '', 23, '2026-04-04 06:31:28'),
(503, 3, '/backend/uploads/tours/69cf8016d8061_1775206422.jpg', 'Uncategorized', '', 24, '2026-04-04 06:31:28'),
(504, 3, '/backend/uploads/tours/69cf8016daa3d_1775206422.jpg', 'Uncategorized', '', 26, '2026-04-04 06:31:28'),
(505, 3, '/backend/uploads/tours/69cf80244d87b_1775206436.jpg', 'Uncategorized', '', 27, '2026-04-04 06:31:28'),
(506, 3, '/backend/uploads/tours/69cf80244f996_1775206436.jpg', 'Uncategorized', '', 30, '2026-04-04 06:31:28'),
(507, 3, '/backend/uploads/tours/69cf803980a4f_1775206457.jpg', 'Uncategorized', '', 34, '2026-04-04 06:31:28'),
(508, 3, '/backend/uploads/tours/69cf8039824be_1775206457.jpg', 'Uncategorized', '', 36, '2026-04-04 06:31:28'),
(509, 3, '/backend/uploads/tours/69cf803982b0a_1775206457.jpg', 'Uncategorized', '', 37, '2026-04-04 06:31:28'),
(510, 3, '/backend/uploads/tours/69cf8047226c9_1775206471.jpg', 'Uncategorized', '', 41, '2026-04-04 06:31:28'),
(511, 3, '/backend/uploads/tours/69cf804723521_1775206471.jpg', 'Uncategorized', '', 42, '2026-04-04 06:31:28'),
(512, 3, '/backend/uploads/tours/69cf804724054_1775206471.jpg', 'Uncategorized', '', 43, '2026-04-04 06:31:28'),
(513, 3, '/backend/uploads/tours/69cf80472532e_1775206471.jpg', 'Uncategorized', '', 44, '2026-04-04 06:31:28'),
(514, 3, '/backend/uploads/tours/69cf8047261c9_1775206471.jpg', 'Uncategorized', '', 45, '2026-04-04 06:31:28'),
(515, 3, '/backend/uploads/tours/69cf804727f79_1775206471.jpg', 'Uncategorized', '', 46, '2026-04-04 06:31:28'),
(516, 3, '/backend/uploads/tours/69cf8055a4a4d_1775206485.jpg', 'Uncategorized', '', 48, '2026-04-04 06:31:28'),
(517, 3, '/backend/uploads/tours/69cf8055a63a8_1775206485.jpg', 'Uncategorized', '', 50, '2026-04-04 06:31:28'),
(518, 3, '/backend/uploads/tours/69cf8055a6e48_1775206485.jpg', 'Uncategorized', '', 51, '2026-04-04 06:31:28'),
(519, 3, '/backend/uploads/tours/69cf8055a7542_1775206485.jpg', 'Uncategorized', '', 52, '2026-04-04 06:31:28'),
(520, 3, '/backend/uploads/tours/69cf8055a7cf4_1775206485.jpg', 'Uncategorized', '', 53, '2026-04-04 06:31:28'),
(521, 3, '/backend/uploads/tours/69cf8055a84f2_1775206485.jpg', 'Uncategorized', '', 54, '2026-04-04 06:31:28'),
(522, 3, '/backend/uploads/tours/69cf80782fb16_1775206520.jpg', 'Uncategorized', '', 55, '2026-04-04 06:31:28'),
(523, 3, '/backend/uploads/tours/69cf8078303df_1775206520.jpg', 'Uncategorized', '', 56, '2026-04-04 06:31:28'),
(623, 5, '/backend/uploads/tours/69d0b4aaa6690_1775285418.jpg', 'Bedroom', '', 0, '2026-04-04 08:46:00'),
(624, 5, '/backend/uploads/tours/69d0b4b0327ea_1775285424.jpg', 'Bedroom', '', 1, '2026-04-04 08:46:00'),
(625, 5, '/backend/uploads/tours/69d0b4b3b461f_1775285427.jpg', 'Bedroom', '', 2, '2026-04-04 08:46:00'),
(626, 5, '/backend/uploads/tours/69d0b4b67e545_1775285430.jpg', 'Bedroom', '', 3, '2026-04-04 08:46:00'),
(627, 5, '/backend/uploads/tours/69d0b4babcf89_1775285434.jpg', 'Bedroom', '', 4, '2026-04-04 08:46:00'),
(628, 5, '/backend/uploads/tours/69d0b4bdeb4c5_1775285437.jpg', 'Bedroom', '', 5, '2026-04-04 08:46:00'),
(629, 5, '/backend/uploads/tours/69d0b4c086719_1775285440.jpg', 'Bedroom', '', 6, '2026-04-04 08:46:00'),
(630, 5, '/backend/uploads/tours/69d0b4c45cbeb_1775285444.jpg', 'Bedroom', '', 7, '2026-04-04 08:46:00'),
(631, 5, '/backend/uploads/tours/69d0b4c713594_1775285447.jpg', 'Bedroom', '', 8, '2026-04-04 08:46:00'),
(632, 5, '/backend/uploads/tours/69d0b4c9bb53d_1775285449.jpg', 'Bedroom', '', 9, '2026-04-04 08:46:00'),
(633, 5, '/backend/uploads/tours/69d0b4cbe3c5c_1775285451.jpg', 'Bedroom', '', 10, '2026-04-04 08:46:00'),
(634, 5, '/backend/uploads/tours/69d0b4cec91f2_1775285454.jpg', 'Bedroom', '', 11, '2026-04-04 08:46:00'),
(635, 5, '/backend/uploads/tours/69d0b4d161c1f_1775285457.jpg', 'Bedroom', '', 12, '2026-04-04 08:46:00'),
(636, 5, '/backend/uploads/tours/69d0b4d3ee3ad_1775285459.jpg', 'Bedroom', '', 13, '2026-04-04 08:46:00'),
(637, 5, '/backend/uploads/tours/69d0b4d6c02b6_1775285462.jpg', 'Bedroom', '', 14, '2026-04-04 08:46:00'),
(638, 5, '/backend/uploads/tours/69d0b4d9296ad_1775285465.jpg', 'Bedroom', '', 15, '2026-04-04 08:46:00'),
(639, 5, '/backend/uploads/tours/69d0b4dbb016a_1775285467.jpg', 'Bedroom', '', 16, '2026-04-04 08:46:00'),
(640, 5, '/backend/uploads/tours/69d0b4dea5484_1775285470.jpg', 'Bedroom', '', 17, '2026-04-04 08:46:00'),
(641, 5, '/backend/uploads/tours/69d0b9961f060_1775286678.jpg', 'Exterior', '', 18, '2026-04-04 08:46:00'),
(642, 5, '/backend/uploads/tours/69d0b99933122_1775286681.jpg', 'Exterior', '', 19, '2026-04-04 08:46:00'),
(643, 5, '/backend/uploads/tours/69d0b9a0b7cdb_1775286688.jpg', 'Exterior', '', 20, '2026-04-04 08:46:00'),
(644, 5, '/backend/uploads/tours/69d0b9a76e8bd_1775286695.jpg', 'Exterior', '', 21, '2026-04-04 08:46:00'),
(645, 5, '/backend/uploads/tours/69d0b9aa0c91e_1775286698.jpg', 'Exterior', '', 22, '2026-04-04 08:46:00'),
(646, 5, '/backend/uploads/tours/69d0b9aec1a8d_1775286702.jpg', 'Exterior', '', 23, '2026-04-04 08:46:00'),
(647, 5, '/backend/uploads/tours/69d0b9b0bc6ae_1775286704.jpg', 'Exterior', '', 24, '2026-04-04 08:46:00'),
(648, 5, '/backend/uploads/tours/69d0b9b53364f_1775286709.jpg', 'Exterior', '', 25, '2026-04-04 08:46:00'),
(649, 5, '/backend/uploads/tours/69d0b9b7bb6ed_1775286711.jpg', 'Exterior', '', 26, '2026-04-04 08:46:00'),
(650, 5, '/backend/uploads/tours/69d0b9ba9b76a_1775286714.jpg', 'Exterior', '', 27, '2026-04-04 08:46:00'),
(651, 5, '/backend/uploads/tours/69d0b9c6e0e40_1775286726.jpg', 'Exterior', '', 28, '2026-04-04 08:46:00'),
(652, 5, '/backend/uploads/tours/69d0b9c907a48_1775286729.jpg', 'Exterior', '', 29, '2026-04-04 08:46:00'),
(653, 5, '/backend/uploads/tours/69d0b9cb8b5d6_1775286731.jpg', 'Exterior', '', 30, '2026-04-04 08:46:00'),
(654, 5, '/backend/uploads/tours/69d0b9cdc7de6_1775286733.jpg', 'Exterior', '', 31, '2026-04-04 08:46:00'),
(655, 5, '/backend/uploads/tours/69d0b9d34be40_1775286739.jpg', 'Exterior', '', 32, '2026-04-04 08:46:00');

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
(17, 2, 'Superior Double Room', 'Modern room with one double bed, private balcony, air conditioning, flat-screen TV, minibar, and en-suite bathroom.', 2, NULL, 28.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Balcony\",\"Safe\"]', 0, 1, '2026-04-03 08:50:46', '2026-04-03 08:50:46'),
(18, 2, 'Superior Twin Room', 'Modern room with twin beds, private balcony, air conditioning, flat-screen TV, minibar, and en-suite bathroom.', 2, NULL, 28.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Balcony\",\"Safe\"]', 1, 1, '2026-04-03 08:50:46', '2026-04-03 08:50:46'),
(34, 4, 'Superior Room', 'Comfortable room with city view, air conditioning, flat-screen TV, minibar, and en-suite bathroom.', 2, NULL, 28.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Safe\"]', 0, 1, '2026-04-03 09:07:39', '2026-04-03 09:07:39'),
(35, 4, 'Deluxe Room', 'Spacious room with modern decor, seating area, city view, and full amenities.', 2, NULL, 32.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Seating Area\",\"Safe\"]', 1, 1, '2026-04-03 09:07:39', '2026-04-03 09:07:39'),
(36, 4, 'Junior Suite', 'Large suite with separate living area, ideal for business or leisure stays.', 2, NULL, 45.0, '[\"Free WiFi\",\"Living Area\",\"Bathtub\",\"Minibar\",\"Safe\"]', 2, 1, '2026-04-03 09:07:39', '2026-04-03 09:07:39'),
(50, 3, 'Deluxe Room', 'Spacious 36 sqm room with forest or garden view, private balcony, air conditioning, flat-screen TV, minibar, and en-suite bathroom.', 2, NULL, 36.0, '[\"Free WiFi\",\"Air Conditioning\",\"Flat-screen TV\",\"Minibar\",\"Balcony\",\"Safe\"]', 0, 1, '2026-04-04 06:31:28', '2026-04-04 06:31:28'),
(51, 3, 'Deluxe Pool Access', 'Modern room with direct access to the swimming pool, private balcony, rain shower, smart TV, and full amenities.', 2, NULL, 36.0, '[\"Free WiFi\",\"Smart TV\",\"Pool Access\",\"Balcony\",\"Rain Shower\",\"Safe\"]', 1, 1, '2026-04-04 06:31:28', '2026-04-04 06:31:28'),
(52, 3, 'Junior Suite', 'Large 62 sqm suite with separate living area, elegant design, private balcony, and premium amenities.', 2, NULL, 62.0, '[\"Free WiFi\",\"Living Area\",\"Balcony\",\"Bathtub\",\"Minibar\",\"Safe\"]', 2, 1, '2026-04-04 06:31:28', '2026-04-04 06:31:28'),
(53, 3, 'Grand Suite Two Bedrooms', 'Spacious 100 sqm suite with two bedrooms, living area, and balcony, ideal for families.', 4, NULL, 100.0, '[\"Free WiFi\",\"Living Room\",\"2 Bedrooms\",\"Balcony\",\"Minibar\",\"Safe\"]', 3, 1, '2026-04-04 06:31:28', '2026-04-04 06:31:28'),
(54, 3, 'Deluxe Private Jacuzzi', 'At this delightful Deluxe room you can treat yourself to a soothing soak in your own private dip pool with massaging jet streams anytime you choose. Located on the balcony, the outdoor pool is totally private, the perfect place to unwind with your loved one. The 36m2 room at our resort in Kalim Bay is extremely comfortable with modern amenities at your fingertips making it easy to relax and feel at home in paradise Phuket.(Hot water is unavaialble for Jacuzzi)', 2, NULL, 36.0, '[\"High-speed Wi-Fi Internet\",\"43\\u201d LED Smart TV\",\"Private balcony\",\"Rain shower\",\"Bathrobes & slippers\",\"Hairdryer\",\"Electronic safe\",\"Writing desk\"]', 4, 1, '2026-04-04 06:31:28', '2026-04-04 06:31:28'),
(55, 3, 'Junior Suite Pool Access', 'Make a splash in the refreshing pool just a few steps away from your Junior Suite Pool Access room at our Patong Beach hotel. This contemporary style suite is a haven of relaxation offering 62m2 of space including a living area and separate bedroom. The en-suite bathroom is modern and elegant featuring a rain shower and bathtub to soothe and refresh your skin after a day at the beach or pool. This lovely suite at The Nature Phuket is perfect for couples and small families, with space for an extra bed if required.', 2, NULL, NULL, '[\"Private balcony\",\"Living \\/ dining room\",\"High-speed Wi-Fi Internet\",\"43\\u201d LED Smart TV\",\"Rain shower & bathtub\",\"Bathrobes & slippers\",\"Hairdryer\",\"Electronic safe\",\"Writing desk\"]', 5, 1, '2026-04-04 06:31:28', '2026-04-04 06:31:28'),
(66, 5, 'Deluxe Pool Access', 'Taking a refreshing dip has never been easier at the Charm Resort Phuket&#039;s Deluxe Pool Access room, featuring an extended balcony that steps down to the lagoon-style swimming pool surrounded by lush foliage. The spacious interiors of our Patong accommodation include a relaxing daybed, work desk, and luxury bathroom where you can soak in the tub while overlooking the room, balcony, and beyond. The quality king-size bed is perfectly positioned to enjoy pool views and in-room entertainment with an LCD TV, and a wide range of satellite channels.', 3, NULL, NULL, '[]', 0, 1, '2026-04-04 08:46:00', '2026-04-04 08:46:00'),
(67, 5, 'Junior Suite', 'The well-appointed Junior Suite at our Phuket beach resort has tasteful modern interiors that feature a separate bedroom and living area, perfect for couples and small families that prefer extra space. The king-size bedroom has an LCD TV, private balcony and contemporary en-suite bathroom with rain shower and bathtub.\n\nAt the Charm Resort Phuket prepare light snacks and refreshments with ease, enjoy room service meals at the dining table and lounge on the sofa with the in-room entertainment. And slide back the living room glass doors to access the spacious private balcony with comfortable furnishings to take in the pleasant views.', 2, NULL, NULL, '[]', 1, 1, '2026-04-04 08:46:00', '2026-04-04 08:46:00'),
(68, 5, 'Executive Suite', 'The Executive Suite at our Thailand hotel adds glamour and style to your stay with two levels of chic contemporary living. A highlight is the extended upper floor deck with loungers and a delightful Jacuzzi tub for two, where romantic couples can share intimate moments while admiring the gorgeous views of Patong Bay.\n\nThe lower floor features the king-size bedroom and beautiful bathroom with a revitalising rain shower and bathtub with a view. Both levels of this duplex hotel room have stylish lounge areas to enjoy the in-room entertainment and free Wi-Fi is available throughout. The upper floor is designed for dining, lounging and above all relaxing, with all the facilities you need within easy reach.', 2, NULL, NULL, '[]', 2, 1, '2026-04-04 08:46:00', '2026-04-04 08:46:00'),
(69, 5, 'Family Two Bedroom Suite', 'The duplex Family Two Bedroom Suite completes the portfolio of stylish rooms at The Charm Resort Phuket. This tastefully designed suite with modern Asian interiors has two floors of amenities for guests, ideal for small groups or families sharing. The lower level has a separate living area and master bedroom, each with an entertainment system and private balcony. The master en-suite has a lavish bathtub with a view across the room and a separate rain shower. The lounge area has comfy furnishings to enjoy a cozy night in with a movie and room service.\n\nUpstairs has an open plan layout featuring a second bedroom. A wonderful feature of the upper floor is the large extended balcony with a delightful Jacuzzi tub and loungers adding a touch of romance and indulgence to your stay. This is the perfect spot for guests at our Patong Beach family hotel to socialize and enjoy the fabulous views with a tropical cocktail as the sun sets over Patong Bay.', 2, NULL, NULL, '[]', 3, 1, '2026-04-04 08:46:00', '2026-04-04 08:46:00'),
(70, 5, 'The Charm Suite', 'This is the most lavish suite at our Patong beachfront resort where couples and families can enjoy an extravagant tropical lifestyle. The two storey Charm Suite offers spacious outdoor areas to admire the prime Andaman Sea views and elegant interiors complete with a full range of modern amenities. A special feature is the luxury Jacuzzi for two on the oversized balcony, the perfect spot for star gazing with a bottle of wine.\n\nThe bedroom and main bathroom are on the lower level, which also features a private balcony, living and dining area separate from the sleeping quarters. The spacious upper floor on this one bedroom suite in Patong is a great place to socialise. The open plan design features a large lounge area with sofa and dining table. There are also two balconies adding extra light to the room making it wonderfully the bright and airy. A second toilet is also on the upper floor for added convenience.', 2, NULL, NULL, '[]', 4, 1, '2026-04-04 08:46:00', '2026-04-04 08:46:00');

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
(12, 'Koh Hey + Sunset Promthep (Catamaran)', 'coral-beach-club-sunset-catamaran', 'Phuket', 'inbound', 'Enjoy a relaxing afternoon at Coral Beach Club on Koh Hey, followed by snorkeling at Hin Dam Bay and a sunset yacht cruise to Promthep Cape with dinner onboard.', 'Coral Beach Club + Sunset Yacht Experience', 1, 0, 'One Day Trip', 1800.00, 1400.00, 'THB', 0.0, 0, 1, 1, NULL, 1, 'easy', '/backend/uploads/tours/69ce34cebc9bb_1775121614.jpg', '[\"\\/backend\\/uploads\\/tours\\/69ce34e71e4f6_1775121639.jpg\",\"\\/backend\\/uploads\\/tours\\/69ce34e71eeee_1775121639.jpg\",\"\\/backend\\/uploads\\/tours\\/69ce34e71f91c_1775121639.jpg\",\"\\/backend\\/uploads\\/tours\\/69ce34e71fc50_1775121639.jpg\",\"\\/backend\\/uploads\\/tours\\/69ce34f547c1c_1775121653.jpg\"]', '[\"Yacht Catamaran cruise\",\"Coral Beach Club\",\"Snorkeling at Hin Dam Bay\",\"Sunset at Promthep Cape\",\"Dinner onboard\"]', '[\"Hotel transfer\",\"Catamaran yacht\",\"Dinner onboard\",\"Soft drinks and fruits\",\"Snorkeling equipment\",\"Tour guide\",\"Insurance\"]', '[\"Alcoholic drinks\",\"Personal expenses\",\"Optional activities\",\"Tips\"]', '[{\"day\":1,\"title\":\"Departure from Rawai Pier\",\"time\":\"14:00\",\"description\":\"Board the catamaran and depart to Koh Hey.\",\"activities\":[]},{\"day\":2,\"title\":\"Coral Beach Club\",\"time\":\"14:30\",\"description\":\"Relax on the beach and enjoy activities.\",\"activities\":[]},{\"day\":3,\"title\":\"Snorkeling at Hin Dam Bay\",\"time\":\"16:30\",\"description\":\"Explore coral reefs and marine life.\",\"activities\":[]},{\"day\":4,\"title\":\"Sunset at Promthep Cape\",\"time\":\"18:00\",\"description\":\"Enjoy sunset with dinner onboard.\",\"activities\":[]},{\"day\":5,\"title\":\"Return to Pier\",\"time\":\"19:30\",\"description\":\"Transfer back to hotel.\",\"activities\":[]}]', 'Schedule subject to change depending on weather conditions.', 'Free cancellation 24 hours before departure.', '14:00', 'Hotel in Phuket (Kata, Karon, Patong)', '19:30', 'Return to hotel', '[\"14:00\"]', 'Dinner included', 'Roundtrip hotel transfer', '[\"Swimwear\",\"Towel\",\"Sunscreen\",\"Sunglasses\",\"Camera\"]', 'Program may change depending on weather and sea conditions. Free transfer only in selected areas.', NULL, '2026-04-02 09:19:56', '2026-04-02 09:53:19');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- AUTO_INCREMENT for table `hotels`
--
ALTER TABLE `hotels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `hotel_images`
--
ALTER TABLE `hotel_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=656;

--
-- AUTO_INCREMENT for table `hotel_room_types`
--
ALTER TABLE `hotel_room_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tours`
--
ALTER TABLE `tours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `tour_images`
--
ALTER TABLE `tour_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
