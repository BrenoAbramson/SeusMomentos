<?php

/**
 * Roteador da API
 * 
 * Este arquivo é responsável por analisar a URL e o método HTTP da requisição
 * e direcionar para o controlador e método corretos.
 */

use Src\Controllers\UserController;
use Src\Utils\Response;

// Extrair a URI (caminho) e o Método (GET, POST, etc)
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Rota de Teste (Ping): Utilizada para verificar se a API está online
if ($requestUri === "/ping" && $requestMethod === "GET") {
    Response::success(["message" => "pong"]);
}

// Rotas de Usuários: Gerencia cadastro e futuramente login/perfil
if ($requestUri === "/users" && $requestMethod === "POST") {
    (new UserController())->store();
}

// Fallback: Caso nenhuma rota acima coincida, retorna erro 404
Response::error("Endpoint não encontrado", 404);
