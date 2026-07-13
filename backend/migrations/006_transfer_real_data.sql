-- ============================================================
-- Transfer Real Data Migration
-- Source: transfer.csv
-- Description: Remove sample transfer data and insert real
--              pricing data from CSV
-- Note: transfer_vehicles table is NOT modified
--        (Sedan=1, SUV=2, Van=3)
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

-- ============================================================
-- STEP 1: Add category/label columns to transfer_routes
-- These help organize different types of transfer services
-- ============================================================
ALTER TABLE `transfer_routes`
  ADD COLUMN IF NOT EXISTS `category` VARCHAR(100) DEFAULT NULL AFTER `destination_id`,
  ADD COLUMN IF NOT EXISTS `label` VARCHAR(300) DEFAULT NULL AFTER `category`;

-- ============================================================
-- STEP 2: DELETE existing sample data (prices → routes → locations)
-- Order matters because of foreign key constraints
-- ============================================================
DELETE FROM `transfer_route_prices`;
DELETE FROM `transfer_routes`;
DELETE FROM `transfer_locations`;

-- Reset auto_increment
ALTER TABLE `transfer_route_prices` AUTO_INCREMENT = 1;
ALTER TABLE `transfer_routes` AUTO_INCREMENT = 1;
ALTER TABLE `transfer_locations` AUTO_INCREMENT = 1;

-- ============================================================
-- STEP 3: INSERT locations (58 total)
-- ============================================================
INSERT INTO `transfer_locations` (`id`, `name`, `is_active`, `sort_order`) VALUES
-- ── Airport ──
(1, 'Phuket Airport (HKT)', 1, 1),

-- ── Hotel Areas (used in Airport Transfer section) ──
(2, 'Patong Beach', 1, 2),
(3, 'Kalim Beach', 1, 3),
(4, 'Phuket Town', 1, 4),
(5, 'Tritrang Beach', 1, 5),
(6, 'Karon Beach', 1, 6),
(7, 'Kata Beach', 1, 7),
(8, 'Laguna Beach', 1, 8),
(9, 'Bang Tao Beach', 1, 9),
(10, 'Surin Beach', 1, 10),
(11, 'Kamala Beach', 1, 11),
(12, 'Nai Yang Beach', 1, 12),
(13, 'Nai Thon Beach', 1, 13),
(14, 'Rawai Beach', 1, 14),
(15, 'Chalong Bay', 1, 15),
(16, 'Cape Panwa Beach', 1, 16),
(17, 'Sirey Bay', 1, 17),

-- ── Additional Phuket Areas ──
(18, 'Mai Khao', 1, 18),
(19, 'Nai Harn', 1, 19),

-- ── Hotel Transfer Destinations (Section 1: Hotel → Destination) ──
(20, 'Phuket Town / Laem Hin Pier', 1, 20),
(21, 'Patong / Kalim / Tri Trang', 1, 21),
(22, 'Kata / Karon', 1, 22),
(23, 'Rawai / Nai Harn', 1, 23),
(24, 'Surin / Bang Tao / Laguna', 1, 24),
(25, 'Ao Por Yacht Haven', 1, 25),
(26, 'Nai Yang / Nai Thon Beach', 1, 26),

-- ── Inter-province Destinations ──
(27, 'Phang Nga Province', 1, 27),
(28, 'Trang Province', 1, 28),
(29, 'Krabi / Krabi Airport', 1, 29),
(30, 'Don Sak Pier', 1, 30),
(31, 'Surat Thani Province', 1, 31),
(32, 'Khao Lak', 1, 32),
(33, 'Krabi / Ao Nang', 1, 33),

-- ── Generic Origin (used as origin for Hotel/Inter-province/Program routes) ──
(34, 'Phuket Hotel', 1, 34),

-- ── City Tour Program Destinations ──
(35, 'Half Day City Tour (4 hrs)', 1, 35),
(36, 'Half Day City Tour (6 hrs) + Tiger Kingdom', 1, 36),
(37, 'Half Day City Tour PVT 5 hrs + Elephant', 1, 37),

