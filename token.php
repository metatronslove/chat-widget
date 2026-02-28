<?php
// token.php - KESİN ÇÖZÜM (keyName eklendi)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST isteği gerekli']);
    exit();
}

// 🔴 KENDİ ABLY KEY'İNİZİ YAZIN
// xxxxx.xxxxxx:*************************************
// AppId.KeyId:KeySecret ;)
$ablyAppId = 'xxxxxx';
$ablyKeyId = 'xxxxxx';
$ablyKeySecret = ':*************************************';
$keyName = $ablyAppId . '.' . $ablyKeyId; // LVafcg.WLtrPQ

$input = json_decode(file_get_contents('php://input'), true);
$clientId = $input['clientId'] ?? $_POST['clientId'] ?? null;
$capability = $input['capability'] ?? $_POST['capability'] ?? '{"*":["*"]}';

if (!$clientId) {
    http_response_code(400);
    echo json_encode(['error' => 'clientId gerekli']);
    exit();
}

// 🔴 DOĞRU TOKENREQUEST FORMATI - keyName EKLENDİ!
$tokenRequestData = [
    'keyName' => $keyName,
    'clientId' => $clientId,
    'capability' => $capability,
    'ttl' => 3600000,
    'timestamp' => time() * 1000
];

$url = 'https://rest.ably.io/keys/' . $keyName . '/requestToken';
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($tokenRequestData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_USERPWD, $keyName . ':' . $ablyKeySecret);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'error' => 'cURL Hatası: ' . $curlError,
        'success' => false
    ]);
    exit();
}

if ($httpCode === 200 || $httpCode === 201) {
    echo $response;
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Token alınamadı',
        'httpCode' => $httpCode,
        'response' => $response,
        'success' => false
    ]);
}
?>
