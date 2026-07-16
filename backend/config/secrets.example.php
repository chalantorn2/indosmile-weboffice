<?php
// Template for backend/config/secrets.php
// Copy this file to secrets.php and fill in the real values. secrets.php is git-ignored.

// Database
define('DB_PASS', '');

// Security
define('JWT_SECRET_KEY', '');

// Public Hotels API keys (server-to-server). Map of raw key => partner label.
define('PUBLIC_API_KEYS', serialize([
    // 'raw_api_key_here' => 'Partner Name',
]));

// Contract Rate API (Seven Smile)
define('CONTRACT_RATE_API_KEY', '');

// Stripe — two key sets, one per mode. The active set is chosen at runtime by the
// `payment_mode` setting (Settings > Payments, super_admin only). See getStripeConfig().

// TEST / sandbox keys
define('STRIPE_SECRET_KEY_TEST', '');
define('STRIPE_PUBLISHABLE_KEY_TEST', '');
// Signing secret (whsec_...) from the Stripe dashboard webhook endpoint (test mode).
// Without it stripe_webhook.php rejects every event, so no booking can be marked paid.
define('STRIPE_WEBHOOK_SECRET_TEST', '');

// LIVE / real-money keys — required before payment_mode can be switched to 'live'.
define('STRIPE_SECRET_KEY_LIVE', '');
define('STRIPE_PUBLISHABLE_KEY_LIVE', '');
define('STRIPE_WEBHOOK_SECRET_LIVE', '');

// ChillPay PayLink
define('CHILLPAY_MERCHANT_CODE', '');
define('CHILLPAY_API_KEY', '');
define('CHILLPAY_MD5_KEY', '');
