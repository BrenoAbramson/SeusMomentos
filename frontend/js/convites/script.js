document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('user_id') || 1;
    let currentEventId = null;
    let eventSlug = '';

    // Referências DOM
    const convitesGrid = document.getElementById('convitesGrid');
    const eventoTitulo = document.getElementById('eventoTitulo');
    const linkEditarTemplate = document.getElementById('linkEditarTemplate');

    function finishLoading() {
        document.body.classList.remove('is-loading');
    }

    function formatarData(dataStr) {
        if (!dataStr) return '-';
        const data = new Date(dataStr.replace(' ', 'T'));
        return data.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function mostrarAlerta(msg, tipo) {
        const div = document.getElementById('alerta');
        document.getElementById('alerta-texto').innerText = msg;
        div.className = 'alerta show ' + tipo;
        setTimeout(() => div.classList.remove('show'), 3000);
    }

    let eventTitle = 'Ricardo & Luisa';
    let eventDateFormatted = '28/10/2026';

    // 1. Carregar o Evento do Usuário
    async function loadEvent() {
        try {
            const res = await fetch(`http://127.0.0.1:8080/events?user_id=${userId}`);
            const data = await res.json();

            if (data.status === 'success' && data.data.events.length > 0) {
                const evento = data.data.events[0];
                currentEventId = evento.id;
                eventSlug = evento.slug;

                let typeFmt = evento.event_type.replace('_', ' ');
                eventoTitulo.innerText = "Convites Recebidos - " + typeFmt.charAt(0).toUpperCase() + typeFmt.slice(1);

                if (linkEditarTemplate) {
                    linkEditarTemplate.href = `../template/index.html?event_id=${currentEventId}`;
                }

                // Buscar detalhes completos do evento para pegar título e data customizados
                try {
                    const resDetalhe = await fetch(`http://127.0.0.1:8080/events/${eventSlug}`);
                    const dataDetalhe = await resDetalhe.json();
                    if (dataDetalhe.status === 'success' && dataDetalhe.data.event) {
                        const fullEvent = dataDetalhe.data.event;
                        eventTitle = fullEvent.customizations.main_title || fullEvent.people.map(p => p.name).join(" & ") || 'Ricardo & Luisa';

                        if (fullEvent.event_date) {
                            const partes = fullEvent.event_date.split('T')[0].split(' ')[0].split('-');
                            if (partes.length === 3) {
                                eventDateFormatted = `${partes[2]}/${partes[1]}/${partes[0]}`;
                            } else {
                                eventDateFormatted = new Date(fullEvent.event_date).toLocaleDateString('pt-BR');
                            }
                        }
                    }
                } catch (err) {
                    console.error("Erro ao carregar detalhes do evento:", err);
                }

                loadConvites(currentEventId);
            } else {
                mostrarAlerta('Nenhum evento encontrado. Crie um novo evento.', 'aviso');
                finishLoading();
            }
        } catch (e) {
            console.error(e);
            mostrarAlerta('Erro ao carregar dados do evento', 'erro');
            finishLoading();
        }
    }

    // 2. Buscar e Renderizar Convites dos Convidados
    async function loadConvites(eventId) {
        try {
            const res = await fetch(`http://127.0.0.1:8080/guests?event_id=${eventId}`);
            const data = await res.json();

            if (data.status === 'success') {
                renderConvites(data.data.guests);
            } else {
                mostrarAlerta('Erro ao carregar convites do servidor.', 'erro');
            }
            finishLoading();
        } catch (e) {
            console.error(e);
            mostrarAlerta('Erro ao carregar convites', 'erro');
            finishLoading();
        }
    }

    function renderConvites(guests) {
        convitesGrid.innerHTML = '';

        // Filtra convidados que confirmaram presença
        const convitesRecebidos = guests.filter(g => g.confirmed_presence);

        if (convitesRecebidos.length === 0) {
            convitesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: #64748B; padding: 60px 0; font-weight: 500;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💌</div>
                    <h3>Nenhum convite recebido ainda</h3>
                    <p style="font-size: 14px; margin-top: 4px; color: #94A3B8;">Compartilhe o link do seu site para os convidados confirmarem presença!</p>
                </div>
            `;
            return;
        }

        convitesRecebidos.forEach(g => {
            const design = g.invitation_selected || 'classic';
            const mensagem = g.custom_message ? g.custom_message : 'Desejamos toda a felicidade do mundo nesta nova etapa!';
            const dataEnvio = formatarData(g.created_at);

            let cardHtml = '';

            if (design === 'modern') {
                cardHtml = `
                    <div class="convite-container-wrapper">
                        <div class="invitation-preview-container modern">
                            <div class="invitation-card-style modern-style">
                                <div class="geometric-overlay"></div>
                                <div class="card-inner">
                                    <div class="modern-header">
                                        <span class="modern-dot"></span>
                                        <span class="modern-label">CONVITE DE CASAMENTO</span>
                                        <span class="modern-dot"></span>
                                    </div>
                                    <h1 class="couple-names-display">${eventTitle}</h1>
                                    <div class="modern-line"></div>
                                    <p class="guest-message-display">"${mensagem}"</p>
                                    <div class="modern-footer">
                                        <div class="modern-date">${eventDateFormatted.replace(/\//g, ' / ')}</div>
                                        <div class="rsvp-status-badge">Confirmado</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="convite-card-footer">
                            <h3>De: ${g.guest_name}</h3>
                            <span>${g.guest_email || g.guest_phone || 'Contato não informado'} • Confirmado em ${dataEnvio}</span>
                        </div>
                    </div>
                `;
            } else if (design === 'minimal') {
                cardHtml = `
                    <div class="convite-container-wrapper">
                        <div class="invitation-preview-container minimal">
                            <div class="invitation-card-style minimal-style">
                                <div class="minimal-border"></div>
                                <div class="card-inner">
                                    <div class="minimal-serif">M</div>
                                    <h1 class="couple-names-display">${eventTitle}</h1>
                                    <p class="guest-message-display">"${mensagem}"</p>
                                    <div class="minimal-date-box">
                                        <span class="line"></span>
                                        <span class="minimal-date">${eventDateFormatted}</span>
                                        <span class="line"></span>
                                    </div>
                                    <div class="minimal-footer">Com amor e alegria</div>
                                </div>
                            </div>
                        </div>
                        <div class="convite-card-footer">
                            <h3>De: ${g.guest_name}</h3>
                            <span>${g.guest_email || g.guest_phone || 'Contato não informado'} • Confirmado em ${dataEnvio}</span>
                        </div>
                    </div>
                `;
            } else {
                // Classic
                cardHtml = `
                    <div class="convite-container-wrapper">
                        <div class="invitation-preview-container classic">
                            <div class="invitation-card-style classic-style">
                                <div class="floral-frame border-top-left"></div>
                                <div class="floral-frame border-top-right"></div>
                                <div class="floral-frame border-bottom-left"></div>
                                <div class="floral-frame border-bottom-right"></div>
                                <div class="card-inner">
                                    <span class="card-tagline">Save the Date</span>
                                    <h1 class="couple-names-display">${eventTitle}</h1>
                                    <div class="classic-divider">❦</div>
                                    <p class="guest-message-display">"${mensagem}"</p>
                                    <div class="card-details">
                                        <div class="date-badge">${eventDateFormatted}</div>
                                        <div class="location-badge">Presença Confirmada</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="convite-card-footer">
                            <h3>De: ${g.guest_name}</h3>
                            <span>${g.guest_email || g.guest_phone || 'Contato não informado'} • Confirmado em ${dataEnvio}</span>
                        </div>
                    </div>
                `;
            }

            convitesGrid.innerHTML += cardHtml;
        });
    }

    // Modal de Manutenção e Novo Evento
    const btnCriarNovoEvento = document.getElementById('btnCriarNovoEvento');
    if (btnCriarNovoEvento) {
        btnCriarNovoEvento.addEventListener('click', () => {
            abrirPopupManutencao("Criar Novo Evento");
        });
    }

    function abrirPopupManutencao(nomeRecurso) {
        const modal = document.getElementById('modalManutencao');
        const nomeRecursoEl = document.getElementById('nomeRecurso');
        if (modal && nomeRecursoEl) {
            nomeRecursoEl.innerText = `${nomeRecurso} em Desenvolvimento`;
            modal.style.display = 'flex';
        }
    }

    const btnFecharManutencao = document.getElementById('btnFecharManutencao');
    const btnOkManutencao = document.getElementById('btnOkManutencao');
    const modal = document.getElementById('modalManutencao');

    const fechar = () => {
        if (modal) modal.style.display = 'none';
    };

    if (btnFecharManutencao) btnFecharManutencao.addEventListener('click', fechar);
    if (btnOkManutencao) btnOkManutencao.addEventListener('click', fechar);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) fechar();
        });
    }

    loadEvent();
});
