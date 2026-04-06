<?php
// Database Configuration for Indo Smile South Services CRM
// Environment: Production

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'sevensmile_indosmile');

// ⚠️ แก้ไขตามที่ตั้งใน Plesk
define('DB_USER', 'sevensmile_indosmile');  // หรือ user ที่สร้างใหม่
define('DB_PASS', 'DnerC2dx@nBe5a0^'); // ⬅️ เปลี่ยนเป็น password ที่ตั้งใหม่

define('DB_CHARSET', 'utf8mb4');

// API Configuration
define('API_VERSION', '1');
define('API_BASE_URL', 'https://indosmilesouthservices.com/backend/api');

// Session Configuration
define('SESSION_LIFETIME', 7200); // 2 hours
define('SESSION_NAME', 'INDOSMILE_ADMIN_SESSION');

// Security
define('JWT_SECRET_KEY', 'indosmile-secret-key-2025-production');
define('PASSWORD_HASH_ALGO', PASSWORD_BCRYPT);
define('PASSWORD_HASH_COST', 12);

// File Upload Configuration
define('UPLOAD_MAX_SIZE', 5242880); // 5MB
define('UPLOAD_DIR', __DIR__ . '/../uploads/');

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Timezone
date_default_timezone_set('Asia/Bangkok');

// Error Reporting (ปิดในโปรดักชั่น)
error_reporting(0);
ini_set('display_errors', 0);

// App Information
define('APP_NAME', 'Indo Smile South Services CRM');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'production');
