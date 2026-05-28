<?php

namespace Src\Controllers;

use Src\Services\GuestService;
use Src\Utils\Response;

class GuestController extends Controller
{
    private GuestService $guestService;

    public function __construct()
    {
        $this->guestService = new GuestService();
    }

    public function store()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $eventId = $input['event_id'] ?? null;
        $name = $input['guest_name'] ?? null;
        $phone = $input['guest_phone'] ?? null;
        $email = $input['guest_email'] ?? null;
        $confirmed = $input['confirmed_presence'] ?? false;
        $message = $input['custom_message'] ?? null;
        $invitation = $input['invitation_selected'] ?? null;
        $giftIds = $input['selected_gift_ids'] ?? [];

        if (!$eventId || !$name) {
            Response::error("event_id e guest_name são obrigatórios", 400);
        }

        try {
            $guestId = $this->guestService->create(
                $eventId, $name, $phone, $email, $confirmed, $message, $invitation, $giftIds
            );
        } catch (\Exception $e) {
            if ($e->getMessage() === "EMAIL_USED_BY_OTHER_GUEST") {
                Response::error("Este e-mail já está sendo utilizado por outro convidado.", 400);
            }
            Response::error("Erro ao registrar confirmação: " . $e->getMessage(), 500);
        }

        if ($guestId) {
            Response::success([
                "message" => "Presença confirmada com sucesso!",
                "guest_id" => $guestId
            ], 201);
        } else {
            Response::error("Erro ao registrar confirmação", 500);
        }
    }

    public function index()
    {
        $eventId = $_GET['event_id'] ?? null;
        if (!$eventId) {
            Response::error("event_id é obrigatório", 400);
        }

        $guests = $this->guestService->getByEventId($eventId);
        Response::success(["guests" => $guests]);
    }
    
    public function updatePayment()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        $guestId = $input['guest_id'] ?? null;
        $status = $input['status'] ?? 'PAID';
        
        if (!$guestId) {
             Response::error("guest_id é obrigatório", 400);
        }
        
        $success = $this->guestService->updatePaymentStatus($guestId, $status);
        
        if ($success) {
            Response::success(["message" => "Status de pagamento atualizado com sucesso!"]);
        } else {
            Response::error("Erro ao atualizar status", 500);
        }
    }

    public function updateInvitation()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        $guestId = $input['guest_id'] ?? null;
        $invitation = $input['invitation_selected'] ?? null;
        
        if (!$guestId || !$invitation) {
            Response::error("guest_id e invitation_selected são obrigatórios", 400);
        }
        
        $success = $this->guestService->updateInvitation($guestId, $invitation);
        
        if ($success) {
            Response::success(["message" => "Modelo de convite atualizado com sucesso!"]);
        } else {
            Response::error("Erro ao atualizar modelo de convite", 500);
        }
    }

    public function detail()
    {
        $guestId = $_GET['guest_id'] ?? null;
        if (!$guestId) {
            Response::error("guest_id é obrigatório", 400);
        }

        $guest = $this->guestService->getById($guestId);
        if (!$guest) {
            Response::error("Convidado não encontrado", 404);
        }

        $gifts = $this->guestService->getSelectedGiftsDetails($guestId);

        Response::success([
            "guest" => $guest,
            "gifts" => $gifts
        ]);
    }

    public function updateGifts()
    {
        $input = json_decode(file_get_contents("php://input"), true);
        $guestId = $input['guest_id'] ?? null;
        $giftIds = $input['selected_gift_ids'] ?? [];
        
        if (!$guestId) {
             Response::error("guest_id é obrigatório", 400);
        }
        
        $success = $this->guestService->updateGifts($guestId, $giftIds);
        
        if ($success) {
            Response::success(["message" => "Presentes do convidado atualizados com sucesso!"]);
        } else {
            Response::error("Erro ao atualizar presentes", 500);
        }
    }
}
