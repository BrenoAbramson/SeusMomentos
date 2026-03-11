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

// Rotas de Usuários: Gerencia cadastro e futuramente login/perfil
if ($requestUri === "/users" && $requestMethod === "POST") {
    (new UserController())->store();
}

// Rota de Login: Verifica credenciais e inicia sessão
if ($requestUri === "/login" && $requestMethod === "POST") {
    (new UserController())->login();
}

// Fallback: Caso nenhuma rota acima coincida, retorna erro 404
Response::error("Endpoint não encontrado", 404);
