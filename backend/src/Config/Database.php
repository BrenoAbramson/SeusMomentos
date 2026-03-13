<?php

namespace Src\Config;

use PDO;
use PDOException;

/**
 * Configuração de Banco de Dados
 * 
 * Gerencia a conexão com o PostgreSQL utilizando PDO.
 * As credenciais são lidas automaticamente do arquivo .env.
 */
class Database
{
    /**
     * Estabelece uma conexão com o banco de dados.
     * @return PDO
     */
    public static function connect()
    {
        try {
            return new PDO(
                "pgsql:host=" . $_ENV['DB_HOST'] .
                ";port=" . $_ENV['DB_PORT'] .
                ";dbname=" . $_ENV['DB_DATABASE'],
                $_ENV['DB_USER'],
                $_ENV['DB_PASSWORD'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
                );
        }
        catch (PDOException $e) {
            // Em produção, o ideal é logar o erro e não exibir a mensagem técnica ao usuário.
            die("Erro de Conexão com o Banco de Dados: " . $e->getMessage());
        }
    }
}