-- ── Attraction / Activity Destinations (for round trips) ──
(38, 'Restaurant', 1, 38),
(39, 'Splash Jungle Water Park', 1, 39),
(40, 'Tiger Kingdom', 1, 40),
(41, 'Aquaria / Andamanda', 1, 41),
(42, 'Phuket Elephant Jungle Sanctuary', 1, 42),
(43, 'Blue Tree Lagoon', 1, 43),
(44, 'Hanuman World', 1, 44),
(45, 'Show Venue A', 1, 45),
(46, 'Show Venue B', 1, 46),

-- ── Combined Area Origins (for round-trip pricing by area) ──
(47, 'Patong / Kalim / Kata area', 1, 47),
(48, 'Laguna / Surin / Bang Tao', 1, 48),
(49, 'Kamala / Kalim / Patong', 1, 49),
(50, 'Rawai / Nai Harn / Chalong Bay', 1, 50),
(51, 'Cape Panwa / Ao Por / Koh Sirey', 1, 51),
(52, 'Patong / Kata / Karon / Cape Panwa', 1, 52),
(53, 'Patong / Kata / Karon', 1, 53),
(54, 'Patong area', 1, 54),
(55, 'Kamala area', 1, 55),
(56, 'Patong / Kalim', 1, 56),

-- ── Additional Program Destinations (distinct from regular transfer) ──
(57, 'Krabi / Ao Nang (Move Hotel + City Tour)', 1, 57),
(58, 'Khao Lak (Move Hotel)', 1, 58);


-- ============================================================
-- STEP 4: INSERT routes (59 total)
-- Categories:
--   hotel_transfer       = Hotel → Destination (Section 1)
--   airport_transfer     = Airport → Hotel Area (Section 2)
--   inter_province       = Long distance transfers (Section 3)
--   move_hotel           = Hotel relocation (Section 4)
--   city_tour            = City tour programs (Section 5)
--   restaurant_roundtrip = Hotel–Restaurant–Hotel (Section 6)
--   attraction_roundtrip = Hotel–Attraction–Hotel (Section 7)
--   show_roundtrip_a     = Hotel–Show–Hotel group A (Section 8)
--   show_roundtrip_b     = Hotel–Show–Hotel group B (Section 9)
-- ============================================================
INSERT INTO `transfer_routes` (`id`, `origin_id`, `destination_id`, `category`, `label`, `is_active`) VALUES

-- ── Section 1: Hotel → Destination (CSV rows 2-10, items 1-9) ──
(1,  34, 20, 'hotel_transfer', 'Hotel → Phuket Town / Laem Hin Pier', 1),
(2,  34, 21, 'hotel_transfer', 'Hotel → Patong / Kalim / Tri Trang', 1),
(3,  34, 22, 'hotel_transfer', 'Hotel → Kata / Karon', 1),
(4,  34, 23, 'hotel_transfer', 'Hotel → Rawai / Nai Harn', 1),
(5,  34, 24, 'hotel_transfer', 'Hotel → Surin / Bang Tao / Laguna', 1),
(6,  34, 11, 'hotel_transfer', 'Hotel → Kamala', 1),
(7,  34, 18, 'hotel_transfer', 'Hotel → Mai Khao', 1),
(8,  34, 25, 'hotel_transfer', 'Hotel → Ao Por Yacht Haven', 1),
(9,  34, 26, 'hotel_transfer', 'Hotel → Nai Yang / Nai Thon Beach', 1),

