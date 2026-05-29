<?php

namespace Src\Controllers;

use Src\Services\AdminService;
use Src\Services\UserService;
use Src\Utils\Response;

/**
 * Controlador de Administração
 * 
 * Gerencia as requisições referentes às telas do painel de administração.
 */
class AdminController extends Controller
{
    private AdminService $adminService;
    private UserService $userService;

    public function __construct()
    {
        $this->adminService = new AdminService();
        $this->userService = new UserService();
    }

    /**
     * Retorna os dados consolidados do painel do administrador (métricas + lista de usuários)
     * e realiza a verificação de segurança baseada no perfil ADMIN.
     */
    public function dashboard()
    {
        // 1. Obter e validar o ID do usuário solicitante
        $userId = $_GET['user_id'] ?? null;
        if (!$userId) {
            $input = json_decode(file_get_contents("php://input"), true);
            $userId = $input['user_id'] ?? null;
        }

        if (!$userId) {
            Response::error("Identificação do usuário (user_id) é obrigatória.", 400);
        }

        // 2. Buscar o perfil no banco de dados e verificar autorização (Role ADMIN)
        $user = $this->userService->findById($userId);
        if (!$user || $user['role'] !== 'ADMIN') {
            Response::error("Acesso não autorizado. Apenas administradores possuem acesso a esta rota.", 403);
        }

        // 3. Obter os dados do serviço
        try {
            $metrics = $this->adminService->getDashboardMetrics();
            $users = $this->adminService->getUsersList();

            Response::success([
                'metrics' => $metrics,
                'users' => $users
            ]);
        } catch (\Exception $e) {
            Response::error("Erro interno ao processar dados do painel: " . $e->getMessage(), 500);
        }
    }
}
