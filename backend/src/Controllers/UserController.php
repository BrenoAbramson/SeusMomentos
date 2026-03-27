<?php

namespace Src\Controllers;

use Src\Services\UserService;
use Src\Utils\Response;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

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

        // 3. Validar formato de e-mail
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error("Formato de e-mail inválido", 400);
        }

        // 4. Buscar usuário pelo e-mail
        $user = $this->userService->findByEmail($email);

        if (!$user) {
            Response::error("E-mail ou senha incorretos", 401);
        }

        // 5. Verificar a senha
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

    public function forgotPassword()
    {
        // 1. Receber e-mail do front-end
        $input = json_decode(file_get_contents("php://input"), true);
        $email = $input['email'] ?? null;

        // 2. Validar se e-mail foi informado e tem formato válido
        if (!$email) {
            Response::error("O campo e-mail é obrigatório", 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::error("Formato de e-mail inválido", 400);
        }

        // 3. Verificar se o usuário existe
        $user = $this->userService->findByEmail($email);

        // Mensagem genérica para evitar descoberta de contas (Segurança)
        $genericMessage = "Você receberá um link de recuperação em breve.";

        if ($user) {
            // 4. Gerar token único e seguro
            $token = bin2hex(random_bytes(32));
            
            // 5. Hash do token para armazenamento seguro
            $tokenHash = password_hash($token, PASSWORD_BCRYPT);

            // 8. Montar link (Direcionando para o front-end vindo do .env)
            $baseUrl = $_ENV['FRONTEND_URL'] ?? "http://127.0.0.1:5500/pages/redefinirSenha/index.html";
            $resetLink = "$baseUrl?token=$token&email=" . urlencode($email);

            // 9. Enviar e-mail REAL via PHPMailer
            // Definimos a expiração de 3 minutos APÓS o disparo bem-sucedido
            if ($this->sendResetEmail($email, $resetLink)) {
                $expiry = date('Y-m-d H:i:s', strtotime('+3 minutes'));
                $this->userService->setResetToken($email, $tokenHash, $expiry);
            }
        }

        // Retornar sempre sucesso (OK) independente de o e-mail existir ou não
        Response::success(["message" => $genericMessage]);
    }

    public function updatePassword()
    {
        // 1. Receber dados
        $input = json_decode(file_get_contents("php://input"), true);
        $email = $input['email'] ?? null;
        $token = $input['token'] ?? null;
        $novaSenha = $input['nova_senha'] ?? null;
        $confirmarSenha = $input['confirmar_senha'] ?? null;

        // 2. Validações básicas e obrigatórias
        if (!$email || !$token || !$novaSenha || !$confirmarSenha) {
            Response::error("Todos os campos são obrigatórios", 400);
        }

        if ($novaSenha !== $confirmarSenha) {
            Response::error("As senhas não coincidem", 400);
        }

        // 3. Validar força da senha
        $passwordRegex = "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/";
        if (!preg_match($passwordRegex, $novaSenha)) {
            Response::error("Senha muito fraca. Use 8+ caracteres com números, maiúsculas, minúsculas e símbolos.", 400);
        }

        // 4. Buscar usuário
        $user = $this->userService->findByEmail($email);

        if (!$user) {
            Response::error("Usuário não encontrado ou e-mail inválido", 404);
        }

        // 5. Validar Token (Hash)
        if (!$user['reset_token_hash'] || !password_verify($token, $user['reset_token_hash'])) {
            Response::error("Token de recuperação inválido", 401);
        }

        // 6. Validar Expiração (3 Minutos)
        $expiryTime = strtotime($user['reset_token_expires_at']);
        if (time() > $expiryTime) {
            Response::error("O link de recuperação expirou (máximo de 3 minutos)", 401);
        }

        // 7. Atualizar senha e limpar token
        $senhaHash = password_hash($novaSenha, PASSWORD_BCRYPT);
        $success = $this->userService->updatePassword($email, $senhaHash);

        if ($success) {
            Response::success(["message" => "Senha redefinida com sucesso!"]);
        } else {
            Response::error("Erro ao atualizar a senha no banco de dados", 500);
        }
    }

    public function validateToken()
    {
        // 1. Receber dados via Query String (GET)
        $email = $_GET['email'] ?? null;
        $token = $_GET['token'] ?? null;

        if (!$email || !$token) {
            Response::error("E-mail e token são obrigatórios para validação", 400);
        }

        // 2. Buscar usuário
        $user = $this->userService->findByEmail($email);

        if (!$user) {
            Response::error("Usuário não encontrado", 404);
        }

        // 3. Validar Token (Hash)
        if (!$user['reset_token_hash'] || !password_verify($token, $user['reset_token_hash'])) {
            Response::error("Token de recuperação inválido", 401);
        }

        // 4. Validar Expiração (3 Minutos)
        $expiryTime = strtotime($user['reset_token_expires_at']);
        if (time() > $expiryTime) {
            Response::error("O link de recuperação expirou", 401);
        }

        // Se chegou aqui, o token é válido e não expirou
        Response::success(["message" => "Token válido"]);
    }

    private function sendVerificationEmail($email, $token)
    {
        // Placeholder para envio de e-mail
        // futuramente integrar com serviço de e-mail
        error_log("Enviando e-mail de confirmação para: $email com token: $token");
    }

    private function sendResetEmail($email, $link)
    {
        $mail = new PHPMailer(true);

        try {
            // Configurações do Servidor
            $mail->isSMTP();
            $mail->Host       = $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['MAIL_USER'];
            $mail->Password   = $_ENV['MAIL_PASS'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $_ENV['MAIL_PORT'] ?? 587;
            $mail->CharSet    = 'UTF-8';

            // Adicionado para contornar falha de SSL no ambiente local
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );

            // Remetente e Destinatário
            $mail->setFrom($_ENV['MAIL_USER'], 'Suporte Seus Momentos');
            $mail->addAddress($email);

            // Conteúdo do E-mail
            $mail->isHTML(true);
            $mail->Subject = 'Recuperação de Senha - Seus Momentos';
            $mail->Body    = "
                <h3>Olá!</h3>
                <p>Você solicitou a recuperação de senha para sua conta no <strong>Seus Momentos</strong>.</p>
                <p>Para criar uma nova senha, clique no link abaixo:</p>
                <p><a href='$link' style='padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;'>Redefinir Senha</a></p>
                <p><strong>Atenção:</strong> Este link expira em 3 minutos.</p>
                <p>Se você não solicitou esta alteração, ignore este e-mail.</p>
            ";
            $mail->AltBody = "Olá! Clique no link para redefinir sua senha: $link (Expira em 3 minutos)";

            $mail->send();
            return true;
        } catch (Exception $e) {
            // Log do erro silencioso para não quebrar a resposta da API
            error_log("Erro ao enviar e-mail de recuperação: {$mail->ErrorInfo}");
            return false;
        }
    }
}
