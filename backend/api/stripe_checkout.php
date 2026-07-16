<?php

/**
 * Stripe Checkout for a confirmed tour booking.
 *
 * POST { reference: "INDO..." } -> { url: <stripe hosted checkout url> }
 *
 * The amount is read from the booking row, never from the request body — the client
 * only says *which* booking to pay for, so a tampered payload cannot change the price.
 *
 * A booking is payable only once the office has confirmed availability
 * (status = confirmed) and it is still unpaid.
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Booking.php';
require_once '../models/Tour.php';
require_once 'helpers.php';

handleCORS();

if (getRequestMethod() !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = getJSONInput();
$reference = isset($input['reference']) ? trim($input['reference']) : '';
if ($reference === '') {
    sendError('Booking reference is required', 400);
}

try {
    $database = new Database();
    $db = $database->connect();
    $bookingModel = new Booking($db);
    $tourModel = new Tour($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

// Which key set (test/live) is active is decided by the payment_mode setting.
$stripe = getStripeConfig($db);
if ($stripe['secret_key'] === '') {
    sendError('Payments are not configured. Please contact us directly.', 500);
}

$booking = $bookingModel->getByReference($reference);
if (!$booking) {
    sendError('Booking not found', 404);
}

if ($booking['payment_status'] === 'paid') {
    sendError('This booking has already been paid.', 409);
}

if ($booking['status'] === 'cancelled') {
    sendError('This booking has been cancelled.', 409);
}

if ($booking['status'] !== 'confirmed') {
    sendError('This booking is not confirmed yet. We will email you a payment link once it is.', 409);
}

$amount = (float)$booking['total_price'];
if ($amount <= 0) {
    sendError('This booking has no payable amount. Please contact us.', 409);
}

$tour = $tourModel->getById($booking['tour_id']);
$tourName = $tour['name'] ?? 'Tour booking';

$currency = strtolower($booking['currency'] ?: 'thb');
$allowedCurrencies = ['thb', 'usd', 'eur', 'gbp', 'sgd', 'aud', 'jpy'];
if (!in_array($currency, $allowedCurrencies, true)) {
    $currency = 'thb';
}

// Stripe takes the smallest currency unit; JPY is zero-decimal.
$unitAmount = $currency === 'jpy' ? (int)round($amount) : (int)round($amount * 100);

$statusUrl = bookingStatusUrl($booking['booking_reference']);
$guests = (int)$booking['number_of_guests'];
$travelDate = date('d M Y', strtotime($booking['travel_date']));

$params = [
    'mode' => 'payment',
    'success_url' => $statusUrl . '?paid=1',
    'cancel_url'  => $statusUrl . '?cancelled=1',
    'customer_email' => $booking['customer_email'],
    'client_reference_id' => $booking['booking_reference'],

    // The webhook trusts these over anything the browser reports back.
    'metadata[booking_reference]' => $booking['booking_reference'],
    'metadata[booking_id]'        => $booking['id'],

    'line_items[0][quantity]' => 1,
    'line_items[0][price_data][currency]'                    => $currency,
    'line_items[0][price_data][unit_amount]'                 => $unitAmount,
    'line_items[0][price_data][product_data][name]'          => $tourName,
    'line_items[0][price_data][product_data][description]'   =>
        $travelDate . ' · ' . $guests . ' guest' . ($guests === 1 ? '' : 's') . ' · Ref ' . $booking['booking_reference'],
];

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $stripe['secret_key'],
    'Content-Type: application/x-www-form-urlencoded',
    // Retrying this exact booking reuses the same session instead of creating a second one.
    'Idempotency-Key: checkout_' . $booking['booking_reference'],
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

$bookingModel->setPaymentSession($booking['id'], $data['id'] ?? null);

sendResponse([
    'url'      => $data['url'],
    'id'       => $data['id'] ?? null,
    'amount'   => $amount,
    'currency' => strtoupper($currency),
], 200, 'Checkout session created');
