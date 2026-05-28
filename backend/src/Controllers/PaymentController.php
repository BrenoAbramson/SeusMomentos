<?php

namespace Src\Controllers;

use Src\Services\GuestService;
use Src\Utils\Response;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class PaymentController extends Controller
{
    private GuestService $guestService;
    private Client $httpClient;
    private string $accessToken;

    public function __construct()
    {
        $this->guestService = new GuestService();
        $this->httpClient = new Client();
        
        // Carrega o Access Token do .env
        $this->accessToken = $_ENV['MERCADOPAGO_ACCESS_TOKEN'] ?? '';
    }

    public function create()
    {
        $input = json_decode(file_get_contents("php://input"), true);

        $guestId = $input['guest_id'] ?? null;
        $paymentMethod = $input['payment_method'] ?? null; // 'pix' ou 'card'

        if (!$guestId || !$paymentMethod) {
            Response::error("guest_id e payment_method são obrigatórios", 400);
        }

        // 1. Obter informações do convidado e valores dos presentes
        $guest = $this->guestService->getById($guestId);
        if (!$guest) {
            Response::error("Convidado não encontrado", 404);
        }

        // Calcula o valor total dos presentes
        $amount = $this->guestService->getGiftsTotalValue($guest['selected_gift_ids']);
        if ($amount <= 0) {
            Response::error("O valor total dos presentes deve ser maior que zero", 400);
        }

        // 2. Preparar payload para o Mercado Pago
        $payerNameParts = explode(' ', trim($guest['guest_name']), 2);
        $firstName = $payerNameParts[0];
        $lastName = $payerNameParts[1] ?? 'Convidado';

        $mpPayload = [
            "transaction_amount" => (float) $amount,
            "description" => "Presente de Casamento - " . ($guest['guest_name'] ?? 'Convidado'),
            "payer" => [
                "email" => $guest['guest_email'] ?: "convidado_teste@email.com",
                "first_name" => $firstName,
                "last_name" => $lastName
            ]
        ];

        if ($paymentMethod === 'pix') {
            $mpPayload["payment_method_id"] = "pix";
        } elseif ($paymentMethod === 'card') {
            $cardNumber = str_replace(' ', '', $input['card_number'] ?? '');
            $cardName = $input['card_name'] ?? '';
            $cardExpiry = $input['card_expiry'] ?? '';
            $cvv = $input['card_cvv'] ?? '';
            $installments = $input['installments'] ?? 1;
            $paymentMethodId = $input['payment_method_id'] ?? '';

            if (!$cardNumber || !$cardName || !$cardExpiry || !$cvv || !$paymentMethodId) {
                Response::error("Todos os campos do cartão são obrigatórios", 400);
            }

            $expiryParts = explode('/', $cardExpiry);
            if (count($expiryParts) !== 2) {
                Response::error("Validade do cartão inválida. Use o formato MM/AA", 400);
            }
            $month = (int)$expiryParts[0];
            $year = (int)("20" . $expiryParts[1]);

            // Chamada de tokenização no backend para contornar bloqueio CORS do navegador
            try {
                $tokenResponse = $this->httpClient->post('https://api.mercadopago.com/v1/card_tokens?public_key=' . ($_ENV['MERCADOPAGO_PUBLIC_KEY'] ?? ''), [
                    'json' => [
                        'card_number' => $cardNumber,
                        'expiration_month' => $month,
                        'expiration_year' => $year,
                        'security_code' => $cvv,
                        'cardholder' => [
                            'name' => $cardName
                        ]
                    ],
                    'headers' => [
                        'Content-Type' => 'application/json'
                    ],
                    'http_errors' => false
                ]);

                $tokenBody = json_decode($tokenResponse->getBody()->getContents(), true);
                if ($tokenResponse->getStatusCode() !== 200 && $tokenResponse->getStatusCode() !== 201) {
                    $msg = $tokenBody['message'] ?? (json_encode($tokenBody['cause'] ?? $tokenBody) ?: 'Erro ao gerar token do cartão');
                    Response::error("Mercado Pago Token: " . $msg, 400);
                }

                $token = $tokenBody['id'];
            } catch (\Exception $e) {
                Response::error("Erro na tokenização do cartão no servidor: " . $e->getMessage(), 500);
            }

            $mpPayload["token"] = $token;
            $mpPayload["installments"] = (int) $installments;
            $mpPayload["payment_method_id"] = $paymentMethodId;
        } else {
            Response::error("Método de pagamento inválido", 400);
        }

        // 3. Enviar requisição ao Mercado Pago
        try {
            $response = $this->httpClient->post('https://api.mercadopago.com/v1/payments', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->accessToken,
                    'Content-Type' => 'application/json',
                    'X-Idempotency-Key' => uniqid('mp_', true)
                ],
                'json' => $mpPayload,
                'http_errors' => false // Impede guzzle de jogar exceção em códigos 4xx/5xx para que possamos tratar
            ]);

            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody()->getContents(), true);

            if ($statusCode === 200 || $statusCode === 201) {
                $paymentId = $body['id'];
                $status = $body['status']; // approved, pending, in_process, rejected

                // Vincula o paymentId do Mercado Pago ao convidado no banco
                $this->guestService->updateMercadoPagoPaymentId($guestId, (string)$paymentId);

                if ($paymentMethod === 'pix') {
                    $qrCode = $body['point_of_interaction']['transaction_data']['qr_code'] ?? null;
                    $qrCodeBase64 = $body['point_of_interaction']['transaction_data']['qr_code_base64'] ?? null;

                    Response::success([
                        "status" => "pending",
                        "payment_method" => "pix",
                        "payment_id" => $paymentId,
                        "qr_code" => $qrCode,
                        "qr_code_base64" => $qrCodeBase64
                    ], 201);
                } else {
                    // Cartão
                    if ($status === 'approved') {
                        // Atualiza convidado como pago se aprovado na hora
                        $this->guestService->updatePaymentStatusByPaymentId((string)$paymentId, 'PAID');
                    }

                    Response::success([
                        "status" => $status,
                        "payment_method" => "card",
                        "payment_id" => $paymentId,
                        "status_detail" => $body['status_detail'] ?? ''
                    ], 201);
                }
            } else {
                // Erro retornado pelo Mercado Pago
                $errorMessage = $body['message'] ?? 'Erro no processamento do Mercado Pago';
                Response::error("Mercado Pago: " . $errorMessage, 400);
            }

        } catch (GuzzleException $e) {
            Response::error("Erro de conexão com o gateway de pagamento: " . $e->getMessage(), 500);
        }
    }

    public function status()
    {
        $guestId = $_GET['guest_id'] ?? null;

        if (!$guestId) {
            Response::error("guest_id é obrigatório", 400);
        }

        $status = $this->guestService->getPaymentStatus($guestId);

        Response::success([
            "guest_id" => $guestId,
            "payment_status" => $status ?: 'PENDING'
        ]);
    }

    public function webhook()
    {
        // 1. Obter entrada do Webhook
        $input = json_decode(file_get_contents("php://input"), true);
        
        $paymentId = $input['data']['id'] ?? $_GET['id'] ?? null;
        $type = $input['type'] ?? $_GET['topic'] ?? null;

        if (($type === 'payment' || $type === 'chargeback') && $paymentId) {
            try {
                // 2. Consultar o Mercado Pago diretamente para garantir a validade (evita spoofing)
                $response = $this->httpClient->get('https://api.mercadopago.com/v1/payments/' . $paymentId, [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $this->accessToken
                    ],
                    'http_errors' => false
                ]);

                if ($response->getStatusCode() === 200) {
                    $body = json_decode($response->getBody()->getContents(), true);
                    $status = $body['status'] ?? '';
                    $externalRef = $body['external_reference'] ?? null;

                    if ($status === 'approved') {
                        // 3. Atualizar no banco de dados para PAID
                        if ($externalRef && is_numeric($externalRef)) {
                            $this->guestService->updateMercadoPagoPaymentId((int)$externalRef, (string)$paymentId);
                            $this->guestService->updatePaymentStatus((int)$externalRef, 'PAID');
                        } else {
                            $this->guestService->updatePaymentStatusByPaymentId((string)$paymentId, 'PAID');
                        }
                    } elseif ($status === 'refunded' || $status === 'cancelled') {
                        if ($externalRef && is_numeric($externalRef)) {
                            $this->guestService->updatePaymentStatus((int)$externalRef, 'CANCELLED');
                        } else {
                            $this->guestService->updatePaymentStatusByPaymentId((string)$paymentId, 'CANCELLED');
                        }
                    }
                }
            } catch (\Exception $e) {
                // Logar erro e continuar (retorna status HTTP 200 para o Mercado Pago não reenviar)
                error_log("Erro no processamento de webhook do Mercado Pago: " . $e->getMessage());
            }
        }

        // Mercado Pago exige resposta de sucesso para confirmar o recebimento
        http_response_code(200);
        echo json_encode(["status" => "received"]);
        exit;
    }

    public function createPlanPreference()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $eventId = $input['event_id'] ?? null;
        $slug = $input['slug'] ?? null;
        $title = $input['title'] ?? 'Plano Premium - Seus Momentos';
        $host = $input['host'] ?? 'http://127.0.0.1:8000';
        $price = 30.00;
        
        if (!$eventId || !$slug) {
            Response::error("event_id e slug são obrigatórios", 400);
        }
        
        // Mercado Pago exige HTTPS para back_urls em ambiente Sandbox/Produção.
        // Convertemos http:// para https:// se necessário.
        $secureHost = str_replace('http://', 'https://', $host);
        
        // Define as URLs de retorno.
        $backUrl = "{$secureHost}/pages/template_selection/index.html?slug={$slug}&event_id={$eventId}";
        $failureUrl = "{$secureHost}/pages/onboarding/index.html?payment=failure&slug={$slug}&event_id={$eventId}";
        
        $payload = [
            "items" => [
                [
                    "title" => $title,
                    "quantity" => 1,
                    "unit_price" => (float) $price,
                    "currency_id" => "BRL"
                ]
            ],
            "back_urls" => [
                "success" => $backUrl . "&payment=success",
                "pending" => $backUrl . "&payment=pending",
                "failure" => $failureUrl
            ],
            "auto_return" => "approved",
            "external_reference" => (string) $eventId
        ];
        
        try {
            // Correção da rota do Mercado Pago: /checkout/preferences em vez de /v1/preferences (evita 404 em espanhol)
            $response = $this->httpClient->post('https://api.mercadopago.com/checkout/preferences', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->accessToken,
                    'Content-Type' => 'application/json'
                ],
                'json' => $payload,
                'http_errors' => false
            ]);
            
            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody()->getContents(), true);
            
            if ($statusCode === 200 || $statusCode === 201) {
                Response::success([
                    "preference_id" => $body['id'],
                    "init_point" => $body['init_point'],
                    "sandbox_init_point" => $body['sandbox_init_point']
                ]);
            } else {
                $errorMessage = $body['message'] ?? 'Erro ao criar preferência no Mercado Pago';
                Response::error("Mercado Pago: " . $errorMessage, 400);
            }
        } catch (\Exception $e) {
            Response::error("Erro de conexão com o Mercado Pago: " . $e->getMessage(), 500);
        }
    }

    public function createCheckoutPreference()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $guestId = $input['guest_id'] ?? null;
        $model = $input['model'] ?? 'classic';
        $host = $input['host'] ?? 'http://127.0.0.1:8000';
        
        if (!$guestId) {
            Response::error("guest_id é obrigatório", 400);
        }
        
        $guest = $this->guestService->getById($guestId);
        if (!$guest) {
            Response::error("Convidado não encontrado", 404);
        }
        
        $amount = $this->guestService->getGiftsTotalValue($guest['selected_gift_ids']);
        if ($amount <= 0) {
            Response::error("O valor total dos presentes deve ser maior que zero", 400);
        }
        
        $secureHost = str_replace('http://', 'https://', $host);
        
        $backUrl = "{$secureHost}/pages/public/checkout.html?guest_id={$guestId}&model={$model}&payment=success";
        $failureUrl = "{$secureHost}/pages/public/checkout.html?guest_id={$guestId}&model={$model}&payment=failure";
        
        $payload = [
            "items" => [
                [
                    "title" => "Presente de Casamento - " . ($guest['guest_name'] ?? 'Convidado'),
                    "quantity" => 1,
                    "unit_price" => (float) $amount,
                    "currency_id" => "BRL"
                ]
            ],
            "back_urls" => [
                "success" => $backUrl,
                "pending" => $backUrl,
                "failure" => $failureUrl
            ],
            "auto_return" => "approved",
            "external_reference" => (string) $guestId
        ];
        
        try {
            $response = $this->httpClient->post('https://api.mercadopago.com/checkout/preferences', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->accessToken,
                    'Content-Type' => 'application/json'
                ],
                'json' => $payload,
                'http_errors' => false
            ]);
            
            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody()->getContents(), true);
            
            if ($statusCode === 200 || $statusCode === 201) {
                Response::success([
                    "preference_id" => $body['id'],
                    "init_point" => $body['init_point'],
                    "sandbox_init_point" => $body['sandbox_init_point']
                ]);
            } else {
                $errorMessage = $body['message'] ?? 'Erro ao criar preferência no Mercado Pago';
                Response::error("Mercado Pago: " . $errorMessage, 400);
            }
        } catch (\Exception $e) {
            Response::error("Erro de conexão com o Mercado Pago: " . $e->getMessage(), 500);
        }
    }
}
