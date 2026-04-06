<?php
/**
 * Users API Endpoint
 * Handles CRUD operations for admin users (User Management)
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Admin.php';
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

// Only admin role can access user management
if (!isset($_SESSION['admin_role']) || $_SESSION['admin_role'] !== 'admin') {
    sendError('Access denied. Admin role required.', 403);
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

// Parse ID from URL if present (e.g., users.php/123)
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
$lastPart = end($pathParts);
$userId = is_numeric($lastPart) ? intval($lastPart) : null;

// Route handling
switch ($method) {
    case 'GET':
        if ($userId) {
            handleGetUser($adminModel, $userId);
        } else {
            handleGetAllUsers($adminModel);
        }
        break;

    case 'POST':
        handleCreateUser($adminModel, $currentAdminId);
        break;

    case 'PUT':
        if ($userId) {
            handleUpdateUser($adminModel, $userId, $currentAdminId);
        } else {
            sendError('User ID is required', 400);
        }
        break;

    case 'DELETE':
        if ($userId) {
            handleDeleteUser($adminModel, $userId, $currentAdminId);
        } else {
            sendError('User ID is required', 400);
        }
        break;

    default:
        sendError('Method not allowed', 405);
}

/**
 * Get all users
 */
function handleGetAllUsers($adminModel) {
    $users = $adminModel->getAll();
    sendResponse($users, 200);
}

/**
 * Get single user
 */
function handleGetUser($adminModel, $id) {
    $user = $adminModel->getById($id);
    if ($user) {
        sendResponse($user, 200);
    } else {
        sendError('User not found', 404);
    }
}

/**
 * Create new user
 */
function handleCreateUser($adminModel, $currentAdminId) {
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Validate required fields
    $requiredFields = ['username', 'email', 'password', 'full_name', 'role'];
    $missing = validateRequired($input, $requiredFields);

    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format', 400);
    }

    // Check username uniqueness
    if ($adminModel->usernameExists(sanitizeInput($input['username']))) {
        sendError('Username already exists', 400);
    }

    // Check email uniqueness
    if ($adminModel->emailExists(sanitizeInput($input['email']))) {
        sendError('Email already exists', 400);
    }

    // Validate role
    $allowedRoles = ['admin', 'staff'];
    if (!in_array($input['role'], $allowedRoles)) {
        sendError('Invalid role. Allowed: ' . implode(', ', $allowedRoles), 400);
    }

    // Prepare data
    $data = [
        'username' => sanitizeInput($input['username']),
        'email' => sanitizeInput($input['email']),
        'password' => $input['password'],
        'full_name' => sanitizeInput($input['full_name']),
        'role' => $input['role'],
        'status' => isset($input['status']) ? $input['status'] : 'active'
    ];

    $newId = $adminModel->create($data);

    if ($newId) {
        $user = $adminModel->getById($newId);
        sendResponse($user, 201, 'User created successfully');
    } else {
        sendError('Failed to create user', 500);
    }
}

/**
 * Update user
 */
function handleUpdateUser($adminModel, $id, $currentAdminId) {
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Check user exists
    $existingUser = $adminModel->getById($id);
    if (!$existingUser) {
        sendError('User not found', 404);
    }

    // Validate required fields (password optional on update)
    $requiredFields = ['username', 'email', 'full_name', 'role'];
    $missing = validateRequired($input, $requiredFields);

    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format', 400);
    }

    // Check username uniqueness (exclude current user)
    if ($adminModel->usernameExists(sanitizeInput($input['username']), $id)) {
        sendError('Username already exists', 400);
    }

    // Check email uniqueness (exclude current user)
    if ($adminModel->emailExists(sanitizeInput($input['email']), $id)) {
        sendError('Email already exists', 400);
    }

    // Validate role
    $allowedRoles = ['admin', 'staff'];
    if (!in_array($input['role'], $allowedRoles)) {
        sendError('Invalid role. Allowed: ' . implode(', ', $allowedRoles), 400);
    }

    // Prepare data
    $data = [
        'username' => sanitizeInput($input['username']),
        'email' => sanitizeInput($input['email']),
        'full_name' => sanitizeInput($input['full_name']),
        'role' => $input['role'],
        'status' => isset($input['status']) ? $input['status'] : 'active'
    ];

    // Include password only if provided
    if (isset($input['password']) && !empty($input['password'])) {
        $data['password'] = $input['password'];
    }

    $result = $adminModel->update($id, $data);

    if ($result) {
        $user = $adminModel->getById($id);
        sendResponse($user, 200, 'User updated successfully');
    } else {
        sendError('Failed to update user', 500);
    }
}

/**
 * Delete user
 */
function handleDeleteUser($adminModel, $id, $currentAdminId) {
    // Prevent self-deletion
    if ($id == $currentAdminId) {
        sendError('You cannot delete your own account', 400);
    }

    // Check user exists
    $existingUser = $adminModel->getById($id);
    if (!$existingUser) {
        sendError('User not found', 404);
    }

    $result = $adminModel->delete($id);

    if ($result) {
        sendResponse(['id' => $id], 200, 'User deleted successfully');
    } else {
        sendError('Failed to delete user', 500);
    }
}
