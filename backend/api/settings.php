<?php
/**
 * Settings API Endpoint
 * Handles retrieving and updating system settings
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once 'helpers.php';

// Handle CORS
handleCORS();

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

// Verify admin session
$currentAdminId = verifyAdminSession();

// Initialize database connection
try {
    $database = new Database();
    $db = $database->connect();
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

$method = getRequestMethod();

switch ($method) {
    case 'GET':
        handleGetSettings($db);
        break;

    case 'PUT':
    case 'POST':
        // Only super_admin or admin can update settings
        if (!isset($_SESSION['admin_role']) || ($_SESSION['admin_role'] !== 'admin' && $_SESSION['admin_role'] !== 'super_admin')) {
            sendError('Access denied. Administrator role required.', 403);
        }
        handleUpdateSettings($db, $currentAdminId);
        break;

    default:
        sendError('Method not allowed', 405);
}

/**
 * Get all settings
 */
function handleGetSettings($db) {
    try {
        $query = "SELECT setting_key, setting_value, setting_type, description FROM settings";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $settings = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Provide exact type correctly stringified for JS
            $settings[] = $row;
        }
        
        sendResponse($settings, 200);
    } catch (PDOException $e) {
        sendError('Failed to fetch settings: ' . $e->getMessage(), 500);
    }
}

/**
 * Update multiple settings
 */
function handleUpdateSettings($db, $adminId) {
    $input = getJSONInput();

    if (!$input || !is_array($input)) {
        sendError('Invalid JSON input array. Ensure you are sending array of setting objects.', 400);
    }

    // Flipping Stripe between sandbox and live is restricted to the 'admin' role
    // (the highest role in this system; staff cannot change it).
    $canManagePayments = isset($_SESSION['admin_role']) && $_SESSION['admin_role'] === 'admin';

    try {
        $db->beginTransaction();

        $query = "UPDATE settings SET setting_value = :setting_value, updated_by = :admin_id WHERE setting_key = :setting_key";
        $stmt = $db->prepare($query);

        $updatedCount = 0;
        foreach ($input as $setting) {
            if (!isset($setting['setting_key']) || !array_key_exists('setting_value', $setting)) {
                continue;
            }
            $key = $setting['setting_key'];
            $value = $setting['setting_value'];

            if ($key === 'payment_mode') {
                // Staff clients still post this key back unchanged on every save —
                // ignore it silently rather than failing their whole request.
                if (!$canManagePayments) {
                    continue;
                }
                if ($value !== 'test' && $value !== 'live') {
                    $db->rollBack();
                    sendError('Invalid payment_mode. Must be "test" or "live".', 400);
                }
                // Refuse to arm live mode until real keys exist, so the toggle can
                // never point checkout at an empty live secret.
                if ($value === 'live' && (!defined('STRIPE_SECRET_KEY_LIVE') || STRIPE_SECRET_KEY_LIVE === '')) {
                    $db->rollBack();
                    sendError('Cannot switch to live: Stripe live keys are not configured on the server.', 409);
                }
            }

            $stmt->bindParam(':setting_value', $value);
            $stmt->bindParam(':admin_id', $adminId);
            $stmt->bindParam(':setting_key', $key);
            if ($stmt->execute() && $stmt->rowCount() > 0) {
                $updatedCount++;
            }
        }

        $db->commit();
        sendResponse(['updated_count' => $updatedCount], 200, 'Settings updated successfully');
        
    } catch (PDOException $e) {
        $db->rollBack();
        sendError('Failed to update settings: ' . $e->getMessage(), 500);
    }
}
