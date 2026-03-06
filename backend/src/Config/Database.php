<?php

namespace Src\Config;

use PDO;
use PDOException;

class Database
{
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
        } catch (PDOException $e) {
            // Em produção, deve-se logar o erro e não exibir a mensagem diretamente.
            die("Erro de Conexão com o Banco de Dados: " . $e->getMessage());
        }
    }
}
