<?php

/**
 * Stripe Webhook — the only place a booking is ever marked paid.
 *
 * The browser returning to /booking/REF?paid=1 proves nothing (anyone can type that
 * URL), so the success page only *displays* status. Money is recorded here, from a
 * signature-verified server-to-server event.
 *
 * Point Stripe at: https://indosmilesouthservices.com/backend/api/stripe_webhook.php
 * Event: checkout.session.completed
 */

require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Booking.php';
require_once '../models/Tour.php';
require_once 'helpers.php';
require_once 'booking_emails.php';

header('Content-Type: application/json');

$logFile = __DIR__ . '/stripe_webhook.log';
$log = function ($msg) use ($logFile) {
    @file_put_contents($logFile, '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL, FILE_APPEND);
};

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$payload   = file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

if (!defined('STRIPE_WEBHOOK_SECRET') || STRIPE_WEBHOOK_SECRET === '') {
    $log('CONFIG ERROR: STRIPE_WEBHOOK_SECRET is not set — event rejected');
    http_response_code(500);
    echo json_encode(['error' => 'Webhook not configured']);
    exit;
}

/**
 * Verify the Stripe-Signature header.
 *
 * Rejecting unsigned/expired events is what stops anyone from POSTing a fake
 * "payment succeeded" straight at this endpoint.
 */
function verifyStripeSignature($payload, $sigHeader, $secret, $tolerance = 300)
{
    $timestamp = null;
    $signatures = [];

    foreach (explode(',', $sigHeader) as $part) {
        $pair = explode('=', trim($part), 2);
        if (count($pair) !== 2) {
            continue;
        }
        if ($pair[0] === 't') {
            $timestamp = $pair[1];
        } elseif ($pair[0] === 'v1') {
            $signatures[] = $pair[1];
        }
    }

    if ($timestamp === null || empty($signatures)) {
        return 'malformed signature header';
    }

    // Reject replays of an old, already-captured request.
    if (abs(time() - (int)$timestamp) > $tolerance) {
        return 'timestamp outside tolerance';
    }

    $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);

    foreach ($signatures as $signature) {
        if (hash_equals($expected, $signature)) {
            return true;
        }
    }

    return 'no matching signature';
}

$verified = verifyStripeSignature($payload, $sigHeader, STRIPE_WEBHOOK_SECRET);
if ($verified !== true) {
    $log('SIGNATURE REJECTED: ' . $verified);
    http_response_code(400);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

$event = json_decode($payload, true);
$type  = $event['type'] ?? '';

// Anything else (refunds, expiries) is acknowledged so Stripe stops retrying.
if ($type !== 'checkout.session.completed') {
    $log('IGNORED event type=' . $type);
    http_response_code(200);
    echo json_encode(['received' => true, 'ignored' => $type]);
    exit;
}

$session = $event['data']['object'] ?? [];
$reference = $session['metadata']['booking_reference'] ?? ($session['client_reference_id'] ?? null);
$paymentIntentId = $session['payment_intent'] ?? null;

if (!$reference) {
    $log('NO REFERENCE on session ' . ($session['id'] ?? '?'));
    http_response_code(200);
    echo json_encode(['received' => true, 'error' => 'no booking reference']);
    exit;
}

// A session can complete with payment still pending (e.g. delayed methods).
if (($session['payment_status'] ?? '') !== 'paid') {
    $log('NOT PAID YET ref=' . $reference . ' payment_status=' . ($session['payment_status'] ?? '?'));
    http_response_code(200);
    echo json_encode(['received' => true]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    $bookingModel = new Booking($db);
    $tourModel = new Tour($db);
} catch (Exception $e) {
    // 500 makes Stripe retry — the payment is real, we just could not record it.
    $log('DB ERROR ref=' . $reference . ' — ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database unavailable']);
    exit;
}

$booking = $bookingModel->getByReference($reference);
if (!$booking) {
    $log('BOOKING NOT FOUND ref=' . $reference);
    http_response_code(200);
    echo json_encode(['received' => true, 'error' => 'booking not found']);
    exit;
}

// markPaid() only returns true for the delivery that actually flipped unpaid -> paid,
// so a retried webhook never sends a second receipt.
$justPaid = $bookingModel->markPaid($booking['id'], $paymentIntentId, 'stripe');

if (!$justPaid) {
    $log('ALREADY PAID ref=' . $reference . ' (duplicate delivery ignored)');
    http_response_code(200);
    echo json_encode(['received' => true, 'duplicate' => true]);
    exit;
}

$log('PAID ref=' . $reference . ' pi=' . $paymentIntentId);

$tour = $tourModel->getById($booking['tour_id']);
sendPaymentReceiptEmail($booking, $tour);
sendAdminPaymentEmail($booking, $tour);

pushBookingToBackoffice('tour', array_merge($booking, [
    'payment_status'    => 'paid',
    'payment_method'    => 'stripe',
    'payment_intent_id' => $paymentIntentId,
    'tour_name'         => $tour['name'] ?? null,
]));

http_response_code(200);
echo json_encode(['received' => true]);
