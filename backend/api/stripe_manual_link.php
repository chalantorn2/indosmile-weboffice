<?php

/**
 * Manual Stripe payment link (admin only).
 *
 * POST { amount: number, currency?: 'thb'|'usd'|..., description?: string, customer_email?: string }
 *   -> { url, id, amount, currency, mode }
 *
 * Unlike stripe_checkout.php the amount comes from the request body, so this
 * endpoint is behind the admin session — only staff may name their own price.
 * Uses inline price_data, so no Stripe Product has to exist beforehand.
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once 'helpers.php';

handleCORS();

if (getRequestMethod() !== 'POST') {
    sendError('Method not allowed', 405);
}

verifyAdminSession();

$input = getJSONInput();
if (!$input) {
    sendError('Invalid JSON input', 400);
}

$amount = isset($input['amount']) ? floatval($input['amount']) : 0;
if ($amount <= 0) {
    sendError('Amount must be greater than 0', 400);
}
if ($amount > 1000000) {
    sendError('Amount is too large', 400);
}

$currency = strtolower(trim($input['currency'] ?? 'thb'));
$allowedCurrencies = ['thb', 'usd', 'eur', 'gbp', 'sgd', 'aud', 'jpy'];
if (!in_array($currency, $allowedCurrencies, true)) {
    sendError('Unsupported currency', 400);
}

$description = isset($input['description']) && trim($input['description']) !== ''
    ? sanitizeInput($input['description'])
    : 'Indo Smile South Services';

$customerEmail = isset($input['customer_email']) ? trim($input['customer_email']) : '';
if ($customerEmail !== '' && !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid customer email', 400);
}

// Stripe expects the smallest currency unit. JPY is zero-decimal.
$unitAmount = $currency === 'jpy' ? (int) round($amount) : (int) round($amount * 100);

try {
    $database = new Database();
    $db = $database->connect();
} catch (Exception $e) {
    $db = null;
}

// Which key set (test/live) is active is decided by the payment_mode setting.
$stripe = getStripeConfig($db);
if ($stripe['secret_key'] === '') {
    sendError('Stripe is not configured on the server', 500);
}

$params = [
    'mode' => 'payment',
    'success_url' => SITE_URL . '/payment-result?status=success&session_id={CHECKOUT_SESSION_ID}',
    'cancel_url'  => SITE_URL . '/payment-result?status=cancel',
    'line_items[0][quantity]' => 1,
    'line_items[0][price_data][currency]'           => $currency,
    'line_items[0][price_data][unit_amount]'        => $unitAmount,
    'line_items[0][price_data][product_data][name]' => $description,
    'metadata[source]' => 'manual_admin_link',
];

if ($customerEmail !== '') {
    $params['customer_email'] = $customerEmail;
}

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $stripe['secret_key'],
    'Content-Type: application/x-www-form-urlencoded',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($response === false) {
    sendError('Failed to reach Stripe: ' . $curlErr, 502);
}

$data = json_decode($response, true);

if ($httpCode < 200 || $httpCode >= 300) {
    $msg = $data['error']['message'] ?? 'Stripe API error';
    sendError($msg, $httpCode);
}

if (empty($data['url'])) {
    sendError('Stripe did not return a checkout URL', 502);
}

sendResponse([
    'id'       => $data['id'] ?? null,
    'url'      => $data['url'],
    'amount'   => $amount,
    'currency' => strtoupper($currency),
    'mode'     => $stripe['mode'],
], 200, 'Payment link created');
