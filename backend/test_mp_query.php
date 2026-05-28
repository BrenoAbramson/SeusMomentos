<?php

require_once __DIR__ . '/vendor/autoload.php';

use Src\Config\App;
use Src\Config\Database;
use GuzzleHttp\Client;

App::loadEnv();
$db = Database::connect();

// 1. Buscar o último convidado com payment_id cadastrado
$stmt = $db->query("SELECT * FROM guests WHERE mercadopago_payment_id IS NOT NULL ORDER BY id DESC LIMIT 1");
$guest = $stmt->fetch();

if (!$guest) {
    echo "Nenhum pagamento do Mercado Pago encontrado na tabela guests.\n";
    exit;
}

echo "=== DADOS DO CONVIDADO NO BANCO ===\n";
echo "ID: " . $guest['id'] . "\n";
echo "Nome: " . $guest['guest_name'] . "\n";
echo "Status de Pagamento: " . $guest['payment_status'] . "\n";
echo "Mercado Pago Payment ID: " . $guest['mercadopago_payment_id'] . "\n\n";

// 2. Consultar o Mercado Pago
$accessToken = $_ENV['MERCADOPAGO_ACCESS_TOKEN'] ?? '';
if (!$accessToken) {
    echo "Erro: MERCADOPAGO_ACCESS_TOKEN não está configurado no .env.\n";
    exit;
}

echo "=== CONSULTANDO MERCADO PAGO API ===\n";
$client = new Client();
try {
    $response = $client->get('https://api.mercadopago.com/v1/payments/' . $guest['mercadopago_payment_id'], [
        'headers' => [
            'Authorization' => 'Bearer ' . $accessToken
        ],
        'http_errors' => false
    ]);

    $statusCode = $response->getStatusCode();
    $body = json_decode($response->getBody()->getContents(), true);

    if ($statusCode === 200) {
        echo "Status HTTP MP: 200 OK\n";
        echo "ID do Pagamento: " . $body['id'] . "\n";
        echo "Status do MP: " . $body['status'] . "\n";
        echo "Detalhe do Status: " . $body['status_detail'] . "\n";
        echo "Valor: R$ " . $body['transaction_amount'] . "\n";
        echo "Data de Criação: " . $body['date_created'] . "\n";
        echo "Método de Pagamento: " . $body['payment_method_id'] . "\n";
        echo "E-mail do Pagador: " . ($body['payer']['email'] ?? 'N/A') . "\n";
    } else {
        echo "Erro ao buscar pagamento (Código HTTP {$statusCode}):\n";
        print_r($body);
    }
} catch (\Exception $e) {
    echo "Erro na requisição: " . $e->getMessage() . "\n";
}
