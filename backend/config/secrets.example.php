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

// Stripe
define('STRIPE_SECRET_KEY', '');
define('STRIPE_PUBLISHABLE_KEY', '');
// Signing secret (whsec_...) from the Stripe dashboard webhook endpoint.
// Without it stripe_webhook.php rejects every event, so no booking can be marked paid.
define('STRIPE_WEBHOOK_SECRET', '');

// ChillPay PayLink
define('CHILLPAY_MERCHANT_CODE', '');
define('CHILLPAY_API_KEY', '');
define('CHILLPAY_MD5_KEY', '');
