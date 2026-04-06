-- Migration: Split price into adult_price and child_price
-- Run this on your existing database

-- 1. Rename price → adult_price
ALTER TABLE `tours` CHANGE `price` `adult_price` DECIMAL(10,2) NOT NULL;

-- 2. Add child_price column (after adult_price)
ALTER TABLE `tours` ADD `child_price` DECIMAL(10,2) DEFAULT NULL AFTER `adult_price`;

-- 3. Drop price_label (no longer needed, computed in frontend)
ALTER TABLE `tours` DROP COLUMN `price_label`;

-- 4. Set default child_price = 70% of adult_price for existing tours
UPDATE `tours` SET `child_price` = ROUND(`adult_price` * 0.7, 2) WHERE `child_price` IS NULL;
