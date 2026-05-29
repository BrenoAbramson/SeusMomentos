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
    
    public function findById($id)
    {
        $stmt = $this->db->prepare("SELECT id, nome, email, role, email_verificado, criado_em, first_access FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(["id" => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function updateFirstAccess($id, $status = false)
    {
        $stmt = $this->db->prepare("UPDATE users SET first_access = :status WHERE id = :id");
        return $stmt->execute([
            "status" => $status ? 'true' : 'false',
            "id" => $id
        ]);
    }

    /**
     * Cria um novo registro de usuário no banco de dados.
     */
    public function cadastrar($nome, $email, $senhaHash, $token, $role = 'CLIENT')
    {
        $stmt = $this->db->prepare("
            INSERT INTO users (nome, email, senha, token_verificacao, role)
            VALUES (:nome, :email, :senha, :token, :role)
        ");

        return $stmt->execute([
            "nome"  => $nome,
            "email" => $email,
            "senha" => $senhaHash,
            "token" => $token,
            "role"  => $role
        ]);
    }

    /**
     * Define o token de recuperação de senha para um usuário.
     */
    public function setResetToken($email, $tokenHash, $expiry)
    {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET reset_token_hash = :hash, 
                reset_token_expires_at = :expiry 
            WHERE email = :email
        ");

        return $stmt->execute([
            "hash"   => $tokenHash,
            "expiry" => $expiry,
            "email"  => $email
        ]);
    }

    /**
     * Atualiza a senha do usuário e limpa as informações de recuperação.
     */
    public function updatePassword($email, $newPasswordHash)
    {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET senha = :senha, 
                reset_token_hash = NULL, 
                reset_token_expires_at = NULL 
            WHERE email = :email
        ");

        return $stmt->execute([
            "senha" => $newPasswordHash,
            "email" => $email
        ]);
    }
}
