<?php
/**
 * Tours API Endpoint
 * Handles all tour-related API requests
 */

header('Content-Type: application/json');
require_once '../../config/config.php';
require_once '../../config/Database.php';
require_once '../../models/Tour.php';
require_once 'helpers.php';

// Handle CORS
handleCORS();

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

            sendResponse($tour, 200);
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

            sendResponse($tour, 200);
        } else {
            sendError('Tour not found', 404);
        }
    }

    // Get all tours with filters
    $filters = [
        'type' => $_GET['type'] ?? null,
        'destination' => $_GET['destination'] ?? null,
        'is_featured' => isset($_GET['featured']) ? (int)$_GET['featured'] : null,
        'is_active' => isset($_GET['active']) ? (int)$_GET['active'] : 1, // Default: only active tours
        'search' => $_GET['search'] ?? null,
        'min_price' => $_GET['min_price'] ?? null,
        'max_price' => $_GET['max_price'] ?? null,
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
    }

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
    $requiredFields = ['name', 'destination', 'type', 'description', 'duration_days', 'duration_nights', 'price'];
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
        'price' => (float)$input['price'],
        'price_label' => isset($input['price_label']) ? sanitizeInput($input['price_label']) : null,
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
        'created_by' => $adminId
    ];

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
        'price' => isset($input['price']) ? (float)$input['price'] : $existingTour['price'],
        'price_label' => isset($input['price_label']) ? sanitizeInput($input['price_label']) : $existingTour['price_label'],
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
        'cancellation_policy' => isset($input['cancellation_policy']) ? $input['cancellation_policy'] : $existingTour['cancellation_policy']
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
