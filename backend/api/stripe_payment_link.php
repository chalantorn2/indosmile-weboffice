<?php

/**
 * Stripe Payment Link (Test) Endpoint
 *
 * POST { amount: number, currency?: 'thb'|'usd'|... , description?: string }
 *   -> { url: string, id: string, amount: number, currency: string }
 *
 * Creates a Stripe Checkout Session with inline price_data so no Product
 * needs to exist beforehand. Returns the hosted Checkout URL.
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once 'helpers.php';

handleCORS();

if (getRequestMethod() !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = getJSONInput();
if (!$input) {
    sendError('Invalid JSON input', 400);
}

$amount = isset($input['amount']) ? floatval($input['amount']) : 0;
if ($amount <= 0) {
    sendError('Amount must be greater than 0', 400);
}

$currency = strtolower(trim($input['currency'] ?? 'thb'));
$allowedCurrencies = ['thb', 'usd', 'eur', 'gbp', 'sgd', 'aud', 'jpy'];
if (!in_array($currency, $allowedCurrencies, true)) {
    sendError('Unsupported currency', 400);
}

$description = isset($input['description']) && trim($input['description']) !== ''
    ? sanitizeInput($input['description'])
    : 'Test payment';

// Stripe expects the smallest currency unit. JPY is zero-decimal.
$zeroDecimal = ['jpy'];
$unitAmount = in_array($currency, $zeroDecimal, true)
    ? (int) round($amount)
    : (int) round($amount * 100);

// Which key set (test/live) is active is decided by the payment_mode setting.
$stripe = getStripeConfig();
if ($stripe['secret_key'] === '') {
    sendError('Stripe is not configured on the server', 500);
}

// Build form-encoded body for Stripe Checkout Session
$origin = $_SERVER['HTTP_ORIGIN']
    ?? ((!empty($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));

$params = [
    'mode' => 'payment',
    'success_url' => $origin . '/stripe-test?status=success&session_id={CHECKOUT_SESSION_ID}',
    'cancel_url'  => $origin . '/stripe-test?status=cancel',
    'line_items[0][quantity]' => 1,
    'line_items[0][price_data][currency]'             => $currency,
    'line_items[0][price_data][unit_amount]'          => $unitAmount,
    'line_items[0][price_data][product_data][name]'   => $description,
];

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

sendResponse([
    'id'       => $data['id'] ?? null,
    'url'      => $data['url'] ?? null,
    'amount'   => $amount,
    'currency' => $currency,
], 200, 'Payment link created');
