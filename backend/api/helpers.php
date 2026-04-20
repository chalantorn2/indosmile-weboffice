<?php

/**
 * API Helper Functions
 */

// Constants that can't be defined in config.php for PHP 5.6 compatibility
if (!defined('ALLOWED_ORIGINS_ARRAY')) {
    define('ALLOWED_ORIGINS_ARRAY', serialize([
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://localhost:5176',
        'https://indosmilesouthservices.com'
    ]));
}

if (!defined('ALLOWED_IMAGE_TYPES_ARRAY')) {
    define('ALLOWED_IMAGE_TYPES_ARRAY', serialize([
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg'
    ]));
}

/**
 * Send JSON response
 */
function sendResponse($data, $statusCode = 200, $message = null)
{
    http_response_code($statusCode);
    header('Content-Type: application/json');

    $response = [
        'success' => ($statusCode >= 200 && $statusCode < 300),
        'status' => $statusCode,
        'data' => $data
    ];

    if ($message !== null) {
        $response['message'] = $message;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400, $errors = null)
{
    http_response_code($statusCode);
    header('Content-Type: application/json');

    $response = [
        'success' => false,
        'status' => $statusCode,
        'message' => $message
    ];

    if ($errors !== null) {
        $response['errors'] = $errors;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Handle CORS
 */
function handleCORS()
{
    // ลบ CORS headers เก่าที่อาจซ้ำ
    if (function_exists('header_remove')) {
        header_remove('Access-Control-Allow-Origin');
        header_remove('Access-Control-Allow-Methods');
        header_remove('Access-Control-Allow-Headers');
        header_remove('Access-Control-Allow-Credentials');
    }

    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    $allowedOrigins = unserialize(ALLOWED_ORIGINS_ARRAY);

    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: " . $origin, true);
        header("Access-Control-Allow-Credentials: true", true);
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS", true);
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With", true);
    header("Access-Control-Max-Age: 3600", true);

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Get request method
 */
function getRequestMethod()
{
    return $_SERVER['REQUEST_METHOD'];
}

/**
 * Get JSON input
 */
function getJSONInput()
{
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

/**
 * Validate required fields
 */
function validateRequired($data, $requiredFields)
{
    $missing = [];

    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $missing[] = $field;
        }
    }

    return $missing;
}

/**
 * Sanitize input
 */
function sanitizeInput($data)
{
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }

    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Generate slug from string
 */
function generateSlug($string)
{
    $string = strtolower($string);
    $string = preg_replace('/[^a-z0-9-]/', '-', $string);
    $string = preg_replace('/-+/', '-', $string);
    $string = trim($string, '-');
    return $string;
}

/**
 * Verify admin session
 */
function verifyAdminSession()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_name(SESSION_NAME);
        session_start();
    }

    if (!isset($_SESSION['admin_id']) || !isset($_SESSION['admin_logged_in'])) {
        sendError('Unauthorized. Please login.', 401);
    }

    return $_SESSION['admin_id'];
}

/**
 * Get pagination params
 */
function getPaginationParams()
{
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? min(intval($_GET['limit']), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
    $offset = ($page - 1) * $limit;

    return [
        'page' => $page,
        'limit' => $limit,
        'offset' => $offset
    ];
}

/**
 * Build pagination response
 */
function buildPaginationResponse($data, $total, $page, $limit)
{
    $totalPages = ceil($total / $limit);

    return [
        'items' => $data,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_items' => $total,
            'total_pages' => $totalPages,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ]
    ];
}

/**
 * Upload image file
 */
function uploadImage($file, $subdir = 'tours')
{
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return array('success' => false, 'message' => 'No file uploaded or upload error');
    }

    if ($file['size'] > UPLOAD_MAX_SIZE) {
        return array('success' => false, 'message' => 'File size exceeds limit');
    }

    $allowedTypes = unserialize(ALLOWED_IMAGE_TYPES_ARRAY);
    if (!in_array($file['type'], $allowedTypes)) {
        return array('success' => false, 'message' => 'Invalid file type');
    }

    $uploadDir = UPLOAD_DIR . $subdir . '/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $url = '/backend/uploads/' . $subdir . '/' . $filename;
        return ['success' => true, 'url' => $url];
    }

    return ['success' => false, 'message' => 'Failed to move uploaded file'];
}

/**
 * Generate booking reference
 */
function generateBookingReference()
{
    $prefix = 'INDO';
    $timestamp = time();
    $random = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));
    return $prefix . $timestamp . $random;
}

// =====================================================================
// Backoffice intake (push to admin web at bookings.indosmilesouthservices.com)
// =====================================================================

if (!defined('BACKOFFICE_INTAKE_URL')) {
    define('BACKOFFICE_INTAKE_URL', 'https://bookings.indosmilesouthservices.com/api/intake.php');
}
if (!defined('BACKOFFICE_INTAKE_KEY')) {
    // MUST match $INTAKE_SECRET inside intake.php
    define('BACKOFFICE_INTAKE_KEY', 'INDO_INTAKE_2026_CHANGE_ME_a8f3d2c1b4e7');
}

/**
 * Fire-and-forget POST of a booking to the admin backoffice.
 * Never throws — failures are logged to backend/api/intake_push.log so the
 * customer-facing flow is never blocked by a backoffice outage.
 *
 * @param string $type     'tour' or 'transfer'
 * @param array  $booking  Booking payload (already includes booking_reference,
 *                         customer_name/email/phone, dates, pax, etc.)
 */
function pushBookingToBackoffice($type, array $booking)
{
    $logFile = __DIR__ . '/intake_push.log';
    $log = function ($msg) use ($logFile) {
        @file_put_contents($logFile, '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL, FILE_APPEND);
    };

    try {
        $payload = json_encode([
            'type'    => $type,
            'booking' => $booking,
        ], JSON_UNESCAPED_UNICODE);

        $ch = curl_init(BACKOFFICE_INTAKE_URL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 8);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-Intake-Key: ' . BACKOFFICE_INTAKE_KEY,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        $ref = $booking['booking_reference'] ?? '?';
        if ($response === false) {
            $log("PUSH FAIL ref=$ref type=$type curl_error=$err");
            return;
        }
        if ($httpCode < 200 || $httpCode >= 300) {
            $log("PUSH FAIL ref=$ref type=$type http=$httpCode body=" . substr($response, 0, 300));
            return;
        }
        $log("PUSH OK ref=$ref type=$type http=$httpCode body=" . substr($response, 0, 200));
    } catch (Exception $e) {
        $log('PUSH EXCEPTION: ' . $e->getMessage());
    }
}
