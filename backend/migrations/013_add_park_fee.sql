-- Migration 013: National park fee, mirrored from the Contract Rate source fields
-- park_fee_included = 1 means the fee is already inside adult_price/child_price.

ALTER TABLE `tours`
    ADD COLUMN `park_fee_included` TINYINT(1) NOT NULL DEFAULT 0 AFTER `child_price`,
    ADD COLUMN `park_fee_adult` DECIMAL(10, 2) NULL AFTER `park_fee_included`,
    ADD COLUMN `park_fee_child` DECIMAL(10, 2) NULL AFTER `park_fee_adult`;

ALTER TABLE `shows`
    ADD COLUMN `park_fee_included` TINYINT(1) NOT NULL DEFAULT 0 AFTER `child_price`,
    ADD COLUMN `park_fee_adult` DECIMAL(10, 2) NULL AFTER `park_fee_included`,
    ADD COLUMN `park_fee_child` DECIMAL(10, 2) NULL AFTER `park_fee_adult`;
