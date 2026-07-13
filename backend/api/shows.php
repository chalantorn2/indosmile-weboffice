<?php
/**
 * Shows API Endpoint
 * Handles all show-related API requests (Shows & Adventures)
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Show.php';
require_once 'helpers.php';

handleCORS();

if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

try {
    $database = new Database();
    $db = $database->connect();
    $showModel = new Show($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

$method = getRequestMethod();

switch ($method) {
    case 'GET':
        handleGetRequest($showModel);
        break;
    case 'POST':
        handlePostRequest($showModel);
        break;
    case 'PUT':
        handlePutRequest($showModel);
        break;
    case 'DELETE':
        handleDeleteRequest($showModel);
        break;
    default:
        sendError('Method not allowed', 405);
}

function decodeShowJsonFields(&$show) {
    $show['gallery_images'] = json_decode($show['gallery_images'], true);
    $show['highlights'] = json_decode($show['highlights'], true);
    $show['included'] = json_decode($show['included'], true);
    $show['not_included'] = json_decode($show['not_included'], true);
    $show['show_times'] = json_decode($show['show_times'], true);
    $show['seat_zones'] = json_decode($show['seat_zones'], true);
    $show['operational_days'] = json_decode($show['operational_days'], true);
    $show['what_to_bring'] = json_decode($show['what_to_bring'], true);
}

function handleGetRequest($showModel) {
    if (isset($_GET['id'])) {
        $show = $showModel->getById($_GET['id']);
        if ($show) {
            decodeShowJsonFields($show);
            sendResponse($show, 200);
        } else {
            sendError('Show not found', 404);
        }
    }

    if (isset($_GET['slug'])) {
        $show = $showModel->getBySlug($_GET['slug']);
        if ($show) {
            decodeShowJsonFields($show);
            sendResponse($show, 200);
        } else {
            sendError('Show not found', 404);
        }
    }

    $filters = [
        'destination' => $_GET['destination'] ?? null,
        'is_featured' => isset($_GET['featured']) ? (int)$_GET['featured'] : null,
        'is_active' => (isset($_GET['active']) && $_GET['active'] !== '') ? (int)$_GET['active'] : null,
        'search' => $_GET['search'] ?? null,
        'min_adult_price' => $_GET['min_price'] ?? null,
        'max_adult_price' => $_GET['max_price'] ?? null,
        'sort_by' => $_GET['sort_by'] ?? 'created_at',
        'sort_order' => $_GET['sort_order'] ?? 'DESC'
    ];

    $pagination = getPaginationParams();
    $filters['limit'] = $pagination['limit'];
    $filters['offset'] = $pagination['offset'];

    $shows = $showModel->getAll($filters);
    $total = $showModel->getCount($filters);

    foreach ($shows as &$show) {
        decodeShowJsonFields($show);
    }

    $response = buildPaginationResponse($shows, $total, $pagination['page'], $pagination['limit']);
    sendResponse($response, 200);
}

function handlePostRequest($showModel) {
    $adminId = verifyAdminSession();
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $requiredFields = ['name', 'destination', 'description', 'adult_price'];
    $missing = validateRequired($input, $requiredFields);
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    $data = buildShowData($input, $adminId);

    // A Contract Rate tour may only be imported once
    if ($data['source_tour_id'] && $showModel->getBySourceTourId($data['source_tour_id'])) {
        sendError('This Contract Rate tour has already been imported', 409);
    }

    try {
        $showId = $showModel->create($data);
        if ($showId) {
            $show = $showModel->getById($showId);
            decodeShowJsonFields($show);
            sendResponse($show, 201, 'Show created successfully');
        } else {
            sendError('Failed to create show', 500);
        }
    } catch (Exception $e) {
        sendError('Error creating show: ' . $e->getMessage(), 500);
    }
}

function handlePutRequest($showModel) {
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Show ID is required', 400);
    }

    $showId = (int)$_GET['id'];
    $existingShow = $showModel->getById($showId);
    if (!$existingShow) {
        sendError('Show not found', 404);
    }

    $input = getJSONInput();
    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $data = buildShowData($input, null, $existingShow);

    try {
        $result = $showModel->update($showId, $data);
        if ($result) {
            $show = $showModel->getById($showId);
            decodeShowJsonFields($show);
            sendResponse($show, 200, 'Show updated successfully');
        } else {
            sendError('Failed to update show', 500);
        }
    } catch (Exception $e) {
        sendError('Error updating show: ' . $e->getMessage(), 500);
    }
}

function handleDeleteRequest($showModel) {
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Show ID is required', 400);
    }

    $showId = (int)$_GET['id'];
    $show = $showModel->getById($showId);
    if (!$show) {
        sendError('Show not found', 404);
    }

    try {
        $result = $showModel->delete($showId);
        if ($result) {
            sendResponse(['id' => $showId], 200, 'Show deleted successfully');
        } else {
            sendError('Failed to delete show', 500);
        }
    } catch (Exception $e) {
        sendError('Error deleting show: ' . $e->getMessage(), 500);
    }
}

/**
 * Build show data from input, merging with existing on update
 */
