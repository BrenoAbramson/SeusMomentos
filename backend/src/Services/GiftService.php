<?php

namespace Src\Services;

use Src\Config\Database;
use PDO;

class GiftService
{
    private ?PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function create($eventId, $name, $value)
    {
        $stmt = $this->db->prepare("
            INSERT INTO gifts (event_id, gift_name, gift_value)
            VALUES (:event_id, :name, :value)
            RETURNING id
        ");

        $stmt->execute([
            "event_id" => $eventId,
            "name" => $name,
            "value" => $value
        ]);
        
        return $stmt->fetchColumn();
    }

    public function update($giftId, $name, $value, $enabled)
    {
        $stmt = $this->db->prepare("
            UPDATE gifts 
            SET gift_name = :name, gift_value = :value, enabled = :enabled 
            WHERE id = :id
        ");
        
        return $stmt->execute([
            "name" => $name,
            "value" => $value,
            "enabled" => $enabled ? 'true' : 'false',
            "id" => $giftId
        ]);
    }

    public function delete($giftId)
    {
        $stmt = $this->db->prepare("DELETE FROM gifts WHERE id = :id");
        return $stmt->execute(["id" => $giftId]);
    }

    public function getByEventId($eventId, $onlyEnabled = false)
    {
        // Verifica se já existem presentes cadastrados para este evento no total
        $stmtCount = $this->db->prepare("SELECT COUNT(*) FROM gifts WHERE event_id = :event_id");
        $stmtCount->execute(["event_id" => $eventId]);
        $totalCount = (int) $stmtCount->fetchColumn();

        if ($totalCount === 0) {
            // Verifica o tipo de evento
            $stmtEvent = $this->db->prepare("SELECT event_type FROM events WHERE id = :id");
            $stmtEvent->execute(["id" => $eventId]);
            $eventType = $stmtEvent->fetchColumn();

            if ($eventType === 'casamento') {
                $this->semeiaPresentesPadrao($eventId);
            }
        }

        $query = "SELECT * FROM gifts WHERE event_id = :event_id";
        if ($onlyEnabled) {
            $query .= " AND enabled = true";
        }
        $query .= " ORDER BY id ASC";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute(["event_id" => $eventId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function semeiaPresentesPadrao($eventId)
    {
        $defaultGifts = [
            ["gift_name" => "2 Passagens Aéreas para a Lua de Mel", "gift_value" => 3500.00],
            ["gift_name" => "Jogo de Jantar Branco - 30 Peças", "gift_value" => 450.00],
            ["gift_name" => "Cafeteira Expresso Automática", "gift_value" => 890.00],
            ["gift_name" => "Smart TV LED 55\" 4K", "gift_value" => 2499.00],
            ["gift_name" => "Robô Aspirador de Pó Inteligente", "gift_value" => 1200.00],
            ["gift_name" => "Batedeira Planetária Inox", "gift_value" => 650.00],
            ["gift_name" => "Fritadeira Elétrica Airfryer", "gift_value" => 399.00],
            ["gift_name" => "Jogo de Panelas Antiaderente - 7 Peças", "gift_value" => 299.00],
            ["gift_name" => "Aparelho de Fondue Preto", "gift_value" => 180.00],
            ["gift_name" => "Caixa de Som Inteligente com Alexa", "gift_value" => 350.00],
            ["gift_name" => "Conjunto de Taças de Cristal (6 peças)", "gift_value" => 250.00],
            ["gift_name" => "Fim de Semana em Resort All Inclusive", "gift_value" => 1800.00],
            ["gift_name" => "Jantar Romântico para o Casal", "gift_value" => 350.00],
            ["gift_name" => "Adega de Vinhos Climatizada", "gift_value" => 1500.00],
            ["gift_name" => "Jogo de Cama Egípcio - Casal", "gift_value" => 400.00]
        ];

        $stmt = $this->db->prepare("
            INSERT INTO gifts (event_id, gift_name, gift_value, enabled)
            VALUES (:event_id, :name, :value, true)
        ");

        foreach ($defaultGifts as $gift) {
            $stmt->execute([
                "event_id" => $eventId,
                "name" => $gift["gift_name"],
                "value" => $gift["gift_value"]
            ]);
        }
    }
}
