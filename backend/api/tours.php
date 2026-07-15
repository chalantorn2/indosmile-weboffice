<?php
/**
 * Tours API Endpoint
 * Handles all tour-related API requests
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Tour.php';
require_once 'helpers.php';

// Handle CORS
handleCORS();

// Start session (must be before any session-dependent logic)
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

// Initialize database connection
try {
    $database = new Database();
    $db = $database->connect();
    $tourModel = new Tour($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

// Get request method
$method = getRequestMethod();

// Route handling
switch ($method) {
    case 'GET':
        handleGetRequest($tourModel);
        break;

    case 'POST':
        handlePostRequest($tourModel);
        break;

    case 'PUT':
        handlePutRequest($tourModel);
        break;

    case 'DELETE':
        handleDeleteRequest($tourModel);
        break;

    default:
        sendError('Method not allowed', 405);
}

/**
 * Handle GET requests
 */
function handleGetRequest($tourModel) {
    // The admin panel reads this same endpoint and needs the net (cost) price to edit it.
    // Nobody else may see it.
    $isAdmin = isAdminLoggedIn();

    // Get single tour by ID or slug
    if (isset($_GET['id'])) {
        $tour = $tourModel->getById($_GET['id']);
        if ($tour) {
            // Decode JSON fields
            $tour['gallery_images'] = json_decode($tour['gallery_images'], true);
            $tour['highlights'] = json_decode($tour['highlights'], true);
            $tour['included'] = json_decode($tour['included'], true);
            $tour['not_included'] = json_decode($tour['not_included'], true);
            $tour['itinerary'] = json_decode($tour['itinerary'], true);
            $tour['departure_times'] = json_decode($tour['departure_times'], true);
            $tour['what_to_bring'] = json_decode($tour['what_to_bring'], true);

            sendResponse($isAdmin ? $tour : stripNetPrices($tour), 200);
        } else {
            sendError('Tour not found', 404);
        }
    }

    if (isset($_GET['slug'])) {
        $tour = $tourModel->getBySlug($_GET['slug']);
        if ($tour) {
            // Decode JSON fields
            $tour['gallery_images'] = json_decode($tour['gallery_images'], true);
            $tour['highlights'] = json_decode($tour['highlights'], true);
            $tour['included'] = json_decode($tour['included'], true);
            $tour['not_included'] = json_decode($tour['not_included'], true);
            $tour['itinerary'] = json_decode($tour['itinerary'], true);
            $tour['departure_times'] = json_decode($tour['departure_times'], true);
            $tour['what_to_bring'] = json_decode($tour['what_to_bring'], true);

            sendResponse($isAdmin ? $tour : stripNetPrices($tour), 200);
        } else {
            sendError('Tour not found', 404);
        }
    }

    // Get all tours with filters
    $filters = [
        'type' => $_GET['type'] ?? null,
        'destination' => $_GET['destination'] ?? null,
        'is_featured' => isset($_GET['featured']) ? (int)$_GET['featured'] : null,
        'is_active' => (isset($_GET['active']) && $_GET['active'] !== '') ? (int)$_GET['active'] : null, // Empty or missing = all tours
        'search' => $_GET['search'] ?? null,
        'min_adult_price' => $_GET['min_price'] ?? null,
        'max_adult_price' => $_GET['max_price'] ?? null,
        'duration' => $_GET['duration'] ?? null,
        'sort_by' => $_GET['sort_by'] ?? 'created_at',
        'sort_order' => $_GET['sort_order'] ?? 'DESC'
    ];

    // Get pagination params
    $pagination = getPaginationParams();
    $filters['limit'] = $pagination['limit'];
    $filters['offset'] = $pagination['offset'];

    // Get tours and total count
    $tours = $tourModel->getAll($filters);
    $total = $tourModel->getCount($filters);

    // Decode JSON fields for each tour
    foreach ($tours as &$tour) {
        $tour['gallery_images'] = json_decode($tour['gallery_images'], true);
        $tour['highlights'] = json_decode($tour['highlights'], true);
        $tour['included'] = json_decode($tour['included'], true);
        $tour['not_included'] = json_decode($tour['not_included'], true);
        $tour['itinerary'] = json_decode($tour['itinerary'], true);
        $tour['departure_times'] = json_decode($tour['departure_times'], true);
        $tour['what_to_bring'] = json_decode($tour['what_to_bring'], true);

        if (!$isAdmin) {
            $tour = stripNetPrices($tour);
        }
    }
    unset($tour);

    // Build paginated response
    $response = buildPaginationResponse($tours, $total, $pagination['page'], $pagination['limit']);

    sendResponse($response, 200);
}

