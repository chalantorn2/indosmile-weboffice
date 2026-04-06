<?php
/**
 * Hotels API Endpoint
 * Handles all hotel-related API requests
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Hotel.php';
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
    $hotelModel = new Hotel($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

// Get request method
$method = getRequestMethod();

// Route handling
switch ($method) {
    case 'GET':
        handleGetRequest($hotelModel);
        break;

    case 'POST':
        handlePostRequest($hotelModel);
        break;

    case 'PUT':
        handlePutRequest($hotelModel);
        break;

    case 'DELETE':
        handleDeleteRequest($hotelModel);
        break;

    default:
        sendError('Method not allowed', 405);
}

/**
 * Handle GET requests
 */
function handleGetRequest($hotelModel) {
    // Get single hotel by ID
    if (isset($_GET['id'])) {
        $hotel = $hotelModel->getById($_GET['id']);
        if ($hotel) {
            $hotel['amenities'] = json_decode($hotel['amenities'], true);
            // Decode room type amenities
            if (!empty($hotel['room_types'])) {
                foreach ($hotel['room_types'] as &$room) {
                    $room['amenities'] = json_decode($room['amenities'], true);
                }
            }
            sendResponse($hotel, 200);
        } else {
            sendError('Hotel not found', 404);
        }
    }

    // Get single hotel by slug
    if (isset($_GET['slug'])) {
        $hotel = $hotelModel->getBySlug($_GET['slug']);
        if ($hotel) {
            $hotel['amenities'] = json_decode($hotel['amenities'], true);
            if (!empty($hotel['room_types'])) {
                foreach ($hotel['room_types'] as &$room) {
                    $room['amenities'] = json_decode($room['amenities'], true);
                }
            }
            sendResponse($hotel, 200);
        } else {
            sendError('Hotel not found', 404);
        }
    }

    // Get all hotels with filters
    $filters = [
        'destination' => $_GET['destination'] ?? null,
        'stars' => $_GET['stars'] ?? null,
        'is_featured' => isset($_GET['featured']) ? (int)$_GET['featured'] : null,
        'is_active' => (isset($_GET['active']) && $_GET['active'] !== '') ? (int)$_GET['active'] : null,
        'search' => $_GET['search'] ?? null,
        'sort_by' => $_GET['sort_by'] ?? 'created_at',
        'sort_order' => $_GET['sort_order'] ?? 'DESC'
    ];

    // Get pagination params
    $pagination = getPaginationParams();
    $filters['limit'] = $pagination['limit'];
    $filters['offset'] = $pagination['offset'];

    // Get hotels and total count
    $hotels = $hotelModel->getAll($filters);
    $total = $hotelModel->getCount($filters);

    // Decode JSON fields and attach sub-resources
    foreach ($hotels as &$hotel) {
        $hotel['amenities'] = json_decode($hotel['amenities'], true);
        $hotel['images'] = $hotelModel->getImages($hotel['id']);
        $hotel['room_types'] = $hotelModel->getRoomTypes($hotel['id']);
        if (!empty($hotel['room_types'])) {
            foreach ($hotel['room_types'] as &$room) {
                $room['amenities'] = json_decode($room['amenities'], true);
            }
        }
    }

    // Build paginated response
    $response = buildPaginationResponse($hotels, $total, $pagination['page'], $pagination['limit']);

    sendResponse($response, 200);
}

/**
 * Handle POST requests (Create new hotel)
 */
