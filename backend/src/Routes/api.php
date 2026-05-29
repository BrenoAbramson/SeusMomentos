<?php

/**
 * Roteador da API
 * 
 * Este arquivo é responsável por analisar a URL e o método HTTP da requisição
 * e direcionar para o controlador e método corretos.
 */

use Src\Controllers\UserController;
use Src\Utils\Response;

// Extrair a URI (tentando PATH_INFO primeiro para maior compatibilidade)
$requestUri = $_SERVER['PATH_INFO'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Caso a URI ainda contenha o "index.php", vamos limpá-la para isolar apenas o endpoint
$scriptName = $_SERVER['SCRIPT_NAME'];
if (strpos($requestUri, $scriptName) === 0) {
    $requestUri = substr($requestUri, strlen($scriptName));
}

$requestMethod = $_SERVER['REQUEST_METHOD'];

// Rota de Teste (Ping): Utilizada para verificar se a API está online
if ($requestUri === "/ping" && $requestMethod === "GET") {
    Response::success(["message" => "pong"]);
}

// Rotas de Autenticação e Cadastro
if ($requestUri === "/auth/cadastro") {
    if ($requestMethod === "POST") {
        (new UserController())->cadastrar();
    }
    else {
        Response::error("O endpoint de cadastro aceita apenas requisições POST", 405);
    }
}

// Rota de Login: Verifica credenciais e inicia sessão
if ($requestUri === "/auth/login") {
    if ($requestMethod === "POST") {
        (new UserController())->login();
    }
    else {
        Response::error("O endpoint de login aceita apenas requisições POST", 405);
    }
}

// Rota de Redefinição de Senha: Envia link de recuperação
if ($requestUri === "/auth/reset-password") {
    if ($requestMethod === "POST") {
        (new UserController())->forgotPassword();
    }
    else {
        Response::error("O endpoint de recuperação aceita apenas requisições POST", 405);
    }
}

// Rota de Validação do Token (GET) - Para o Front-end
if (strpos($requestUri, "/auth/reset-password/validate") === 0) {
    if ($requestMethod === "GET") {
        (new UserController())->validateToken();
    }
    else {
        Response::error("Método não permitido", 405);
    }
}

// Rota de Atualização de Senha
if ($requestUri === "/auth/reset-password/update") {
    if ($requestMethod === "POST") {
        (new UserController())->updatePassword();
    }
    else {
        Response::error("Método não permitido", 405);
    }
}

// Rotas de Eventos
if ($requestUri === "/events") {
    if ($requestMethod === "POST") {
        (new \Src\Controllers\EventController())->store();
    } elseif ($requestMethod === "GET") {
        (new \Src\Controllers\EventController())->index();
    }
}

if (strpos($requestUri, "/events/") === 0 && preg_match('/^\/events\/([^\/]+)$/', $requestUri, $matches)) {
    if ($requestMethod === "GET") {
        $_GET['slug'] = $matches[1];
        (new \Src\Controllers\EventController())->show();
    }
}

if (strpos($requestUri, "/events/") === 0 && preg_match('/^\/events\/([^\/]+)\/customizations$/', $requestUri, $matches)) {
    if ($requestMethod === "PUT") {
        (new \Src\Controllers\EventController())->updateCustomizations();
    }
}

// Rotas de Presentes
if ($requestUri === "/gifts") {
    if ($requestMethod === "POST") {
        (new \Src\Controllers\GiftController())->store();
    } elseif ($requestMethod === "PUT") {
        (new \Src\Controllers\GiftController())->update();
    } elseif ($requestMethod === "DELETE") {
        (new \Src\Controllers\GiftController())->destroy();
    } elseif ($requestMethod === "GET") {
        (new \Src\Controllers\GiftController())->index();
    }
}

// Rotas de Convidados
if ($requestUri === "/guests") {
    if ($requestMethod === "POST") {
        (new \Src\Controllers\GuestController())->store();
    } elseif ($requestMethod === "GET") {
        (new \Src\Controllers\GuestController())->index();
    }
}

if ($requestUri === "/guests/payment" && $requestMethod === "PUT") {
    (new \Src\Controllers\GuestController())->updatePayment();
}

if ($requestUri === "/guests/invitation" && $requestMethod === "PUT") {
    (new \Src\Controllers\GuestController())->updateInvitation();
}

if ($requestUri === "/guests/detail" && $requestMethod === "GET") {
    (new \Src\Controllers\GuestController())->detail();
}

if ($requestUri === "/guests/gifts" && $requestMethod === "PUT") {
    (new \Src\Controllers\GuestController())->updateGifts();
}

// Rotas de Pagamento (Mercado Pago)
if ($requestUri === "/payments/create" && $requestMethod === "POST") {
    (new \Src\Controllers\PaymentController())->create();
}

if ($requestUri === "/payments/create-preference" && $requestMethod === "POST") {
    (new \Src\Controllers\PaymentController())->createPlanPreference();
}

if ($requestUri === "/payments/create-checkout-preference" && $requestMethod === "POST") {
    (new \Src\Controllers\PaymentController())->createCheckoutPreference();
}

if ($requestUri === "/payments/status" && $requestMethod === "GET") {
    (new \Src\Controllers\PaymentController())->status();
}

if ($requestUri === "/payments/webhook" && $requestMethod === "POST") {
    (new \Src\Controllers\PaymentController())->webhook();
}

// Fallback: Caso nenhuma rota acima coincida, retorna erro 404
Response::error("Endpoint não encontrado", 404);
