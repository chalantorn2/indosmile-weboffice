<?php
/**
 * Blog Posts API Endpoint
 * Handles all blog post-related API requests
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/BlogPost.php';
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
    $postModel = new BlogPost($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

// Get request method
$method = getRequestMethod();

// Route handling
switch ($method) {
    case 'GET':
        handleGetRequest($postModel);
        break;
    case 'POST':
        handlePostRequest($postModel);
        break;
    case 'PUT':
        handlePutRequest($postModel);
        break;
    case 'DELETE':
        handleDeleteRequest($postModel);
        break;
    default:
        sendError('Method not allowed', 405);
}

/**
 * Handle GET requests
 */
function handleGetRequest($postModel) {
    // Get single post by ID
    if (isset($_GET['id'])) {
        $post = $postModel->getById((int)$_GET['id']);
        if ($post) {
            $post['tags'] = json_decode($post['tags'], true);
            $post['gallery_images'] = json_decode($post['gallery_images'], true);
            sendResponse($post, 200);
        } else {
            sendError('Post not found', 404);
        }
    }

    // Get single post by slug (public — increments views)
    if (isset($_GET['slug'])) {
        $post = $postModel->getBySlug($_GET['slug']);
        if ($post) {
            $post['tags'] = json_decode($post['tags'], true);
            $post['gallery_images'] = json_decode($post['gallery_images'], true);

            // Get related posts
            $tags = is_array($post['tags']) ? $post['tags'] : [];
            $related = $postModel->getRelated($post['id'], $post['category_id'], $tags, 3);
            foreach ($related as &$r) {
                $r['tags'] = json_decode($r['tags'], true);
            }
            $post['related_posts'] = $related;

            sendResponse($post, 200);
        } else {
            sendError('Post not found', 404);
        }
    }

    // Get related posts for a specific post
    if (isset($_GET['related_to'])) {
        $mainPost = $postModel->getById((int)$_GET['related_to']);
        if ($mainPost) {
            $tags = json_decode($mainPost['tags'], true);
            $tags = is_array($tags) ? $tags : [];
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 3;
            $related = $postModel->getRelated($mainPost['id'], $mainPost['category_id'], $tags, $limit);
            foreach ($related as &$r) {
                $r['tags'] = json_decode($r['tags'], true);
            }
            sendResponse($related, 200);
        } else {
            sendError('Post not found', 404);
        }
    }

    // Get all posts with filters
    $filters = [
        'status' => $_GET['status'] ?? null,
        'category_id' => $_GET['category_id'] ?? null,
        'category_slug' => $_GET['category'] ?? null,
        'is_featured' => isset($_GET['featured']) ? (int)$_GET['featured'] : null,
        'tag' => $_GET['tag'] ?? null,
        'search' => $_GET['search'] ?? null,
        'exclude_id' => $_GET['exclude'] ?? null,
        'sort_by' => $_GET['sort_by'] ?? 'published_at',
        'sort_order' => $_GET['sort_order'] ?? 'DESC'
    ];

    // For public requests, only show published posts unless admin
    if (!isset($_GET['all']) || $_GET['all'] !== '1') {
        // Check if admin session exists
        $isAdmin = isset($_SESSION['admin_id']) && !empty($_SESSION['admin_id']);
        if (!$isAdmin && empty($filters['status'])) {
            $filters['status'] = 'published';
        }
    }

    // Get pagination params
    $pagination = getPaginationParams();
    $filters['limit'] = $pagination['limit'];
    $filters['offset'] = $pagination['offset'];

    // Get posts and total count
    $posts = $postModel->getAll($filters);
    $total = $postModel->getCount($filters);

    // Decode JSON fields
    foreach ($posts as &$post) {
        $post['tags'] = json_decode($post['tags'], true);
        $post['gallery_images'] = json_decode($post['gallery_images'], true);
    }

    $response = buildPaginationResponse($posts, $total, $pagination['page'], $pagination['limit']);
    sendResponse($response, 200);
}

/**
 * Handle POST requests
 */
