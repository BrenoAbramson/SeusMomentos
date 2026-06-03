<?php
// router.php - Roteador para desenvolvimento local com PHP embutido (php -S)
$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// Mapeamento de URLs Amigáveis para os arquivos HTML físicos correspondentes
$routes = [
    '/' => '/index.html',
    '/home' => '/index.html',
    '/planos' => '/pages/planos/index.html',
    '/exemplos' => '/pages/exemplos/index.html',
    '/quem-somos' => '/pages/quemSomos/index.html',
    '/login' => '/pages/login/index.html',
    '/cadastro' => '/pages/cadastro/index.html',
];

if (isset($routes[$uri])) {
    // Carrega o arquivo HTML correto
    $_SERVER['SCRIPT_NAME'] = $routes[$uri];
    include __DIR__ . $routes[$uri];
    exit;
}

// Suporte para diretórios (ex: acessar /pages/planos serve /pages/planos/index.html)
if (is_dir(__DIR__ . $uri) && file_exists(__DIR__ . rtrim($uri, '/') . '/index.html')) {
    include __DIR__ . rtrim($uri, '/') . '/index.html';
    exit;
}

// Retorna false para que arquivos estáticos (.css, .js, imagens) sejam servidos normalmente
return false;
