-- Migration 010: Link tours/shows back to the Contract Rate source record
-- Lets admin import a tour from contractrate.sevensmiletourandticket.com and
-- keeps a reference so the same source tour cannot be imported twice.

ALTER TABLE `tours`
    ADD COLUMN `source_tour_id` INT(11) NULL COMMENT 'tours.id on the Contract Rate API' AFTER `created_by`,
    ADD COLUMN `source_supplier_name` VARCHAR(200) NULL AFTER `source_tour_id`,
    ADD UNIQUE INDEX `idx_source_tour_id` (`source_tour_id`);

ALTER TABLE `shows`
    ADD COLUMN `source_tour_id` INT(11) NULL COMMENT 'tours.id on the Contract Rate API' AFTER `created_by`,
    ADD COLUMN `source_supplier_name` VARCHAR(200) NULL AFTER `source_tour_id`,
    ADD UNIQUE INDEX `idx_source_tour_id` (`source_tour_id`);
