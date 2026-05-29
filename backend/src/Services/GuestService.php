<?php

namespace Src\Services;

use Src\Config\Database;
use PDO;

class GuestService
{
    private ?PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function create($eventId, $name, $phone, $email, $confirmed, $message, $invitation, $giftIds)
    {
        // giftIds é um array de inteiros. O PostgreSQL suporta inserção usando formatação de array {1,2,3}
        // Exemplo: se $giftIds = [1, 2], vira "{1,2}"
        $giftIdsPgArray = null;
        if (!empty($giftIds) && is_array($giftIds)) {
            $giftIdsPgArray = "{" . implode(",", $giftIds) . "}";
        }

        // Se o e-mail foi fornecido, verifica se já existe uma confirmação para este evento com este e-mail
        if (!empty($email)) {
            $stmtCheckEmail = $this->db->prepare("SELECT guest_name FROM guests WHERE event_id = :event_id AND guest_email = :guest_email LIMIT 1");
            $stmtCheckEmail->execute(["event_id" => $eventId, "guest_email" => $email]);
            $existingName = $stmtCheckEmail->fetchColumn();

            // Se o e-mail já foi usado por outro convidado (nome diferente)
            if ($existingName && strtolower(trim($existingName)) !== strtolower(trim($name))) {
                throw new \Exception("EMAIL_USED_BY_OTHER_GUEST");
            }

            // Se for o mesmo convidado, busca o registro dele que não esteja pago para fazer o UPDATE
            $stmtCheck = $this->db->prepare("
                SELECT id, selected_gift_ids FROM guests 
                WHERE event_id = :event_id 
                  AND guest_email = :guest_email 
                  AND (payment_status IS NULL OR payment_status != 'PAID')
                LIMIT 1
            ");
            $stmtCheck->execute(["event_id" => $eventId, "guest_email" => $email]);
            $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                $existingId = $existing['id'];
                $existingGiftsPg = $existing['selected_gift_ids'];

                // Carrega os IDs de presentes já cadastrados
                $existingGifts = [];
                if (!empty($existingGiftsPg)) {
                    $clean = trim($existingGiftsPg, '{}');
                    if (!empty($clean)) {
                        $existingGifts = array_map('intval', explode(',', $clean));
                    }
                }

                // Mescla os presentes novos com os anteriores e remove duplicatas
                $newGifts = is_array($giftIds) ? array_map('intval', $giftIds) : [];
                $mergedGifts = array_unique(array_merge($existingGifts, $newGifts));

                // Formata o array para gravação no PostgreSQL
                $giftIdsPgArray = null;
                if (!empty($mergedGifts)) {
                    $giftIdsPgArray = "{" . implode(",", $mergedGifts) . "}";
                }

                // Atualiza a confirmação existente
                $stmtUpdate = $this->db->prepare("
                    UPDATE guests SET 
                        guest_name = :guest_name,
                        guest_phone = :guest_phone,
                        confirmed_presence = :confirmed,
                        custom_message = :custom_message,
                        invitation_selected = :invitation,
                        selected_gift_ids = :gifts
                    WHERE id = :id
                ");
                $stmtUpdate->execute([
                    "guest_name" => $name,
                    "guest_phone" => $phone,
                    "confirmed" => $confirmed ? 'true' : 'false',
                    "custom_message" => $message,
                    "invitation" => $invitation,
                    "gifts" => $giftIdsPgArray,
                    "id" => $existingId
                ]);
                return $existingId;
            }
        }

        $stmt = $this->db->prepare("
            INSERT INTO guests (
                event_id, guest_name, guest_phone, guest_email, confirmed_presence, 
                custom_message, invitation_selected, selected_gift_ids
            ) VALUES (
                :event_id, :guest_name, :guest_phone, :guest_email, :confirmed, 
                :custom_message, :invitation, :gifts
            ) RETURNING id
        ");

        $stmt->execute([
            "event_id" => $eventId,
            "guest_name" => $name,
            "guest_phone" => $phone,
            "guest_email" => $email,
            "confirmed" => $confirmed ? 'true' : 'false',
            "custom_message" => $message,
            "invitation" => $invitation,
            "gifts" => $giftIdsPgArray
        ]);
        
        return $stmt->fetchColumn();
    }

    public function getByEventId($eventId)
    {
        $stmt = $this->db->prepare("SELECT * FROM guests WHERE event_id = :event_id ORDER BY created_at DESC");
        $stmt->execute(["event_id" => $eventId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function updatePaymentStatus($guestId, $status)
    {
        $stmt = $this->db->prepare("UPDATE guests SET payment_status = :status WHERE id = :id");
        return $stmt->execute([
            "status" => $status,
            "id" => $guestId
        ]);
    }

    public function updateInvitation($guestId, $invitation)
    {
        $stmt = $this->db->prepare("UPDATE guests SET invitation_selected = :invitation WHERE id = :id");
        return $stmt->execute([
            "invitation" => $invitation,
            "id" => $guestId
        ]);
    }

    public function getById($guestId)
    {
        $stmt = $this->db->prepare("
            SELECT g.*, e.slug AS event_slug 
            FROM guests g 
            LEFT JOIN events e ON e.id = g.event_id 
            WHERE g.id = :id
        ");
        $stmt->execute(["id" => $guestId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getGiftsTotalValue($giftIdsPgArray)
    {
        if (empty($giftIdsPgArray)) return 0.00;
        $clean = trim($giftIdsPgArray, '{}');
        if (empty($clean)) return 0.00;
        $ids = explode(',', $clean);

        $defaultGifts = [
            101 => 3500.00,
            102 => 450.00,
            103 => 890.00,
            104 => 2499.00,
            105 => 1200.00,
            106 => 650.00,
            107 => 399.00,
            108 => 299.00,
            109 => 180.00,
            110 => 350.00,
            111 => 250.00,
            112 => 1800.00,
            113 => 350.00,
            114 => 1500.00,
            115 => 400.00
        ];

        $total = 0.00;
        $dbIds = [];
        foreach ($ids as $id) {
            $id = (int)$id;
            if (isset($defaultGifts[$id])) {
                $total += $defaultGifts[$id];
            } else {
                $dbIds[] = $id;
            }
        }

        if (!empty($dbIds)) {
            $placeholders = implode(',', array_fill(0, count($dbIds), '?'));
            $stmt = $this->db->prepare("SELECT SUM(gift_value) FROM gifts WHERE id IN ($placeholders)");
            $stmt->execute($dbIds);
            $total += (float) $stmt->fetchColumn();
        }

        return $total;
    }

    public function updateMercadoPagoPaymentId($guestId, $paymentId)
    {
        $stmt = $this->db->prepare("UPDATE guests SET mercadopago_payment_id = :payment_id WHERE id = :id");
        return $stmt->execute([
            "payment_id" => $paymentId,
            "id" => $guestId
        ]);
    }

    public function updatePaymentStatusByPaymentId($paymentId, $status)
    {
        $stmt = $this->db->prepare("UPDATE guests SET payment_status = :status WHERE mercadopago_payment_id = :payment_id");
        return $stmt->execute([
            "status" => $status,
            "payment_id" => $paymentId
        ]);
    }

    public function getPaymentStatus($guestId)
    {
        $stmt = $this->db->prepare("SELECT payment_status FROM guests WHERE id = :id");
        $stmt->execute(["id" => $guestId]);
        return $stmt->fetchColumn();
    }

    public function getSelectedGiftsDetails($guestId)
    {
        $guest = $this->getById($guestId);
        if (!$guest || empty($guest['selected_gift_ids'])) {
            return [];
        }
        
        $clean = trim($guest['selected_gift_ids'], '{}');
        if (empty($clean)) {
            return [];
        }
        
        $ids = explode(',', $clean);

        $defaultGifts = [
            101 => ["id" => 101, "gift_name" => "2 Passagens Aéreas para a Lua de Mel", "gift_value" => 3500.00],
            102 => ["id" => 102, "gift_name" => "Jogo de Jantar Branco - 30 Peças", "gift_value" => 450.00],
            103 => ["id" => 103, "gift_name" => "Cafeteira Expresso Automática", "gift_value" => 890.00],
            104 => ["id" => 104, "gift_name" => "Smart TV LED 55\" 4K", "gift_value" => 2499.00],
            105 => ["id" => 105, "gift_name" => "Robô Aspirador de Pó Inteligente", "gift_value" => 1200.00],
            106 => ["id" => 106, "gift_name" => "Batedeira Planetária Inox", "gift_value" => 650.00],
            107 => ["id" => 107, "gift_name" => "Fritadeira Elétrica Airfryer", "gift_value" => 399.00],
            108 => ["id" => 108, "gift_name" => "Jogo de Panelas Antiaderente - 7 Peças", "gift_value" => 299.00],
            109 => ["id" => 109, "gift_name" => "Aparelho de Fondue Preto", "gift_value" => 180.00],
            110 => ["id" => 110, "gift_name" => "Caixa de Som Inteligente com Alexa", "gift_value" => 350.00],
            111 => ["id" => 111, "gift_name" => "Conjunto de Taças de Cristal (6 peças)", "gift_value" => 250.00],
            112 => ["id" => 112, "gift_name" => "Fim de Semana em Resort All Inclusive", "gift_value" => 1800.00],
            113 => ["id" => 113, "gift_name" => "Jantar Romântico para o Casal", "gift_value" => 350.00],
            114 => ["id" => 114, "gift_name" => "Adega de Vinhos Climatizada", "gift_value" => 1500.00],
            115 => ["id" => 115, "gift_name" => "Jogo de Cama Egípcio - Casal", "gift_value" => 400.00]
        ];

        $results = [];
        $dbIds = [];
        foreach ($ids as $id) {
            $id = (int)$id;
            if (isset($defaultGifts[$id])) {
                $results[] = $defaultGifts[$id];
            } else {
                $dbIds[] = $id;
            }
        }

        if (!empty($dbIds)) {
            $placeholders = implode(',', array_fill(0, count($dbIds), '?'));
            $stmt = $this->db->prepare("SELECT * FROM gifts WHERE id IN ($placeholders)");
            $stmt->execute($dbIds);
            $dbGifts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($dbGifts as $g) {
                $g['id'] = (int)$g['id'];
                $g['gift_value'] = (float)$g['gift_value'];
                $results[] = $g;
            }
        }

        return $results;
    }

    public function updateGifts($guestId, $giftIds)
    {
        $giftIdsPgArray = null;
        if (!empty($giftIds) && is_array($giftIds)) {
            $giftIdsPgArray = "{" . implode(",", array_map('intval', $giftIds)) . "}";
        }
        
        $stmt = $this->db->prepare("UPDATE guests SET selected_gift_ids = :gifts WHERE id = :id");
        return $stmt->execute([
            "gifts" => $giftIdsPgArray,
            "id" => $guestId
        ]);
    }
}
