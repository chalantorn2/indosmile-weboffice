<?php

/**
 * Bookings API Endpoint
 * Handles all booking-related API requests
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Booking.php';
require_once '../models/Tour.php';
require_once 'helpers.php';
require_once 'booking_emails.php';

// Handle CORS
handleCORS();

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

// Initialize database connection
try {
    $database = new Database();
    $db = $database->connect();
    $bookingModel = new Booking($db);
    $tourModel = new Tour($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

// Get request method
$method = getRequestMethod();

// Route handling
switch ($method) {
    case 'GET':
        handleGetRequest($bookingModel);
        break;

    case 'POST':
        handlePostRequest($bookingModel, $tourModel);
        break;

    case 'PUT':
        handlePutRequest($bookingModel, $tourModel);
        break;

    case 'DELETE':
        handleDeleteRequest($bookingModel);
        break;

    default:
        sendError('Method not allowed', 405);
}

/**
 * Handle GET requests
 */
function handleGetRequest($bookingModel)
{
    // Get booking statistics (admin only)
    if (isset($_GET['stats'])) {
        verifyAdminSession();
        $stats = $bookingModel->getStats();
        sendResponse($stats, 200);
    }

    // Get single booking by ID or reference
    if (isset($_GET['id'])) {
        verifyAdminSession();
        $booking = $bookingModel->getById($_GET['id']);
        if ($booking) {
            sendResponse($booking, 200);
        } else {
            sendError('Booking not found', 404);
        }
    }

    if (isset($_GET['reference'])) {
        $booking = $bookingModel->getByReference($_GET['reference']);
        if ($booking) {
            sendResponse($booking, 200);
        } else {
            sendError('Booking not found', 404);
        }
    }

    // Get all bookings (admin only)
    verifyAdminSession();

    $filters = [
        'status' => $_GET['status'] ?? null,
        'payment_status' => $_GET['payment_status'] ?? null,
        'tour_id' => $_GET['tour_id'] ?? null,
        'search' => $_GET['search'] ?? null,
        'date_from' => $_GET['date_from'] ?? null,
        'date_to' => $_GET['date_to'] ?? null,
        'sort_by' => $_GET['sort_by'] ?? 'created_at',
        'sort_order' => $_GET['sort_order'] ?? 'DESC'
    ];

    // Get pagination params
    $pagination = getPaginationParams();
    $filters['limit'] = $pagination['limit'];
    $filters['offset'] = $pagination['offset'];

    // Get bookings and total count
    $bookings = $bookingModel->getAll($filters);
    $total = $bookingModel->getCount($filters);

    // Build paginated response
    $response = buildPaginationResponse($bookings, $total, $pagination['page'], $pagination['limit']);

    sendResponse($response, 200);
}

/**
 * Handle POST requests (Create new booking)
 */
