-- Migration 007: Add 'shows' to tours.type enum for Shows & Adventures
-- Existing values: 'inbound','outbound','incentive'
-- New value: 'shows'

ALTER TABLE `tours`
    MODIFY `type` ENUM('inbound','outbound','incentive','shows') DEFAULT 'inbound';
