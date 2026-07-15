<?php
/**
 * Agents API Endpoint (admin-only)
 * Manage B2B partner agent accounts, generate their credentials, read login history.
 *
 * Routes:
 *   GET    agents.php                        list all agents
 *   GET    agents.php/{id}                   single agent
 *   GET    agents.php/{id}/logs              login history for an agent
 *   GET    agents.php/{id}/rates             every active tour + this agent's contract rate
 *   POST   agents.php                        create agent (code + password auto-generated)
 *   POST   agents.php/{id}/generate-password issue a new password
 *   POST   agents.php/{id}/send-credentials  email the agent the password shown on screen
 *   PUT    agents.php/{id}                   update agent details
 *   PUT    agents.php/{id}/rates             apply one markup pair to a set of tours
 *   DELETE agents.php/{id}                   delete agent
 *   DELETE agents.php/{id}/rates             take a set of tours off the agent
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Agent.php';
require_once '../models/AgentTourRate.php';
require_once 'helpers.php';
require_once 'agent_emails.php';

handleCORS();

if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

verifyAdminSession();

if (!isset($_SESSION['admin_role']) || $_SESSION['admin_role'] !== 'admin') {
    sendError('Access denied. Admin role required.', 403);
}

try {
    $database = new Database();
    $db = $database->connect();
    $agentModel = new Agent($db);
    $rateModel = new AgentTourRate($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

$method = getRequestMethod();

// Parse trailing path segments: agents.php/{id}[/{action}]
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = array_values(array_filter(explode('/', trim($path, '/'))));
$scriptIndex = array_search('agents.php', $pathParts);
$segments = $scriptIndex === false ? [] : array_slice($pathParts, $scriptIndex + 1);

$agentId = isset($segments[0]) && is_numeric($segments[0]) ? intval($segments[0]) : null;
$action = isset($segments[1]) ? $segments[1] : null;

switch ($method) {
    case 'GET':
        if ($agentId && $action === 'logs') {
            handleGetLogs($agentModel, $agentId);
        } elseif ($agentId && $action === 'rates') {
            handleGetRates($agentModel, $rateModel, $agentId);
        } elseif ($agentId) {
            handleGetAgent($agentModel, $agentId);
        } else {
            sendResponse($agentModel->getAll(), 200);
        }
        break;

    case 'POST':
        if ($agentId && $action === 'generate-password') {
            handleGeneratePassword($agentModel, $agentId);
        } elseif ($agentId && $action === 'send-credentials') {
            handleSendCredentials($agentModel, $agentId);
        } elseif (!$agentId) {
            handleCreateAgent($agentModel);
        } else {
            sendError('Invalid endpoint', 404);
        }
        break;

    case 'PUT':
        if (!$agentId) {
            sendError('Agent ID is required', 400);
        }
        if ($action === 'rates') {
            handleSetRates($agentModel, $rateModel, $agentId);
        } else {
            handleUpdateAgent($agentModel, $agentId);
        }
        break;

    case 'DELETE':
        if (!$agentId) {
            sendError('Agent ID is required', 400);
        }
        if ($action === 'rates') {
            handleRemoveRates($agentModel, $rateModel, $agentId);
        } else {
            handleDeleteAgent($agentModel, $agentId);
        }
        break;

    default:
        sendError('Method not allowed', 405);
}

/**
 * Resolve the agent code: use the admin's own if they typed one, otherwise derive
 * it from the company name. Rejects duplicates either way.
 */
function resolveAgentCode($agentModel, $input, $companyName, $excludeId = null) {
    $raw = isset($input['agent_code']) ? trim((string)$input['agent_code']) : '';

    if ($raw === '') {
        return $agentModel->generateAgentCodeFromName($companyName);
    }

    $code = Agent::normalizeCode($raw);

    if ($code === '') {
        sendError('Agent code must contain letters or numbers', 400);
    }

    if ($agentModel->codeExists($code, $excludeId)) {
        sendError('Agent code "' . $code . '" is already taken', 400);
    }

    return $code;
}

