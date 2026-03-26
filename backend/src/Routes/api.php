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

// Rotas de Usuários: Gerencia cadastro (POST)
if ($requestUri === "/users") {
    if ($requestMethod === "POST") {
        (new UserController())->store();
    }
    else {
        Response::error("O endpoint de cadastro aceita apenas requisições POST", 405);
    }
}

// Rota de Login: Verifica credenciais e inicia sessão
if ($requestUri === "/login") {
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

// Fallback: Caso nenhuma rota acima coincida, retorna erro 404
Response::error("Endpoint não encontrado", 404);
