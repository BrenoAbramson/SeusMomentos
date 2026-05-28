<?php
$slug = $_SERVER['QUERY_STRING'] ?? '';
$slug = rawurldecode($slug);

if (strpos($slug, 'evento=') === 0) {
    $slug = substr($slug, 7);
}

if (!$slug) {
    echo "Evento não encontrado.";
    exit;
}

// 1. Chamar a API do Backend
$apiUrl = "http://127.0.0.1:8080/events/" . urlencode($slug);

// Fazer a chamada de forma segura usando stream contexts
$context = stream_context_create([
    "http" => [
        "ignore_errors" => true,
        "header" => "Content-Type: application/json\r\n"
    ]
]);

$response = @file_get_contents($apiUrl, false, $context);
if (!$response) {
    echo "Erro ao conectar ao servidor do backend.";
    exit;
}

$data = json_decode($response, true);
if (!$data || $data['status'] !== 'success') {
    echo "Evento não encontrado.";
    exit;
}

$event = $data['data']['event'];
$customizations = $event['customizations'];
$eventType = $event['event_type'];

// 2. Definir qual template HTML ler
$templatePath = __DIR__ . '/../template/' . ($eventType === 'casamento' ? 'casamento_modelo.html' : '15anos_modelo.html');

if (!file_exists($templatePath)) {
    echo "Template do evento não encontrado.";
    exit;
}

$html = file_get_contents($templatePath);

// 3. Funções Auxiliares de Formatação
function formatarDataPorExtenso($dateStr) {
    if (!$dateStr) return "";
    $timestamp = strtotime($dateStr);
    $dia = date('d', $timestamp);
    $ano = date('Y', $timestamp);
    
    $meses = [
        1 => 'Janeiro', 2 => 'Fevereiro', 3 => 'Março', 4 => 'Abril',
        5 => 'Maio', 6 => 'Junho', 7 => 'Julho', 8 => 'Agosto',
        9 => 'Setembro', 10 => 'Outubro', 11 => 'Novembro', 12 => 'Dezembro'
    ];
    
    $mesNum = (int)date('m', $timestamp);
    $mesNome = $meses[$mesNum] ?? '';
    
    return "{$dia} de {$mesNome} de {$ano}";
}

// 4. Formatar dados e substituir placeholders
$defaultTitle = "";
if (isset($event['people']) && is_array($event['people'])) {
    $names = array_map(function($p) { return $p['name']; }, $event['people']);
    $defaultTitle = implode(" & ", $names);
}
$title = !empty($customizations['main_title']) ? $customizations['main_title'] : $defaultTitle;

// Iniciais do logo
$initials = "";
if (isset($event['people']) && is_array($event['people']) && count($event['people']) > 0) {
    $firstLetters = array_map(function($p) { 
        return mb_strtoupper(mb_substr(trim($p['name']), 0, 1)); 
    }, $event['people']);
    $initials = implode("&", $firstLetters);
} else {
    $cleanTitle = str_ireplace([' e ', ' & ', ' and '], '&', $title);
    $parts = explode('&', $cleanTitle);
    $letters = array_map(function($pt) {
        return mb_strtoupper(mb_substr(trim($pt), 0, 1));
    }, $parts);
    $initials = implode('&', $letters);
}
if (empty($initials)) {
    $initials = "R&L";
}

$defaultMsg = ($eventType === 'casamento') 
    ? "Tudo começou com um amor compartilhado por discos de vinil antigos e cafés em tardes chuvosas."
    : "Convido você para uma noite de gala e encanto, onde celebraremos a transição e a beleza dos 15 anos.";
$message = !empty($customizations['custom_message']) ? $customizations['custom_message'] : $defaultMsg;

$defaultBg = ($eventType === 'casamento')
    ? "../../assets/casamento/paisagem.png"
    : "../../assets/15anos/rose-gold-hero.jpg";
$bgUrl = !empty($customizations['background_image']) ? $customizations['background_image'] : $defaultBg;

// Ajustar data por extenso
$eventDate = $event['event_date'] ? formatarDataPorExtenso($event['event_date']) : 'Data a definir';
$location = $event['location'] ? $event['location'] : 'Local a definir';

// Calcular prazo de RSVP (30 dias antes)
$deadlineFmt = "";
if ($event['event_date']) {
    $eventTimestamp = strtotime($event['event_date']);
    $deadlineTimestamp = $eventTimestamp - (30 * 24 * 60 * 60);
    $deadlineDateStr = date('Y-m-d', $deadlineTimestamp);
    $deadlineFmt = formatarDataPorExtenso($deadlineDateStr);
} else {
    $deadlineFmt = "30 dias antes do evento";
}

// Injetar os placeholders no HTML do template
$html = str_replace('{{TITLE}}', htmlspecialchars($title), $html);
$html = str_replace('{{INITIALS}}', htmlspecialchars($initials), $html);
$html = str_replace('{{DATE}}', htmlspecialchars($eventDate), $html);
$html = str_replace('{{LOCATION}}', htmlspecialchars($location), $html);
$html = str_replace('{{HISTORY_TEXT}}', htmlspecialchars($message), $html);
$html = str_replace('{{MESSAGE}}', htmlspecialchars($message), $html);
$html = str_replace('{{BACKGROUND_URL}}', htmlspecialchars($bgUrl), $html);
$html = str_replace('{{DEADLINE_DATE}}', htmlspecialchars($deadlineFmt), $html);

// 5. Injetar a variável Javascript global para que o RSVP funcione corretamente
$jsIntegration = "<script>window.eventData = " . json_encode($event) . ";</script>";
$html = str_replace('</body>', $jsIntegration . "\n</body>", $html);

echo $html;
