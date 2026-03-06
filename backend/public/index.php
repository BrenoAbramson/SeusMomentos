<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Src\Config\App;

// Carregar variáveis de ambiente
App::loadEnv();

// CORS e JSON Header
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Simples roteador para teste inicial
require_once __DIR__ . '/../src/Routes/api.php';
