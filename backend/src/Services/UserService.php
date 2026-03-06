<?php

namespace Src\Services;

use Src\Config\Database;
use PDO;

class UserService
{
    private ?PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function emailExists($email)
    {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(["email" => $email]);
        return $stmt->fetch();
    }

    public function create($nome, $email, $senhaHash, $token)
    {
        $stmt = $this->db->prepare("
            INSERT INTO users (nome, email, senha, token_verificacao)
            VALUES (:nome, :email, :senha, :token)
        ");

        return $stmt->execute([
            "nome" => $nome,
            "email" => $email,
            "senha" => $senhaHash,
            "token" => $token
        ]);
    }
}