function handlePostRequest($bookingModel, $tourModel)
{
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Validate required fields
    $requiredFields = ['tour_id', 'customer_name', 'customer_email', 'customer_phone', 'travel_date', 'number_of_guests'];
    $missing = validateRequired($input, $requiredFields);

    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    // Validate tour exists
    $tour = $tourModel->getById($input['tour_id']);
    if (!$tour) {
        sendError('Tour not found', 404);
    }

    if (!$tour['is_active']) {
        sendError('Tour is not available for booking', 400);
    }

    // Calculate total price
    $adults = isset($input['adults']) ? (int)$input['adults'] : (int)$input['number_of_guests'];
    $children = isset($input['children']) ? (int)$input['children'] : 0;
    $infants = isset($input['infants']) ? (int)$input['infants'] : 0;
    $adultPrice = floatval($tour['adult_price']);
    $childPrice = isset($tour['child_price']) ? floatval($tour['child_price']) : 0;
    // Infants travel free and are not counted toward the guest total.
    $totalPrice = ($adults * $adultPrice) + ($children * $childPrice);
    $numberOfGuests = $adults + $children;

    // Generate booking reference, retrying on the rare same-day collision (2 hex = 256/day).
    $bookingReference = generateBookingReference();
    $attempts = 0;
    while ($bookingModel->getByReference($bookingReference) && $attempts < 20) {
        $bookingReference = generateBookingReference();
        $attempts++;
    }

    // Get client IP and user agent
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    // Prepare booking data
    $data = [
        'tour_id' => (int)$input['tour_id'],
        'booking_reference' => $bookingReference,
        'customer_name' => sanitizeInput($input['customer_name']),
        'customer_email' => sanitizeInput($input['customer_email']),
        'customer_phone' => sanitizeInput($input['customer_phone']),
        'travel_date' => $input['travel_date'],
        'number_of_guests' => $numberOfGuests,
        'adults' => isset($input['adults']) ? (int)$input['adults'] : $numberOfGuests,
        'children' => isset($input['children']) ? (int)$input['children'] : 0,
        'infants' => $infants,
        'special_requests' => isset($input['special_requests']) ? sanitizeInput($input['special_requests']) : null,
        'total_price' => $totalPrice,
        'currency' => $tour['currency'],
        'status' => 'pending',
        'payment_status' => 'unpaid',
        'ip_address' => $ipAddress,
        'user_agent' => $userAgent
    ];

    // Create booking
    try {
        $bookingId = $bookingModel->create($data);

        if ($bookingId) {
            $booking = $bookingModel->getById($bookingId);

            // Notify the office, and confirm receipt to the customer.
            sendBookingEmails($data, $tour);

            // Mirror the booking into the backoffice (admin web).
            // Fire-and-forget; never blocks the customer response.
            pushBookingToBackoffice('tour', array_merge($data, [
                'tour_id'     => (int)$input['tour_id'],
                'tour_name'   => $tour['name'] ?? null,
                'adult_price' => $adultPrice,
                'child_price' => $childPrice,
            ]));

            sendResponse($booking, 201, 'Booking created successfully');
        } else {
            sendError('Failed to create booking', 500);
        }
    } catch (Exception $e) {
        sendError('Error creating booking: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle PUT requests (Update booking)
 */
function handlePutRequest($bookingModel, $tourModel)
{
    // Admin only
    $adminId = verifyAdminSession();

    // Get booking ID
    if (!isset($_GET['id'])) {
        sendError('Booking ID is required', 400);
    }

    $bookingId = (int)$_GET['id'];

    // Check if booking exists
    $existingBooking = $bookingModel->getById($bookingId);
    if (!$existingBooking) {
        sendError('Booking not found', 404);
    }

    // An empty body is legitimate here — `confirm` takes no arguments — so only reject
    // input that failed to parse, not input that parsed to an empty object.
    $input = getJSONInput();

    if (!is_array($input)) {
        sendError('Invalid JSON input', 400);
    }

    // Check for special actions
    if (isset($_GET['action'])) {
        $action = $_GET['action'];

        if ($action === 'confirm') {
            $result = $bookingModel->confirm($bookingId, $adminId);
            if ($result) {
                $booking = $bookingModel->getById($bookingId);

                // Confirming is what unlocks payment, so this is the moment the customer
                // gets their Pay Now link. Skip it if they somehow already paid.
                if ($booking['payment_status'] === 'unpaid') {
                    sendCustomerPaymentLinkEmail($booking, $tourModel->getById($booking['tour_id']));
                }

                sendResponse($booking, 200, 'Booking confirmed successfully');
            } else {
                sendError('Failed to confirm booking', 500);
            }
        }

        if ($action === 'mark_seen') {
            // Clears the "new" indicator in the admin list. Idempotent: only the first
            // call stamps viewed_at, later ones are a no-op but still return the booking.
            $bookingModel->markSeen($bookingId);
            $booking = $bookingModel->getById($bookingId);
            sendResponse($booking, 200, 'Booking marked as seen');
        }

        if ($action === 'cancel') {
            $reason = isset($input['reason']) ? sanitizeInput($input['reason']) : null;
            $result = $bookingModel->cancel($bookingId, $reason);
            if ($result) {
                $booking = $bookingModel->getById($bookingId);
                sendResponse($booking, 200, 'Booking cancelled successfully');
            } else {
                sendError('Failed to cancel booking', 500);
            }
        }

        // Customer lost the confirmation mail, or it bounced. Safe to repeat: the mail
        // links to the status page, not to a Stripe session that could expire.
        if ($action === 'resend_payment_link') {
            if ($existingBooking['status'] !== 'confirmed') {
                sendError('Confirm the booking first — that is what sends the payment link.', 409);
            }
            if ($existingBooking['payment_status'] === 'paid') {
                sendError('This booking is already paid.', 409);
            }

            sendCustomerPaymentLinkEmail($existingBooking, $tourModel->getById($existingBooking['tour_id']));
            sendResponse($existingBooking, 200, 'Payment link resent to ' . $existingBooking['customer_email']);
        }

        // Offline payment (cash, bank transfer). Card payments never come through here —
        // those are recorded by stripe_webhook.php.
        if ($action === 'mark_paid') {
            if ($existingBooking['payment_status'] === 'paid') {
                sendError('This booking is already paid.', 409);
            }
            if ($existingBooking['status'] === 'cancelled') {
                sendError('This booking is cancelled.', 409);
            }

            $allowedMethods = ['cash', 'bank_transfer', 'other'];
            $method = isset($input['payment_method']) ? sanitizeInput($input['payment_method']) : 'cash';
            if (!in_array($method, $allowedMethods, true)) {
                sendError('Unsupported payment method', 400);
            }

            if (!$bookingModel->markPaid($bookingId, null, $method)) {
                sendError('Failed to mark booking as paid', 500);
            }

            // Paying settles availability too — an unconfirmed booking that has been paid
            // for is confirmed by definition.
            if ($existingBooking['status'] === 'pending') {
                $bookingModel->confirm($bookingId, $adminId);
            }

            $booking = $bookingModel->getById($bookingId);
            $tour = $tourModel->getById($booking['tour_id']);
            $methodLabels = ['cash' => 'Cash', 'bank_transfer' => 'Bank Transfer', 'other' => 'Other'];

            // The office mailbox gets a record of every payment, however it arrived —
            // the admin who clicked this may not be the only one who needs to know.
            sendPaymentReceiptEmail($booking, $tour, $methodLabels[$method]);
            sendAdminPaymentEmail($booking, $tour, $methodLabels[$method]);

            pushBookingToBackoffice('tour', array_merge($booking, ['tour_name' => $tour['name'] ?? null]));

            sendResponse($booking, 200, 'Booking marked as paid');
        }
    }

    // Regular update
    $data = [
        'status' => isset($input['status']) ? sanitizeInput($input['status']) : $existingBooking['status'],
        'payment_status' => isset($input['payment_status']) ? sanitizeInput($input['payment_status']) : $existingBooking['payment_status'],
        'payment_method' => isset($input['payment_method']) ? sanitizeInput($input['payment_method']) : $existingBooking['payment_method'],
        'payment_date' => isset($input['payment_date']) ? $input['payment_date'] : $existingBooking['payment_date'],
        'notes' => isset($input['notes']) ? sanitizeInput($input['notes']) : $existingBooking['notes']
    ];

    try {
        $result = $bookingModel->update($bookingId, $data);

        if ($result) {
            $booking = $bookingModel->getById($bookingId);
            sendResponse($booking, 200, 'Booking updated successfully');
        } else {
            sendError('Failed to update booking', 500);
        }
    } catch (Exception $e) {
        sendError('Error updating booking: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle DELETE requests
 */
function handleDeleteRequest($bookingModel)
{
    sendError('Deleting bookings is not allowed. Use cancel instead.', 403);
}

