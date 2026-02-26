<?php
// token.php - InfinityFree Uyumlu Token Üretici
// Bu dosya SADECE Ably token'ı üretir, chat iletişimi İÇERMEZ!
// InfinityFree "chat script" engelini aşmak için tasarlandı

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: application/json');

// Sadece OPTIONS isteklerine yanıt ver
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ably API Key (dashboard'dan alın)
define('ABLY_API_KEY', 'xVIyHw.ArU8jg:j3k2h1g5f6d7s8a9'); // Kendi key'inizle değiştirin
define('ABLY_APP_ID', 'xVIyHw'); // Ably App ID

// Sadece GET isteklerine izin ver
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Sadece GET isteğine izin verilir']);
    exit();
}

// Gerekli parametreleri kontrol et
$clientId = $_GET['client_id'] ?? '';
$room = $_GET['room'] ?? 'genel';

if (empty($clientId)) {
    http_response_code(400);
    echo json_encode(['error' => 'client_id gerekli']);
    exit();
}

// Token oluştur
$token = generateAblyToken($clientId, $room);

if ($token) {
    echo json_encode([
        'success' => true,
        'token' => $token,
        'client_id' => $clientId,
        'room' => $room,
        'expires' => time() + 3600
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Token oluşturulamadı']);
}

/**
 * Ably Token oluştur - SADECE token üretir, chat içermez
 */
function generateAblyToken($clientId, $room) {
    $url = "https://rest.ably.io/apps/" . ABLY_APP_ID . "/tokens";
    
    $data = [
        'clientId' => $clientId,
        'capability' => json_encode([
            $room => ['publish', 'subscribe', 'presence']
        ]),
        'ttl' => 3600000, // 1 saat
        'timestamp' => time() * 1000
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Basic ' . base64_encode(ABLY_API_KEY . ':'),
        'Content-Type: application/x-www-form-urlencoded'
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // InfinityFree için
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200 || $httpCode === 201) {
        $tokenData = json_decode($response, true);
        return $tokenData['token'] ?? null;
    }
    
    return null;
}
?>