-- ── Section 2: Airport → Hotel Area (CSV rows 13-28, items 10-25) ──
(10, 1,  2,  'airport_transfer', 'Phuket Airport → Patong Beach', 1),
(11, 1,  3,  'airport_transfer', 'Phuket Airport → Kalim Beach', 1),
(12, 1,  4,  'airport_transfer', 'Phuket Airport → Phuket Town', 1),
(13, 1,  5,  'airport_transfer', 'Phuket Airport → Tritrang Beach', 1),
(14, 1,  6,  'airport_transfer', 'Phuket Airport → Karon Beach', 1),
(15, 1,  7,  'airport_transfer', 'Phuket Airport → Kata Beach', 1),
(16, 1,  8,  'airport_transfer', 'Phuket Airport → Laguna Beach', 1),
(17, 1,  9,  'airport_transfer', 'Phuket Airport → Bang Tao Beach', 1),
(18, 1,  10, 'airport_transfer', 'Phuket Airport → Surin Beach', 1),
(19, 1,  11, 'airport_transfer', 'Phuket Airport → Kamala Beach', 1),
(20, 1,  12, 'airport_transfer', 'Phuket Airport → Nai Yang Beach', 1),
(21, 1,  13, 'airport_transfer', 'Phuket Airport → Nai Thon Beach', 1),
(22, 1,  14, 'airport_transfer', 'Phuket Airport → Rawai Beach', 1),
(23, 1,  15, 'airport_transfer', 'Phuket Airport → Chalong Bay', 1),
(24, 1,  16, 'airport_transfer', 'Phuket Airport → Cape Panwa Beach', 1),
(25, 1,  17, 'airport_transfer', 'Phuket Airport → Sirey Bay', 1),

-- ── Section 3: Inter-province (CSV rows 31-36, items 26-31) ──
(26, 34, 27, 'inter_province', 'Phang Nga Province (2 hrs)', 1),
(27, 34, 28, 'inter_province', 'Trang Province (2 hrs)', 1),
(28, 34, 29, 'inter_province', 'Krabi / Krabi Airport (3 hrs)', 1),
(29, 34, 30, 'inter_province', 'Don Sak Pier', 1),
(30, 34, 31, 'inter_province', 'Surat Thani Province (5 hrs)', 1),
(31, 34, 32, 'inter_province', 'Phuket Hotel → Khao Lak Hotel', 1),

-- ── Section 4: Move Hotel (CSV row 39, item 32) ──
(32, 34, 33, 'move_hotel', 'Phuket Hotel → Krabi / Ao Nang (Move Hotel)', 1),

-- ── Section 5: City Tour Programs (CSV rows 42-46, items 33-37) ──
(33, 34, 35, 'city_tour', 'Half Day City Tour (4 hrs)', 1),
(34, 34, 36, 'city_tour', 'Half Day City Tour (6 hrs) + Tiger Kingdom', 1),
(35, 34, 57, 'city_tour', 'Phuket → Krabi / Ao Nang (Move Hotel + City Tour)', 1),
(36, 34, 37, 'city_tour', 'Half Day City Tour PVT 5 hrs + Elephant', 1),
(37, 34, 58, 'city_tour', 'Phuket Hotel → Khao Lak (Move Hotel)', 1),

-- ── Section 6: Restaurant Round Trip (CSV rows 49-53, items 1-5) ──
(38, 47, 38, 'restaurant_roundtrip', 'Hotel → Restaurant → Hotel (Patong/Kalim/Kata area)', 1),
(39, 48, 38, 'restaurant_roundtrip', 'Hotel → Restaurant → Hotel from Laguna/Surin/Bang Tao', 1),
(40, 49, 38, 'restaurant_roundtrip', 'Hotel → Restaurant → Hotel from Kamala/Kalim/Patong', 1),
(41, 50, 38, 'restaurant_roundtrip', 'Hotel → Restaurant → Hotel from Rawai/Nai Harn/Chalong Bay', 1),
(42, 51, 38, 'restaurant_roundtrip', 'Hotel → Restaurant → Hotel from Cape Panwa/Ao Por/Koh Sirey', 1),

-- ── Section 7: Attraction Round Trip (CSV rows 56-62, items 6-12) ──
(43, 52, 39, 'attraction_roundtrip', 'Hotel – Splash Jungle Water Park – Hotel (Patong/Kata/Karon/Cape Panwa)', 1),
(44, 52, 40, 'attraction_roundtrip', 'Hotel – Tiger Kingdom – Hotel (Patong/Kata/Karon/Cape Panwa)', 1),
(45, 53, 4,  'attraction_roundtrip', 'Hotel – Phuket Town – Hotel (Patong/Kata/Karon)', 1),
(46, 34, 41, 'attraction_roundtrip', 'Hotel – Aquaria / Andamanda – Hotel', 1),
(47, 34, 42, 'attraction_roundtrip', 'Hotel – Phuket Elephant Jungle Sanctuary – Hotel', 1),
(48, 34, 43, 'attraction_roundtrip', 'Hotel – Blue Tree Lagoon – Hotel', 1),
(49, 34, 44, 'attraction_roundtrip', 'Hotel – Hanuman World – Hotel', 1),

