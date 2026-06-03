document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('user_id') || 1;
    let currentEventId = null;
    let eventSlug = '';
    
    // Referências do DOM
    const giftsGrid = document.getElementById('giftsGrid');
    const giftsCount = document.getElementById('giftsCount');
    const eventoTitulo = document.getElementById('eventoTitulo');

    function finishLoading() {
        document.body.classList.remove('is-loading');
    }

    // 30 itens de casamento conforme imagem enviada e itens realistas
    const LISTA_MODELOS_CASAMENTO = [
        { name: "2 Passagens Aéreas para a Lua de Mel", value: 1922.36, image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=300&auto=format&fit=crop" },
        { name: "Abajur Decorativo", value: 254.81, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=300&auto=format&fit=crop" },
        { name: "Adega de Vinhos Climatizada", value: 1544.67, image: "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?q=80&w=300&auto=format&fit=crop" },
        { name: "Aluguel de Carro para a Lua de Mel", value: 1859.41, image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=300&auto=format&fit=crop" },
        { name: "Aparador em Madeira Jequitibá 200 cm", value: 1228.67, image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=300&auto=format&fit=crop" },
        { name: "Aparelho de Fondue Preto", value: 160.39, image: "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?q=80&w=300&auto=format&fit=crop" },
        { name: "Aparelho de Jantar Branco - 30 Peças", value: 752.77, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=300&auto=format&fit=crop" },
        { name: "Ar Condicionado Split Inverter 12000 BTUs", value: 2424.69, image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=300&auto=format&fit=crop" },
        { name: "Aspirador de Pó Vertical", value: 242.22, image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=300&auto=format&fit=crop" },
        { name: "Batedeira Planetária Inox", value: 589.90, image: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?q=80&w=300&auto=format&fit=crop" },
        { name: "Cafeteira Expresso Automática", value: 899.00, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop" },
        { name: "Jogo de Cama Egípcio - Casal", value: 450.00, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=300&auto=format&fit=crop" },
        { name: "Jogo de Panelas Antiaderente - 7 Peças", value: 380.00, image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=300&auto=format&fit=crop" },
        { name: "Liquidificador com Copo de Vidro", value: 199.90, image: "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?q=80&w=300&auto=format&fit=crop" },
        { name: "Micro-ondas Espelhado 30L", value: 680.00, image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=300&auto=format&fit=crop" },
        { name: "Fritadeira Elétrica Airfryer", value: 399.00, image: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?q=80&w=300&auto=format&fit=crop" },
        { name: "Aparelho de Fondue de Chocolate", value: 120.00, image: "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=300&auto=format&fit=crop" },
        { name: "Conjunto de Taças de Cristal (6 peças)", value: 180.00, image: "https://images.unsplash.com/photo-1571244856003-885e3a890457?q=80&w=300&auto=format&fit=crop" },
        { name: "Smart TV LED 55\" 4K", value: 2799.00, image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=300&auto=format&fit=crop" },
        { name: "Caixa de Som Inteligente com Alexa", value: 349.00, image: "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=300&auto=format&fit=crop" },
        { name: "Robô Aspirador de Pó Inteligente", value: 1200.00, image: "https://images.unsplash.com/photo-1589156229477-466aa820df31?q=80&w=300&auto=format&fit=crop" },
        { name: "Mesa de Cabeceira Industrial", value: 220.00, image: "https://images.unsplash.com/photo-1532372320978-9b4d8a3a8245?q=80&w=300&auto=format&fit=crop" },
        { name: "Câmera Instantânea Instax", value: 489.00, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=300&auto=format&fit=crop" },
        { name: "Conjunto de Churrasco com Maleta (18 pcs)", value: 170.00, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop" },
        { name: "Faqueiro em Aço Inox - 72 Peças", value: 340.00, image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=300&auto=format&fit=crop" },
        { name: "Quadro Decorativo Moderno", value: 150.00, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop" },
        { name: "Fim de Semana em Resort All Inclusive", value: 1500.00, image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=300&auto=format&fit=crop" },
        { name: "Jantar Romântico para o Casal", value: 250.00, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300&auto=format&fit=crop" },
        { name: "Espremedor de Frutas Automático", value: 130.00, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop" },
        { name: "Jogo de Toalhas de Banho (5 peças)", value: 210.00, image: "https://images.unsplash.com/photo-1616627547474-be041322f1d2?q=80&w=300&auto=format&fit=crop" }
    ];

    let presentesAtivosBanco = [];

    // Formata o valor monetário no padrão brasileiro
    function formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }

    // 1. Carregar Dados do Evento
    async function loadEvent() {
        try {
            const res = await fetch(`http://127.0.0.1:8080/events?user_id=${userId}`);
            const data = await res.json();
            
            if (data.status === 'success' && data.data.events.length > 0) {
                const evento = data.data.events[0];
                currentEventId = evento.id;
                eventSlug = evento.slug;
                
                let typeFmt = evento.event_type.replace('_', ' ');
                eventoTitulo.innerText = "Meu " + typeFmt.charAt(0).toUpperCase() + typeFmt.slice(1);

                // Configura o link de edição na sidebar
                document.getElementById('linkEditarTemplate').href = `../template/index.html?event_id=${currentEventId}`;
                
                await loadGifts();
            } else {
                mostrarAlerta('Nenhum evento ativo localizado.', 'aviso');
                finishLoading();
            }
        } catch(e) {
            console.error(e);
            mostrarAlerta('Erro ao carregar informações do evento', 'erro');
            finishLoading();
        }
    }

    // 2. Carregar Presentes Cadastrados no Banco
    async function loadGifts() {
        try {
            const res = await fetch(`http://127.0.0.1:8080/gifts?event_id=${currentEventId}`);
            const data = await res.json();
            
            if (data.status === 'success') {
                presentesAtivosBanco = data.data.gifts;
                renderGiftsList();
            }
            finishLoading();
        } catch(e) {
            console.error(e);
            mostrarAlerta('Erro ao consultar lista de presentes', 'erro');
            finishLoading();
        }
    }

    // 3. Renderizar a lista de 30 presentes na tela
    function renderGiftsList() {
        giftsGrid.innerHTML = '';
        let selecionadosCount = 0;

        LISTA_MODELOS_CASAMENTO.forEach((modelo, index) => {
            // Verifica se o presente com este mesmo nome já está ativo no banco
            const presenteBanco = presentesAtivosBanco.find(g => g.gift_name === modelo.name);
            const isSelected = !!presenteBanco;
            const dbId = presenteBanco ? presenteBanco.id : null;
            
            if (isSelected) selecionadosCount++;

            const card = document.createElement('div');
            card.className = `gift-selection-card ${isSelected ? 'selected' : ''}`;
            card.dataset.index = index;
            if (dbId) card.dataset.dbid = dbId;

            card.innerHTML = `
                <div class="gift-select-badge">✔</div>
                <div class="gift-card-image">
                    <img src="${modelo.image}" alt="${modelo.name}" onerror="this.src='../../assets/casamento/Mask Group.png'">
                </div>
                <div class="gift-card-body">
                    <h3>${modelo.name}</h3>
                    <div class="gift-card-value">${formatarMoeda(modelo.value)}</div>
                    <button class="btn-select-gift">
                        ${isSelected ? '✔ Selecionado' : 'Selecionar'}
                    </button>
                </div>
            `;

            // Adiciona o manipulador de clique para toggle de seleção
            const btn = card.querySelector('.btn-select-gift');
            btn.addEventListener('click', () => toggleGiftSelection(card, modelo));

            giftsGrid.appendChild(card);
        });

        giftsCount.innerText = `${selecionadosCount} selecionado(s)`;
    }

    // 4. Salvar/Deletar presente via API
    async function toggleGiftSelection(card, modelo) {
        const isSelected = card.classList.contains('selected');
        const dbId = card.dataset.dbid;
        const btn = card.querySelector('.btn-select-gift');

        if (isSelected && dbId) {
            // Desmarcar / Deletar do banco
            btn.innerText = "Removendo...";
            try {
                const res = await fetch(`http://127.0.0.1:8080/gifts?id=${dbId}`, {
                    method: 'DELETE'
                });
                const result = await res.json();
                
                if (res.ok || result.status === 'success') {
                    card.classList.remove('selected');
                    delete card.dataset.dbid;
                    btn.innerText = "Selecionar";
                    mostrarAlerta('Presente removido com sucesso!', 'sucesso');
                    
                    // Atualiza o cache local
                    presentesAtivosBanco = presentesAtivosBanco.filter(g => g.id != dbId);
                    atualizarContadorGeral();
                } else {
                    mostrarAlerta(result.message || 'Erro ao remover presente', 'erro');
                    btn.innerText = "✔ Selecionado";
                }
            } catch(e) {
                console.error(e);
                mostrarAlerta('Erro de conexão ao remover presente', 'erro');
                btn.innerText = "✔ Selecionado";
            }
        } else {
            // Selecionar / Salvar no banco
            btn.innerText = "Adicionando...";
            const payload = {
                event_id: currentEventId,
                gift_name: modelo.name,
                gift_value: parseFloat(modelo.value)
            };

            try {
                const res = await fetch('http://127.0.0.1:8080/gifts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();

                if (res.ok && result.status === 'success') {
                    const novoId = result.data.gift_id;
                    card.classList.add('selected');
                    card.dataset.dbid = novoId;
                    btn.innerText = "✔ Selecionado";
                    mostrarAlerta('Presente adicionado com sucesso!', 'sucesso');
                    
                    // Atualiza o cache local
                    presentesAtivosBanco.push({
                        id: novoId,
                        event_id: currentEventId,
                        gift_name: modelo.name,
                        gift_value: modelo.value,
                        enabled: true
                    });
                    atualizarContadorGeral();
                } else {
                    mostrarAlerta(result.message || 'Erro ao adicionar presente', 'erro');
                    btn.innerText = "Selecionar";
                }
            } catch(e) {
                console.error(e);
                mostrarAlerta('Erro de conexão ao adicionar presente', 'erro');
                btn.innerText = "Selecionar";
            }
        }
    }

    // Helper para atualizar o contador global sem re-renderizar todo o grid
    function atualizarContadorGeral() {
        const selecionados = document.querySelectorAll('.gift-selection-card.selected').length;
        giftsCount.innerText = `${selecionados} selecionado(s)`;
    }

    // Helper Alerta
    function mostrarAlerta(msg, tipo) {
        const div = document.getElementById('alerta');
        const txt = document.getElementById('alerta-texto');
        const icone = document.getElementById('alerta-icone');
        
        let iconeTxt = tipo === "sucesso" ? "✔" : (tipo === "erro" ? "✖" : "!");
        
        if(txt) txt.innerText = msg;
        if(icone) icone.innerText = iconeTxt;
        
        div.className = 'alerta show ' + tipo;
        setTimeout(() => div.classList.remove('show'), 3000);
    }

    // Botão de Novo Evento
    document.getElementById('btnCriarNovoEvento').addEventListener('click', () => {
        abrirPopupManutencao("Criar Novo Evento");
    });

    await loadEvent();

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
