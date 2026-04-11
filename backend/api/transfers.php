<?php
/**
 * Transfers API Endpoint
 * Handles all transfer-related API requests
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Transfer.php';
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
    $transferModel = new Transfer($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

$method = getRequestMethod();

switch ($method) {
    case 'GET':
        handleGetRequest($transferModel, $db);
        break;
    case 'POST':
        handlePostRequest($transferModel, $db);
        break;
    case 'PUT':
        handlePutRequest($transferModel);
        break;
    case 'DELETE':
        handleDeleteRequest($transferModel);
        break;
    default:
        sendError('Method not allowed', 405);
}

function handleGetRequest($transferModel, $db) {
    $action = isset($_GET['action']) ? $_GET['action'] : null;

    if ($action === 'options') {
        // Dynamic frontend dropdowns
        if (isset($_GET['origin']) && isset($_GET['destination'])) {
            $vehicles = $transferModel->getVehiclesByRoute($_GET['origin'], $_GET['destination']);
            sendResponse($vehicles, 200);
        } elseif (isset($_GET['origin'])) {
            $destinations = $transferModel->getDestinationsByOrigin($_GET['origin']);
            sendResponse($destinations, 200);
        } else {
            $origins = $transferModel->getOrigins();
            sendResponse($origins, 200);
        }
    } elseif ($action === 'gallery') {
        // Public: get transfer page gallery images
        $gallery = getTransferGallery($db);
        sendResponse($gallery, 200);
    } elseif ($action === 'bookings') {
        // Admin: list transfer bookings
        verifyAdminSession();
        require_once '../models/TransferBooking.php';
        $transferBookingModel = new TransferBooking($db);

        if (isset($_GET['stats'])) {
            $stats = $transferBookingModel->getStats();
            sendResponse($stats, 200);
        }

        $filters = [
            'status' => $_GET['status'] ?? null,
            'search' => $_GET['search'] ?? null,
            'date_from' => $_GET['date_from'] ?? null,
            'date_to' => $_GET['date_to'] ?? null,
            'sort_by' => $_GET['sort_by'] ?? 'created_at',
            'sort_order' => $_GET['sort_order'] ?? 'DESC'
        ];

        $pagination = getPaginationParams();
        $filters['limit'] = $pagination['limit'];
        $filters['offset'] = $pagination['offset'];

        $bookings = $transferBookingModel->getAll($filters);
        $total = $transferBookingModel->getCount($filters);

        $response = buildPaginationResponse($bookings, $total, $pagination['page'], $pagination['limit']);
        sendResponse($response, 200);
    } else {
        // Admin CRUD
        if (isset($_GET['id'])) {
            $transfer = $transferModel->getById($_GET['id']);
            if ($transfer) {
                sendResponse($transfer, 200);
            } else {
                sendError('Transfer not found', 404);
            }
        } else {
            $filters = [];
            if (isset($_GET['active']) && $_GET['active'] !== '') {
                $filters['is_active'] = (int)$_GET['active'];
            }
            $transfers = $transferModel->getAll($filters);
            sendResponse(["data" => $transfers, "total" => count($transfers)], 200);
        }
    }
}

function handlePostRequest($transferModel, $db) {
    $action = isset($_GET['action']) ? $_GET['action'] : null;

    // Public booking endpoint — no admin required
    if ($action === 'book') {
        handleTransferBooking($db);
        return;
    }

    // Admin: save gallery images
    if ($action === 'gallery') {
        verifyAdminSession();
        $input = getJSONInput();
        if (!$input || !isset($input['images'])) {
            sendError('Invalid input: images array required', 400);
        }
        saveTransferGallery($db, $input['images']);
        sendResponse($input['images'], 200, 'Gallery updated successfully');
        return;
    }

    // Admin CRUD — requires admin session
    verifyAdminSession();

    $input = getJSONInput();
    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $requiredFields = ['origin', 'destination', 'vehicle_name', 'price'];
    $missing = validateRequired($input, $requiredFields);

    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    $data = [
        'origin' => sanitizeInput($input['origin']),
        'destination' => sanitizeInput($input['destination']),
        'vehicle_name' => sanitizeInput($input['vehicle_name']),
        'max_passengers' => isset($input['max_passengers']) ? (int)$input['max_passengers'] : 1,
        'max_luggage' => isset($input['max_luggage']) ? (int)$input['max_luggage'] : 2,
        'price' => (float)$input['price'],
        'image_url' => isset($input['image_url']) ? $input['image_url'] : null,
        'description' => isset($input['description']) ? sanitizeInput($input['description']) : null,
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1
    ];

    try {
        $id = $transferModel->create($data);
        if ($id) {
            $transfer = $transferModel->getById($id);
            sendResponse($transfer, 201, 'Transfer created successfully');
        } else {
            sendError('Failed to create transfer', 500);
        }
    } catch (Exception $e) {
        sendError('Error creating transfer: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle public transfer booking request
 */
