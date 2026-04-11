<?php
/**
 * Blog Categories API Endpoint
 * Handles all blog category-related API requests
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/BlogCategory.php';
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
    $categoryModel = new BlogCategory($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

// Get request method
$method = getRequestMethod();

// Route handling
switch ($method) {
    case 'GET':
        handleGetRequest($categoryModel);
        break;
    case 'POST':
        handlePostRequest($categoryModel);
        break;
    case 'PUT':
        handlePutRequest($categoryModel);
        break;
    case 'DELETE':
        handleDeleteRequest($categoryModel);
        break;
    default:
        sendError('Method not allowed', 405);
}

/**
 * Handle GET requests
 */
function handleGetRequest($categoryModel) {
    // Get single category
    if (isset($_GET['id'])) {
        $category = $categoryModel->getById((int)$_GET['id']);
        if ($category) {
            sendResponse($category, 200);
        } else {
            sendError('Category not found', 404);
        }
    }

    if (isset($_GET['slug'])) {
        $category = $categoryModel->getBySlug($_GET['slug']);
        if ($category) {
            sendResponse($category, 200);
        } else {
            sendError('Category not found', 404);
        }
    }

    // Get all categories
    $activeOnly = isset($_GET['active']) && $_GET['active'] === '1';
    $categories = $categoryModel->getAll(true, $activeOnly);
    sendResponse($categories, 200);
}

/**
 * Handle POST requests
 */
function handlePostRequest($categoryModel) {
    $adminId = verifyAdminSession();
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $requiredFields = ['name'];
    $missing = validateRequired($input, $requiredFields);
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    $data = [
        'name' => sanitizeInput($input['name']),
        'slug' => isset($input['slug']) ? sanitizeInput($input['slug']) : generateSlug($input['name']),
        'description' => isset($input['description']) ? sanitizeInput($input['description']) : null,
        'color' => isset($input['color']) ? sanitizeInput($input['color']) : '#010048',
        'sort_order' => isset($input['sort_order']) ? (int)$input['sort_order'] : 0,
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : 1
    ];

    try {
        $categoryId = $categoryModel->create($data);
        if ($categoryId) {
            $category = $categoryModel->getById($categoryId);
            sendResponse($category, 201, 'Category created successfully');
        } else {
            sendError('Failed to create category', 500);
        }
    } catch (Exception $e) {
        sendError('Error creating category: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle PUT requests
 */
function handlePutRequest($categoryModel) {
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Category ID is required', 400);
    }

    $categoryId = (int)$_GET['id'];
    $existing = $categoryModel->getById($categoryId);
    if (!$existing) {
        sendError('Category not found', 404);
    }

    $input = getJSONInput();
    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $data = [
        'name' => isset($input['name']) ? sanitizeInput($input['name']) : $existing['name'],
        'slug' => isset($input['slug']) ? sanitizeInput($input['slug']) : $existing['slug'],
        'description' => isset($input['description']) ? sanitizeInput($input['description']) : $existing['description'],
        'color' => isset($input['color']) ? sanitizeInput($input['color']) : $existing['color'],
        'sort_order' => isset($input['sort_order']) ? (int)$input['sort_order'] : $existing['sort_order'],
        'is_active' => isset($input['is_active']) ? (int)$input['is_active'] : $existing['is_active']
    ];

    try {
        $result = $categoryModel->update($categoryId, $data);
        if ($result) {
            $category = $categoryModel->getById($categoryId);
            sendResponse($category, 200, 'Category updated successfully');
        } else {
            sendError('Failed to update category', 500);
        }
    } catch (Exception $e) {
        sendError('Error updating category: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle DELETE requests
 */
function handleDeleteRequest($categoryModel) {
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Category ID is required', 400);
    }

    $categoryId = (int)$_GET['id'];
    $category = $categoryModel->getById($categoryId);
    if (!$category) {
        sendError('Category not found', 404);
    }

    try {
        $result = $categoryModel->delete($categoryId);
        if ($result) {
            sendResponse(['id' => $categoryId], 200, 'Category deleted successfully');
        } else {
            sendError('Failed to delete category', 500);
        }
    } catch (Exception $e) {
        sendError('Error deleting category: ' . $e->getMessage(), 500);
    }
}
