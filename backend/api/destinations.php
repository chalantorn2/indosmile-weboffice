<?php
/**
 * Destinations API Endpoint
 * Returns unique destinations from tours and hotels tables
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once '../config/Database.php';
require_once 'helpers.php';

handleCORS();

if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

try {
    $database = new Database();
    $db = $database->connect();

    $query = "SELECT DISTINCT destination FROM (
        SELECT destination FROM tours WHERE destination IS NOT NULL AND destination != ''
        UNION
        SELECT destination FROM hotels WHERE destination IS NOT NULL AND destination != ''
    ) AS combined ORDER BY destination ASC";

    $stmt = $db->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_COLUMN);

    sendResponse($results, 200);
} catch (Exception $e) {
    sendError('Failed to fetch destinations', 500);
}
