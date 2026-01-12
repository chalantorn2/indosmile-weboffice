<?php
/**
 * Authentication API Endpoint
 * Handles login, logout, and session management
 */

header('Content-Type: application/json');
require_once '../../config/config.php';
require_once '../../config/Database.php';
require_once '../../models/Admin.php';
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
    $adminModel = new Admin($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

// Get request method
$method = getRequestMethod();

// Parse request path
$requestUri = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim(parse_url($requestUri, PHP_URL_PATH), '/'));
$action = end($pathParts);

// Route handling
switch ($action) {
    case 'login':
        if ($method === 'POST') {
            handleLogin($adminModel);
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case 'logout':
        if ($method === 'POST') {
            handleLogout();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case 'me':
        if ($method === 'GET') {
            handleGetCurrentUser($adminModel);
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case 'check':
        if ($method === 'GET') {
            handleCheckSession();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    default:
        sendError('Invalid endpoint', 404);
}

/**
 * Handle login
 */
function handleLogin($adminModel) {
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Validate required fields
    $requiredFields = ['username', 'password'];
    $missing = validateRequired($input, $requiredFields);

    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    $username = sanitizeInput($input['username']);
    $password = $input['password']; // Don't sanitize password

    // Attempt login
    $admin = $adminModel->login($username, $password);

    if ($admin) {
        // Set session variables
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        $_SESSION['admin_email'] = $admin['email'];
        $_SESSION['admin_role'] = $admin['role'];
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['login_time'] = time();

        // Regenerate session ID for security
        session_regenerate_id(true);

        sendResponse([
            'user' => $admin,
            'session_id' => session_id()
        ], 200, 'Login successful');
    } else {
        sendError('Invalid username or password', 401);
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    // Destroy session
    $_SESSION = [];

    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    session_destroy();

    sendResponse(['message' => 'Logged out successfully'], 200);
}

/**
 * Get current logged-in user
 */
function handleGetCurrentUser($adminModel) {
    if (!isset($_SESSION['admin_id']) || !isset($_SESSION['admin_logged_in'])) {
        sendError('Not authenticated', 401);
    }

    $admin = $adminModel->getById($_SESSION['admin_id']);

    if ($admin) {
        sendResponse($admin, 200);
    } else {
        sendError('User not found', 404);
    }
}

/**
 * Check if session is valid
 */
function handleCheckSession() {
    if (isset($_SESSION['admin_id']) && isset($_SESSION['admin_logged_in'])) {
        sendResponse([
            'authenticated' => true,
            'admin_id' => $_SESSION['admin_id'],
            'username' => $_SESSION['admin_username'],
            'role' => $_SESSION['admin_role']
        ], 200);
    } else {
        sendResponse([
            'authenticated' => false
        ], 200);
    }
}
