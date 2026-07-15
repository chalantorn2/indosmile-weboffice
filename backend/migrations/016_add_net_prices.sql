-- Migration 016: Split cost from selling price, and turn agent rates into a markup
--
-- Contract Rate hands us the supplier's NET price. Until now we dropped it straight
-- into adult_price/child_price, so the number we pay and the number we charge were
-- the same column and nobody could tell them apart afterwards.
--
--   net_adult_price / net_child_price  what the tour costs us      (admin-only, never public)
--   adult_price     / child_price      what we sell it for         (public)
--
-- Agent rates are now built UP from our cost instead of DOWN from our selling price:
--
--   agent_adult = tours.net_adult_price + r.adult_markup
--   agent_child = tours.net_child_price + r.child_markup   (NULL when the tour has no child net)
--
-- Old rows carried a discount off the selling price, which has no meaning under the new
-- model, so every markup resets to 0 and the rates have to be set again.

-- ─── 1. Cost price on tours and shows ────────────────────────────────────────
ALTER TABLE `tours`
    ADD COLUMN `net_adult_price` DECIMAL(10, 2) NULL AFTER `duration_label`,
    ADD COLUMN `net_child_price` DECIMAL(10, 2) NULL AFTER `net_adult_price`;

ALTER TABLE `shows`
    ADD COLUMN `net_adult_price` DECIMAL(10, 2) NULL AFTER `duration_label`,
    ADD COLUMN `net_child_price` DECIMAL(10, 2) NULL AFTER `net_adult_price`;

-- Existing rows have no cost on file. Seed it from the selling price so agent rates
-- keep resolving; an admin corrects it tour by tour.
UPDATE `tours` SET `net_adult_price` = `adult_price`, `net_child_price` = `child_price`;
UPDATE `shows` SET `net_adult_price` = `adult_price`, `net_child_price` = `child_price`;

-- ─── 2. agent_tour_rates: discount → markup ──────────────────────────────────
ALTER TABLE `agent_tour_rates`
    CHANGE `adult_discount` `adult_markup` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CHANGE `child_discount` `child_markup` DECIMAL(10,2) NOT NULL DEFAULT 0.00;

UPDATE `agent_tour_rates` SET `adult_markup` = 0.00, `child_markup` = 0.00;
