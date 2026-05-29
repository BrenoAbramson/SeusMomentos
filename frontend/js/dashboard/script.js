document.addEventListener('DOMContentLoaded', async () => {
    
    // No ambiente real, pegar da sessão/localStorage. Mock = 1.
    const userId = localStorage.getItem('user_id') || 1;
    let currentEventId = null;
    let eventSlug = '';
    let allGifts = [];
    let saldoResgatar = 0;
    let eventPlan = 'free';

    // Referências DOM
    const statConfirmados = document.getElementById('statConfirmados');
    const statPendentes = document.getElementById('statPendentes');
    const statTotal = document.getElementById('statTotal');
    const statValor = document.getElementById('statValor');
    const guestsTableBody = document.getElementById('guestsTableBody');
    const eventoTitulo = document.getElementById('eventoTitulo');
    const linkSitePublico = document.getElementById('linkSitePublico');
    const btnCopiarLink = document.getElementById('btnCopiarLink');
    const buscaConvidado = document.getElementById('buscaConvidado');
    
    function finishLoading() {
        document.body.classList.remove('is-loading');
    }

    function parsePostgresArray(pgArrayStr) {
        if (!pgArrayStr) return [];
        if (Array.isArray(pgArrayStr)) return pgArrayStr;
        const clean = pgArrayStr.replace(/[{}]/g, '').trim();
        if (clean === '') return [];
        return clean.split(',').map(Number);
    }

    function formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    // 1. Carregar o Evento do Usuário
    async function loadEvent() {
        try {
            const res = await fetch(`${window.API_BASE_URL}/events?user_id=${userId}`);
            const data = await res.json();
            
            if(data.status === 'success' && data.data.events.length > 0) {
                // Pega o primeiro evento (o mais recente)
                const evento = data.data.events[0];
                currentEventId = evento.id;
                eventSlug = evento.slug;
                eventPlan = evento.plan || 'free';
                
                const basePath = window.location.pathname.substring(0, window.location.pathname.indexOf('/pages/dashboard/'));
                const urlCompleta = window.location.origin + basePath + '/pages/public/index.php?' + eventSlug;
                
                // Capitalizar primeira letra
                let typeFmt = evento.event_type.replace('_', ' ');
                eventoTitulo.innerText = "Meu " + typeFmt.charAt(0).toUpperCase() + typeFmt.slice(1);
                
                linkSitePublico.href = urlCompleta;
                linkSitePublico.innerText = '/' + eventSlug;

                // Atualizar o link no menu lateral para apontar sempre para a casca unificada do editor
                document.getElementById('linkEditarTemplate').href = `../template/index.html?event_id=${currentEventId}`;
                
                loadGuests(currentEventId);
            } else {
                mostrarAlerta('Nenhum evento encontrado. Crie um novo evento.', 'aviso');
                finishLoading();
            }
        } catch(e) {
            console.error(e);
            mostrarAlerta('Erro ao carregar dados do evento', 'erro');
            finishLoading();
        }
    }

    // 2. Carregar Convidados
    async function loadGuests(eventId) {
        try {
            // Primeiro, carregar os presentes do evento
            const giftsRes = await fetch(`${window.API_BASE_URL}/gifts?event_id=${eventId}`);
            const giftsData = await giftsRes.json();
            if (giftsData.status === 'success') {
                allGifts = giftsData.data.gifts || [];
            }

            const res = await fetch(`${window.API_BASE_URL}/guests?event_id=${eventId}`);
            const data = await res.json();
            
            if(data.status === 'success') {
                renderStats(data.data.guests);
                renderTable(data.data.guests);
                setupSearch(data.data.guests);
            }
            finishLoading();
        } catch(e) {
            console.error(e);
            mostrarAlerta('Erro ao carregar convidados', 'erro');
            finishLoading();
        }
    }

    function renderStats(guests) {
        let confirmados = 0;
        let pendentes = 0;
        let arrecadado = 0;

        // Mapeia os valores dos presentes por ID
        const giftValues = {};
        allGifts.forEach(gift => {
            giftValues[gift.id] = Number(gift.gift_value || 0);
        });
        
        guests.forEach(g => {
            if(g.confirmed_presence) confirmados++;
            else pendentes++;

            if(g.payment_status === 'PAID') {
                const giftIds = parsePostgresArray(g.selected_gift_ids);
                giftIds.forEach(giftId => {
                    arrecadado += giftValues[giftId] || 0;
                });
            }
        });

        const rateMultiplier = eventPlan === 'premium' ? 0.99 : 0.97;
        const saldoDisponivel = arrecadado * rateMultiplier;
        saldoResgatar = saldoDisponivel;

        if (statConfirmados) statConfirmados.innerText = confirmados;
        if (statPendentes) statPendentes.innerText = pendentes;
        if (statTotal) statTotal.innerText = guests.length;
        if (statValor) statValor.innerText = formatarMoeda(saldoDisponivel);
    }

    function renderTable(guests) {
        guestsTableBody.innerHTML = '';
        
        if(guests.length === 0) {
            guestsTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum convidado confirmou ainda. Compartilhe seu link!</td></tr>';
            return;
        }

        guests.forEach(g => {
            let statusBadge = g.confirmed_presence ? '<span class="badge success">Confirmado</span>' : '<span class="badge pending">Pendente</span>';
            let payBadge = '';
            
            if(g.payment_status === 'PAID') payBadge = '<span class="badge success">Pago</span>';
            else if(g.payment_status === 'PENDING') payBadge = '<span class="badge pending">Aguardando</span>';
            else payBadge = '<span class="badge danger">Cancelado</span>';

            let msg = g.custom_message ? `<i>"${g.custom_message}"</i>` : '<span style="color:#94A3B8">-</span>';

            const giftIds = parsePostgresArray(g.selected_gift_ids);
            const giftCountText = giftIds.length > 0 
                ? giftIds.length + (giftIds.length === 1 ? ' presente' : ' presentes') 
                : 'Nenhum';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${g.guest_name}</strong><br><small style="color:#64748B">${g.guest_email || g.guest_phone}</small></td>
                <td>${statusBadge}</td>
                <td>${giftCountText}</td>
                <td>${payBadge}</td>
                <td>${msg}</td>
            `;
            tr.addEventListener('click', () => abrirPopupDetalhesConvidado(g));
            guestsTableBody.appendChild(tr);
        });
    }

    // Busca rápida
    function setupSearch(guests) {
        buscaConvidado.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtrados = guests.filter(g => g.guest_name.toLowerCase().includes(term));
            renderTable(filtrados);
        });
    }

    // Copiar Link
    btnCopiarLink.addEventListener('click', () => {
        if(linkSitePublico.href) {
            navigator.clipboard.writeText(linkSitePublico.href);
            mostrarAlerta('Link copiado para a área de transferência!', 'sucesso');
        }
    });

    const btnResgatarSaldo = document.getElementById('btnResgatarSaldo');
    if (btnResgatarSaldo) {
        btnResgatarSaldo.addEventListener('click', abrirPopupResgatePix);
    }

    document.getElementById('btnCriarNovoEvento').addEventListener('click', () => {
        abrirPopupManutencao("Criar Novo Evento");
    });

    // Helper Alerta
    function mostrarAlerta(msg, tipo) {
        const div = document.getElementById('alerta');
        document.getElementById('alerta-texto').innerText = msg;
        div.className = 'alerta show ' + tipo;
        setTimeout(() => div.classList.remove('show'), 3000);
    }

    // Modal de Detalhes do Convidado
    function abrirPopupDetalhesConvidado(guest) {
        const giftIds = parsePostgresArray(guest.selected_gift_ids);
        const selectedGifts = allGifts.filter(g => giftIds.includes(g.id));

        let giftsListHtml = '';
        if (selectedGifts.length === 0) {
            giftsListHtml = '<p style="color:#64748B; font-size:14px; font-style:italic;">Nenhum presente foi selecionado por este convidado.</p>';
        } else {
            selectedGifts.forEach(gift => {
                giftsListHtml += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; margin-bottom:8px;">
                        <span style="font-size:14px; font-weight:600; color:#0F172A;">${gift.gift_name}</span>
                        <span style="font-size:14px; font-weight:700; color:#149CB8;">${formatarMoeda(gift.gift_value)}</span>
                    </div>
                `;
            });
        }

        const msg = guest.custom_message ? `"${guest.custom_message}"` : 'Nenhuma mensagem deixada.';
        const statusBadge = guest.confirmed_presence ? '<span class="badge success">Presença Confirmada</span>' : '<span class="badge pending">Presença Pendente</span>';
        const payBadge = guest.payment_status === 'PAID' 
            ? '<span class="badge success">Pago</span>' 
            : (guest.payment_status === 'PENDING' ? '<span class="badge pending">Aguardando Pagamento</span>' : '<span class="badge danger">Cancelado</span>');

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalhes do Convidado</h3>
                    <button class="modal-close-btn">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 80vh; overflow-y: auto;">
                    <div>
                        <h4 style="margin: 0 0 4px 0; font-size: 18px; color: #0F172A;">${guest.guest_name}</h4>
                        <p style="margin: 0; font-size: 14px; color: #64748B;">${guest.guest_email || 'Sem e-mail'} | ${guest.guest_phone || 'Sem telefone'}</p>
                    </div>
                    
                    <div style="display:flex; gap:12px; margin-top:4px;">
                        <div>${statusBadge}</div>
                        <div>${payBadge}</div>
                    </div>
                    
                    <div style="border-top:1px solid #E2E8F0; padding-top:16px;">
                        <h5 style="margin:0 0 8px 0; font-size:12px; text-transform:uppercase; color:#64748B; letter-spacing:0.5px;">Mensagem para o Casal</h5>
                        <p style="margin:0; font-size:14px; color:#475569; font-style:italic; background:#F8FAFC; padding:12px; border-radius:8px; border:1px solid #E2E8F0;">${msg}</p>
                    </div>
                    
                    <div style="border-top:1px solid #E2E8F0; padding-top:16px; margin-bottom: 8px;">
                        <h5 style="margin:0 0 12px 0; font-size:12px; text-transform:uppercase; color:#64748B; letter-spacing:0.5px;">Presentes Selecionados</h5>
                        ${giftsListHtml}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const fechar = () => {
            document.body.removeChild(overlay);
        };

        overlay.querySelector('.modal-close-btn').addEventListener('click', fechar);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar();
        });
    }

    // Modal de Resgate Pix
    function abrirPopupResgatePix() {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Resgatar Saldo (Pix)</h3>
                    <button class="modal-close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background:linear-gradient(135deg, #149CB8 0%, #0F768C 100%); color:white; padding:20px; border-radius:12px; text-align:center; box-shadow:0 4px 12px rgba(20,156,184,0.15); margin-bottom: 8px;">
                        <span style="font-size:12px; text-transform:uppercase; letter-spacing:0.5px; opacity:0.9;">Saldo Disponível (${eventPlan === 'premium' ? '99%' : '97%'} Líquido)</span>
                        <h4 style="margin:6px 0 0 0; font-size:28px; font-weight:700;">${formatarMoeda(saldoResgatar)}</h4>
                    </div>

                    <form id="pixRescueForm" style="display:flex; flex-direction:column; gap:16px; margin-top:8px;">
                        <div class="pix-form-group">
                            <label for="pixType">Tipo de Chave Pix</label>
                            <select id="pixType" required>
                                <option value="cpf">CPF</option>
                                <option value="cnpj">CNPJ</option>
                                <option value="email">E-mail</option>
                                <option value="celular">Celular</option>
                                <option value="aleatoria">Chave Aleatória</option>
                            </select>
                        </div>
                        <div class="pix-form-group">
                            <label for="pixKey">Chave Pix</label>
                            <input type="text" id="pixKey" placeholder="000.000.000-00" required>
                        </div>
                        <div class="pix-form-group">
                            <label for="rescueValue">Valor do Resgate</label>
                            <input type="number" step="0.01" min="1.00" max="${saldoResgatar}" id="rescueValue" value="${saldoResgatar.toFixed(2)}" required>
                        </div>
                        <button type="submit" class="btn-save" style="margin-top:8px; background:#149CB8; color:white; border:none; padding:14px; border-radius:8px; font-weight:700; cursor:pointer; font-size:15px; transition:0.2s;">Concluir Resgate</button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const fechar = () => {
            document.body.removeChild(overlay);
        };

        overlay.querySelector('.modal-close-btn').addEventListener('click', fechar);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar();
        });

        const pixType = overlay.querySelector('#pixType');
        const pixKey = overlay.querySelector('#pixKey');
        const form = overlay.querySelector('#pixRescueForm');

        pixType.addEventListener('change', () => {
            pixKey.value = '';
            if (pixType.value === 'cpf') {
                pixKey.placeholder = '000.000.000-00';
            } else if (pixType.value === 'cnpj') {
                pixKey.placeholder = '00.000.000/0000-00';
            } else if (pixType.value === 'celular') {
                pixKey.placeholder = '(00) 90000-0000';
            } else if (pixType.value === 'email') {
                pixKey.placeholder = 'exemplo@email.com';
            } else {
                pixKey.placeholder = 'Insira a chave aleatória';
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const val = parseFloat(overlay.querySelector('#rescueValue').value);
            if (val <= 0 || isNaN(val)) {
                alert('Insira um valor de resgate válido.');
                return;
            }
            if (val > saldoResgatar) {
                alert('O valor de resgate não pode ser maior do que o saldo disponível.');
                return;
            }
            if (!pixKey.value.trim()) {
                alert('Por favor, insira a chave Pix.');
                return;
            }

            fechar();
            mostrarAlerta(`Solicitação de resgate de ${formatarMoeda(val)} enviada! O valor será creditado na chave Pix informada em até 24 horas úteis.`, 'sucesso');
        });
    }

    loadEvent();

    // Modal de Manutenção
    function abrirPopupManutencao(nomeRecurso) {
        if (document.getElementById('modalManutencao')) return;

        const overlay = document.createElement('div');
        overlay.id = 'modalManutencao';
        overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:10000; animation:fadeIn 0.2s ease-out;";

        const content = document.createElement('div');
        content.style = "background:#FFFFFF; border-radius:16px; width:90%; max-width:400px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); overflow:hidden; display:flex; flex-direction:column; animation:scaleIn 0.2s ease-out;";

        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-bottom:1px solid #E2E8F0; background:#F8FAFC;">
                <h3 style="margin:0; font-size:16px; font-weight:700; color:#0F172A; font-family:'Manrope',sans-serif;">Aviso do Sistema</h3>
                <button id="btnFecharManutencao" style="background:none; border:none; font-size:20px; cursor:pointer; color:#64748B; font-weight:700; display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; transition:0.2s;">&times;</button>
            </div>
            <div style="padding:24px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px;">
                <div style="font-size:40px;">🛠️</div>
                <h4 style="margin:0; font-size:18px; font-weight:700; color:#0F172A; font-family:'Playfair Display',serif;">${nomeRecurso} em Desenvolvimento</h4>
                <p style="margin:0; font-size:14px; line-height:1.6; color:#64748B; font-family:'Manrope',sans-serif;">Esta funcionalidade está em desenvolvimento ou em manutenção temporária. Por favor, tente novamente mais tarde.</p>
                <button id="btnOkManutencao" style="margin-top:8px; width:100%; padding:12px; background:#149CB8; color:white; border:none; border-radius:8px; font-weight:700; cursor:pointer; transition:0.2s; font-family:'Manrope',sans-serif;">Entendido</button>
            </div>
        `;

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        const styleTag = document.createElement('style');
        styleTag.innerHTML = `
            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
            @keyframes scaleIn { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }
            #btnFecharManutencao:hover { background:#E2E8F0; color:#0F172A; }
            #btnOkManutencao:hover { background:#10829A; }
        `;
        document.head.appendChild(styleTag);

        const fechar = () => {
            document.body.removeChild(overlay);
            document.head.removeChild(styleTag);
        };

        document.getElementById('btnFecharManutencao').addEventListener('click', fechar);
        document.getElementById('btnOkManutencao').addEventListener('click', fechar);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar();
        });
    }
});
