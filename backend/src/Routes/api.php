<?php

use Src\Controllers\UserController;
use Src\Utils\Response;

// Obter URI e Método
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Rota Simples de Teste (Ping)
if ($requestUri === "/ping" && $requestMethod === "GET") {
    Response::success(["message" => "pong"]);
}

// Rotas de Usuários
if ($requestUri === "/users" && $requestMethod === "POST") {
    (new UserController())->store();
}

// Rota Não Encontrada
Response::error("Endpoint não encontrado", 404);
