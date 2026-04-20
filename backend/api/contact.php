<?php

/**
 * Contact Messages API Endpoint
 * Handles contact form submissions and admin management
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/ContactMessage.php';
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
    $messageModel = new ContactMessage($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

// Get request method
$method = getRequestMethod();

// Route handling
switch ($method) {
    case 'GET':
        handleGetRequest($messageModel);
        break;

    case 'POST':
        handlePostRequest($messageModel);
        break;

    case 'PUT':
        handlePutRequest($messageModel);
        break;

    case 'DELETE':
        handleDeleteRequest($messageModel);
        break;

    default:
        sendError('Method not allowed', 405);
}

/**
 * Handle GET requests (admin only - list messages)
 */
function handleGetRequest($messageModel)
{
    // Stats endpoint
    if (isset($_GET['stats'])) {
        verifyAdminSession();
        $stats = $messageModel->getStats();
        sendResponse($stats, 200);
    }

    // Single message by ID
    if (isset($_GET['id'])) {
        verifyAdminSession();
        $message = $messageModel->getById($_GET['id']);
        if ($message) {
            // Auto-mark as read when viewed
            if ($message['status'] === 'unread') {
                $messageModel->markAsRead($_GET['id']);
                $message['status'] = 'read';
            }
            sendResponse($message, 200);
        } else {
            sendError('Message not found', 404);
        }
    }

    // List all messages (admin only)
    verifyAdminSession();

    $filters = [
        'status' => $_GET['status'] ?? null,
        'search' => $_GET['search'] ?? null,
        'sort_by' => $_GET['sort_by'] ?? 'created_at',
        'sort_order' => $_GET['sort_order'] ?? 'DESC'
    ];

    // Get pagination params
    $pagination = getPaginationParams();
    $filters['limit'] = $pagination['limit'];
    $filters['offset'] = $pagination['offset'];

    // Get messages and total count
    $messages = $messageModel->getAll($filters);
    $total = $messageModel->getCount($filters);

    // Build paginated response
    $response = buildPaginationResponse($messages, $total, $pagination['page'], $pagination['limit']);

    sendResponse($response, 200);
}

/**
 * Handle POST requests (public - submit contact form)
 */
function handlePostRequest($messageModel)
{
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    // Validate required fields
    $requiredFields = ['name', 'email', 'subject', 'message'];
    $missing = validateRequired($input, $requiredFields);

    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email address', 400);
    }

    // Basic spam protection: check message length
    if (strlen($input['message']) < 10) {
        sendError('Message is too short (minimum 10 characters)', 400);
    }

    // Get client info
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    // Prepare data
    $data = [
        'name' => sanitizeInput($input['name']),
        'email' => sanitizeInput($input['email']),
        'subject' => sanitizeInput($input['subject']),
        'message' => sanitizeInput($input['message']),
        'ip_address' => $ipAddress,
        'user_agent' => $userAgent
    ];

    // Create message
    try {
        $messageId = $messageModel->create($data);

        if ($messageId) {
            // Send email notification to admin
            sendContactNotificationEmail($data);

            sendResponse([
                'id' => $messageId,
                'message' => 'Your message has been sent successfully. We will get back to you shortly.'
            ], 201, 'Message sent successfully');
        } else {
            sendError('Failed to send message', 500);
        }
    } catch (Exception $e) {
        sendError('Error sending message: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle PUT requests (admin only - update status/notes)
 */
function handlePutRequest($messageModel)
{
    $adminId = verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Message ID is required', 400);
    }

    $messageId = (int)$_GET['id'];

    $existingMessage = $messageModel->getById($messageId);
    if (!$existingMessage) {
        sendError('Message not found', 404);
    }

    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    try {
        // Update status
        if (isset($input['status'])) {
            $allowedStatuses = ['unread', 'read', 'replied', 'archived'];
            if (!in_array($input['status'], $allowedStatuses)) {
                sendError('Invalid status', 400);
            }
            $messageModel->updateStatus($messageId, $input['status'], $adminId);
        }

        // Update admin notes
        if (isset($input['admin_notes'])) {
            $messageModel->updateNotes($messageId, sanitizeInput($input['admin_notes']));
        }

        $message = $messageModel->getById($messageId);
        sendResponse($message, 200, 'Message updated successfully');
    } catch (Exception $e) {
        sendError('Error updating message: ' . $e->getMessage(), 500);
    }
}

/**
 * Handle DELETE requests (admin only)
 */
function handleDeleteRequest($messageModel)
{
    verifyAdminSession();

    if (!isset($_GET['id'])) {
        sendError('Message ID is required', 400);
    }

    $messageId = (int)$_GET['id'];

    $existingMessage = $messageModel->getById($messageId);
    if (!$existingMessage) {
        sendError('Message not found', 404);
    }

    try {
        $result = $messageModel->delete($messageId);
        if ($result) {
            sendResponse(null, 200, 'Message deleted successfully');
        } else {
            sendError('Failed to delete message', 500);
        }
    } catch (Exception $e) {
        sendError('Error deleting message: ' . $e->getMessage(), 500);
    }
}

/**
 * Send email notification to admin when new contact message is received
 */
function sendContactNotificationEmail($data)
{
    $to = 'info@indosmilesouthservices.com';
    $rawSubject = 'New Contact Message: ' . $data['subject'] . ' - from ' . $data['name'];
    $subject = '=?UTF-8?B?' . base64_encode($rawSubject) . '?=';

    $body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #1B2E4A; color: #fff; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .info-table { width: 100%; border-collapse: collapse; }
            .info-table td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; }
            .info-table td:first-child { font-weight: bold; width: 30%; color: #1B2E4A; }
            .message-box { background: #fff; padding: 16px; border-radius: 8px; border-left: 4px solid #FFC72C; margin-top: 15px; }
            .footer { padding: 15px; text-align: center; font-size: 12px; color: #999; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>New Contact Message</h1>
            </div>
            <div class='content'>
                <h3 style='color: #1B2E4A;'>Sender Information</h3>
                <table class='info-table'>
                    <tr><td>Name</td><td>{$data['name']}</td></tr>
                    <tr><td>Email</td><td><a href='mailto:{$data['email']}'>{$data['email']}</a></td></tr>
                    <tr><td>Subject</td><td>{$data['subject']}</td></tr>
                </table>

                <h3 style='color: #1B2E4A; margin-top: 20px;'>Message</h3>
                <div class='message-box'>
                    " . nl2br($data['message']) . "
                </div>
            </div>
            <div class='footer'>
                <p>This is an automated notification from Indo Smile South Services website.</p>
                <p>Log in to the <a href='https://indosmilesouthservices.com/backend/admin/'>Admin Panel</a> to manage this message.</p>
            </div>
        </div>
    </body>
    </html>";

    $replyName = '=?UTF-8?B?' . base64_encode($data['name']) . '?=';
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Indo Smile Website <noreply@indosmilesouthservices.com>\r\n";
    $headers .= "Reply-To: {$replyName} <{$data['email']}>\r\n";

    @mail($to, $subject, $body, $headers, '-f info@indosmilesouthservices.com');
}
