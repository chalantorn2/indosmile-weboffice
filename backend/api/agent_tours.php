<?php
/**
 * Agent Tours API (agent portal)
 *
 * The tours a logged-in agent has a contract rate on, priced at their net rate.
 *
 * Routes:
 *   GET agent_tours.php            list — optional ?search=
 *   GET agent_tours.php?id={id}    full detail for one tour
 *
 * Access rule: a tour is visible only if agent_tour_rates has a row for
 * (this agent, that tour). No row, no tour — there is no "all tours" view here.
 *
 * Our own selling price (tours.adult_price / child_price) must never appear in a
 * response: the agent resells against it. AgentTourRate substitutes the net rate
 * into those fields before anything is sent.
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once '../models/Agent.php';
require_once '../models/AgentTourRate.php';
require_once 'helpers.php';

if (!defined('AGENT_SESSION_NAME')) {
    define('AGENT_SESSION_NAME', 'INDOSMILE_AGENT_SESSION');
}

handleCORS();

if (session_status() === PHP_SESSION_NONE) {
    session_name(AGENT_SESSION_NAME);
    session_start();
}

if (getRequestMethod() !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $database = new Database();
    $db = $database->connect();
    $agentModel = new Agent($db);
    $rateModel = new AgentTourRate($db);
} catch (Exception $e) {
    sendError('Database connection failed', 500);
}

$agent = requireActiveAgent($agentModel);

if (isset($_GET['id'])) {
    handleGetTour($rateModel, $agent['id'], (int)$_GET['id']);
} else {
    handleListTours($rateModel, $agent['id']);
}

/**
 * Session gate. Mirrors requireAgent() in agent_auth.php: a deactivated account
 * loses access on its next request, not its next login.
 */
function requireActiveAgent($agentModel) {
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

function handleListTours($rateModel, $agentId) {
    $search = isset($_GET['search']) ? sanitizeInput($_GET['search']) : null;

    $tours = $rateModel->agentTours($agentId, $search);

    sendResponse(['items' => $tours, 'count' => count($tours)], 200);
}

function handleGetTour($rateModel, $agentId, $tourId) {
    $tour = $rateModel->agentTour($agentId, $tourId);

    // Also the answer when the tour exists but this agent has no rate on it —
    // they have no way to tell the two apart, which is what we want.
    if (!$tour) {
        sendError('Tour not found', 404);
    }

    foreach (['gallery_images', 'highlights', 'included', 'not_included',
              'itinerary', 'departure_times', 'what_to_bring'] as $field) {
        $tour[$field] = json_decode($tour[$field], true);
    }

    sendResponse($tour, 200);
}
