<?php
// Temporary test script to debug transfer booking
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode(['step' => 'start']) . "\n";

try {
    require_once '../config/config.php';
    echo json_encode(['step' => 'config loaded']) . "\n";
    
    require_once '../config/Database.php';
    echo json_encode(['step' => 'database class loaded']) . "\n";
    
    $database = new Database();
    $db = $database->connect();
    echo json_encode(['step' => 'db connected', 'db_type' => get_class($db)]) . "\n";
    
    require_once '../models/TransferBooking.php';
    echo json_encode(['step' => 'TransferBooking model loaded']) . "\n";
    
    $model = new TransferBooking($db);
    echo json_encode(['step' => 'TransferBooking instantiated (table created)']) . "\n";
    
    // Test reading input
    $raw = file_get_contents('php://input');
    echo json_encode(['step' => 'input read', 'raw_length' => strlen($raw), 'raw_preview' => substr($raw, 0, 200)]) . "\n";
    
    $input = json_decode($raw, true);
    echo json_encode(['step' => 'json decoded', 'fields' => array_keys($input ?? [])]) . "\n";
    
    echo json_encode(['result' => 'ALL STEPS PASSED']) . "\n";
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]) . "\n";
} catch (Error $e) {
    echo json_encode(['fatal_error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]) . "\n";
}