-- ── Section 8: Show Round Trip A (CSV rows 65-69, items 13-17) ──
(50, 54, 45, 'show_roundtrip_a', 'Hotel – Show – Hotel (Patong area)', 1),
(51, 22, 45, 'show_roundtrip_a', 'Hotel – Show – Hotel (Kata / Karon)', 1),
(52, 23, 45, 'show_roundtrip_a', 'Hotel – Show – Hotel (Rawai / Nai Harn)', 1),
(53, 24, 45, 'show_roundtrip_a', 'Hotel – Show – Hotel (Surin / Bang Tao / Laguna)', 1),
(54, 55, 45, 'show_roundtrip_a', 'Hotel – Show – Hotel (Kamala area)', 1),

-- ── Section 9: Show Round Trip B (CSV rows 72-76, items 18-22) ──
(55, 56, 46, 'show_roundtrip_b', 'Hotel – Show – Hotel (Patong / Kalim)', 1),
(56, 22, 46, 'show_roundtrip_b', 'Hotel – Show – Hotel (Kata / Karon)', 1),
(57, 23, 46, 'show_roundtrip_b', 'Hotel – Show – Hotel (Rawai / Nai Harn)', 1),
(58, 24, 46, 'show_roundtrip_b', 'Hotel – Show – Hotel (Surin / Bang Tao / Laguna)', 1),
(59, 4,  46, 'show_roundtrip_b', 'Hotel – Show – Hotel (Phuket Town)', 1);


-- ============================================================
-- STEP 5: INSERT prices (174 total)
-- Vehicle IDs: Car/Sedan=1, SUV=2, Van=3
-- All prices in THB
-- ============================================================
INSERT INTO `transfer_route_prices` (`route_id`, `vehicle_id`, `price`) VALUES
-- ── Section 1: Hotel Transfer (routes 1-9) ──
-- Route 1: Hotel → Phuket Town / Laem Hin Pier
(1, 1, 1150.00), (1, 2, 1350.00), (1, 3, 1350.00),
-- Route 2: Hotel → Patong / Kalim / Tri Trang
(2, 1, 1350.00), (2, 2, 1650.00), (2, 3, 1650.00),
-- Route 3: Hotel → Kata / Karon
(3, 1, 1350.00), (3, 2, 1650.00), (3, 3, 1650.00),
-- Route 4: Hotel → Rawai / Nai Harn
(4, 1, 1450.00), (4, 2, 1650.00), (4, 3, 1650.00),
-- Route 5: Hotel → Surin / Bang Tao / Laguna
(5, 1, 1150.00), (5, 2, 1350.00), (5, 3, 1350.00),
-- Route 6: Hotel → Kamala
(6, 1, 1250.00), (6, 2, 1450.00), (6, 3, 1450.00),
-- Route 7: Hotel → Mai Khao
(7, 1, 1450.00), (7, 2, 1650.00), (7, 3, 1650.00),
-- Route 8: Hotel → Ao Por Yacht Haven
(8, 1, 1550.00), (8, 2, 1750.00), (8, 3, 1750.00),
-- Route 9: Hotel → Nai Yang / Nai Thon Beach
(9, 1, 1350.00), (9, 2, 1550.00), (9, 3, 1550.00),