function handlePostRequest($hotelModel) {
    // Verify admin session
    $adminId = verifyAdminSession();

    // Get JSON input
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Validate required fields
    $requiredFields = ['name', 'destination', 'description'];
    $missing = validateRequired($input, $requiredFields);

    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    // Prepare data
    $data = [
        'name' => sanitizeInput($input['name']),
        'slug' => isset($input['slug']) ? sanitizeInput($input['slug']) : generateSlug($input['name']),
        'destination' => sanitizeInput($input['destination']),
        'stars' => isset($input['stars']) ? (int)$input['stars'] : 4,
        'description' => sanitizeInput($input['description']),
        'short_description' => isset($input['short_description']) ? sanitizeInput($input['short_description']) : null,
        'rating' => isset($input['rating']) ? (float)$input['rating'] : 0.0,
        'review_count' => isset($input['review_count']) ? (int)$input['review_count'] : 0,
        'main_image' => isset($input['main_image']) ? $input['main_image'] : null,
        'amenities' => isset($input['amenities']) ? json_encode($input['amenities']) : null,
        'check_in_time' => isset($input['check_in_time']) ? sanitizeInput($input['check_in_time']) : null,
        'check_out_time' => isset($input['check_out_time']) ? sanitizeInput($input['check_out_time']) : null,
        'address' => isset($input['address']) ? sanitizeInput($input['address']) : null,
        'contact_phone' => isset($input['contact_phone']) ? sanitizeInput($input['contact_phone']) : null,
        'contact_email' => isset($input['contact_email']) ? sanitizeInput($input['contact_email']) : null,
        'website' => isset($input['website']) ? sanitizeInput($input['website']) : null,
        'is_featured' => isset($input['is_featured']) ? (int)$input['is_featured'] : 0,
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1,
        'created_by' => $adminId
    ];

    try {
        $hotelId = $hotelModel->create($data);

        if ($hotelId) {
            // Save images
            if (isset($input['images']) && is_array($input['images'])) {
                $hotelModel->saveImages($hotelId, $input['images']);
            }

            // Save room types
            if (isset($input['room_types']) && is_array($input['room_types'])) {
                $roomTypes = [];
                foreach ($input['room_types'] as $room) {
                    $roomTypes[] = [
                        'name' => sanitizeInput($room['name']),
                        'description' => isset($room['description']) ? sanitizeInput($room['description']) : null,
                        'max_guests' => isset($room['max_guests']) ? (int)$room['max_guests'] : 2,
                        'bed_type' => isset($room['bed_type']) ? sanitizeInput($room['bed_type']) : null,
                        'room_size' => isset($room['room_size']) ? $room['room_size'] : null,
                        'amenities' => isset($room['amenities']) ? json_encode($room['amenities']) : null,
                        'sort_order' => isset($room['sort_order']) ? (int)$room['sort_order'] : 0,
                        'is_active' => isset($room['is_active']) ? (int)$room['is_active'] : 1
                    ];
                }
                $hotelModel->saveRoomTypes($hotelId, $roomTypes);
            }

            $hotel = $hotelModel->getById($hotelId);
            sendResponse($hotel, 201, 'Hotel created successfully');
        } else {
            sendError('Failed to create hotel', 500);
        }
    } catch (Exception $e) {
        sendError('Error creating hotel: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle PUT requests (Update hotel)
 */
function handlePutRequest($hotelModel) {
    // Verify admin session
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Hotel ID is required', 400);
    }

    $hotelId = (int)$_GET['id'];

    $existingHotel = $hotelModel->getById($hotelId);
    if (!$existingHotel) {
        sendError('Hotel not found', 404);
    }

    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Merge with existing data
    $data = [
        'name' => isset($input['name']) ? sanitizeInput($input['name']) : $existingHotel['name'],
        'slug' => isset($input['slug']) ? sanitizeInput($input['slug']) : $existingHotel['slug'],
        'destination' => isset($input['destination']) ? sanitizeInput($input['destination']) : $existingHotel['destination'],
        'stars' => isset($input['stars']) ? (int)$input['stars'] : $existingHotel['stars'],
        'description' => isset($input['description']) ? sanitizeInput($input['description']) : $existingHotel['description'],
        'short_description' => isset($input['short_description']) ? sanitizeInput($input['short_description']) : $existingHotel['short_description'],
        'rating' => isset($input['rating']) ? (float)$input['rating'] : $existingHotel['rating'],
        'review_count' => isset($input['review_count']) ? (int)$input['review_count'] : $existingHotel['review_count'],
        'main_image' => isset($input['main_image']) ? $input['main_image'] : $existingHotel['main_image'],
        'amenities' => isset($input['amenities']) ? json_encode($input['amenities']) : $existingHotel['amenities'],
        'check_in_time' => isset($input['check_in_time']) ? sanitizeInput($input['check_in_time']) : $existingHotel['check_in_time'],
        'check_out_time' => isset($input['check_out_time']) ? sanitizeInput($input['check_out_time']) : $existingHotel['check_out_time'],
        'address' => isset($input['address']) ? sanitizeInput($input['address']) : $existingHotel['address'],
        'contact_phone' => isset($input['contact_phone']) ? sanitizeInput($input['contact_phone']) : $existingHotel['contact_phone'],
        'contact_email' => isset($input['contact_email']) ? sanitizeInput($input['contact_email']) : $existingHotel['contact_email'],
        'website' => isset($input['website']) ? sanitizeInput($input['website']) : $existingHotel['website'],
        'is_featured' => isset($input['is_featured']) ? (int)$input['is_featured'] : $existingHotel['is_featured'],
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : $existingHotel['is_active']
    ];

    try {
        $result = $hotelModel->update($hotelId, $data);

        if ($result) {
            // Update images if provided
            if (isset($input['images']) && is_array($input['images'])) {
                $hotelModel->saveImages($hotelId, $input['images']);
            }

            // Update room types if provided
            if (isset($input['room_types']) && is_array($input['room_types'])) {
                $roomTypes = [];
                foreach ($input['room_types'] as $room) {
                    $roomTypes[] = [
                        'name' => sanitizeInput($room['name']),
                        'description' => isset($room['description']) ? sanitizeInput($room['description']) : null,
                        'max_guests' => isset($room['max_guests']) ? (int)$room['max_guests'] : 2,
                        'bed_type' => isset($room['bed_type']) ? sanitizeInput($room['bed_type']) : null,
                        'room_size' => isset($room['room_size']) ? $room['room_size'] : null,
                        'amenities' => isset($room['amenities']) ? json_encode($room['amenities']) : null,
                        'sort_order' => isset($room['sort_order']) ? (int)$room['sort_order'] : 0,
                        'is_active' => isset($room['is_active']) ? (int)$room['is_active'] : 1
                    ];
                }
                $hotelModel->saveRoomTypes($hotelId, $roomTypes);
            }

            $hotel = $hotelModel->getById($hotelId);
            sendResponse($hotel, 200, 'Hotel updated successfully');
        } else {
            sendError('Failed to update hotel', 500);
        }
    } catch (Exception $e) {
        sendError('Error updating hotel: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle DELETE requests
 */
function handleDeleteRequest($hotelModel) {
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Hotel ID is required', 400);
    }

    $hotelId = (int)$_GET['id'];

    $hotel = $hotelModel->getById($hotelId);
    if (!$hotel) {
        sendError('Hotel not found', 404);
    }

    try {
        $result = $hotelModel->delete($hotelId);

        if ($result) {
            sendResponse(['id' => $hotelId], 200, 'Hotel deleted successfully');
        } else {
            sendError('Failed to delete hotel', 500);
        }
    } catch (Exception $e) {
        sendError('Error deleting hotel: ' . $e->getMessage(), 500);
    }
}
