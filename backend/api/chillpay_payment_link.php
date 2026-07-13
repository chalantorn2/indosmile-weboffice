<?php

/**
 * ChillPay PayLink Generate Endpoint
 *
 * POST { amount: number, currency?: string, productName?: string,
 *        productDescription?: string, paymentLimit?: 0|1, expiredDays?: number }
 *   -> { paymentUrl, qrImage, payLinkId, payLinkToken, amount, currency, expiredDate }
 *
 * Reference: ChillPay API PayLink Services Document v1.0.3 - Section 1
 */

header('Content-Type: application/json');
require_once '../config/config.php';
require_once 'helpers.php';

handleCORS();

if (getRequestMethod() !== 'POST') {
    sendError('Method not allowed', 405);
}

if (!defined('CHILLPAY_MERCHANT_CODE') || CHILLPAY_MERCHANT_CODE === ''
    || !defined('CHILLPAY_API_KEY') || CHILLPAY_API_KEY === ''
    || !defined('CHILLPAY_MD5_KEY') || CHILLPAY_MD5_KEY === '') {
    sendError('ChillPay is not configured on the server', 500);
}

$input = getJSONInput();
if (!$input) {
    sendError('Invalid JSON input', 400);
}

$amount = isset($input['amount']) ? floatval($input['amount']) : 0;
if ($amount <= 0) {
    sendError('Amount must be greater than 0', 400);
}

$currency = strtoupper(trim($input['currency'] ?? 'THB'));
$allowedCurrencies = ['THB', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'NZD', 'HKD', 'SGD', 'CHF', 'MYR', 'CNY', 'CAD'];
if (!in_array($currency, $allowedCurrencies, true)) {
    sendError('Unsupported currency', 400);
}

$productName = isset($input['productName']) && trim($input['productName']) !== ''
    ? sanitizeInput($input['productName'])
    : 'Test Payment';

$productDescription = isset($input['productDescription']) && trim($input['productDescription']) !== ''
    ? sanitizeInput($input['productDescription'])
    : $productName;

// PaymentLimit: 1 = one-time (default), 0 = unlimited
$paymentLimit = isset($input['paymentLimit']) && $input['paymentLimit'] !== '' ? intval($input['paymentLimit']) : 1;
if ($paymentLimit !== 0 && $paymentLimit !== 1) {
    $paymentLimit = 1;
}

// ChillPay expects amount in smallest unit. Last 2 digits = decimal value.
// Example: 27500 -> 275.00. JPY/KRW have no decimal.
$zeroDecimal = ['JPY', 'KRW'];
$amountInt = in_array($currency, $zeroDecimal, true)
    ? (int) round($amount)
    : (int) round($amount * 100);

// Dates in format dd/MM/yyyy HH:mm:ss (Asia/Bangkok set in config)
$expiredDays = isset($input['expiredDays']) ? max(1, intval($input['expiredDays'])) : 1;
$startDate   = date('d/m/Y H:i:s');
$expiredDate = date('d/m/Y H:i:s', strtotime("+{$expiredDays} days"));

$productImage = ''; // optional base64; leave empty

// Checksum: ProductImage + ProductName + ProductDescription + PaymentLimit
//         + StartDate + ExpiredDate + Currency + Amount + MD5SecretKey
$checksumRaw = $productImage
    . $productName
    . $productDescription
    . $paymentLimit
    . $startDate
    . $expiredDate
    . $currency
    . $amountInt
    . CHILLPAY_MD5_KEY;
$checksum = md5($checksumRaw);

$body = [
    'ProductImage'       => $productImage,
    'ProductName'        => $productName,
    'ProductDescription' => $productDescription,
    'PaymentLimit'       => $paymentLimit,
    'StartDate'          => $startDate,
    'ExpiredDate'        => $expiredDate,
    'Currency'           => $currency,
    'Amount'             => $amountInt,
    'Checksum'           => $checksum,
];

$ch = curl_init(CHILLPAY_API_BASE . '/paylink/generate');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'CHILLPAY-MerchantCode: ' . CHILLPAY_MERCHANT_CODE,
    'CHILLPAY-ApiKey: ' . CHILLPAY_API_KEY,
    'Content-Type: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($response === false) {
    sendError('Failed to reach ChillPay: ' . $curlErr, 502);
}

$data = json_decode($response, true);
if (!is_array($data)) {
    sendError('Invalid response from ChillPay', 502);
}

$status = isset($data['status']) ? intval($data['status']) : 0;
if ($status !== 200) {
    $msg = $data['message'] ?? 'ChillPay API error';
    sendError($msg . ' (status ' . $status . ')', $httpCode >= 400 ? $httpCode : 400);
}

$payload = $data['data'] ?? [];

sendResponse([
    'payLinkId'     => $payload['payLinkId']     ?? null,
    'payLinkToken'  => $payload['payLinkToken']  ?? null,
    'paymentUrl'    => $payload['paymentUrl']    ?? null,
    'qrImage'       => $payload['qrImage']       ?? null,
    'productName'   => $payload['productName']   ?? $productName,
    'amount'        => $payload['amount']        ?? $amount,
    'currency'      => $payload['currency']      ?? $currency,
    'startDate'     => $payload['startDate']     ?? $startDate,
    'expiredDate'   => $payload['expiredDate']   ?? $expiredDate,
    'linkStatus'    => $payload['status']        ?? null,
], 200, 'Payment link created');
