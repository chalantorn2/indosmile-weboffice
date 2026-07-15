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
        if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }

    return $missing;
}

/**
 * Sanitize plain-text input.
 * Stores raw text in DB. Output-side escaping is React's job for JSX,
 * and sanitizeHtml() for rich-text fields rendered via dangerouslySetInnerHTML.
 */
function sanitizeInput($data)
{
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }

    if ($data === null) {
        return null;
    }

    return trim((string)$data);
}

/**
 * Sanitize rich HTML input (blog content, etc.) with a tag/attribute allowlist.
 * Strips <script>, <style>, event handlers, javascript: URLs.
 */
function sanitizeHtml($html)
{
    if ($html === null || $html === '') {
        return $html;
    }

    $allowedTags = '<p><br><strong><b><em><i><u><s><a><img><ul><ol><li><h1><h2><h3><h4><h5><h6><blockquote><pre><code><hr><table><thead><tbody><tr><th><td><span><div><figure><figcaption>';

    $html = preg_replace('#<script\b[^>]*>.*?</script>#is', '', $html);
    $html = preg_replace('#<style\b[^>]*>.*?</style>#is', '', $html);
    $html = preg_replace('#<iframe\b[^>]*>.*?</iframe>#is', '', $html);

    $html = strip_tags($html, $allowedTags);

    $html = preg_replace('#\son[a-z]+\s*=\s*"[^"]*"#i', '', $html);
    $html = preg_replace("#\son[a-z]+\s*=\s*'[^']*'#i", '', $html);
    $html = preg_replace('#\son[a-z]+\s*=\s*[^\s>]+#i', '', $html);

    $html = preg_replace('#(href|src)\s*=\s*"\s*javascript:[^"]*"#i', '$1="#"', $html);
    $html = preg_replace("#(href|src)\s*=\s*'\s*javascript:[^']*'#i", "$1='#'", $html);

    return $html;
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
 * Same check as verifyAdminSession(), but answers instead of rejecting — for endpoints
 * that serve both the public site and the admin panel and only differ in what they show.
 */
function isAdminLoggedIn()
{
    if (session_status() === PHP_SESSION_NONE) {
        session_name(SESSION_NAME);
        session_start();
    }

    return isset($_SESSION['admin_id']) && isset($_SESSION['admin_logged_in']);
}

/**
 * net_adult_price / net_child_price are what a tour COSTS us. They live in the same
 * row as the selling price, and tours/shows are read with SELECT *, so every public
 * read has to drop them explicitly — a customer must never see what we paid.
 */
function stripNetPrices($row)
{
    unset($row['net_adult_price'], $row['net_child_price']);
    return $row;
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
 * Download a remote image into the local uploads dir and return its public URL.
 * Used when importing tours from the Contract Rate API so we don't hotlink their files.
 */
function downloadImageToUploads($url, $subdir = 'tours')
{
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return ['success' => false, 'message' => 'Invalid URL'];
    }

    $host = parse_url($url, PHP_URL_HOST);
    $allowedHost = parse_url(CONTRACT_RATE_API_BASE, PHP_URL_HOST);
    if ($host !== $allowedHost) {
        return ['success' => false, 'message' => 'URL host not allowed'];
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_MAXFILESIZE => UPLOAD_MAX_SIZE,
    ]);
    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $mime = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    if ($body === false || $status !== 200) {
        return ['success' => false, 'message' => 'Download failed (HTTP ' . $status . ')'];
    }

    if (strlen($body) > UPLOAD_MAX_SIZE) {
        return ['success' => false, 'message' => 'File size exceeds limit'];
    }

    $mime = trim(explode(';', (string)$mime)[0]);
    $allowedTypes = unserialize(ALLOWED_IMAGE_TYPES_ARRAY);
    if (!in_array($mime, $allowedTypes)) {
        return ['success' => false, 'message' => 'Invalid file type: ' . $mime];
    }

    $uploadDir = UPLOAD_DIR . $subdir . '/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
    if (!preg_match('/^(jpg|jpeg|png|gif|webp)$/', $extension)) {
        $extension = 'jpg';
    }
    $filename = uniqid() . '_' . time() . '.' . $extension;

    if (file_put_contents($uploadDir . $filename, $body) === false) {
        return ['success' => false, 'message' => 'Failed to save file'];
    }

    return ['success' => true, 'url' => '/backend/uploads/' . $subdir . '/' . $filename];
}