-- ── Section 2: Airport Transfer (routes 10-25) ──
-- All airport transfers: Car=850, SUV=950, Van=1050
-- Route 10: Airport → Patong Beach
(10, 1, 850.00), (10, 2, 950.00), (10, 3, 1050.00),
-- Route 11: Airport → Kalim Beach
(11, 1, 850.00), (11, 2, 950.00), (11, 3, 1050.00),
-- Route 12: Airport → Phuket Town
(12, 1, 850.00), (12, 2, 950.00), (12, 3, 1050.00),
-- Route 13: Airport → Tritrang Beach
(13, 1, 850.00), (13, 2, 950.00), (13, 3, 1050.00),
-- Route 14: Airport → Karon Beach
(14, 1, 850.00), (14, 2, 950.00), (14, 3, 1050.00),
-- Route 15: Airport → Kata Beach
(15, 1, 850.00), (15, 2, 950.00), (15, 3, 1050.00),
-- Route 16: Airport → Laguna Beach
(16, 1, 850.00), (16, 2, 950.00), (16, 3, 1050.00),
-- Route 17: Airport → Bang Tao Beach
(17, 1, 850.00), (17, 2, 950.00), (17, 3, 1050.00),
-- Route 18: Airport → Surin Beach
(18, 1, 850.00), (18, 2, 950.00), (18, 3, 1050.00),
-- Route 19: Airport → Kamala Beach
(19, 1, 850.00), (19, 2, 950.00), (19, 3, 1050.00),
-- Route 20: Airport → Nai Yang Beach
(20, 1, 850.00), (20, 2, 950.00), (20, 3, 1050.00),
-- Route 21: Airport → Nai Thon Beach
(21, 1, 850.00), (21, 2, 950.00), (21, 3, 1050.00),
-- Route 22: Airport → Rawai Beach
(22, 1, 850.00), (22, 2, 950.00), (22, 3, 1050.00),
-- Route 23: Airport → Chalong Bay
(23, 1, 850.00), (23, 2, 950.00), (23, 3, 1050.00),
-- Route 24: Airport → Cape Panwa Beach
(24, 1, 850.00), (24, 2, 950.00), (24, 3, 1050.00),
-- Route 25: Airport → Sirey Bay
(25, 1, 850.00), (25, 2, 950.00), (25, 3, 1050.00),

-- ── Section 3: Inter-province (routes 26-31) ──
-- Route 26: Phang Nga Province (2 hrs)
(26, 1, 1950.00), (26, 2, 2050.00), (26, 3, 2350.00),
-- Route 27: Trang Province (2 hrs)
(27, 1, 4650.00), (27, 2, 5150.00), (27, 3, 5450.00),
-- Route 28: Krabi / Krabi Airport (3 hrs)
(28, 1, 2250.00), (28, 2, 2450.00), (28, 3, 2650.00),
-- Route 29: Don Sak Pier
(29, 1, 4650.00), (29, 2, 5150.00), (29, 3, 5450.00),
-- Route 30: Surat Thani Province (5 hrs) - NO PRICES AVAILABLE (marked as "-" in CSV)
-- Route 31: Phuket Hotel → Khao Lak Hotel
(31, 1, 2150.00), (31, 2, 2350.00), (31, 3, 2750.00),

-- ── Section 4: Move Hotel (route 32) ──
-- Route 32: Phuket Hotel → Krabi / Ao Nang
(32, 1, 2450.00), (32, 2, 2650.00), (32, 3, 2950.00),

-- ── Section 5: City Tour Programs (routes 33-37) ──
-- Route 33: Half Day City Tour (4 hrs)
(33, 1, 1950.00), (33, 2, 1950.00), (33, 3, 1950.00),
-- Route 34: Half Day City Tour (6 hrs) + Tiger Kingdom
(34, 1, 2250.00), (34, 2, 2250.00), (34, 3, 2250.00),
-- Route 35: Phuket → Krabi / Ao Nang (Move Hotel + City Tour)
(35, 1, 3650.00), (35, 2, 3650.00), (35, 3, 3950.00),
-- Route 36: Half Day City Tour PVT 5 hrs + Elephant
(36, 1, 2250.00), (36, 2, 2250.00), (36, 3, 2250.00),
-- Route 37: Phuket Hotel → Khao Lak (Move Hotel)
(37, 1, 3150.00), (37, 2, 3150.00), (37, 3, 3150.00),

