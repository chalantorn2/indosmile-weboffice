<?php
/**
 * Public Hotels API (Read-only)
 *
 * Server-to-server endpoint that lets approved partners pull hotel data.
 * - GET only. POST/PUT/DELETE are not supported here (use hotels.php with an admin session).
 * - Auth: send the key in the `X-API-Key` header (or `?api_key=` query param as a fallback).
 * - CORS is open (*) since callers are expected to be backends, not browsers.
 * - Simple per-key, per-minute rate limit backed by temp files.
 *
 * Endpoints:
 *   GET public_hotels.php                 -> paginated list (filters: destination, stars, featured, search, page, limit)
 *   GET public_hotels.php?id=5            -> single hotel
 *   GET public_hotels.php?slug=some-slug  -> single hotel by slug
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Hotel.php';
require_once 'helpers.php';

// --- Open CORS for this public endpoint (overrides the whitelisted handleCORS) ---
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key');
header('Access-Control-Max-Age: 3600');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- Method guard: read-only ---
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed. This endpoint is read-only.', 405);
}

// --- API key check ---
$apiKey = getProvidedApiKey();
$partner = validateApiKey($apiKey);
if ($partner === false) {
    sendError('Invalid or missing API key.', 401);
}

// --- Rate limit ---
enforceRateLimit($apiKey, PUBLIC_API_RATE_LIMIT);

// --- Serve hotel data ---
try {
    $database = new Database();
    $db = $database->connect();
    $hotelModel = new Hotel($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

// Single hotel by ID
if (isset($_GET['id'])) {
    $hotel = $hotelModel->getById((int)$_GET['id']);
    if ($hotel && (int)$hotel['is_active'] === 1) {
        sendResponse(decodeHotel($hotel), 200);
    }
    sendError('Hotel not found', 404);
}

// Single hotel by slug
if (isset($_GET['slug'])) {
    $hotel = $hotelModel->getBySlug($_GET['slug']);
    if ($hotel && (int)$hotel['is_active'] === 1) {
        sendResponse(decodeHotel($hotel), 200);
    }
    sendError('Hotel not found', 404);
}

// List (only active hotels are exposed publicly)
$filters = [
    'destination' => $_GET['destination'] ?? null,
    'stars'       => $_GET['stars'] ?? null,
    'is_featured' => isset($_GET['featured']) ? (int)$_GET['featured'] : null,
    'is_active'   => 1,
    'search'      => $_GET['search'] ?? null,
    'sort_by'     => $_GET['sort_by'] ?? 'created_at',
    'sort_order'  => $_GET['sort_order'] ?? 'DESC',
];

$pagination = getPaginationParams();
$filters['limit']  = $pagination['limit'];
$filters['offset'] = $pagination['offset'];

$hotels = $hotelModel->getAll($filters);
$total  = $hotelModel->getCount($filters);

foreach ($hotels as &$hotel) {
    $hotel['amenities']  = json_decode($hotel['amenities'], true);
    $hotel['images']     = $hotelModel->getImages($hotel['id']);
    $hotel['room_types'] = $hotelModel->getRoomTypes($hotel['id']);
    foreach ($hotel['room_types'] as &$room) {
        $room['amenities'] = json_decode($room['amenities'], true);
    }
    unset($room);
}
unset($hotel);

sendResponse(buildPaginationResponse($hotels, $total, $pagination['page'], $pagination['limit']), 200);


// =====================================================================
// Helpers local to the public API
// =====================================================================

/**
 * Decode JSON fields on a single hotel record (already includes images/room_types
 * from Hotel::getById/getBySlug).
 */
function decodeHotel($hotel)
{
    $hotel['amenities'] = json_decode($hotel['amenities'], true);
    if (!empty($hotel['room_types'])) {
        foreach ($hotel['room_types'] as &$room) {
            $room['amenities'] = json_decode($room['amenities'], true);
        }
        unset($room);
    }
    return $hotel;
}

/**
 * Read the API key from the X-API-Key header, falling back to ?api_key=.
 */
function getProvidedApiKey()
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    foreach ($headers as $name => $value) {
        if (strtolower($name) === 'x-api-key') {
            return trim($value);
        }
    }
    if (isset($_SERVER['HTTP_X_API_KEY'])) {
        return trim($_SERVER['HTTP_X_API_KEY']);
    }
    if (isset($_GET['api_key'])) {
        return trim($_GET['api_key']);
    }
    return '';
}

/**
 * Validate the key against the configured list using a constant-time compare.
 * Returns the partner label on success, or false.
 */
function validateApiKey($apiKey)
{
    if ($apiKey === '') {
        return false;
    }
    $keys = unserialize(PUBLIC_API_KEYS);
    foreach ($keys as $validKey => $label) {
        if (hash_equals((string)$validKey, (string)$apiKey)) {
            return $label;
        }
    }
    return false;
}

/**
 * Fixed-window per-minute rate limit, one counter file per key.
 * Sends a 429 (with Retry-After) when the limit is exceeded.
 */
function enforceRateLimit($apiKey, $limitPerMin)
{
    if ((int)$limitPerMin <= 0) {
        return; // unlimited
    }

    $minute = (int)floor(time() / 60);
    $file = sys_get_temp_dir() . '/indosmile_rl_' . sha1($apiKey) . '.json';

    $count = 0;
    $fp = @fopen($file, 'c+');
    if ($fp === false) {
        return; // fail open: never block traffic on a filesystem hiccup
    }

    if (flock($fp, LOCK_EX)) {
        $raw = stream_get_contents($fp);
        $state = json_decode($raw, true);
        if (is_array($state) && isset($state['minute']) && (int)$state['minute'] === $minute) {
            $count = (int)$state['count'] + 1;
        } else {
            $count = 1;
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode(['minute' => $minute, 'count' => $count]));
        fflush($fp);
        flock($fp, LOCK_UN);
    }
    fclose($fp);

    if ($count > (int)$limitPerMin) {
        header('Retry-After: ' . (60 - (time() % 60)));
        sendError('Rate limit exceeded. Try again shortly.', 429);
    }
}
