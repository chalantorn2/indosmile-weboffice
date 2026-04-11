-- ===================================
-- Migration: Add Transfer Page Gallery
-- Date: 2026-04-11
-- ===================================
-- This migration adds the transfer_gallery setting to store
-- gallery images for the "Our Services in Action" section
-- on the Transfer page. Images are managed via Admin Panel.
--
-- Storage: settings table (JSON array of {src, alt} objects)
-- No new table is needed — uses existing settings infrastructure.
-- ===================================

INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('transfer_gallery',
 '[{"src":"https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80","alt":"VIP Van Transfer"},{"src":"https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80","alt":"Luxury Coach Service"},{"src":"https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80","alt":"Airport Transfer"},{"src":"https://images.unsplash.com/photo-1549317661-a47734bbd828?w=600&q=80","alt":"Private Sedan"},{"src":"https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80","alt":"Airport Pickup Service"},{"src":"https://images.unsplash.com/photo-1609520505218-7421df70a75b?w=600&q=80","alt":"Group Transfer"}]',
 'json',
 'Transfer page gallery images (JSON array of {src, alt})')
ON DUPLICATE KEY UPDATE `setting_key` = `setting_key`;