/**
 * Optional contact/profile fields shared by create and update.
 */
function collectAgentFields($input) {
    $optional = ['contact_name', 'phone', 'whatsapp', 'line_id', 'wechat_id',
                 'country', 'address', 'tax_id', 'license_no', 'notes'];

    $data = [];
    foreach ($optional as $field) {
        $value = isset($input[$field]) ? sanitizeInput($input[$field]) : null;
        $data[$field] = ($value === '') ? null : $value;
    }

    $allowedStatus = ['active', 'inactive', 'suspended'];
    $status = isset($input['status']) ? $input['status'] : 'active';
    if (!in_array($status, $allowedStatus)) {
        sendError('Invalid status. Allowed: ' . implode(', ', $allowedStatus), 400);
    }
    $data['status'] = $status;

    return $data;
}

function handleGetAgent($agentModel, $id) {
    $agent = $agentModel->getById($id);

    if (!$agent) {
        sendError('Agent not found', 404);
    }

    $agent['login_logs'] = $agentModel->getLoginLogs($id, 20);
    sendResponse($agent, 200);
}

function handleGetLogs($agentModel, $id) {
    if (!$agentModel->getById($id)) {
        sendError('Agent not found', 404);
    }

    $limit = isset($_GET['limit']) ? min(intval($_GET['limit']), 100) : 20;
    sendResponse($agentModel->getLoginLogs($id, $limit), 200);
}

function handleCreateAgent($agentModel) {
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $missing = validateRequired($input, ['company_name', 'email']);
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    $email = sanitizeInput($input['email']);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format', 400);
    }

    if ($agentModel->emailExists($email)) {
        sendError('An agent with this email already exists', 400);
    }

    $data = collectAgentFields($input);
    $data['company_name'] = sanitizeInput($input['company_name']);
    $data['email'] = $email;
    $data['agent_code'] = resolveAgentCode($agentModel, $input, $data['company_name']);

    // The plain password is returned exactly once so the admin can pass it to the agent.
    $plainPassword = Agent::generatePassword();
    $data['password'] = $plainPassword;

    $newId = $agentModel->create($data);

    if (!$newId) {
        sendError('Failed to create agent', 500);
    }

    $agent = $agentModel->getById($newId);
    $agent['generated_password'] = $plainPassword;

    sendResponse($agent, 201, 'Agent created successfully');
}

function handleUpdateAgent($agentModel, $id) {
    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $existing = $agentModel->getById($id);
    if (!$existing) {
        sendError('Agent not found', 404);
    }

    $missing = validateRequired($input, ['company_name', 'email']);
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    $email = sanitizeInput($input['email']);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format', 400);
    }

    if ($agentModel->emailExists($email, $id)) {
        sendError('An agent with this email already exists', 400);
    }

    $data = collectAgentFields($input);
    $data['company_name'] = sanitizeInput($input['company_name']);
    $data['email'] = $email;

    // Blank code on update means "leave it as it is" — never silently re-derive it.
    $rawCode = isset($input['agent_code']) ? trim((string)$input['agent_code']) : '';
    if ($rawCode === '') {
        $data['agent_code'] = $existing['agent_code'];
    } else {
        $data['agent_code'] = resolveAgentCode($agentModel, $input, $data['company_name'], $id);
    }

    if (!$agentModel->update($id, $data)) {
        sendError('Failed to update agent', 500);
    }

    sendResponse($agentModel->getById($id), 200, 'Agent updated successfully');
}

function handleGeneratePassword($agentModel, $id) {
    if (!$agentModel->getById($id)) {
        sendError('Agent not found', 404);
    }

    $plainPassword = Agent::generatePassword();

    if (!$agentModel->setPassword($id, $plainPassword)) {
        sendError('Failed to generate password', 500);
    }

    sendResponse([
        'id' => $id,
        'generated_password' => $plainPassword
    ], 200, 'New password generated');
}

