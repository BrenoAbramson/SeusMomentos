<?php

namespace Src\Services;

use Src\Config\Database;
use PDO;

class EventService
{
    private ?PDO $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    public function slugExists($slug)
    {
        $stmt = $this->db->prepare("SELECT id FROM events WHERE slug = :slug LIMIT 1");
        $stmt->execute(["slug" => $slug]);
        return $stmt->fetch();
    }

    public function create($userId, $eventType, $slug, $date, $location, $people, $plan = 'free')
    {
        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO events (user_id, event_type, slug, event_date, location, plan)
                VALUES (:user_id, :event_type, :slug, :event_date, :location, :plan)
                RETURNING id
            ");
            
            // Tratamento caso a data venha nula (PostgreSQL aceita null em TIMESTAMP mas precisamos passar explicitamente)
            $date = $date ? $date : null;
            $location = $location ? $location : null;

            $stmt->execute([
                "user_id" => $userId,
                "event_type" => $eventType,
                "slug" => $slug,
                "event_date" => $date,
                "location" => $location,
                "plan" => $plan
            ]);
            $eventId = $stmt->fetchColumn();

            // Insert people (ex: noivo/noiva ou aniversariante)
            $stmtPeople = $this->db->prepare("
                INSERT INTO event_people (event_id, name, role)
                VALUES (:event_id, :name, :role)
            ");
            foreach ($people as $person) {
                $stmtPeople->execute([
                    "event_id" => $eventId,
                    "name" => $person['name'],
                    "role" => $person['role']
                ]);
            }

            // Create default customizations row
            $stmtCustom = $this->db->prepare("
                INSERT INTO event_customizations (event_id) VALUES (:event_id)
            ");
            $stmtCustom->execute(["event_id" => $eventId]);

            $this->db->commit();
            return $eventId;
        } catch (\Exception $e) {
            $this->db->rollBack();
            error_log("Erro ao criar evento: " . $e->getMessage());
            return false;
        }
    }

    public function getByUser($userId)
    {
        $stmt = $this->db->prepare("
            SELECT e.*, 
            (SELECT COUNT(*) FROM guests WHERE event_id = e.id AND confirmed_presence = true) as confirmed_guests
            FROM events e
            WHERE user_id = :user_id ORDER BY created_at DESC
        ");
        $stmt->execute(["user_id" => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getBySlug($slug)
    {
        // Busca o evento
        $stmt = $this->db->prepare("SELECT * FROM events WHERE slug = :slug LIMIT 1");
        $stmt->execute(["slug" => $slug]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$event) return null;

        // Busca pessoas
        $stmtPeople = $this->db->prepare("SELECT name, role FROM event_people WHERE event_id = :id");
        $stmtPeople->execute(["id" => $event['id']]);
        $event['people'] = $stmtPeople->fetchAll(PDO::FETCH_ASSOC);

        // Busca customizações
        $stmtCustom = $this->db->prepare("SELECT * FROM event_customizations WHERE event_id = :id LIMIT 1");
        $stmtCustom->execute(["id" => $event['id']]);
        $event['customizations'] = $stmtCustom->fetch(PDO::FETCH_ASSOC);

        return $event;
    }
    
    public function updateCustomizations($eventId, $bg, $imageName, $title, $msg, $styles)
    {
        try {
            // Como a constraint UNIQUE no event_id garante 1:1, podemos dar UPDATE.
            $stmt = $this->db->prepare("
                UPDATE event_customizations 
                SET background_image = :bg,
                    image_name = :image_name,
                    main_title = :title,
                    custom_message = :msg,
                    custom_styles = :styles
                WHERE event_id = :event_id
            ");
            
            return $stmt->execute([
                "bg" => $bg,
                "image_name" => $imageName,
                "title" => $title,
                "msg" => $msg,
                "styles" => $styles ? json_encode($styles) : null,
                "event_id" => $eventId
            ]);
        } catch (\Exception $e) {
            error_log("Erro ao atualizar customizações: " . $e->getMessage());
            return false;
        }
    }
}
