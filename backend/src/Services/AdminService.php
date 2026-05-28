<?php

namespace Src\Services;

use Src\Config\Database;
use PDO;

/**
 * Serviço de Administração
 * 
 * Camada de Regras de Negócio e Persistência para o Painel Administrativo.
 * Responsável por obter métricas gerais e listagem consolidada de usuários.
 */
class AdminService
{
    private ?PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * Retorna métricas globais do sistema:
     * - Quantidade total de clientes cadastrados
     * - Valor arrecadado total das comissões de 1%
     */
    public function getDashboardMetrics(): array
    {
        // 1. Quantidade de usuários Free (aqueles que não tem evento ou o plano do evento é diferente de 'premium')
        // Contamos ID de usuário único
        $stmtFreeUsers = $this->db->query("
            SELECT COUNT(DISTINCT u.id) 
            FROM users u
            LEFT JOIN events e ON e.user_id = u.id
            WHERE u.role = 'CLIENT' AND NOT EXISTS (
                SELECT 1 FROM events e2 WHERE e2.user_id = u.id AND e2.plan = 'premium'
            )
        ");
        $totalFreeUsers = (int) $stmtFreeUsers->fetchColumn();

        // 2. Quantidade de usuários Premium (aqueles que têm pelo menos um evento com plano 'premium')
        // Contamos ID de usuário único
        $stmtPremiumUsers = $this->db->query("
            SELECT COUNT(DISTINCT u.id) 
            FROM users u
            JOIN events e ON e.user_id = u.id
            WHERE u.role = 'CLIENT' AND e.plan = 'premium'
        ");
        $totalPremiumUsers = (int) $stmtPremiumUsers->fetchColumn();

        // 3. Valor Arrecadado (3% Taxa) dos usuários Free
        $stmtFreeFee = $this->db->query("
            SELECT COALESCE(SUM(gi.gift_value * 0.03), 0) AS total_fee
            FROM guests g
            JOIN events e ON g.event_id = e.id
            CROSS JOIN LATERAL UNNEST(g.selected_gift_ids) AS gift_id
            JOIN gifts gi ON gi.id = gift_id
            WHERE g.payment_status = 'PAID' AND (e.plan IS NULL OR e.plan != 'premium')
        ");
        $totalFreeFee = (float) $stmtFreeFee->fetchColumn();

        // 4. Valor Arrecadado (1% Taxa) dos usuários Premium
        $stmtPremiumFee = $this->db->query("
            SELECT COALESCE(SUM(gi.gift_value * 0.01), 0) AS total_fee
            FROM guests g
            JOIN events e ON g.event_id = e.id
            CROSS JOIN LATERAL UNNEST(g.selected_gift_ids) AS gift_id
            JOIN gifts gi ON gi.id = gift_id
            WHERE g.payment_status = 'PAID' AND e.plan = 'premium'
        ");
        $totalPremiumFee = (float) $stmtPremiumFee->fetchColumn();

        // 5. Histórico de registros de usuários para gráficos
        $stmtHistoryReg = $this->db->query("
            SELECT 
                u.criado_em AS date,
                CASE 
                    WHEN EXISTS (SELECT 1 FROM events e WHERE e.user_id = u.id AND e.plan = 'premium') THEN 'premium'
                    ELSE 'free'
                END AS plan
            FROM users u
            WHERE u.role = 'CLIENT'
            ORDER BY u.criado_em ASC
        ");
        $historyRegistrations = $stmtHistoryReg->fetchAll(PDO::FETCH_ASSOC);

        // 6. Histórico de arrecadações para gráficos
        $stmtHistoryRev = $this->db->query("
            SELECT 
                g.created_at AS date,
                COALESCE(e.plan, 'free') AS plan,
                gi.gift_value
            FROM guests g
            JOIN events e ON g.event_id = e.id
            CROSS JOIN LATERAL UNNEST(g.selected_gift_ids) AS gift_id
            JOIN gifts gi ON gi.id = gift_id
            WHERE g.payment_status = 'PAID'
            ORDER BY g.created_at ASC
        ");
        $rawRevenues = $stmtHistoryRev->fetchAll(PDO::FETCH_ASSOC);

        $historyRevenues = array_map(function ($rev) {
            $val = (float) $rev['gift_value'];
            $plan = $rev['plan'] === 'premium' ? 'premium' : 'free';
            $fee = $plan === 'premium' ? $val * 0.01 : $val * 0.03;
            return [
                'date' => $rev['date'],
                'plan' => $plan,
                'fee' => $fee
            ];
        }, $rawRevenues);

        $totalPlanRevenue = $totalPremiumUsers * 30.00;

        return [
            'total_free_users' => $totalFreeUsers,
            'total_free_fee' => $totalFreeFee,
            'total_premium_users' => $totalPremiumUsers,
            'total_premium_fee' => $totalPremiumFee,
            'total_plan_revenue' => $totalPlanRevenue,
            'total_system_fee' => $totalFreeFee + $totalPremiumFee + $totalPlanRevenue,
            'history' => [
                'registrations' => $historyRegistrations,
                'revenues' => $historyRevenues
            ]
        ];
    }

    /**
     * Retorna a lista detalhada de usuários com suas respectivas estatísticas de eventos:
     * - ID, Nome, E-mail, Data de criação
     * - Slug do site do evento
     * - Quantidade de convidados confirmados (presença = true)
     * - Valor bruto arrecadado (total das compras confirmadas)
     * - Valor líquido arrecadado (99%)
     * - Taxa do sistema arrecadada (1% ou 3%)
     * Evita retornar o mesmo usuário duplicado caso ele tenha múltiplos eventos,
     * priorizando o evento de ID mais alto (mais recente).
     */
    public function getUsersList(): array
    {
        $sql = "
            SELECT * FROM (
                SELECT DISTINCT ON (u.id)
                    u.id, 
                    u.nome, 
                    u.email, 
                    u.criado_em,
                    e.slug AS event_slug,
                    e.plan AS event_plan,
                    COALESCE(
                        (SELECT COUNT(*) 
                         FROM guests g 
                         WHERE g.event_id = e.id AND g.confirmed_presence = TRUE), 
                        0
                    ) AS confirmed_guests_count,
                    COALESCE(
                        (SELECT SUM(gi.gift_value)
                         FROM guests g
                         CROSS JOIN LATERAL UNNEST(g.selected_gift_ids) AS gift_id
                         JOIN gifts gi ON gi.id = gift_id
                         WHERE g.event_id = e.id AND g.payment_status = 'PAID'),
                        0
                    ) AS total_collected_gross
                FROM users u
                LEFT JOIN events e ON e.user_id = u.id
                WHERE u.role = 'CLIENT'
                ORDER BY u.id, e.id DESC
            ) AS subquery
            ORDER BY criado_em DESC
        ";

        $stmt = $this->db->query($sql);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Adiciona cálculos de valores líquidos e comissões para facilidade no frontend (1% premium, 3% free)
        return array_map(function ($user) {
            $gross = (float) $user['total_collected_gross'];
            $plan = $user['event_plan'] ?? 'free';
            $feeRate = $plan === 'premium' ? 0.01 : 0.03;
            $user['total_collected_gross'] = $gross;
            $user['total_collected_net'] = $gross * (1 - $feeRate);
            $user['system_fee_collected'] = $gross * $feeRate;
            return $user;
        }, $users);
    }
}
