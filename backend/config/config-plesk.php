<?php
// Database Configuration for Indo Smile South Services CRM
// Environment: Production (Plesk)

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'sevensmile_indosmile');

// ⚠️ แก้ไขตามที่ตั้งใน Plesk
define('DB_USER', 'indosmile_admin');  // หรือ sevensmile_indosmile
define('DB_PASS', 'Admin@2025!');      // ⬅️ เปลี่ยนตาม password จริง

define('DB_CHARSET', 'utf8mb4');

// API Configuration
define('API_VERSION', '1');
define('API_BASE_URL', 'https://indosmilesouthservices.com/backend/api');

// Session Configuration
define('SESSION_LIFETIME', 7200); // 2 hours
define('SESSION_NAME', 'INDOSMILE_ADMIN_SESSION');

// Security
define('JWT_SECRET_KEY', 'indosmile-secret-key-2025-change-this');
define('PASSWORD_HASH_ALGO', PASSWORD_BCRYPT);
define('PASSWORD_HASH_COST', 12);

// File Upload Configuration
define('UPLOAD_MAX_SIZE', 5242880); // 5MB
define('UPLOAD_DIR', __DIR__ . '/../uploads/');

// ⚠️ PHP 5.6 ไม่รองรับ array ใน define() - ใช้ constant แทน
// ALLOWED_IMAGE_TYPES และ ALLOWED_ORIGINS จะอยู่ใน helpers.php แทน

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Timezone
date_default_timezone_set('Asia/Bangkok');

// Error Reporting (เปิดชั่วคราวเพื่อ debug)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// App Information
define('APP_NAME', 'Indo Smile South Services CRM');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'production');
