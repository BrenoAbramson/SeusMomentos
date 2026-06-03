document.addEventListener('DOMContentLoaded', () => {
    // Para simplificar a demonstração, assumiremos user_id estático se não houver um real.
    // Numa integração real, viria do localStorage ou token.
    const userId = localStorage.getItem('user_id') || 1; 

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const step4 = document.getElementById('step4');

    const typeCards = document.querySelectorAll('.type-card');
    const btnNext1 = document.getElementById('btnNext1');
    const btnNext2 = document.getElementById('btnNext2');
    const btnNext3 = document.getElementById('btnNext3');
    const btnBack1 = document.getElementById('btnBack1');
    const btnBack2 = document.getElementById('btnBack2');
    const btnBack3 = document.getElementById('btnBack3');
    const btnSubmit = document.getElementById('btnSubmit');

    const fieldsCasamento = document.getElementById('fieldsCasamento');
    const fields15Anos = document.getElementById('fields15Anos');
    const customUrlGroup = document.getElementById('customUrlGroup');
    const customUrlInput = document.getElementById('customUrl');
    const planCards = document.querySelectorAll('.plan-card');

    let selectedType = null;
    let selectedPlan = null;

    // Define a data mínima do evento para posterior ao dia de amanhã (a partir de depois de amanhã)
    const dataEventoInput = document.getElementById('dataEvento');
    if (dataEventoInput) {
        const hoje = new Date();
        const depoisDeAmanha = new Date(hoje);
        depoisDeAmanha.setDate(hoje.getDate() + 2);
        const yyyy = depoisDeAmanha.getFullYear();
        const mm = String(depoisDeAmanha.getMonth() + 1).padStart(2, '0');
        const dd = String(depoisDeAmanha.getDate()).padStart(2, '0');
        dataEventoInput.min = `${yyyy}-${mm}-${dd}`;
    }

    // Seleção de Tipo
    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.dataset.type === '15_anos') {
                abrirPopupManutencao("Festa de 15 Anos");
                return;
            }
            typeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedType = card.dataset.type;
            btnNext1.disabled = false;
        });
    });

    // Navegação Passo 1 -> Passo 2
    btnNext1.addEventListener('click', () => {
        if (!selectedType) return;
        
        step1.classList.remove('active');
        step2.classList.add('active');

        if (selectedType === 'casamento') {
            fieldsCasamento.style.display = 'block';
            fields15Anos.style.display = 'none';
        } else {
            fieldsCasamento.style.display = 'none';
            fields15Anos.style.display = 'block';
        }
    });

    // Navegação Passo 2 -> Passo 1
    btnBack1.addEventListener('click', () => {
        step2.classList.remove('active');
        step1.classList.add('active');
    });

    // Navegação Passo 2 -> Passo 3
    btnNext2.addEventListener('click', () => {
        // Validação simples
        if (selectedType === 'casamento') {
            if (!document.getElementById('nome1').value || !document.getElementById('nome2').value) {
                return mostrarAlerta('Preencha os nomes dos anfitriões', 'erro');
            }
        } else {
            if (!document.getElementById('nomeAniversariante').value) {
                return mostrarAlerta('Preencha o nome do aniversariante', 'erro');
            }
        }
        
        step2.classList.remove('active');
        step3.classList.add('active');
    });

    // Navegação Passo 3 -> Passo 2
    btnBack2.addEventListener('click', () => {
        step3.classList.remove('active');
        step2.classList.add('active');
    });

    // Navegação Passo 3 -> Passo 4
    btnNext3.addEventListener('click', () => {
        const dataEvento = document.getElementById('dataEvento').value;
        if (!dataEvento) {
            return mostrarAlerta('Por favor, informe a data do evento.', 'erro');
        }

        const dataSelecionada = new Date(dataEvento + 'T00:00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const limite = new Date(hoje);
        limite.setDate(hoje.getDate() + 1); // amanhã

        if (dataSelecionada <= limite) {
            return mostrarAlerta('A data do casamento deve ser posterior ao dia de amanhã.', 'erro');
        }

        step3.classList.remove('active');
        step4.classList.add('active');
    });

    // Navegação Passo 4 -> Passo 3
    btnBack3.addEventListener('click', () => {
        step4.classList.remove('active');
        step3.classList.add('active');
    });

    // Seleção de Plano
    planCards.forEach(card => {
        card.addEventListener('click', () => {
            planCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedPlan = card.dataset.plan;
            btnSubmit.disabled = false;

            if (selectedPlan === 'premium') {
                customUrlGroup.style.display = 'block';
            } else {
                customUrlGroup.style.display = 'none';
                customUrlInput.value = '';
            }
        });
    });

    // Submissão do Formulário
    document.getElementById('onboardingForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const dataEvento = document.getElementById('dataEvento').value;
        const localEvento = document.getElementById('localEvento').value;

        if (!dataEvento) {
            return mostrarAlerta('Por favor, informe a data do evento.', 'erro');
        }

        const dataSelecionada = new Date(dataEvento + 'T00:00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const limite = new Date(hoje);
        limite.setDate(hoje.getDate() + 1); // amanhã

        if (dataSelecionada <= limite) {
            return mostrarAlerta('A data do casamento deve ser posterior ao dia de amanhã.', 'erro');
        }

        if (!selectedPlan) {
            return mostrarAlerta('Por favor, selecione um plano.', 'erro');
        }

        let customSlug = null;
        if (selectedPlan === 'premium') {
            customSlug = customUrlInput.value.trim();
            if (!customSlug) {
                return mostrarAlerta('Por favor, informe a URL personalizada desejada.', 'erro');
            }
            // Apenas letras minúsculas, números, hifens e &
            if (!/^[a-z0-9\-&]+$/.test(customSlug)) {
                return mostrarAlerta('A URL personalizada só pode conter letras minúsculas, números, hifens e &.', 'erro');
            }
        }

        btnSubmit.disabled = true;
        btnSubmit.innerText = 'Criando...';

        let people = [];
        if (selectedType === 'casamento') {
            people.push({ name: document.getElementById('nome1').value, role: 'pessoa1' });
            people.push({ name: document.getElementById('nome2').value, role: 'pessoa2' });
        } else {
            people.push({ name: document.getElementById('nomeAniversariante').value, role: 'aniversariante' });
        }

        const payload = {
            user_id: parseInt(userId),
            event_type: selectedType,
            event_date: dataEvento,
            location: localEvento,
            people: people,
            plan: selectedPlan,
            slug: customSlug
        };

        try {
            // Chamada para a API
            const response = await fetch(`${window.API_BASE_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                // Atualiza first_access para false no backend
                await fetch(`${window.API_BASE_URL}/auth/first-access`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId })
                });

                if (selectedPlan === 'premium') {
                    mostrarAlerta('Redirecionando para o Mercado Pago para ativação...', 'sucesso');
                    try {
                        const prefResponse = await fetch(`${window.API_BASE_URL}/payments/create-preference`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                event_id: result.data.event_id,
                                slug: result.data.slug,
                                title: "Plano Premium - Seus Momentos",
                                host: window.location.origin
                            })
                        });
                        const prefData = await prefResponse.json();
                        if (prefResponse.ok && prefData.data && prefData.data.sandbox_init_point) {
                            setTimeout(() => {
                                window.location.href = prefData.data.sandbox_init_point;
                            }, 1500);
                            return;
                        } else {
                            mostrarAlerta(prefData.message || 'Erro ao gerar pagamento. Redirecionando para templates...', 'erro');
                        }
                    } catch (prefErr) {
                        console.error('Erro ao conectar ao Mercado Pago:', prefErr);
                        mostrarAlerta('Erro de conexão ao gerar link de pagamento.', 'erro');
                    }
                }

                setTimeout(() => {
                    window.location.href = `../template_selection/index.html?event_id=${result.data.event_id}&slug=${result.data.slug}`;
                }, 1500);
            } else {
                mostrarAlerta(result.message || 'Erro ao criar evento', 'erro');
                btnSubmit.disabled = false;
                btnSubmit.innerText = 'Criar Meu Evento!';
            }
        } catch (err) {
            mostrarAlerta('Erro de conexão com a API', 'erro');
            btnSubmit.disabled = false;
            btnSubmit.innerText = 'Criar Meu Evento!';
        }
    });

    // Helper Alerta
    function mostrarAlerta(msg, tipo) {
        const div = document.getElementById('alerta');
        document.getElementById('alerta-texto').innerText = msg;
        div.className = 'alerta show ' + tipo;
        setTimeout(() => div.classList.remove('show'), 3000);
    }

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

    // Pré-seleciona o plano vindo da URL
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    if (planParam) {
        const targetCard = Array.from(planCards).find(c => c.dataset.plan === planParam);
        if (targetCard) {
            targetCard.click();
        }
    }
});
