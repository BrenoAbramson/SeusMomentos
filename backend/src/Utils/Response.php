<?php

namespace Src\Utils;

/**
 * Classe Utilitária de Resposta
 * 
 * Centraliza a padronização das respostas JSON da API, garantindo que o front-end
 * receba sempre uma estrutura consistente em casos de erro ou sucesso.
 */
class Response
{
    /**
     * Retorna uma resposta JSON genérica e finaliza a execução.
     */
    public static function json($data, $status = 200)
    {
        header('Content-Type: application/json');
        http_response_code($status);
        echo json_encode($data);
        exit;
    }

    /**
     * Retorna uma resposta de sucesso padronizada.
     */
    public static function success($data, $status = 200)
    {
        self::json([
            "status" => "success",
            "data" => $data
        ], $status);
    }

    /**
     * Retorna uma resposta de erro padronizada.
     */
    public static function error($message, $status = 400)
    {
        self::json([
            "status" => "error",
            "message" => $message
        ], $status);
    }
}
