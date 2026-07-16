-- ===================================
-- Add payment_mode setting (Stripe sandbox vs live switch)
-- Controlled from Settings > Payments (super_admin only).
-- Default 'test' so a fresh install can never charge real cards by accident.
-- ===================================

INSERT INTO `settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('payment_mode', 'test', 'string', 'Stripe payment mode: test (sandbox) or live (real charges)')
ON DUPLICATE KEY UPDATE `setting_key` = `setting_key`;
