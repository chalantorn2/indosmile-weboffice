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
        handlePutRequest($bookingModel);
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
function handleGetRequest($bookingModel) {
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
function handlePostRequest($bookingModel, $tourModel) {
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
    $numberOfGuests = (int)$input['number_of_guests'];
    $totalPrice = $tour['price'] * $numberOfGuests;

    // Generate booking reference
    $bookingReference = generateBookingReference();

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
function handlePutRequest($bookingModel) {
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

    // Get JSON input
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Check for special actions
    if (isset($_GET['action'])) {
        $action = $_GET['action'];

        if ($action === 'confirm') {
            $result = $bookingModel->confirm($bookingId, $adminId);
            if ($result) {
                $booking = $bookingModel->getById($bookingId);
                sendResponse($booking, 200, 'Booking confirmed successfully');
            } else {
                sendError('Failed to confirm booking', 500);
            }
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
function handleDeleteRequest($bookingModel) {
    sendError('Deleting bookings is not allowed. Use cancel instead.', 403);
}
