-- =====================================================================
-- Migration 006: Restructure Transfer system into normalized tables
-- =====================================================================
-- Replaces flat `transfers` table with 4 normalized tables:
--   transfer_locations      master list of pickup/dropoff locations
--   transfer_vehicles       master list of vehicle types
--   transfer_routes         pairs of locations (bidirectional, stored as origin_id < destination_id)
--   transfer_route_prices   price of each vehicle on each route
-- =====================================================================

DROP TABLE IF EXISTS `transfer_route_prices`;
DROP TABLE IF EXISTS `transfer_routes`;
DROP TABLE IF EXISTS `transfer_vehicles`;
DROP TABLE IF EXISTS `transfer_locations`;
DROP TABLE IF EXISTS `transfers`;

CREATE TABLE `transfer_locations` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `sort_order` INT(11) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_name` (`name`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `transfer_vehicles` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `max_passengers` INT(11) DEFAULT 1,
    `max_luggage` INT(11) DEFAULT 2,
    `image_url` TEXT NULL,
    `description` TEXT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `sort_order` INT(11) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_name` (`name`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `transfer_routes` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `origin_id` INT(11) NOT NULL,
    `destination_id` INT(11) NOT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_pair` (`origin_id`, `destination_id`),
    INDEX `idx_origin` (`origin_id`),
    INDEX `idx_destination` (`destination_id`),
    INDEX `idx_active` (`is_active`),
    CONSTRAINT `fk_route_origin` FOREIGN KEY (`origin_id`) REFERENCES `transfer_locations` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_route_destination` FOREIGN KEY (`destination_id`) REFERENCES `transfer_locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `transfer_route_prices` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `route_id` INT(11) NOT NULL,
    `vehicle_id` INT(11) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_route_vehicle` (`route_id`, `vehicle_id`),
    INDEX `idx_route` (`route_id`),
    INDEX `idx_vehicle` (`vehicle_id`),
    CONSTRAINT `fk_price_route` FOREIGN KEY (`route_id`) REFERENCES `transfer_routes` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_price_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `transfer_vehicles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
