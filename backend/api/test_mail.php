<?php
header('Content-Type: application/json');

// เปลี่ยนเป็น email อื่นเพื่อทดสอบ
$to = isset($_GET['to']) ? $_GET['to'] : 'info@indosmilesouthservices.com';
$subject = 'Test Email from Indo Smile';
$body = '<h1>Test Email</h1><p>If you see this, PHP mail() is working.</p>';

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: info@indosmilesouthservices.com\r\n";

$result = @mail($to, $subject, $body, $headers, '-f info@indosmilesouthservices.com');

echo json_encode([
    'mail_sent' => $result,
    'mail_function_exists' => function_exists('mail'),
    'disabled_functions' => ini_get('disable_functions'),
]);