-- ── Section 6: Restaurant Round Trip (routes 38-42) ──
-- Route 38: Hotel–Restaurant–Hotel (Patong/Kalim/Kata area)
(38, 1, 1350.00), (38, 2, 1350.00), (38, 3, 1650.00),
-- Route 39: Hotel–Restaurant–Hotel from Laguna/Surin/Bang Tao
(39, 1, 1350.00), (39, 2, 1350.00), (39, 3, 1650.00),
-- Route 40: Hotel–Restaurant–Hotel from Kamala/Kalim/Patong
(40, 1, 1550.00), (40, 2, 1650.00), (40, 3, 1750.00),
-- Route 41: Hotel–Restaurant–Hotel from Rawai/Nai Harn/Chalong Bay
(41, 1, 1550.00), (41, 2, 1650.00), (41, 3, 1750.00),
-- Route 42: Hotel–Restaurant–Hotel from Cape Panwa/Ao Por/Koh Sirey
(42, 1, 1950.00), (42, 2, 2350.00), (42, 3, 2350.00),

-- ── Section 7: Attraction Round Trip (routes 43-49) ──
-- Route 43: Hotel–Splash Jungle Water Park–Hotel (Patong/Kata/Karon/Cape Panwa)
(43, 1, 1650.00), (43, 2, 2150.00), (43, 3, 2150.00),
-- Route 44: Hotel–Tiger Kingdom–Hotel (Patong/Kata/Karon/Cape Panwa)
(44, 1, 1350.00), (44, 2, 1550.00), (44, 3, 1650.00),
-- Route 45: Hotel–Phuket Town–Hotel (Patong/Kata/Karon)
(45, 1, 1150.00), (45, 2, 1350.00), (45, 3, 1350.00),
-- Route 46: Hotel–Aquaria / Andamanda–Hotel
(46, 1, 1450.00), (46, 2, 1550.00), (46, 3, 1650.00),
-- Route 47: Hotel–Phuket Elephant Jungle Sanctuary–Hotel
(47, 1, 1450.00), (47, 2, 1550.00), (47, 3, 1650.00),
-- Route 48: Hotel–Blue Tree Lagoon–Hotel
(48, 1, 1650.00), (48, 2, 1750.00), (48, 3, 1750.00),
-- Route 49: Hotel–Hanuman World–Hotel
(49, 1, 1850.00), (49, 2, 1950.00), (49, 3, 2050.00),

-- ── Section 8: Show Round Trip A (routes 50-54) ──
-- Route 50: Hotel–Show–Hotel (Patong area)
(50, 1, 1350.00), (50, 2, 1650.00), (50, 3, 1650.00),
-- Route 51: Hotel–Show–Hotel (Kata / Karon)
(51, 1, 1450.00), (51, 2, 1650.00), (51, 3, 1650.00),
-- Route 52: Hotel–Show–Hotel (Rawai / Nai Harn)
(52, 1, 1550.00), (52, 2, 1750.00), (52, 3, 1750.00),
-- Route 53: Hotel–Show–Hotel (Surin / Bang Tao / Laguna)
(53, 1, 1450.00), (53, 2, 1650.00), (53, 3, 1650.00),
-- Route 54: Hotel–Show–Hotel (Kamala area)
(54, 1, 1150.00), (54, 2, 1350.00), (54, 3, 1350.00),

-- ── Section 9: Show Round Trip B (routes 55-59) ──
-- Route 55: Hotel–Show–Hotel (Patong / Kalim)
(55, 1, 1450.00), (55, 2, 1650.00), (55, 3, 1650.00),
-- Route 56: Hotel–Show–Hotel (Kata / Karon)
(56, 1, 1450.00), (56, 2, 1650.00), (56, 3, 1650.00),
-- Route 57: Hotel–Show–Hotel (Rawai / Nai Harn)
(57, 1, 1550.00), (57, 2, 1750.00), (57, 3, 1750.00),
-- Route 58: Hotel–Show–Hotel (Surin / Bang Tao / Laguna)
(58, 1, 1450.00), (58, 2, 1650.00), (58, 3, 1650.00),
-- Route 59: Hotel–Show–Hotel (Phuket Town)
(59, 1, 1150.00), (59, 2, 1350.00), (59, 3, 1350.00);

COMMIT;
