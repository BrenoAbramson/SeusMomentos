<?php

namespace Src\Controllers;

use Src\Services\UserService;
use Src\Utils\Response;

class UserController extends Controller
{
    private UserService $userService;

    public function __construct()
    {
        $this->userService = new UserService();
    }

    public function store()
    {
        // 1. Receber dados JSON
        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input) {
            Response::error("Dados inválidos ou vazios", 400);
        }

        $nome = $input['nome'] ?? null;
        $email = $input['email'] ?? null;
        $senha = $input['senha'] ?? null;
        $confirmarSenha = $input['confirmar_senha'] ?? null;

        // 2. Validar campos obrigatórios
        if (!$nome || !$email || !$senha || !$confirmarSenha) {
            Response::error("Campos obrigatórios vazios", 400);
        }

        // 3. Validar se senhas coincidem
        if ($senha !== $confirmarSenha) {
            Response::error("As senhas não coincidem", 400);
        }

        // 4. Validar formato de e-mail
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error("Formato de e-mail inválido", 400);
        }

        // 5. Validar força da senha
        // Mínimo 8 caracteres, Número, Letra maiúscula, Letra minúscula, Caracter Especial
        $passwordRegex = "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/";
        if (!preg_match($passwordRegex, $senha)) {
            Response::error("Formato de senha inválido. A senha deve possuir no mínimo 8 caracteres, incluindo número, letra maiúscula, minúscula e caractere especial.", 400);
        }

        // 6. Verificar se e-mail já existe
        if ($this->userService->emailExists($email)) {
            Response::error("E-mail já cadastrado", 409);
        }

        // 7. Criptografar a senha (hash)
        $senhaHash = password_hash($senha, PASSWORD_BCRYPT);

        // 8. Gerar token de verificação (placeholder)
        $token = bin2hex(random_bytes(32));

        // 9. Salvar no banco de dados
        $success = $this->userService->create($nome, $email, $senhaHash, $token);

        if ($success) {
            // 10. Simular envio de e-mail (Log ou placeholder)
            // Em uma implementação real, usaríamos um PHPMailer ou serviço de e-mail aqui.
            $this->sendVerificationEmail($email, $token);

            Response::success([
                "message" => "Usuário cadastrado com sucesso! Verifique seu e-mail para confirmar a conta.",
                "email" => $email
            ], 201);
        }
        else {
            Response::error("Erro ao salvar usuário no banco de dados", 500);
        }
    }

    public function login()
    {
        // 1. Receber dados JSON
        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input) {
            Response::error("Dados inválidos ou vazios", 400);
        }

        $email = $input['email'] ?? null;
        $senha = $input['senha'] ?? null;

        // 2. Validar campos obrigatórios
        if (!$email || !$senha) {
            Response::error("E-mail e senha são obrigatórios", 400);
        }

        // 3. Buscar usuário pelo e-mail
        $user = $this->userService->findByEmail($email);

        if (!$user) {
            Response::error("E-mail ou senha incorretos", 401);
        }

        // 4. Verificar a senha
        if (password_verify($senha, $user['senha'])) {
            // Sucesso! Removemos a senha dos dados retornados por segurança
            unset($user['senha']);
            
            Response::success([
                "message" => "Login realizado com sucesso!",
                "user" => $user
            ]);
        } else {
            Response::error("E-mail ou senha incorretos", 401);
        }
    }

    private function sendVerificationEmail($email, $token)
    {
        // Placeholder para envio de e-mail
        // futuramente integrar com serviço de e-mail
        error_log("Enviando e-mail de confirmação para: $email com token: $token");
    }
}
