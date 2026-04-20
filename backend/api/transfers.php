<?php

/**
 * Transfers API Endpoint
 *
 * Resources (admin CRUD):
 *   GET    ?resource=locations         list locations
 *   POST   ?resource=locations         create location
 *   PUT    ?resource=locations&id=N    update location
 *   DELETE ?resource=locations&id=N    delete location
 *
 *   GET    ?resource=vehicles          list vehicles
 *   POST   ?resource=vehicles          create vehicle
 *   PUT    ?resource=vehicles&id=N     update vehicle
 *   DELETE ?resource=vehicles&id=N     delete vehicle
 *
 *   GET    ?resource=routes            list routes (with prices)
 *   POST   ?resource=routes            create route + prices
 *   PUT    ?resource=routes&id=N       update route + replace prices
 *   DELETE ?resource=routes&id=N       delete route
 *
 * Public actions:
 *   GET ?action=options                                   list origin location names
 *   GET ?action=options&origin=X                          list destinations reachable from X
 *   GET ?action=options&origin=X&destination=Y            list vehicles + prices for that pair
 *   GET ?action=gallery                                   transfer page gallery images
 *   POST ?action=gallery                                  (admin) save gallery
 *   POST ?action=book                                     submit transfer booking
 *
 * Admin booking management (existing):
 *   GET ?action=bookings[&stats=1]
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/TransferLocation.php';
require_once '../models/TransferVehicle.php';
require_once '../models/TransferRoute.php';
require_once 'helpers.php';

handleCORS();

if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

try {
    $database = new Database();
    $db = $database->connect();
    $locationModel = new TransferLocation($db);
    $vehicleModel = new TransferVehicle($db);
    $routeModel = new TransferRoute($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

$method = getRequestMethod();
$resource = isset($_GET['resource']) ? $_GET['resource'] : null;
$action = isset($_GET['action']) ? $_GET['action'] : null;

// Public actions first (no admin session required)
if ($action === 'options' && $method === 'GET') {
    handleOptions($routeModel);
    exit;
}
if ($action === 'gallery' && $method === 'GET') {
    sendResponse(getTransferGallery($db), 200);
    exit;
}
if ($action === 'book' && $method === 'POST') {
    handleTransferBooking($db);
    exit;
}

// Resource-based admin endpoints
if ($resource === 'locations') {
    handleResource($method, $locationModel, 'location');
    exit;
}
if ($resource === 'vehicles') {
    handleResource($method, $vehicleModel, 'vehicle');
    exit;
}
if ($resource === 'routes') {
    handleResource($method, $routeModel, 'route');
    exit;
}

// Admin gallery save
if ($action === 'gallery' && $method === 'POST') {
    verifyAdminSession();
    $input = getJSONInput();
    if (!$input || !isset($input['images'])) {
        sendError('Invalid input: images array required', 400);
    }
    saveTransferGallery($db, $input['images']);
    sendResponse($input['images'], 200, 'Gallery updated successfully');
    exit;
}

// Admin booking list
if ($action === 'bookings' && $method === 'GET') {
    handleBookingsList($db);
    exit;
}

sendError('Unknown endpoint. Use ?resource= or ?action=', 400);

// =====================================================================
// Resource handlers
// =====================================================================

function handleResource($method, $model, $resourceLabel)
{
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $item = $model->getById((int)$_GET['id']);
                if ($item) {
                    sendResponse($item, 200);
                } else {
                    sendError(ucfirst($resourceLabel) . ' not found', 404);
                }
            } else {
                $filters = [];
                if (isset($_GET['active']) && $_GET['active'] !== '') {
                    $filters['is_active'] = (int)$_GET['active'];
                }
                $items = $model->getAll($filters);
                sendResponse(['data' => $items, 'total' => count($items)], 200);
            }
            break;

        case 'POST':
            verifyAdminSession();
            $input = getJSONInput();
            if (!$input) sendError('Invalid JSON input', 400);
            try {
                $data = prepareResourceInput($resourceLabel, $input, $model);
                $id = $model->create($data);
                if ($id) {
                    $created = $model->getById($id);
                    sendResponse($created, 201, ucfirst($resourceLabel) . ' created successfully');
                } else {
                    sendError('Failed to create ' . $resourceLabel, 500);
                }
            } catch (Exception $e) {
                sendError($e->getMessage(), 400);
            }
            break;

        case 'PUT':
            verifyAdminSession();
            if (!isset($_GET['id'])) sendError(ucfirst($resourceLabel) . ' ID is required', 400);
            $id = (int)$_GET['id'];
            $existing = $model->getById($id);
            if (!$existing) sendError(ucfirst($resourceLabel) . ' not found', 404);

            $input = getJSONInput();
            if (!$input) sendError('Invalid JSON input', 400);
            try {
                $data = prepareResourceInput($resourceLabel, $input, $model, $id);
                if ($model->update($id, $data)) {
                    sendResponse($model->getById($id), 200, ucfirst($resourceLabel) . ' updated successfully');
                } else {
                    sendError('Failed to update ' . $resourceLabel, 500);
                }
            } catch (Exception $e) {
                sendError($e->getMessage(), 400);
            }
            break;

        case 'DELETE':
            verifyAdminSession();
            if (!isset($_GET['id'])) sendError(ucfirst($resourceLabel) . ' ID is required', 400);
            $id = (int)$_GET['id'];
            if (!$model->getById($id)) sendError(ucfirst($resourceLabel) . ' not found', 404);
            try {
                if ($model->delete($id)) {
                    sendResponse(['id' => $id], 200, ucfirst($resourceLabel) . ' deleted successfully');
                } else {
                    sendError('Failed to delete ' . $resourceLabel, 500);
                }
            } catch (Exception $e) {
                sendError($e->getMessage(), 500);
            }
            break;

        default:
            sendError('Method not allowed', 405);
    }
}

function prepareResourceInput($resource, $input, $model, $excludeId = null)
{
    if ($resource === 'location') {
        if (empty($input['name']) || trim($input['name']) === '') {
            throw new Exception('Name is required');
        }
        $name = sanitizeInput($input['name']);
        if ($model->existsByName($name, $excludeId)) {
            throw new Exception('A location with this name already exists');
        }
        return [
            'name' => $name,
            'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
            'sort_order' => isset($input['sort_order']) ? (int)$input['sort_order'] : 0,
        ];
    }

    if ($resource === 'vehicle') {
        if (empty($input['name']) || trim($input['name']) === '') {
            throw new Exception('Name is required');
        }
        $name = sanitizeInput($input['name']);
        if ($model->existsByName($name, $excludeId)) {
            throw new Exception('A vehicle with this name already exists');
        }
        return [
            'name' => $name,
            'max_passengers' => isset($input['max_passengers']) ? (int)$input['max_passengers'] : 1,
            'max_luggage' => isset($input['max_luggage']) ? (int)$input['max_luggage'] : 2,
            'image_url' => isset($input['image_url']) ? $input['image_url'] : null,
            'description' => isset($input['description']) ? sanitizeInput($input['description']) : null,
            'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
            'sort_order' => isset($input['sort_order']) ? (int)$input['sort_order'] : 0,
        ];
    }

    if ($resource === 'route') {
        if (empty($input['origin_id']) || empty($input['destination_id'])) {
            throw new Exception('origin_id and destination_id are required');
        }
        if ((int)$input['origin_id'] === (int)$input['destination_id']) {
            throw new Exception('Origin and destination must be different locations');
        }
        return [
            'origin_id' => (int)$input['origin_id'],
            'destination_id' => (int)$input['destination_id'],
            'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
            'prices' => isset($input['prices']) && is_array($input['prices']) ? $input['prices'] : [],
        ];
    }

    return $input;
}

// =====================================================================
// Public options endpoint (drives frontend dropdowns)
// =====================================================================

function handleOptions($routeModel)
{
    if (isset($_GET['origin']) && isset($_GET['destination'])) {
        $vehicles = $routeModel->getVehiclesForLocationPair($_GET['origin'], $_GET['destination']);
        sendResponse($vehicles, 200);
    } elseif (isset($_GET['origin'])) {
        $destinations = $routeModel->getDestinationsByOrigin($_GET['origin']);
        sendResponse($destinations, 200);
    } else {
        $origins = $routeModel->getActiveOriginLocations();
        sendResponse($origins, 200);
    }
}

// =====================================================================
// Public booking endpoint (unchanged behavior)
// =====================================================================

function handleTransferBooking($db)
{
    require_once '../models/TransferBooking.php';
    $transferBookingModel = new TransferBooking($db);

    $input = getJSONInput();
    if (!$input) sendError('Invalid JSON input', 400);

    $requiredFields = ['customer_name', 'customer_email', 'customer_phone', 'pickup_location', 'dropoff_location', 'pickup_date', 'pickup_time'];
    $missing = validateRequired($input, $requiredFields);
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    if (!filter_var($input['customer_email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email address', 400);
    }

    $bookingReference = 'TRF' . time() . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));
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
            sendTransferBookingEmail($data);
            pushBookingToBackoffice('transfer', $data);
            sendResponse($booking, 201, 'Transfer booking submitted successfully');
        } else {
            sendError('Failed to create transfer booking', 500);
        }
    } catch (Exception $e) {
        sendError('Error creating transfer booking: ' . $e->getMessage(), 500);
    }
}

// =====================================================================
// Admin: list bookings
// =====================================================================

function handleBookingsList($db)
{
    verifyAdminSession();
    require_once '../models/TransferBooking.php';
    $transferBookingModel = new TransferBooking($db);

    if (isset($_GET['stats'])) {
        sendResponse($transferBookingModel->getStats(), 200);
    }

    $filters = [
        'status' => $_GET['status'] ?? null,
        'search' => $_GET['search'] ?? null,
        'date_from' => $_GET['date_from'] ?? null,
        'date_to' => $_GET['date_to'] ?? null,
        'sort_by' => $_GET['sort_by'] ?? 'created_at',
        'sort_order' => $_GET['sort_order'] ?? 'DESC',
    ];

    $pagination = getPaginationParams();
    $filters['limit'] = $pagination['limit'];
    $filters['offset'] = $pagination['offset'];

    $bookings = $transferBookingModel->getAll($filters);
    $total = $transferBookingModel->getCount($filters);
    $response = buildPaginationResponse($bookings, $total, $pagination['page'], $pagination['limit']);
    sendResponse($response, 200);
}

// =====================================================================
// Email + gallery (kept from previous version)
// =====================================================================

function sendTransferBookingEmail($bookingData)
{
    $to = 'info@indosmilesouthservices.com';
    $subject = 'New Transfer Booking from ' . $bookingData['customer_name'] . ' (' . $bookingData['booking_reference'] . ')';

    $pickupDate = date('d M Y', strtotime($bookingData['pickup_date']));
    $pickupTime = date('H:i', strtotime($bookingData['pickup_time']));
    $tripTypeLabel = $bookingData['trip_type'] === 'return' ? 'Return Trip' : 'One Way';
    $totalPassengers = $bookingData['adults'] + $bookingData['children'] + $bookingData['infants'];

    // Extract vehicle + price line (prepended by the frontend) from special_requests
    $vehicleName = null;
    $vehiclePrice = null;
    $customerNotes = $bookingData['special_requests'] ?? '';
    if ($customerNotes && preg_match('/^\s*Vehicle:\s*(.+?)\s+[—\-–]\s+([\d,\.]+)\s+THB\s*\n?(.*)$/su', $customerNotes, $m)) {
        $vehicleName = trim($m[1]);
        $vehiclePrice = trim($m[2]);
        $customerNotes = trim($m[3]);
    }

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
                    <tr><td>Total Passengers</td><td>{$totalPassengers}</td></tr>";

    if ($vehicleName !== null) {
        $safeVehicle = htmlspecialchars($vehicleName, ENT_QUOTES, 'UTF-8');
        $safePrice = htmlspecialchars($vehiclePrice, ENT_QUOTES, 'UTF-8');
        $priceLabel = $bookingData['trip_type'] === 'return' ? 'Price (per way)' : 'Price';
        $body .= "
                    <tr><td>Vehicle</td><td>{$safeVehicle}</td></tr>
                    <tr><td>{$priceLabel}</td><td>฿{$safePrice} THB</td></tr>";
    }

    $body .= "
                </table>";

    if (!empty($customerNotes)) {
        $safeNotes = nl2br(htmlspecialchars($customerNotes, ENT_QUOTES, 'UTF-8'));
        $body .= "
                <h3 style='color: #1B2E4A; margin-top: 20px;'>Special Requests</h3>
                <p style='background: #fff; padding: 12px; border-radius: 4px;'>{$safeNotes}</p>";
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

function getTransferGallery($db)
{
    try {
        $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'transfer_gallery' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && $row['setting_value']) {
            $images = json_decode($row['setting_value'], true);
            return is_array($images) ? $images : [];
        }
    } catch (PDOException $e) {
        // table may not exist yet
    }
    return [];
}

function saveTransferGallery($db, $images)
{
    $json = json_encode($images);
    $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value, setting_type, description)
        VALUES ('transfer_gallery', :val, 'json', 'Transfer page gallery images (JSON array)')
        ON DUPLICATE KEY UPDATE setting_value = :val2");
    $stmt->bindParam(':val', $json);
    $stmt->bindParam(':val2', $json);
    $stmt->execute();
}
