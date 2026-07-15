<?php

/**
 * Public Booking Status Endpoint
 *
 * GET ?reference=INDO...  -> safe, customer-facing view of one tour booking.
 *
 * The reference is the only credential, so this deliberately returns a narrowed
 * projection: no internal notes, no IP/user-agent, and contact details are masked.
 * Everything here is data the customer already typed in themselves.
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Booking.php';
require_once '../models/Tour.php';
require_once 'helpers.php';

handleCORS();

if (getRequestMethod() !== 'GET') {
    sendError('Method not allowed', 405);
}

$reference = isset($_GET['reference']) ? trim($_GET['reference']) : '';
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

$booking = $bookingModel->getByReference($reference);
if (!$booking) {
    sendError('Booking not found. Please check your reference number.', 404);
}

$tour = $tourModel->getById($booking['tour_id']);

/**
 * Mask an email to j***n@example.com so the page can prove which address we hold
 * without exposing it to anyone who guesses a reference.
 */
function maskEmail($email)
{
    $parts = explode('@', (string)$email);
    if (count($parts) !== 2) {
        return '';
    }
    $local  = $parts[0];
    $domain = $parts[1];
    $len = strlen($local);
    if ($len <= 2) {
        return str_repeat('*', $len) . '@' . $domain;
    }
    return $local[0] . str_repeat('*', $len - 2) . $local[$len - 1] . '@' . $domain;
}

function maskPhone($phone)
{
    $phone = (string)$phone;
    $len = strlen($phone);
    if ($len <= 4) {
        return str_repeat('*', $len);
    }
    return str_repeat('*', $len - 4) . substr($phone, -4);
}

// The customer may pay only once we have confirmed availability and nothing is paid yet.
$canPay = $booking['status'] === 'confirmed' && $booking['payment_status'] === 'unpaid';

sendResponse([
    'booking_reference' => $booking['booking_reference'],
    'status'            => $booking['status'],
    'payment_status'    => $booking['payment_status'],
    'can_pay'           => $canPay,

    'customer_name'     => $booking['customer_name'],
    'customer_email'    => maskEmail($booking['customer_email']),
    'customer_phone'    => maskPhone($booking['customer_phone']),

    'travel_date'       => $booking['travel_date'],
    'adults'            => (int)$booking['adults'],
    'children'          => (int)$booking['children'],
    'number_of_guests'  => (int)$booking['number_of_guests'],
    'special_requests'  => $booking['special_requests'],
    'total_price'       => (float)$booking['total_price'],
    'currency'          => $booking['currency'],
    'payment_date'      => $booking['payment_date'],
    'created_at'        => $booking['created_at'],

    'tour' => $tour ? [
        'id'          => (int)$tour['id'],
        'name'        => $tour['name'],
        'destination' => $tour['destination'],
        'duration'    => $tour['duration_label'] ?? null,
        'image'       => $tour['main_image'] ?? null,
    ] : null,
], 200);
