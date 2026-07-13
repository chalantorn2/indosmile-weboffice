<?php
// Configuration for Indo Smile South Services CRM
// Environment: Production
// Secrets live in secrets.php (git-ignored). See secrets.example.php.

$secretsFile = __DIR__ . '/secrets.php';
if (!file_exists($secretsFile)) {
    http_response_code(500);
    die('Missing backend/config/secrets.php — copy secrets.example.php and fill in the values.');
}
require_once $secretsFile;

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'sevensmile_indosmile');
define('DB_USER', 'sevensmile_indosmile');
define('DB_CHARSET', 'utf8mb4');

// API Configuration
define('API_VERSION', '1');
define('API_BASE_URL', 'https://indosmilesouthservices.com/backend/api');

// Max requests per minute per key for the public API (0 = unlimited).
define('PUBLIC_API_RATE_LIMIT', 60);

// Contract Rate API (Seven Smile) — read-only source for importing tours/shows
define('CONTRACT_RATE_API_BASE', 'https://contactrate.sevensmiletourandticket.com/api/public');

// Session Configuration
define('SESSION_LIFETIME', 7200); // 2 hours
define('SESSION_NAME', 'INDOSMILE_ADMIN_SESSION');

// Security
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

// ChillPay PayLink
define('CHILLPAY_API_BASE', 'https://sandbox-apipaylink.chillpay.co/api/v1');
// Production: https://api-paylink.chillpay.co/api/v1
