<?php
/**
 * Database Connection Tester
 * ไฟล์นี้ช่วยหา password ที่ถูกต้อง
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Database Connection Tester</h1>";
echo "<p>Server: " . $_SERVER['HTTP_HOST'] . "</p>";
echo "<hr>";

// ข้อมูล Database
$host = 'localhost';
$port = '3306';
$dbname = 'sevensmile_indosmile';
$username = 'sevensmile_indosmile';

// ⚠️ ลอง password หลายๆ แบบ
$passwords_to_try = [
    'DnerC2dx@nBe5a0^',      // ไม่มี backslash
    'DnerC2dx@nBe5a0^\\',    // มี backslash
    'DnerC2dx@nBe5a0^\',     // backslash เดียว
];

echo "<h2>Testing Passwords...</h2>";

foreach ($passwords_to_try as $index => $password) {
    echo "<div style='padding: 10px; margin: 10px 0; border: 1px solid #ddd;'>";
    echo "<h3>Test #" . ($index + 1) . "</h3>";
    echo "<p><strong>Password:</strong> " . htmlspecialchars($password) . "</p>";

    try {
        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        echo "<p style='color: green; font-weight: bold;'>✓ CONNECTION SUCCESSFUL!</p>";
        echo "<p>This is the correct password!</p>";

        // ทดสอบ query
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo "<p><strong>Tables found:</strong> " . count($tables) . "</p>";
        if (count($tables) > 0) {
            echo "<ul>";
            foreach ($tables as $table) {
                echo "<li>" . htmlspecialchars($table) . "</li>";
            }
            echo "</ul>";
        } else {
            echo "<p style='color: orange;'>⚠️ Database is empty! You need to import database_schema.sql</p>";
        }

        // ถ้าเจอ password ที่ถูก ให้แสดงโค้ดที่ต้องใช้
        echo "<hr>";
        echo "<h3>✓ Use this in config.php:</h3>";
        echo "<pre style='background: #f5f5f5; padding: 15px; border-radius: 5px;'>";
        echo "define('DB_USER', '{$username}');\n";
        echo "define('DB_PASS', '" . addslashes($password) . "');";
        echo "</pre>";

        break; // หยุดทดสอบเมื่อเจอที่ถูก

    } catch (PDOException $e) {
        echo "<p style='color: red;'>✗ Failed: " . htmlspecialchars($e->getMessage()) . "</p>";
    }

    echo "</div>";
}

echo "<hr>";
echo "<h2>Alternative: Create New User</h2>";
echo "<p>If none of the passwords work, create a new database user in Plesk:</p>";
echo "<ol>";
echo "<li>Go to Plesk → Databases</li>";
echo "<li>Select database: sevensmile_indosmile</li>";
echo "<li>Click 'User Management'</li>";
echo "<li>Add new user: indosmile_admin</li>";
echo "<li>Set a simple password like: <strong>Admin2025!</strong></li>";
echo "<li>Grant ALL privileges</li>";
echo "</ol>";

echo "<p>Then update config.php:</p>";
echo "<pre style='background: #f5f5f5; padding: 15px; border-radius: 5px;'>";
echo "define('DB_USER', 'indosmile_admin');\n";
echo "define('DB_PASS', 'Admin2025!');";
echo "</pre>";
?>