function buildShowData($input, $adminId = null, $existing = null) {
    $get = function ($key, $default = null) use ($input, $existing) {
        if (isset($input[$key])) return $input[$key];
        if ($existing && isset($existing[$key])) return $existing[$key];
        return $default;
    };

    $jsonField = function ($key) use ($input, $existing) {
        if (isset($input[$key])) return json_encode($input[$key]);
        if ($existing && isset($existing[$key])) return $existing[$key];
        return null;
    };

    $data = [
        'name' => sanitizeInput($get('name')),
        'slug' => isset($input['slug']) ? sanitizeInput($input['slug']) : ($existing['slug'] ?? generateSlug($input['name'] ?? '')),
        'destination' => sanitizeInput($get('destination')),
        'venue' => sanitizeInput($get('venue')),
        'description' => sanitizeInput($get('description')),
        'short_description' => sanitizeInput($get('short_description')),
        'duration_days' => (int)$get('duration_days', 1),
        'duration_nights' => (int)$get('duration_nights', 0),
        'duration_label' => sanitizeInput($get('duration_label')),
        'adult_price' => (float)$get('adult_price', 0),
        'child_price' => isset($input['child_price']) ? (float)$input['child_price'] : ($existing['child_price'] ?? null),
        'park_fee_included' => isset($input['park_fee_included'])
            ? (int)(bool)$input['park_fee_included']
            : (int)($existing['park_fee_included'] ?? 0),
        'park_fee_adult' => array_key_exists('park_fee_adult', $input)
            ? parseOptionalDecimal($input['park_fee_adult'])
            : ($existing['park_fee_adult'] ?? null),
        'park_fee_child' => array_key_exists('park_fee_child', $input)
            ? parseOptionalDecimal($input['park_fee_child'])
            : ($existing['park_fee_child'] ?? null),
        'currency' => sanitizeInput($get('currency', 'THB')),
        'rating' => (float)$get('rating', 0),
        'review_count' => (int)$get('review_count', 0),
        'is_featured' => (int)$get('is_featured', 0),
        'is_active' => (int)$get('is_active', 1),
        'max_participants' => isset($input['max_participants']) ? (int)$input['max_participants'] : ($existing['max_participants'] ?? null),
        'min_participants' => (int)$get('min_participants', 1),
        'main_image' => $get('main_image'),
        'gallery_images' => $jsonField('gallery_images'),
        'highlights' => $jsonField('highlights'),
        'included' => $jsonField('included'),
        'not_included' => $jsonField('not_included'),
        'show_times' => $jsonField('show_times'),
        'seat_zones' => $jsonField('seat_zones'),
        'operational_days' => $jsonField('operational_days'),
        'pickup_time' => sanitizeInput($get('pickup_time')),
        'pickup_location' => sanitizeInput($get('pickup_location')),
        'dropoff_time' => sanitizeInput($get('dropoff_time')),
        'dropoff_location' => sanitizeInput($get('dropoff_location')),
        'meal_info' => sanitizeInput($get('meal_info')),
        'transfer_info' => sanitizeInput($get('transfer_info')),
        'what_to_bring' => $jsonField('what_to_bring'),
        'important_notes' => $get('important_notes'),
        'terms_conditions' => $get('terms_conditions'),
        'cancellation_policy' => $get('cancellation_policy'),
    ];

    // Source link is set once, on import — never overwritten by a later edit
    if ($adminId !== null) {
        $data['created_by'] = $adminId;
        $data['source_tour_id'] = isset($input['source_tour_id']) ? (int)$input['source_tour_id'] : null;
        $data['source_supplier_name'] = isset($input['source_supplier_name']) ? sanitizeInput($input['source_supplier_name']) : null;
    }

    return $data;
}
