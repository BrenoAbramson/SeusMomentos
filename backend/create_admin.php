<?php

require_once __DIR__ . '/vendor/autoload.php';

use Src\Config\App;
use Src\Config\Database;
use Src\Utils\UserRole;

App::loadEnv();
$db = Database::connect();

$email = 'admin@seusmomentos.com';
$password = 'Admin@1234';

// Verificar se já existe
$stmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
$stmt->execute(['email' => $email]);
$exists = $stmt->fetch();

if ($exists) {
    // Atualizar role e senha para garantir acesso e perfil correto
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $db->prepare("UPDATE users SET role = :role, senha = :senha, first_access = false, email_verificado = true WHERE email = :email");
    $stmt->execute([
        'role' => UserRole::ADMIN,
        'senha' => $hash,
        'email' => $email
    ]);
    echo "Usuário admin já existia e foi atualizado com sucesso.\n";
} else {
    // Inserir novo administrador
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $token = bin2hex(random_bytes(32));
    $stmt = $db->prepare("
        INSERT INTO users (nome, email, senha, token_verificacao, role, email_verificado, first_access)
        VALUES ('Administrador', :email, :senha, :token, :role, true, false)
    ");
    $stmt->execute([
        'email' => $email,
        'senha' => $hash,
        'token' => $token,
        'role' => UserRole::ADMIN
    ]);
    echo "Usuário admin criado com sucesso!\n";
}
