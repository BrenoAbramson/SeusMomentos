<?php

namespace Src\Services;

use Src\Config\Database;
use PDO;

/**
 * Serviço de Usuários
 * 
 * Camada de Regras de Negócio e Persistência para a entidade de Usuários.
 * Reponsável por interagir diretamente com o banco de dados PostgreSQL.
 */
class UserService
{
    private ?PDO $db;

    public function __construct()
    {
        // Conecta ao banco de dados ao instanciar o serviço
        $this->db = Database::connect();
    }

    public function emailExists($email)
    {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(["email" => $email]);
        return $stmt->fetch();
    }

    /**
     * Busca um usuário pelo e-mail (incluindo senha para validação).
     */
    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(["email" => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Cria um novo registro de usuário no banco de dados.
     */
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
