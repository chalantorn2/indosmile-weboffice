<?php
// Database Configuration for Indo Smile South Services CRM
// Environment: Production

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'sevensmile_indosmile');
define('DB_USER', 'sevensmile_indosmile');

// ⚠️ ถ้า password จริงไม่มี backslash ให้ใช้บรรทัดนี้:
define('DB_PASS', 'DnerC2dx@nBe5a0^');

// ⚠️ ถ้า password มี backslash จริงๆ (\) ให้ใช้บรรทัดนี้:
// define('DB_PASS', 'DnerC2dx@nBe5a0^\\');

define('DB_CHARSET', 'utf8mb4');

// API Configuration
define('API_VERSION', '1');
define('API_BASE_URL', 'https://indosmilesouthservices.com/backend/api');

// Session Configuration
define('SESSION_LIFETIME', 7200); // 2 hours
define('SESSION_NAME', 'INDOSMILE_ADMIN_SESSION');

// Security
define('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production-' . DB_NAME);
define('PASSWORD_HASH_ALGO', PASSWORD_BCRYPT);
define('PASSWORD_HASH_COST', 12);

// File Upload Configuration
define('UPLOAD_MAX_SIZE', 5242880); // 5MB
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

// Pagination
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://indosmilesouthservices.com'
]);

// Timezone
date_default_timezone_set('Asia/Bangkok');

// Error Reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// App Information
define('APP_NAME', 'Indo Smile South Services CRM');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'production'); // development, staging, production
