<?php
/**
 * Agent Authentication API (public — used by the Agent Portal on the website)
 *
 * Routes:
 *   POST agent_auth.php/login     { email, password }
 *   POST agent_auth.php/logout
 *   GET  agent_auth.php/me
 *   PUT  agent_auth.php/profile   { contact_name, phone, whatsapp, line_id, wechat_id, country, address }
 *   POST agent_auth.php/password  { current_password, new_password }
 *
 * Uses its own session name so an agent session never collides with an admin session.
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Agent.php';
require_once 'helpers.php';

if (!defined('AGENT_SESSION_NAME')) {
    define('AGENT_SESSION_NAME', 'INDOSMILE_AGENT_SESSION');
}

handleCORS();

if (session_status() === PHP_SESSION_NONE) {
    session_name(AGENT_SESSION_NAME);
    session_start();
}

try {
    $database = new Database();
    $db = $database->connect();
    $agentModel = new Agent($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

$method = getRequestMethod();

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = array_values(array_filter(explode('/', trim($path, '/'))));
$action = end($pathParts);

switch ($action) {
    case 'login':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        handleAgentLogin($agentModel);
        break;

    case 'logout':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        handleAgentLogout();
        break;

    case 'me':
        if ($method !== 'GET') sendError('Method not allowed', 405);
        handleGetCurrentAgent($agentModel);
        break;

    case 'profile':
        if ($method !== 'PUT') sendError('Method not allowed', 405);
        handleUpdateProfile($agentModel);
        break;

    case 'password':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        handleChangePassword($agentModel);
        break;

    default:
        sendError('Invalid endpoint', 404);
}

/**
 * The agent behind the current session, or a 401/403. Every authenticated route starts
 * here, so an account we deactivate loses access on its next request, not its next login.
 */
function requireAgent($agentModel) {
    if (!isset($_SESSION['agent_id']) || !isset($_SESSION['agent_logged_in'])) {
        sendError('Not authenticated', 401);
    }

    $agent = $agentModel->getById($_SESSION['agent_id']);

    if (!$agent) {
        sendError('Agent not found', 404);
    }

    if ($agent['status'] !== 'active') {
        sendError('This account is not active. Please contact us.', 403);
    }

    return $agent;
}

function handleAgentLogin($agentModel) {
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $missing = validateRequired($input, ['email', 'password']);
    if (!empty($missing)) {
        sendError('Email and password are required', 400);
    }

    $email = sanitizeInput($input['email']);
    $password = $input['password'];

    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : null;
    $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : null;

    $agent = $agentModel->login($email, $password, $ip, $userAgent);

    if ($agent === 'inactive') {
        sendError('This account is not active. Please contact us.', 403);
    }

    if (!$agent) {
        sendError('Invalid email or password', 401);
    }

    $_SESSION['agent_id'] = $agent['id'];
    $_SESSION['agent_email'] = $agent['email'];
    $_SESSION['agent_logged_in'] = true;
    $_SESSION['agent_login_time'] = time();

    session_regenerate_id(true);

    sendResponse(['agent' => $agent], 200, 'Login successful');
}

function handleAgentLogout() {
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }

    session_destroy();

    sendResponse(['message' => 'Logged out successfully'], 200);
}

function handleGetCurrentAgent($agentModel) {
    sendResponse(requireAgent($agentModel), 200);
}

function handleUpdateProfile($agentModel) {
    $agent = requireAgent($agentModel);

    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $missing = validateRequired($input, ['contact_name']);
    if (!empty($missing)) {
        sendError('Contact person is required', 400);
    }

    // Only the self-service fields are read. Anything else in the payload
    // (agent_code, email, status, notes) is ignored rather than trusted.
    $data = [];
    foreach (['contact_name', 'phone', 'whatsapp', 'line_id', 'wechat_id', 'country', 'address'] as $field) {
        $data[$field] = isset($input[$field]) ? sanitizeInput($input[$field]) : null;
    }

    if (!$agentModel->updateProfile($agent['id'], $data)) {
        sendError('Failed to update your details', 500);
    }

    sendResponse($agentModel->getById($agent['id']), 200, 'Your details have been updated');
}

function handleChangePassword($agentModel) {
    $agent = requireAgent($agentModel);

    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $missing = validateRequired($input, ['current_password', 'new_password']);
    if (!empty($missing)) {
        sendError('Current and new password are required', 400);
    }

    $newPassword = $input['new_password'];

    if (strlen($newPassword) < 8) {
        sendError('New password must be at least 8 characters', 400);
    }

    if (!$agentModel->verifyPassword($agent['id'], $input['current_password'])) {
        sendError('Your current password is incorrect', 401);
    }

    if (!$agentModel->changeOwnPassword($agent['id'], $newPassword)) {
        sendError('Failed to change your password', 500);
    }

    sendResponse(['id' => $agent['id']], 200, 'Password changed successfully');
}
