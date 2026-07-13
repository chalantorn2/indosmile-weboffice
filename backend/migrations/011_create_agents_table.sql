-- Migration 011: Agent (B2B partner) accounts + login history
-- Run once against sevensmile_indosmile

CREATE TABLE IF NOT EXISTS `agents` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `agent_code` VARCHAR(20) NOT NULL,
  `company_name` VARCHAR(200) NOT NULL,
  `contact_name` VARCHAR(150) DEFAULT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `whatsapp` VARCHAR(50) DEFAULT NULL,
  `line_id` VARCHAR(100) DEFAULT NULL,
  `wechat_id` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `tax_id` VARCHAR(50) DEFAULT NULL,
  `license_no` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` DATETIME DEFAULT NULL,
  `login_count` INT(11) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_agents_code` (`agent_code`),
  UNIQUE KEY `uq_agents_email` (`email`),
  KEY `idx_agents_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `agent_login_logs` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `agent_id` INT(11) NOT NULL,
  `success` TINYINT(1) NOT NULL DEFAULT 1,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_agent_login_logs_agent` (`agent_id`),
  KEY `idx_agent_login_logs_created` (`created_at`),
  CONSTRAINT `fk_agent_login_logs_agent` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
