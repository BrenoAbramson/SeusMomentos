<?php

namespace Src\Controllers;

use Src\Services\GiftService;
use Src\Utils\Response;

class GiftController extends Controller
{
    private GiftService $giftService;

    public function __construct()
    {
        $this->giftService = new GiftService();
    }

    public function store()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $eventId = $input['event_id'] ?? null;
        $name = $input['gift_name'] ?? null;
        $value = $input['gift_value'] ?? null;

        if (!$eventId || !$name || !$value) {
            Response::error("event_id, gift_name e gift_value são obrigatórios", 400);
        }

        $giftId = $this->giftService->create($eventId, $name, $value);

        if ($giftId) {
            Response::success([
                "message" => "Presente criado com sucesso!",
                "gift_id" => $giftId
            ], 201);
        } else {
            Response::error("Erro ao criar presente", 500);
        }
    }

    public function update()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        
        // Aqui assumimos que o id do presente vem no JSON, ou poderia vir na query string se fizéssemos /gifts?id=X
        $giftId = $input['id'] ?? null;
        $name = $input['gift_name'] ?? null;
        $value = $input['gift_value'] ?? null;
        $enabled = $input['enabled'] ?? true;

        if (!$giftId || !$name || !$value) {
            Response::error("id, gift_name e gift_value são obrigatórios para atualizar", 400);
        }

        $success = $this->giftService->update($giftId, $name, $value, $enabled);

        if ($success) {
            Response::success(["message" => "Presente atualizado com sucesso!"]);
        } else {
            Response::error("Erro ao atualizar presente", 500);
        }
    }

    public function destroy()
    {
        // DELETE request, podemos pegar do JSON ou GET (query string)
        // Se formos rígidos com REST, poderíamos ler $_GET['id'] da url /gifts?id=X
        $giftId = $_GET['id'] ?? null;
        
        if (!$giftId) {
            $input = json_decode(file_get_contents("php://input"), true);
            $giftId = $input['id'] ?? null;
        }

        if (!$giftId) {
            Response::error("O id do presente é obrigatório", 400);
        }

        $success = $this->giftService->delete($giftId);

        if ($success) {
            Response::success(["message" => "Presente removido com sucesso!"]);
        } else {
            Response::error("Erro ao remover presente", 500);
        }
    }

    public function index()
    {
        $eventId = $_GET['event_id'] ?? null;
        $onlyEnabled = isset($_GET['enabled']) && $_GET['enabled'] == 'true';

        if (!$eventId) {
            Response::error("event_id é obrigatório", 400);
        }

        $gifts = $this->giftService->getByEventId($eventId, $onlyEnabled);
        Response::success(["gifts" => $gifts]);
    }
}
