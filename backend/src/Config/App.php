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
        $path = __DIR__ . '/../../';
        if (file_exists($path . '.env')) {
            $dotenv = Dotenv::createImmutable($path);
            $dotenv->load();
        } else {
            // Em produção, se o arquivo .env não existir (injetado via painel do Render), 
            // populamos a superglobal $_ENV com os valores do sistema para garantir compatibilidade.
            $variables = [
                'APP_ENV', 'APP_DEBUG', 
                'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD',
                'SUPABASE_URL', 'SUPABASE_ANON_KEY',
                'MERCADOPAGO_PUBLIC_KEY', 'MERCADOPAGO_ACCESS_TOKEN',
                'MAIL_HOST', 'MAIL_USER', 'MAIL_PASS', 'MAIL_PORT'
            ];
            foreach ($variables as $var) {
                $value = getenv($var);
                if ($value !== false) {
                    $_ENV[$var] = $value;
                }
            }
        }
    }
}
