-- ===================================
-- Add new settings for social media & address
-- Run this migration to add new setting keys
-- ===================================

INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('site_address', '199/100 Moo 9, Thepkrasattri, Thalang, Phuket 83110', 'string', 'Office address shown on the website'),
('social_facebook', '', 'string', 'Facebook page URL'),
('social_instagram', '', 'string', 'Instagram page URL'),
('social_line', '', 'string', 'LINE Official Account URL'),
('social_whatsapp', '', 'string', 'WhatsApp link (wa.me/...)')
ON DUPLICATE KEY UPDATE `setting_key` = `setting_key`;
