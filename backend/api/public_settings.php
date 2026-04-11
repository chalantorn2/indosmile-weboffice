<?php
/**
 * Public Settings API (Read-only, No Auth)
 * Serves site settings to the public React frontend
 * Only exposes non-sensitive keys
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once 'helpers.php';

// Handle CORS
handleCORS();

// Only public-safe keys
$publicKeys = [
    'site_name',
    'site_email',
    'site_phone',
    'site_address',
    'currency_default',
    'social_facebook',
    'social_instagram',
    'social_line',
    'social_whatsapp'
];

try {
    $database = new Database();
    $db = $database->connect();

    $placeholders = implode(',', array_fill(0, count($publicKeys), '?'));
    $query = "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ($placeholders)";
    $stmt = $db->prepare($query);
    $stmt->execute($publicKeys);

    $result = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $result[$row['setting_key']] = $row['setting_value'];
    }

    sendResponse($result, 200);
} catch (Exception $e) {
    sendError('Failed to load settings', 500);
}