/**
 * Handle POST requests (Create new tour)
 */
function handlePostRequest($tourModel) {
    // Verify admin session
    $adminId = verifyAdminSession();

    // Get JSON input
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Validate required fields
    $requiredFields = ['name', 'destination', 'type', 'description', 'duration_days', 'duration_nights', 'adult_price'];
    $missing = validateRequired($input, $requiredFields);

    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    // Prepare data
    $data = [
        'name' => sanitizeInput($input['name']),
        'slug' => isset($input['slug']) ? sanitizeInput($input['slug']) : generateSlug($input['name']),
        'destination' => sanitizeInput($input['destination']),
        'type' => sanitizeInput($input['type']),
        'description' => sanitizeInput($input['description']),
        'short_description' => isset($input['short_description']) ? sanitizeInput($input['short_description']) : null,
        'duration_days' => (int)$input['duration_days'],
        'duration_nights' => (int)$input['duration_nights'],
        'duration_label' => isset($input['duration_label']) ? sanitizeInput($input['duration_label']) : null,
        'net_adult_price' => parseOptionalDecimal($input['net_adult_price'] ?? null),
        'net_child_price' => parseOptionalDecimal($input['net_child_price'] ?? null),
        'adult_price' => (float)$input['adult_price'],
        'child_price' => isset($input['child_price']) ? (float)$input['child_price'] : null,
        'park_fee_included' => isset($input['park_fee_included']) ? (int)(bool)$input['park_fee_included'] : 0,
        'park_fee_adult' => parseOptionalDecimal($input['park_fee_adult'] ?? null),
        'park_fee_child' => parseOptionalDecimal($input['park_fee_child'] ?? null),
        'currency' => isset($input['currency']) ? sanitizeInput($input['currency']) : 'THB',
        'rating' => isset($input['rating']) ? (float)$input['rating'] : 0.0,
        'review_count' => isset($input['review_count']) ? (int)$input['review_count'] : 0,
        'is_featured' => isset($input['is_featured']) ? (int)$input['is_featured'] : 0,
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
        'max_participants' => isset($input['max_participants']) ? (int)$input['max_participants'] : null,
        'min_participants' => isset($input['min_participants']) ? (int)$input['min_participants'] : 1,
        'difficulty_level' => isset($input['difficulty_level']) ? sanitizeInput($input['difficulty_level']) : 'easy',
        'main_image' => isset($input['main_image']) ? $input['main_image'] : null,
        'gallery_images' => isset($input['gallery_images']) ? json_encode($input['gallery_images']) : null,
        'highlights' => isset($input['highlights']) ? json_encode($input['highlights']) : null,
        'included' => isset($input['included']) ? json_encode($input['included']) : null,
        'not_included' => isset($input['not_included']) ? json_encode($input['not_included']) : null,
        'itinerary' => isset($input['itinerary']) ? json_encode($input['itinerary']) : null,
        'terms_conditions' => isset($input['terms_conditions']) ? $input['terms_conditions'] : null,
        'cancellation_policy' => isset($input['cancellation_policy']) ? $input['cancellation_policy'] : null,
        'pickup_time' => isset($input['pickup_time']) ? sanitizeInput($input['pickup_time']) : null,
        'pickup_location' => isset($input['pickup_location']) ? sanitizeInput($input['pickup_location']) : null,
        'dropoff_time' => isset($input['dropoff_time']) ? sanitizeInput($input['dropoff_time']) : null,
        'dropoff_location' => isset($input['dropoff_location']) ? sanitizeInput($input['dropoff_location']) : null,
        'departure_times' => isset($input['departure_times']) ? json_encode($input['departure_times']) : null,
        'meal_info' => isset($input['meal_info']) ? sanitizeInput($input['meal_info']) : null,
        'transfer_info' => isset($input['transfer_info']) ? sanitizeInput($input['transfer_info']) : null,
        'what_to_bring' => isset($input['what_to_bring']) ? json_encode($input['what_to_bring']) : null,
        'important_notes' => isset($input['important_notes']) ? $input['important_notes'] : null,
        'created_by' => $adminId,
        'source_tour_id' => isset($input['source_tour_id']) ? (int)$input['source_tour_id'] : null,
        'source_supplier_name' => isset($input['source_supplier_name']) ? sanitizeInput($input['source_supplier_name']) : null
    ];

    // A Contract Rate tour may only be imported once
    if ($data['source_tour_id'] && $tourModel->getBySourceTourId($data['source_tour_id'])) {
        sendError('This Contract Rate tour has already been imported', 409);
    }

    // Create tour
    try {
        $tourId = $tourModel->create($data);

        if ($tourId) {
            $tour = $tourModel->getById($tourId);
            sendResponse($tour, 201, 'Tour created successfully');
        } else {
            sendError('Failed to create tour', 500);
        }
    } catch (Exception $e) {
        sendError('Error creating tour: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle PUT requests (Update tour)
 */
function handlePutRequest($tourModel) {
    // Verify admin session
    verifyAdminSession();

    // Get tour ID from query string
    if (!isset($_GET['id'])) {
        sendError('Tour ID is required', 400);
    }

    $tourId = (int)$_GET['id'];

    // Check if tour exists
    $existingTour = $tourModel->getById($tourId);
    if (!$existingTour) {
        sendError('Tour not found', 404);
    }

    // Get JSON input
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Merge with existing data
    $data = [
        'name' => isset($input['name']) ? sanitizeInput($input['name']) : $existingTour['name'],
        'slug' => isset($input['slug']) ? sanitizeInput($input['slug']) : $existingTour['slug'],
        'destination' => isset($input['destination']) ? sanitizeInput($input['destination']) : $existingTour['destination'],
        'type' => isset($input['type']) ? sanitizeInput($input['type']) : $existingTour['type'],
        'description' => isset($input['description']) ? sanitizeInput($input['description']) : $existingTour['description'],
        'short_description' => isset($input['short_description']) ? sanitizeInput($input['short_description']) : $existingTour['short_description'],
        'duration_days' => isset($input['duration_days']) ? (int)$input['duration_days'] : $existingTour['duration_days'],
        'duration_nights' => isset($input['duration_nights']) ? (int)$input['duration_nights'] : $existingTour['duration_nights'],
        'duration_label' => isset($input['duration_label']) ? sanitizeInput($input['duration_label']) : $existingTour['duration_label'],
        'net_adult_price' => array_key_exists('net_adult_price', $input) ? parseOptionalDecimal($input['net_adult_price']) : $existingTour['net_adult_price'],
        'net_child_price' => array_key_exists('net_child_price', $input) ? parseOptionalDecimal($input['net_child_price']) : $existingTour['net_child_price'],
        'adult_price' => isset($input['adult_price']) ? (float)$input['adult_price'] : $existingTour['adult_price'],
        'child_price' => isset($input['child_price']) ? (float)$input['child_price'] : $existingTour['child_price'],
        'park_fee_included' => isset($input['park_fee_included']) ? (int)(bool)$input['park_fee_included'] : (int)$existingTour['park_fee_included'],
        'park_fee_adult' => array_key_exists('park_fee_adult', $input) ? parseOptionalDecimal($input['park_fee_adult']) : $existingTour['park_fee_adult'],
        'park_fee_child' => array_key_exists('park_fee_child', $input) ? parseOptionalDecimal($input['park_fee_child']) : $existingTour['park_fee_child'],
        'currency' => isset($input['currency']) ? sanitizeInput($input['currency']) : $existingTour['currency'],
        'rating' => isset($input['rating']) ? (float)$input['rating'] : $existingTour['rating'],
        'review_count' => isset($input['review_count']) ? (int)$input['review_count'] : $existingTour['review_count'],
        'is_featured' => isset($input['is_featured']) ? (int)$input['is_featured'] : $existingTour['is_featured'],
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : $existingTour['is_active'],
        'max_participants' => isset($input['max_participants']) ? (int)$input['max_participants'] : $existingTour['max_participants'],
        'min_participants' => isset($input['min_participants']) ? (int)$input['min_participants'] : $existingTour['min_participants'],
        'difficulty_level' => isset($input['difficulty_level']) ? sanitizeInput($input['difficulty_level']) : $existingTour['difficulty_level'],
        'main_image' => isset($input['main_image']) ? $input['main_image'] : $existingTour['main_image'],
        'gallery_images' => isset($input['gallery_images']) ? json_encode($input['gallery_images']) : $existingTour['gallery_images'],
        'highlights' => isset($input['highlights']) ? json_encode($input['highlights']) : $existingTour['highlights'],
        'included' => isset($input['included']) ? json_encode($input['included']) : $existingTour['included'],
        'not_included' => isset($input['not_included']) ? json_encode($input['not_included']) : $existingTour['not_included'],
        'itinerary' => isset($input['itinerary']) ? json_encode($input['itinerary']) : $existingTour['itinerary'],
        'terms_conditions' => isset($input['terms_conditions']) ? $input['terms_conditions'] : $existingTour['terms_conditions'],
        'cancellation_policy' => isset($input['cancellation_policy']) ? $input['cancellation_policy'] : $existingTour['cancellation_policy'],
        'pickup_time' => isset($input['pickup_time']) ? sanitizeInput($input['pickup_time']) : $existingTour['pickup_time'],
        'pickup_location' => isset($input['pickup_location']) ? sanitizeInput($input['pickup_location']) : $existingTour['pickup_location'],
        'dropoff_time' => isset($input['dropoff_time']) ? sanitizeInput($input['dropoff_time']) : $existingTour['dropoff_time'],
        'dropoff_location' => isset($input['dropoff_location']) ? sanitizeInput($input['dropoff_location']) : $existingTour['dropoff_location'],
        'departure_times' => isset($input['departure_times']) ? json_encode($input['departure_times']) : $existingTour['departure_times'],
        'meal_info' => isset($input['meal_info']) ? sanitizeInput($input['meal_info']) : $existingTour['meal_info'],
        'transfer_info' => isset($input['transfer_info']) ? sanitizeInput($input['transfer_info']) : $existingTour['transfer_info'],
        'what_to_bring' => isset($input['what_to_bring']) ? json_encode($input['what_to_bring']) : $existingTour['what_to_bring'],
        'important_notes' => isset($input['important_notes']) ? $input['important_notes'] : $existingTour['important_notes']
    ];

    // Update tour
    try {
        $result = $tourModel->update($tourId, $data);

        if ($result) {
            $tour = $tourModel->getById($tourId);
            sendResponse($tour, 200, 'Tour updated successfully');
        } else {
            sendError('Failed to update tour', 500);
        }
    } catch (Exception $e) {
        sendError('Error updating tour: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle DELETE requests
 */
function handleDeleteRequest($tourModel) {
    // Verify admin session
    verifyAdminSession();

    // Get tour ID from query string
    if (!isset($_GET['id'])) {
        sendError('Tour ID is required', 400);
    }

    $tourId = (int)$_GET['id'];

    // Check if tour exists
    $tour = $tourModel->getById($tourId);
    if (!$tour) {
        sendError('Tour not found', 404);
    }

    // Delete tour
    try {
        $result = $tourModel->delete($tourId);

        if ($result) {
            sendResponse(['id' => $tourId], 200, 'Tour deleted successfully');
        } else {
            sendError('Failed to delete tour', 500);
        }
    } catch (Exception $e) {
        sendError('Error deleting tour: ' . $e->getMessage(), 500);
    }
}
