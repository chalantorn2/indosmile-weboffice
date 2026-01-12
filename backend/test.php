<?php
// Test file for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>PHP Test</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// Test database connection
try {
    require_once 'config/config.php';
    require_once 'config/Database.php';

    echo "<p>Config loaded ✓</p>";

    $database = new Database();
    $db = $database->connect();

    echo "<p style='color: green;'>✓ Database connection successful!</p>";
    echo "<p>Connected to: " . DB_NAME . "</p>";

    // Test query
    $stmt = $db->query("SELECT COUNT(*) as count FROM tours");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p>Tours in database: " . $result['count'] . "</p>";

} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<h2>Server Info</h2>";
echo "<pre>";
phpinfo();
echo "</pre>";
?>