/**
 * Cast an optional money input to a float, keeping "not set" and "" as NULL so an
 * empty form field does not become 0.00.
 */
function parseOptionalDecimal($value)
{
    if ($value === null || $value === '' || !is_numeric($value)) {
        return null;
    }
    return (float)$value;
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
// Email
// =====================================================================

if (!defined('SITE_URL')) {
    define('SITE_URL', 'https://indosmilesouthservices.com');
}
if (!defined('ADMIN_EMAIL')) {
    define('ADMIN_EMAIL', 'info@indosmilesouthservices.com');
}
if (!defined('MAIL_FROM')) {
    define('MAIL_FROM', 'Indo Smile South Services <booking@indosmilesouthservices.com>');
}

/**
 * Send an HTML email and log the outcome.
 *
 * PHP's mail() only reports "handed to the MTA", not delivery — but a false return
 * still means the message never left, which the old @mail() calls swallowed silently.
 */
function sendMail($to, $subject, $htmlBody, $replyTo = null)
{
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= 'From: ' . MAIL_FROM . "\r\n";
    if ($replyTo) {
        $headers .= 'Reply-To: ' . $replyTo . "\r\n";
    }

    $sent = @mail($to, $subject, $htmlBody, $headers, '-f ' . ADMIN_EMAIL);

    @file_put_contents(
        __DIR__ . '/mail.log',
        '[' . date('Y-m-d H:i:s') . '] ' . ($sent ? 'OK  ' : 'FAIL') . " to=$to subject=$subject" . PHP_EOL,
        FILE_APPEND
    );

    return $sent;
}

/**
 * Wrap body content in the shared branded email shell.
 *
 * $accent tints the reference bar so the customer can tell the three mails apart at
 * a glance: yellow = received, blue = pay now, green = paid.
 */
function emailLayout($heading, $reference, $contentHtml, $accent = 'yellow')
{
    $accents = [
        'yellow' => ['bg' => '#FFC72C', 'fg' => '#1B2E4A'],
        'blue'   => ['bg' => '#1B2E4A', 'fg' => '#ffffff'],
        'green'  => ['bg' => '#1E8E5A', 'fg' => '#ffffff'],
    ];
    $a = $accents[$accent] ?? $accents['yellow'];

    $refBar = $reference
        ? "<div style='background:{$a['bg']};color:{$a['fg']};padding:15px;text-align:center;font-size:18px;font-weight:bold;'>
               Booking Reference: {$reference}
           </div>"
        : '';

    return "
    <html>
    <head><meta charset='UTF-8'></head>
    <body style='margin:0;padding:0;background:#f4f4f4;'>
        <div style='max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#333;background:#ffffff;'>
            <div style='background:#1B2E4A;color:#fff;padding:20px;text-align:center;'>
                <h1 style='margin:0;font-size:22px;'>{$heading}</h1>
            </div>
            {$refBar}
            <div style='padding:20px;background:#f9f9f9;'>
                {$contentHtml}
            </div>
            <div style='padding:15px;text-align:center;font-size:12px;color:#999;'>
                <p style='margin:0 0 4px;'>Indo Smile South Services</p>
                <p style='margin:0;'>+66 82 253 6662 &middot; " . ADMIN_EMAIL . "</p>
            </div>
        </div>
    </body>
    </html>";
}

/**
 * Render a label/value table for email bodies. Values are escaped.
 */
function emailInfoTable(array $rows)
{
    $html = "<table style='width:100%;border-collapse:collapse;'>";
    foreach ($rows as $label => $value) {
        if ($value === null || $value === '') {
            continue;
        }
        $label = htmlspecialchars($label, ENT_QUOTES, 'UTF-8');
        $value = htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
        $html .= "<tr>
            <td style='padding:10px 12px;border-bottom:1px solid #e0e0e0;font-weight:bold;width:40%;color:#1B2E4A;'>{$label}</td>
            <td style='padding:10px 12px;border-bottom:1px solid #e0e0e0;'>{$value}</td>
        </tr>";
    }
    return $html . '</table>';
}

/**
 * Public URL of the customer-facing booking status page.
 */
function bookingStatusUrl($reference)
{
    return SITE_URL . '/booking/' . rawurlencode($reference);
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