function handleTransferBooking($db) {
    require_once '../models/TransferBooking.php';

    $transferBookingModel = new TransferBooking($db);

    $input = getJSONInput();
    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Validate required fields
    $requiredFields = ['customer_name', 'customer_email', 'customer_phone', 'pickup_location', 'dropoff_location', 'pickup_date', 'pickup_time'];
    $missing = validateRequired($input, $requiredFields);

    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    // Validate email format
    if (!filter_var($input['customer_email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email address', 400);
    }

    // Generate booking reference
    $bookingReference = 'TRF' . time() . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));

    // Get client info
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $data = [
        'booking_reference' => $bookingReference,
        'customer_name' => sanitizeInput($input['customer_name']),
        'customer_email' => sanitizeInput($input['customer_email']),
        'customer_phone' => sanitizeInput($input['customer_phone']),
        'trip_type' => isset($input['trip_type']) ? sanitizeInput($input['trip_type']) : 'one-way',
        'pickup_location' => sanitizeInput($input['pickup_location']),
        'dropoff_location' => sanitizeInput($input['dropoff_location']),
        'pickup_date' => $input['pickup_date'],
        'pickup_time' => $input['pickup_time'],
        'return_date' => isset($input['return_date']) ? $input['return_date'] : null,
        'return_time' => isset($input['return_time']) ? $input['return_time'] : null,
        'adults' => isset($input['adults']) ? (int)$input['adults'] : 1,
        'children' => isset($input['children']) ? (int)$input['children'] : 0,
        'infants' => isset($input['infants']) ? (int)$input['infants'] : 0,
        'special_requests' => isset($input['special_requests']) ? sanitizeInput($input['special_requests']) : null,
        'status' => 'pending',
        'ip_address' => $ipAddress,
        'user_agent' => $userAgent,
    ];

    try {
        $bookingId = $transferBookingModel->create($data);

        if ($bookingId) {
            $booking = $transferBookingModel->getById($bookingId);

            // Send email notification
            sendTransferBookingEmail($data);

            sendResponse($booking, 201, 'Transfer booking submitted successfully');
        } else {
            sendError('Failed to create transfer booking', 500);
        }
    } catch (Exception $e) {
        sendError('Error creating transfer booking: ' . $e->getMessage(), 500);
    }
}

function handlePutRequest($transferModel) {
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Transfer ID is required', 400);
    }

    $id = (int)$_GET['id'];
    $existing = $transferModel->getById($id);

    if (!$existing) {
        sendError('Transfer not found', 404);
    }

    $input = getJSONInput();
    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $data = [
        'origin' => isset($input['origin']) ? sanitizeInput($input['origin']) : $existing['origin'],
        'destination' => isset($input['destination']) ? sanitizeInput($input['destination']) : $existing['destination'],
        'vehicle_name' => isset($input['vehicle_name']) ? sanitizeInput($input['vehicle_name']) : $existing['vehicle_name'],
        'max_passengers' => isset($input['max_passengers']) ? (int)$input['max_passengers'] : $existing['max_passengers'],
        'max_luggage' => isset($input['max_luggage']) ? (int)$input['max_luggage'] : ($existing['max_luggage'] ?? 2),
        'price' => isset($input['price']) ? (float)$input['price'] : $existing['price'],
        'image_url' => isset($input['image_url']) ? $input['image_url'] : $existing['image_url'],
        'description' => isset($input['description']) ? sanitizeInput($input['description']) : $existing['description'],
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : $existing['is_active']
    ];

    try {
        if ($transferModel->update($id, $data)) {
            $transfer = $transferModel->getById($id);
            sendResponse($transfer, 200, 'Transfer updated successfully');
        } else {
            sendError('Failed to update transfer', 500);
        }
    } catch (Exception $e) {
        sendError('Error updating transfer: ' . $e->getMessage(), 500);
    }
}

function handleDeleteRequest($transferModel) {
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Transfer ID is required', 400);
    }

    $id = (int)$_GET['id'];
    if (!$transferModel->getById($id)) {
        sendError('Transfer not found', 404);
    }

    try {
        if ($transferModel->delete($id)) {
            sendResponse(['id' => $id], 200, 'Transfer deleted successfully');
        } else {
            sendError('Failed to delete transfer', 500);
        }
    } catch (Exception $e) {
        sendError('Error deleting transfer: ' . $e->getMessage(), 500);
    }
}

