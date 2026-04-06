<?php
/**
 * Upload API Endpoint
 * Handles image file uploads for tours
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once 'helpers.php';

// Handle CORS
handleCORS();

// Only POST allowed
if (getRequestMethod() !== 'POST') {
    sendError('Method not allowed', 405);
}

// Verify admin session
verifyAdminSession();

// Check if files were sent
if (empty($_FILES)) {
    sendError('No files uploaded', 400);
}

// Handle single file upload
if (isset($_FILES['image'])) {
    $result = uploadImage($_FILES['image'], 'tours');

    if ($result['success']) {
        sendResponse(['url' => $result['url']], 201, 'Image uploaded successfully');
    } else {
        sendError($result['message'], 400);
    }
}

// Handle multiple file upload
if (isset($_FILES['images'])) {
    $files = $_FILES['images'];
    $uploaded = [];
    $errors = [];

    $fileCount = is_array($files['name']) ? count($files['name']) : 0;

    if ($fileCount === 0) {
        sendError('No files uploaded', 400);
    }

    if ($fileCount > 10) {
        sendError('Maximum 10 files allowed per upload', 400);
    }

    for ($i = 0; $i < $fileCount; $i++) {
        $file = [
            'name' => $files['name'][$i],
            'type' => $files['type'][$i],
            'tmp_name' => $files['tmp_name'][$i],
            'error' => $files['error'][$i],
            'size' => $files['size'][$i]
        ];

        $result = uploadImage($file, 'tours');

        if ($result['success']) {
            $uploaded[] = $result['url'];
        } else {
            $errors[] = $files['name'][$i] . ': ' . $result['message'];
        }
    }

    sendResponse([
        'urls' => $uploaded,
        'uploaded_count' => count($uploaded),
        'error_count' => count($errors),
        'errors' => $errors
    ], count($uploaded) > 0 ? 201 : 400,
       count($uploaded) > 0 ? count($uploaded) . ' image(s) uploaded' : 'All uploads failed');
}

sendError('Invalid upload field name. Use "image" for single or "images" for multiple.', 400);
