<?php

namespace Src\Controllers;

use Src\Services\EventService;
use Src\Utils\Response;

class EventController extends Controller
{
    private EventService $eventService;

    public function __construct()
    {
        $this->eventService = new EventService();
    }

    public function store()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $userId = $input['user_id'] ?? null;
        $eventType = $input['event_type'] ?? null;
        $date = $input['event_date'] ?? null;
        $location = $input['location'] ?? null;
        $people = $input['people'] ?? []; // esperado array ex: [['name' => 'João', 'role' => 'pessoa1']]

        if (!$userId || !$eventType || empty($people)) {
            Response::error("Campos obrigatórios ausentes (user_id, event_type, people)", 400);
        }

        $plan = $input['plan'] ?? 'free';
        $customSlug = $input['slug'] ?? null;

        if ($plan === 'premium' && !empty($customSlug)) {
            // Limpa o slug customizado: substitui espaços por hifens e remove caracteres inválidos
            $slug = strtolower(preg_replace('/[^a-z0-9\-&]/', '', iconv('UTF-8', 'ASCII//TRANSLIT', str_replace(' ', '-', $customSlug))));
        } else {
            // Gera o slug automaticamente baseado nos nomes (ex: breno&maria)
            $names = array_column($people, 'name');
            $cleanedNames = array_map(function($name) {
                $name = str_replace(' ', '', $name);
                return strtolower(preg_replace('/[^a-zA-Z0-9]/', '', iconv('UTF-8', 'ASCII//TRANSLIT', $name)));
            }, $names);
            $slugBase = implode("&", $cleanedNames);
            $slug = $slugBase;
        }
        
        $counter = 1;
        $slugBase = $slug;
        while ($this->eventService->slugExists($slug)) {
            $slug = $slugBase . "-" . $counter;
            $counter++;
        }

        $eventId = $this->eventService->create($userId, $eventType, $slug, $date, $location, $people, $plan);

        if ($eventId) {
            Response::success([
                "message" => "Evento criado com sucesso!",
                "event_id" => $eventId,
                "slug" => $slug
            ], 201);
        } else {
            Response::error("Erro ao criar evento", 500);
        }
    }

    public function index()
    {
        // Aceita via GET ou POST (JSON)
        $userId = $_GET['user_id'] ?? null;
        
        if (!$userId) {
            // Tenta pegar do corpo se for via payload em rota protegida sem query string
            $input = json_decode(file_get_contents("php://input"), true);
            $userId = $input['user_id'] ?? null;
        }

        if (!$userId) {
            Response::error("user_id é obrigatório", 400);
        }

        $events = $this->eventService->getByUser($userId);
        Response::success(["events" => $events]);
    }
    
    public function show()
    {
        $slug = $_GET['slug'] ?? null;
        if (!$slug) {
            Response::error("Slug do evento é obrigatório", 400);
        }
        
        $event = $this->eventService->getBySlug($slug);
        
        if ($event) {
            Response::success(["event" => $event]);
        } else {
            Response::error("Evento não encontrado", 404);
        }
    }
    
    public function updateCustomizations()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $eventId = $input['event_id'] ?? null;
        if (!$eventId) {
            Response::error("event_id é obrigatório", 400);
        }
        
        $bg = $input['background_image'] ?? null;
        $imageName = $input['image_name'] ?? null;
        $title = $input['main_title'] ?? null;
        $msg = $input['custom_message'] ?? null;
        $styles = $input['custom_styles'] ?? null;
        
        $success = $this->eventService->updateCustomizations($eventId, $bg, $imageName, $title, $msg, $styles);
        
        if ($success) {
            Response::success(["message" => "Customizações atualizadas com sucesso!"]);
        } else {
            Response::error("Erro ao atualizar customizações", 500);
        }
    }
}
