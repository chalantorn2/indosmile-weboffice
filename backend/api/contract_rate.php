<?php
/**
 * Contract Rate Import API
 *
 * Admin-only proxy to the read-only Seven Smile Contract Rate API. The admin panel
 * uses it to search source tours, inspect their images, and pull the images we pick
 * into our own uploads dir before creating a tour or show.
 *
 * The upstream API key never reaches the browser.
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

verifyAdminSession();

$method = getRequestMethod();
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'search') {
    handleSearch();
} elseif ($method === 'GET' && $action === 'detail') {
    handleDetail();
} elseif ($method === 'POST' && $action === 'import_images') {
    handleImportImages();
} else {
    sendError('Unknown action. Use ?action=search|detail (GET) or ?action=import_images (POST).', 400);
}

/**
 * Call the upstream Contract Rate API and return its `data` array.
 */
function contractRateGet($endpoint, $params = [])
{
    $url = CONTRACT_RATE_API_BASE . '/' . $endpoint;
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => ['X-API-Key: ' . CONTRACT_RATE_API_KEY],
    ]);
    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        sendError('Contract Rate API unreachable: ' . $curlError, 502);
    }
    if ($status !== 200) {
        sendError('Contract Rate API returned HTTP ' . $status, 502);
    }

    $json = json_decode($body, true);
    if (!is_array($json) || empty($json['success'])) {
        sendError('Contract Rate API error: ' . ($json['error'] ?? 'malformed response'), 502);
    }

    return $json['data'] ?? [];
}

/**
 * Map source tour id => ['type' => 'tour'|'show', 'id' => local id] for everything
 * already imported, so the UI can mark those rows and block a second import.
 */
function getImportedMap($db)
{
    $map = [];

    foreach ([['tours', 'tour'], ['shows', 'show']] as [$table, $type]) {
        $stmt = $db->query("SELECT id, source_tour_id FROM `{$table}` WHERE source_tour_id IS NOT NULL");
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $map[(int)$row['source_tour_id']] = ['type' => $type, 'id' => (int)$row['id']];
        }
    }

    // A show combined from several Contract Rate rows records each source here, so
    // every one of those rows is marked imported (the table may not exist pre-migration).
    try {
        $stmt = $db->query("SELECT show_id, source_tour_id FROM show_sources");
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $map[(int)$row['source_tour_id']] = ['type' => 'show', 'id' => (int)$row['show_id']];
        }
    } catch (PDOException $e) {
        // show_sources not migrated yet — combined-import marking is simply unavailable
    }

    return $map;
}

function handleSearch()
{
    $search = trim($_GET['q'] ?? '');

    $params = [];
    if ($search !== '') {
        $params['search'] = $search;
    }

    $tours = contractRateGet('tours.php', $params);

    try {
        $database = new Database();
        $db = $database->connect();
        $imported = getImportedMap($db);
    } catch (Exception $e) {
        sendError('Database connection failed', 500);
    }

    // Trim to just what the picker list needs, plus the imported marker.
    $results = array_map(function ($t) use ($imported) {
        $sourceId = (int)$t['id'];
        return [
            'source_id' => $sourceId,
            'tour_name' => trim($t['tour_name'] ?? ''),
            'supplier_name' => $t['supplier_name'] ?? '',
            'departure_from' => $t['departure_from'] ?? '',
            'destination' => $t['destination'] ?? '',
            'tour_type' => $t['tour_type'],
            'adult_price' => $t['adult_price'],
            'child_price' => $t['child_price'],
            'imported' => $imported[$sourceId] ?? null,
        ];
    }, $tours);

    sendResponse(['items' => $results, 'count' => count($results)], 200);
}

function handleDetail()
{
    if (!isset($_GET['id'])) {
        sendError('Source tour id is required', 400);
    }
    $sourceId = (int)$_GET['id'];

    $tours = contractRateGet('tours.php', ['id' => $sourceId]);
    // `?id=` still returns a list-shaped payload.
    $tour = isset($tours['id']) ? $tours : ($tours[0] ?? null);
    if (!$tour) {
        sendError('Source tour not found', 404);
    }

    $files = contractRateGet('files.php', ['tour_id' => $sourceId]);
    $images = array_values(array_filter(array_map(function ($f) {
        return [
            'file_url' => $f['file_url'],
            'original_name' => $f['original_name'],
            'file_category' => $f['file_category'],
        ];
    }, $files), function ($f) {
        return !empty($f['file_url']);
    }));

    try {
        $database = new Database();
        $db = $database->connect();
        $imported = getImportedMap($db);
    } catch (Exception $e) {
        sendError('Database connection failed', 500);
    }

    $tour['tour_name'] = trim($tour['tour_name'] ?? '');
    $tour['images'] = $images;
    $tour['imported'] = $imported[$sourceId] ?? null;

    sendResponse($tour, 200);
}

/**
 * Download the picked images into our uploads dir. Returns local URLs in the same
 * order they were sent, so the caller can keep main/gallery straight.
 */
function handleImportImages()
{
    $input = getJSONInput();
    if (!$input || empty($input['urls']) || !is_array($input['urls'])) {
        sendError('urls array is required', 400);
    }

    $urls = $input['urls'];
    if (count($urls) > 30) {
        sendError('Maximum 30 images per import', 400);
    }

    $subdir = ($input['subdir'] ?? 'tours') === 'shows' ? 'shows' : 'tours';

    $results = [];
    $errors = [];

    foreach ($urls as $url) {
        $result = downloadImageToUploads($url, $subdir);
        if ($result['success']) {
            $results[] = ['source_url' => $url, 'url' => $result['url']];
        } else {
            $errors[] = basename(parse_url($url, PHP_URL_PATH)) . ': ' . $result['message'];
        }
    }

    if (empty($results)) {
        sendError('All image downloads failed: ' . implode(', ', $errors), 502);
    }

    sendResponse([
        'images' => $results,
        'imported_count' => count($results),
        'errors' => $errors,
    ], 200, count($results) . ' image(s) imported');
}
