<?php

namespace Src\Utils;

/**
 * Definição dos Perfis de Usuário (Roles)
 */
class UserRole
{
    public const ADMIN = 'ADMIN';
    public const CLIENT = 'CLIENT';

    /**
     * Retorna todos os perfis válidos
     */
    public static function all(): array
    {
        return [self::ADMIN, self::CLIENT];
    }
}
