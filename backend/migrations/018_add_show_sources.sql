-- Migration 018: Track every Contract Rate source row that feeds a single show
-- A show can be imported from several Contract Rate rows at once (each row is one
-- seat zone / ticket option). `shows.source_tour_id` only holds one id, so this
-- link table records all of them and lets the importer mark each source row as
-- already imported (blocking a second pick).

CREATE TABLE IF NOT EXISTS `show_sources` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `show_id` INT(11) NOT NULL,
    `source_tour_id` INT(11) NOT NULL COMMENT 'tours.id on the Contract Rate API',
    `source_supplier_name` VARCHAR(200) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_source_tour_id` (`source_tour_id`),
    INDEX `idx_show_id` (`show_id`),
    CONSTRAINT `fk_show_sources_show` FOREIGN KEY (`show_id`) REFERENCES `shows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