/**
 * Send transfer booking notification email to admin
 */
function sendTransferBookingEmail($bookingData) {
    $to = 'info@indosmilesouthservices.com';
    $subject = 'New Transfer Booking from ' . $bookingData['customer_name'] . ' (' . $bookingData['booking_reference'] . ')';

    $pickupDate = date('d M Y', strtotime($bookingData['pickup_date']));
    $pickupTime = date('H:i', strtotime($bookingData['pickup_time']));
    $tripTypeLabel = $bookingData['trip_type'] === 'return' ? 'Return Trip' : 'One Way';
    $totalPassengers = $bookingData['adults'] + $bookingData['children'] + $bookingData['infants'];

    $body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #1B2E4A; color: #fff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .info-table { width: 100%; border-collapse: collapse; }
            .info-table td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; }
            .info-table td:first-child { font-weight: bold; width: 40%; color: #1B2E4A; }
            .highlight { background-color: #FFC72C; color: #1B2E4A; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
            .footer { padding: 15px; text-align: center; font-size: 12px; color: #999; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>New Transfer Booking</h1>
            </div>
            <div class='highlight'>
                Booking Reference: {$bookingData['booking_reference']}
            </div>
            <div class='content'>
                <h3 style='color: #1B2E4A;'>Customer Information</h3>
                <table class='info-table'>
                    <tr><td>Name</td><td>{$bookingData['customer_name']}</td></tr>
                    <tr><td>Email</td><td>{$bookingData['customer_email']}</td></tr>
                    <tr><td>Phone</td><td>{$bookingData['customer_phone']}</td></tr>
                </table>

                <h3 style='color: #1B2E4A; margin-top: 20px;'>Transfer Details</h3>
                <table class='info-table'>
                    <tr><td>Trip Type</td><td>{$tripTypeLabel}</td></tr>
                    <tr><td>Pick-up Location</td><td>{$bookingData['pickup_location']}</td></tr>
                    <tr><td>Drop-off Location</td><td>{$bookingData['dropoff_location']}</td></tr>
                    <tr><td>Pick-up Date</td><td>{$pickupDate}</td></tr>
                    <tr><td>Pick-up Time</td><td>{$pickupTime}</td></tr>";

    if ($bookingData['trip_type'] === 'return' && !empty($bookingData['return_date'])) {
        $returnDate = date('d M Y', strtotime($bookingData['return_date']));
        $returnTime = !empty($bookingData['return_time']) ? date('H:i', strtotime($bookingData['return_time'])) : 'TBD';
        $body .= "
                    <tr><td>Return Date</td><td>{$returnDate}</td></tr>
                    <tr><td>Return Time</td><td>{$returnTime}</td></tr>";
    }

    $body .= "
                    <tr><td>Adults</td><td>{$bookingData['adults']}</td></tr>
                    <tr><td>Children</td><td>{$bookingData['children']}</td></tr>
                    <tr><td>Infants</td><td>{$bookingData['infants']}</td></tr>
                    <tr><td>Total Passengers</td><td>{$totalPassengers}</td></tr>
                </table>";

    if (!empty($bookingData['special_requests'])) {
        $body .= "
                <h3 style='color: #1B2E4A; margin-top: 20px;'>Special Requests</h3>
                <p style='background: #fff; padding: 12px; border-radius: 4px;'>{$bookingData['special_requests']}</p>";
    }

    $body .= "
            </div>
            <div class='footer'>
                <p>This is an automated notification from Indo Smile South Services booking system.</p>
                <p>Please log in to the admin panel to manage this booking.</p>
            </div>
        </div>
    </body>
    </html>";

    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Indo Smile Booking <booking@indosmilesouthservices.com>\r\n";
    $headers .= "Reply-To: {$bookingData['customer_name']} <{$bookingData['customer_email']}>\r\n";

    @mail($to, $subject, $body, $headers, '-f info@indosmilesouthservices.com');
}

/**
 * Get transfer page gallery images from settings
 */
function getTransferGallery($db) {
    try {
        $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'transfer_gallery' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['setting_value']) {
            $images = json_decode($row['setting_value'], true);
            return is_array($images) ? $images : [];
        }
    } catch (PDOException $e) {
        // Table might not exist yet
    }
    return [];
}

/**
 * Save transfer page gallery images to settings
 */
function saveTransferGallery($db, $images) {
    $json = json_encode($images);
    $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value, setting_type, description)
        VALUES ('transfer_gallery', :val, 'json', 'Transfer page gallery images (JSON array)')
        ON DUPLICATE KEY UPDATE setting_value = :val2");
    $stmt->bindParam(':val', $json);
    $stmt->bindParam(':val2', $json);
    $stmt->execute();
}
