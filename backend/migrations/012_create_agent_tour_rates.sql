-- Migration 012: Per-agent contract rates for tours
-- Run once against sevensmile_indosmile
--
-- Stores the DISCOUNT off our selling price, not the net rate itself, so that
-- raising tours.adult_price / tours.child_price flows through to every agent
-- automatically instead of leaving stale net rates behind.
--
--   net_adult = MAX(tours.adult_price - adult_discount, 0)
--   net_child = MAX(tours.child_price - child_discount, 0)   (NULL when the tour has no child price)
--
-- A tour with no row here is simply not visible to that agent.

CREATE TABLE IF NOT EXISTS `agent_tour_rates` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `agent_id` INT(11) NOT NULL,
  `tour_id` INT(11) NOT NULL,
  `adult_discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `child_discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_agent_tour` (`agent_id`, `tour_id`),
  KEY `idx_agent_tour_rates_tour` (`tour_id`),
  CONSTRAINT `fk_agent_tour_rates_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_agent_tour_rates_tour` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