function handlePostRequest($postModel) {
    $adminId = verifyAdminSession();
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $requiredFields = ['title', 'content'];
    $missing = validateRequired($input, $requiredFields);
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    // Auto-set published_at if status is published
    $publishedAt = isset($input['published_at']) ? $input['published_at'] : null;
    if (isset($input['status']) && $input['status'] === 'published' && empty($publishedAt)) {
        $publishedAt = date('Y-m-d H:i:s');
    }

    $data = [
        'title' => sanitizeInput($input['title']),
        'slug' => isset($input['slug']) && !empty($input['slug']) ? sanitizeInput($input['slug']) : generateSlug($input['title']),
        'category_id' => isset($input['category_id']) && !empty($input['category_id']) ? (int)$input['category_id'] : null,
        'excerpt' => isset($input['excerpt']) ? sanitizeInput($input['excerpt']) : null,
        'content' => $input['content'],  // Allow HTML content
        'cover_image' => isset($input['cover_image']) ? $input['cover_image'] : null,
        'gallery_images' => isset($input['gallery_images']) ? json_encode($input['gallery_images']) : null,
        'tags' => isset($input['tags']) ? json_encode($input['tags']) : null,
        'author_id' => $adminId,
        'author_name' => isset($input['author_name']) ? sanitizeInput($input['author_name']) : null,
        'status' => isset($input['status']) ? sanitizeInput($input['status']) : 'draft',
        'is_featured' => isset($input['is_featured']) ? (int)$input['is_featured'] : 0,
        'reading_time' => 0,
        'meta_title' => isset($input['meta_title']) ? sanitizeInput($input['meta_title']) : null,
        'meta_description' => isset($input['meta_description']) ? sanitizeInput($input['meta_description']) : null,
        'published_at' => $publishedAt
    ];

    try {
        $postId = $postModel->create($data);
        if ($postId) {
            $post = $postModel->getById($postId);
            $post['tags'] = json_decode($post['tags'], true);
            $post['gallery_images'] = json_decode($post['gallery_images'], true);
            sendResponse($post, 201, 'Blog post created successfully');
        } else {
            sendError('Failed to create blog post', 500);
        }
    } catch (Exception $e) {
        sendError('Error creating blog post: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle PUT requests
 */
function handlePutRequest($postModel) {
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Post ID is required', 400);
    }

    $postId = (int)$_GET['id'];
    $existing = $postModel->getById($postId);
    if (!$existing) {
        sendError('Post not found', 404);
    }

    $input = getJSONInput();
    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Handle published_at: auto-set when publishing for first time
    $publishedAt = isset($input['published_at']) ? $input['published_at'] : $existing['published_at'];
    if (isset($input['status']) && $input['status'] === 'published' && empty($existing['published_at']) && empty($publishedAt)) {
        $publishedAt = date('Y-m-d H:i:s');
    }

    $data = [
        'title' => isset($input['title']) ? sanitizeInput($input['title']) : $existing['title'],
        'slug' => isset($input['slug']) && !empty($input['slug']) ? sanitizeInput($input['slug']) : $existing['slug'],
        'category_id' => isset($input['category_id']) ? ($input['category_id'] ? (int)$input['category_id'] : null) : $existing['category_id'],
        'excerpt' => isset($input['excerpt']) ? sanitizeInput($input['excerpt']) : $existing['excerpt'],
        'content' => isset($input['content']) ? $input['content'] : $existing['content'],
        'cover_image' => isset($input['cover_image']) ? $input['cover_image'] : $existing['cover_image'],
        'gallery_images' => isset($input['gallery_images']) ? json_encode($input['gallery_images']) : $existing['gallery_images'],
        'tags' => isset($input['tags']) ? json_encode($input['tags']) : $existing['tags'],
        'author_name' => isset($input['author_name']) ? sanitizeInput($input['author_name']) : $existing['author_name'],
        'status' => isset($input['status']) ? sanitizeInput($input['status']) : $existing['status'],
        'is_featured' => isset($input['is_featured']) ? (int)$input['is_featured'] : $existing['is_featured'],
        'reading_time' => $existing['reading_time'],
        'meta_title' => isset($input['meta_title']) ? sanitizeInput($input['meta_title']) : $existing['meta_title'],
        'meta_description' => isset($input['meta_description']) ? sanitizeInput($input['meta_description']) : $existing['meta_description'],
        'published_at' => $publishedAt
    ];

    try {
        $result = $postModel->update($postId, $data);
        if ($result) {
            $post = $postModel->getById($postId);
            $post['tags'] = json_decode($post['tags'], true);
            $post['gallery_images'] = json_decode($post['gallery_images'], true);
            sendResponse($post, 200, 'Blog post updated successfully');
        } else {
            sendError('Failed to update blog post', 500);
        }
    } catch (Exception $e) {
        sendError('Error updating blog post: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle DELETE requests
 */
function handleDeleteRequest($postModel) {
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Post ID is required', 400);
    }

    $postId = (int)$_GET['id'];
    $post = $postModel->getById($postId);
    if (!$post) {
        sendError('Post not found', 404);
    }

    try {
        $result = $postModel->delete($postId);
        if ($result) {
            sendResponse(['id' => $postId], 200, 'Blog post deleted successfully');
        } else {
            sendError('Failed to delete blog post', 500);
        }
    } catch (Exception $e) {
        sendError('Error deleting blog post: ' . $e->getMessage(), 500);
    }
}