/**
 * Email the agent their login details.
 *
 * The admin sends the password back to us because we never kept the plaintext — it only
 * exists in the dialog shown right after create or generate-password. We check it against
 * the stored hash first, so this endpoint can only ever mail out the agent's real current
 * password, not arbitrary text an admin (or anyone with their session) typed in.
 *
 * Nothing is sent automatically on create: an account is often set up days before the
 * partner should be let in.
 */
function handleSendCredentials($agentModel, $id) {
    $agent = $agentModel->getById($id);

    if (!$agent) {
        sendError('Agent not found', 404);
    }

    $input = getJSONInput();

    if (!$input || empty($input['password'])) {
        sendError('The password is required. Generate a new one first if it is no longer on screen.', 400);
    }

    if (!$agentModel->verifyPassword($id, $input['password'])) {
        sendError('That is no longer this agent\'s password. Generate a new one and send that instead.', 400);
    }

    if (!sendAgentCredentialsEmail($agent, $input['password'])) {
        sendError('Could not send the email. Check the mail log and try again.', 500);
    }

    $agentModel->markCredentialsSent($id);

    sendResponse($agentModel->getById($id), 200, 'Login details sent to ' . $agent['email']);
}

function handleDeleteAgent($agentModel, $id) {
    if (!$agentModel->getById($id)) {
        sendError('Agent not found', 404);
    }

    if (!$agentModel->delete($id)) {
        sendError('Failed to delete agent', 500);
    }

    sendResponse(['id' => $id], 200, 'Agent deleted successfully');
}

// =====================================================================
// Contract rates
// =====================================================================

/**
 * The tour ids from a rates payload, rejecting an empty or malformed list.
 */
function requireTourIds($input) {
    if (empty($input['tour_ids']) || !is_array($input['tour_ids'])) {
        sendError('tour_ids must be a non-empty array', 400);
    }

    $tourIds = array_values(array_filter(array_map('intval', $input['tour_ids'])));

    if (empty($tourIds)) {
        sendError('tour_ids must contain at least one valid tour id', 400);
    }

    return $tourIds;
}

/**
 * A markup is money added on top of our net price, so it may not be negative — that
 * would quietly sell the tour to the agent below what it costs us.
 */
function requireMarkup($input, $field) {
    $value = isset($input[$field]) ? $input[$field] : 0;

    if (!is_numeric($value)) {
        sendError(str_replace('_', ' ', $field) . ' must be a number', 400);
    }

    $value = round((float)$value, 2);

    if ($value < 0) {
        sendError(str_replace('_', ' ', $field) . ' cannot be negative', 400);
    }

    return $value;
}

function handleGetRates($agentModel, $rateModel, $id) {
    if (!$agentModel->getById($id)) {
        sendError('Agent not found', 404);
    }

    sendResponse($rateModel->adminList($id), 200);
}

function handleSetRates($agentModel, $rateModel, $id) {
    if (!$agentModel->getById($id)) {
        sendError('Agent not found', 404);
    }

    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $tourIds = requireTourIds($input);
    $adultMarkup = requireMarkup($input, 'adult_markup');
    $childMarkup = requireMarkup($input, 'child_markup');

    try {
        $count = $rateModel->setBulk($id, $tourIds, $adultMarkup, $childMarkup);
    } catch (PDOException $e) {
        sendError('Failed to save rates', 500);
    }

    sendResponse($rateModel->adminList($id), 200, $count . ' tour rate(s) saved');
}

function handleRemoveRates($agentModel, $rateModel, $id) {
    if (!$agentModel->getById($id)) {
        sendError('Agent not found', 404);
    }

    $input = getJSONInput();

    if (!$input) {
        sendError('Invalid JSON input', 400);
    }

    $tourIds = requireTourIds($input);
    $count = $rateModel->removeBulk($id, $tourIds);

    sendResponse($rateModel->adminList($id), 200, $count . ' tour(s) removed from this agent');
}
