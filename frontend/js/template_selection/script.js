document.addEventListener('DOMContentLoaded', () => {
    // 1. Capturar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id');
    const slug = urlParams.get('slug');
    const paymentStatus = urlParams.get('payment');

    const btnEscolherCasamento = document.getElementById('btnEscolherCasamento');
    const btnVisualizarCasamento = document.getElementById('btnVisualizarCasamento');

    // 2. Sistema de Alerta
    function mostrarAlerta(mensagem, tipo) {
        const alerta = document.getElementById('alerta');
        const alertaTexto = document.getElementById('alerta-texto');
        const alertaIcone = document.getElementById('alerta-icone');

        let icone = '✔';
        if (tipo === 'erro') icone = '✖';
        if (tipo === 'aviso') icone = '!';

        alertaTexto.innerText = mensagem;
        alertaIcone.innerText = icone;
        alerta.className = `alerta show ${tipo}`;

        setTimeout(() => {
            alerta.classList.remove('show');
        }, 5000);
    }

    // 3. Verificar Status de Pagamento vindo do Mercado Pago
    if (paymentStatus === 'success') {
        mostrarAlerta('Pagamento aprovado com sucesso! Plano Premium ativado.', 'sucesso');
    } else if (paymentStatus === 'pending') {
        mostrarAlerta('Pagamento em análise ou aguardando compensação. Seu plano será ativado em breve.', 'aviso');
    } else if (paymentStatus === 'failure') {
        mostrarAlerta('Houve um problema com o seu pagamento. Tente novamente ou use o plano grátis.', 'erro');
    }

    // 4. Configurar link do botão de visualizar dinamicamente
    if (btnVisualizarCasamento && eventId) {
        btnVisualizarCasamento.href = `../template/casamento.html?event_id=${eventId}`;
    }

    // 5. Configurar clique para selecionar template e ir para o editor
    if (btnEscolherCasamento) {
        btnEscolherCasamento.addEventListener('click', () => {
            if (!eventId) {
                mostrarAlerta('Erro: Evento não identificado. Retorne ao painel.', 'erro');
                setTimeout(() => {
                    window.location.href = '../dashboard/index.html';
                }, 2000);
                return;
            }

            // Redireciona para o editor passando o id do evento
            window.location.href = `../template/index.html?event_id=${eventId}`;
        });
    }

    // 6. Verificar status de ativação do template casamento
    const isCasamentoActive = localStorage.getItem('template_casamento_active') !== 'false';
    const cardCasamentoClassic = document.getElementById('cardCasamentoClassic');
    const templatesGrid = document.getElementById('templatesGrid');

    if (!isCasamentoActive) {
        if (cardCasamentoClassic) {
            cardCasamentoClassic.style.display = 'none';
        }
        if (templatesGrid) {
            const emptyMsg = document.createElement('div');
            emptyMsg.id = 'emptyTemplatesMsg';
            emptyMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; color: #64748B; padding: 40px 0; font-weight: 500;';
            emptyMsg.innerText = 'Nenhum template disponível no momento.';
            templatesGrid.appendChild(emptyMsg);
        }
    }
});
