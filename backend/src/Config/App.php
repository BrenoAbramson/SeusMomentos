<?php

namespace Src\Config;

use Dotenv\Dotenv;

/**
 * Configuração Global da Aplicação
 * 
 * Esta classe é responsável por gerenciar as configurações de alto nível 
 * do sistema, como o carregamento das variáveis de ambiente (.env).
 */
class App
{
    /**
     * Carrega as variáveis de ambiente a partir do arquivo .env.
     * Utiliza a biblioteca phpdotenv para tornar as configurações 
     * acessíveis via $_ENV ou getenv().
     */
    public static function loadEnv()
    {
        // Define o caminho para a raiz do projeto onde está o .env
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->load();
    }
}
