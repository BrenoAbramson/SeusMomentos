<?php

namespace Src\Utils;

use Src\Utils\Response;

/**
 * Middleware de Autenticação e Autorização
 * 
 * Estrutura preparada para implementação futura de validação de tokens JWT
 * e controle de acesso baseado em perfis (roles).
 */
class AuthMiddleware
{
    /**
     * Verifica se o usuário tem a permissão necessária.
     * 
     * @param string $role O perfil exigido (ex: ADMIN)
     */
    public static function authorize(string $requiredRole = UserRole::CLIENT)
    {
        // Placeholder: Futuramente aqui será validado o Token JWT enviado no Header
        // Ex: $token = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        
        // Simulação de lógica futura:
        // if (!$token) {
        //     Response::error("Token não fornecido", 401);
        // }
        
        // Log de acesso (apenas para debug inicial)
        error_log("Verificando autorização para perfil: $requiredRole");
    }
}
