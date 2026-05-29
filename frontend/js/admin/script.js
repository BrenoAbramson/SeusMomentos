document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verificação de Acesso (Segurança Básica no Frontend)
    const userRole = localStorage.getItem('user_role');
    const userId = localStorage.getItem('user_id');

    if (userRole !== 'ADMIN' || !userId) {
        localStorage.clear();
        window.location.href = '../login/index.html';
        return;
    }

    // Referências DOM - Navegação e Estrutura
    const menuDashboard = document.getElementById('menuDashboard');
    const menuUsers = document.getElementById('menuUsers');
    const menuTemplates = document.getElementById('menuTemplates');
    const sectionDashboard = document.getElementById('sectionDashboard');
    const sectionUsers = document.getElementById('sectionUsers');
    const sectionTemplates = document.getElementById('sectionTemplates');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');

    // Referências DOM - Métricas
    const statFreeUsers = document.getElementById('statFreeUsers');
    const statFreeCommission = document.getElementById('statFreeCommission');
    const statPremiumUsers = document.getElementById('statPremiumUsers');
    const statPremiumCommission = document.getElementById('statPremiumCommission');
    const statPlanRevenue = document.getElementById('statPlanRevenue');
    const statTotalCommission = document.getElementById('statTotalCommission');

    // Referências DOM - Usuários e Filtros
    const usersTableBody = document.getElementById('usersTableBody');
    const buscaUsuario = document.getElementById('buscaUsuario');
    const filtroPlano = document.getElementById('filtroPlano');
    const btnLogout = document.getElementById('btnLogout');

    // Variáveis de Estado
    let allUsers = [];
    let historyData = { registrations: [], revenues: [] };
    let chartRegInstance = null;
    let chartRevInstance = null;
    let currentPeriod = 'mes';

    // Helper de formatação de moeda BRL
    function formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    // Helper de formatação de data
    function formatarData(dataStr) {
        if (!dataStr) return '-';
        const data = new Date(dataStr);
        return data.toLocaleDateString('pt-BR');
    }

    // Finalizar o estado de carregamento
    function finishLoading() {
        document.body.classList.remove('is-loading');
    }

    // Exibir alertas
    function mostrarAlerta(msg, tipo) {
        const div = document.getElementById('alerta');
        document.getElementById('alerta-texto').innerText = msg;
        div.className = 'alerta show ' + tipo;
        setTimeout(() => div.classList.remove('show'), 4000);
    }

    // 2. Carregar dados do Painel Administrativo
    async function loadAdminData() {
        try {
            const res = await fetch(`${window.API_BASE_URL}/admin/dashboard?user_id=${userId}`);
            
            if (res.status === 403 || res.status === 401) {
                mostrarAlerta('Acesso negado pelo servidor.', 'erro');
                localStorage.clear();
                setTimeout(() => { window.location.href = '../login/index.html'; }, 2000);
                return;
            }

            const result = await res.json();
            
            if (result.status === 'success') {
                allUsers = result.data.users || [];
                historyData = result.data.metrics.history || { registrations: [], revenues: [] };
                
                renderMetrics(result.data.metrics);
                renderTable(allUsers);
                updateCharts();
                setupSearch();
                setupNavigation();
                setupPeriodFilters();
                setupTemplatesManagement();
                setupTemplateCategoryFilter();
            } else {
                mostrarAlerta(result.message || 'Erro ao carregar dados do painel.', 'erro');
            }
            finishLoading();
        } catch(e) {
            console.error(e);
            mostrarAlerta('Erro de conexão com o servidor de APIs', 'erro');
            finishLoading();
        }
    }

    // 3. Renderizar Métricas Principais
    function renderMetrics(metrics) {
        if (statFreeUsers) statFreeUsers.innerText = metrics.total_free_users;
        if (statFreeCommission) statFreeCommission.innerText = formatarMoeda(metrics.total_free_fee);
        if (statPremiumUsers) statPremiumUsers.innerText = metrics.total_premium_users;
        if (statPremiumCommission) statPremiumCommission.innerText = formatarMoeda(metrics.total_premium_fee);
        if (statPlanRevenue) statPlanRevenue.innerText = formatarMoeda(metrics.total_plan_revenue);
        if (statTotalCommission) statTotalCommission.innerText = formatarMoeda(metrics.total_system_fee);
    }

    // 4. Renderizar Tabela de Usuários
    function renderTable(users) {
        usersTableBody.innerHTML = '';

        if (users.length === 0) {
            usersTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748B;">Nenhum usuário cliente encontrado no sistema.</td></tr>';
            return;
        }

        users.forEach(user => {
            const dataCadastro = formatarData(user.criado_em);
            const brutoFmt = formatarMoeda(user.total_collected_gross);
            const liquidoFmt = formatarMoeda(user.total_collected_net);
            const comissaoFmt = formatarMoeda(user.system_fee_collected);

            let acoesHtml = '<span style="color:#94A3B8; font-style:italic;">Não criado</span>';
            if (user.event_slug) {
                const basePath = window.location.pathname.substring(0, window.location.pathname.indexOf('/pages/admin/'));
                const urlCompleta = window.location.origin + basePath + '/pages/public/index.php?' + user.event_slug;
                acoesHtml = `<a href="${urlCompleta}" target="_blank" class="action-link">Ver Site ↗</a>`;
            }

            const planBadge = user.event_plan === 'premium' 
                ? '<span class="badge success" style="background:#E0F2FE; color:#0369A1; font-size:12px; padding:4px 8px; font-weight:700; border-radius:4px;">Premium</span>'
                : '<span class="badge pending" style="background:#F1F5F9; color:#475569; font-size:12px; padding:4px 8px; font-weight:700; border-radius:4px;">Grátis</span>';
            const ratePercent = user.event_plan === 'premium' ? 99 : 97;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong>${user.nome}</strong><br>
                    <small style="color:#64748B; font-size:12px;">${user.email}</small><br>
                    <small style="color:#94A3B8; font-size:11px;">Cadastrado em: ${dataCadastro}</small>
                </td>
                <td>
                    ${planBadge}
                </td>
                <td>
                    <span class="badge success" style="display:inline-flex; align-items:center; gap:4px;">
                        👥 ${user.confirmed_guests_count}
                    </span>
                </td>
                <td>
                    <span style="font-weight:600; color:#0F172A;">Bruto: ${brutoFmt}</span><br>
                    <span style="color:#16A34A; font-size:12px; font-weight:700;">Líquido (${ratePercent}%): ${liquidoFmt}</span>
                </td>
                <td>
                    <span style="font-weight:700; color:#149CB8;">${comissaoFmt}</span>
                </td>
                <td>
                    ${acoesHtml}
                </td>
            `;
            usersTableBody.appendChild(tr);
        });
    }

    // 5. Configurar Filtros Dinâmicos (Nome e Plano) na aba de Gerenciar Usuários
    function setupSearch() {
        function aplicarFiltros() {
            const term = buscaUsuario.value.toLowerCase().trim();
            const planoSelecionado = filtroPlano.value;

            const filtered = allUsers.filter(user => {
                const nomeMatch = user.nome.toLowerCase().includes(term);
                const planoUser = user.event_plan === 'premium' ? 'premium' : 'free';
                const planoMatch = (planoSelecionado === 'all') || (planoUser === planoSelecionado);
                return nomeMatch && planoMatch;
            });

            renderTable(filtered);
        }

        buscaUsuario.addEventListener('input', aplicarFiltros);
        filtroPlano.addEventListener('change', aplicarFiltros);
    }

    // 6. Navegação entre Abas (Dashboard vs Usuários vs Templates)
    function setupNavigation() {
        menuDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            menuDashboard.classList.add('active');
            menuUsers.classList.remove('active');
            menuTemplates.classList.remove('active');
            sectionDashboard.classList.remove('hidden');
            sectionUsers.classList.add('hidden');
            sectionTemplates.classList.add('hidden');
            pageTitle.innerText = "Dashboard";
            pageSubtitle.innerText = "Métricas e gráficos consolidados do sistema";
        });

        menuUsers.addEventListener('click', (e) => {
            e.preventDefault();
            menuUsers.classList.add('active');
            menuDashboard.classList.remove('active');
            menuTemplates.classList.remove('active');
            sectionUsers.classList.remove('hidden');
            sectionDashboard.classList.add('hidden');
            sectionTemplates.classList.add('hidden');
            pageTitle.innerText = "Gerenciar Usuários";
            pageSubtitle.innerText = "Visualização e controle de usuários cadastrados";
        });

        menuTemplates.addEventListener('click', (e) => {
            e.preventDefault();
            menuTemplates.classList.add('active');
            menuDashboard.classList.remove('active');
            menuUsers.classList.remove('active');
            sectionTemplates.classList.remove('hidden');
            sectionDashboard.classList.add('hidden');
            sectionUsers.classList.add('hidden');
            pageTitle.innerText = "Templates de Evento";
            pageSubtitle.innerText = "Gerencie a ativação dos modelos disponíveis para os usuários";
        });
    }

    // 10. Gerenciamento de ativação do template
    function setupTemplatesManagement() {
        const btnToggle = document.getElementById('btnToggleTemplateCasamento');
        if (!btnToggle) return;

        function updateButtonState() {
            const isCasamentoActive = localStorage.getItem('template_casamento_active') !== 'false';
            if (isCasamentoActive) {
                btnToggle.innerText = '✔ Ativo (Clique para Desativar)';
                btnToggle.style.background = '#149CB8';
                btnToggle.style.color = 'white';
                btnToggle.style.border = 'none';
            } else {
                btnToggle.innerText = '❌ Inativo (Clique para Ativar)';
                btnToggle.style.background = '#F1F5F9';
                btnToggle.style.color = '#64748B';
                btnToggle.style.border = '1px solid #E2E8F0';
            }
        }

        btnToggle.addEventListener('click', () => {
            const isCasamentoActive = localStorage.getItem('template_casamento_active') !== 'false';
            localStorage.setItem('template_casamento_active', isCasamentoActive ? 'false' : 'true');
            updateButtonState();
            mostrarAlerta(
                isCasamentoActive ? 'Template Casamento Classic desativado!' : 'Template Casamento Classic ativado!',
                isCasamentoActive ? 'erro' : 'sucesso'
            );
        });

        // Inicializa o estado do botão
        updateButtonState();
    }

    // 11. Filtro de Categorias de Templates
    function setupTemplateCategoryFilter() {
        const selectFiltro = document.getElementById('filtroCategoriaTemplate');
        if (!selectFiltro) return;

        const cards = document.querySelectorAll('.template-card-item');
        const container = document.getElementById('templatesGridAdmin');

        selectFiltro.addEventListener('change', () => {
            const categoriaSelecionada = selectFiltro.value;
            let countVisible = 0;

            cards.forEach(card => {
                const categoriaCard = card.dataset.category;
                if (categoriaSelecionada === 'all' || categoriaCard === categoriaSelecionada) {
                    card.style.display = 'flex';
                    countVisible++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Remover mensagem de erro antiga se existir
            const oldMsg = document.getElementById('emptyTemplatesMsgAdmin');
            if (oldMsg) oldMsg.remove();

            // Se nenhum template for visível, mostra a mensagem
            if (countVisible === 0 && container) {
                const emptyMsg = document.createElement('div');
                emptyMsg.id = 'emptyTemplatesMsgAdmin';
                emptyMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; color: #64748B; padding: 40px 0; font-weight: 500; width: 100%;';
                emptyMsg.innerText = 'Nenhum template cadastrado nesta categoria.';
                container.appendChild(emptyMsg);
            }
        });
    }

    // 7. Configuração dos Filtros Temporais do Dashboard
    function setupPeriodFilters() {
        const botoes = document.querySelectorAll('.btn-periodo');
        botoes.forEach(btn => {
            btn.addEventListener('click', () => {
                botoes.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPeriod = btn.dataset.periodo;
                updateCharts();
            });
        });
    }

    // 8. Lógica de Agrupamento Temporal e Atualização dos Gráficos
    function parseDate(dateStr) {
        if (!dateStr) return null;
        return new Date(dateStr.replace(' ', 'T'));
    }

    function getDayString(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function groupDataForCharts() {
        const now = new Date();
        const registrations = historyData.registrations || [];
        const revenues = historyData.revenues || [];

        let labels = [];
        let regFree = [];
        let regPremium = [];
        let revFree = [];
        let revPremium = [];

        if (currentPeriod === 'mes') {
            // Últimos 30 dias agrupados por dia
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const dateStr = getDayString(d);
                const label = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
                labels.push(label);

                const regs = registrations.filter(r => getDayString(parseDate(r.date)) === dateStr);
                regFree.push(regs.filter(r => r.plan === 'free').length);
                regPremium.push(regs.filter(r => r.plan === 'premium').length);

                const revs = revenues.filter(r => getDayString(parseDate(r.date)) === dateStr);
                revFree.push(revs.filter(r => r.plan === 'free').reduce((acc, r) => acc + r.fee, 0));
                revPremium.push(revs.filter(r => r.plan === 'premium').reduce((acc, r) => acc + r.fee, 0));
            }
        } else if (currentPeriod === 'bimestre') {
            // Últimos 60 dias agrupados em 8 semanas
            for (let i = 7; i >= 0; i--) {
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7 + 6));
                const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
                const label = `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
                labels.push(label);

                const regs = registrations.filter(r => {
                    const d = parseDate(r.date);
                    return d >= start && d <= new Date(end.getTime() + 24 * 60 * 60 * 1000);
                });
                regFree.push(regs.filter(r => r.plan === 'free').length);
                regPremium.push(regs.filter(r => r.plan === 'premium').length);

                const revs = revenues.filter(r => {
                    const d = parseDate(r.date);
                    return d >= start && d <= new Date(end.getTime() + 24 * 60 * 60 * 1000);
                });
                revFree.push(revs.filter(r => r.plan === 'free').reduce((acc, r) => acc + r.fee, 0));
                revPremium.push(revs.filter(r => r.plan === 'premium').reduce((acc, r) => acc + r.fee, 0));
            }
        } else if (currentPeriod === 'semestre') {
            // Últimos 6 meses agrupados por mês
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
                labels.push(label);

                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

                const regs = registrations.filter(r => {
                    const rd = parseDate(r.date);
                    return rd && `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, '0')}` === monthKey;
                });
                regFree.push(regs.filter(r => r.plan === 'free').length);
                regPremium.push(regs.filter(r => r.plan === 'premium').length);

                const revs = revenues.filter(r => {
                    const rd = parseDate(r.date);
                    return rd && `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, '0')}` === monthKey;
                });
                revFree.push(revs.filter(r => r.plan === 'free').reduce((acc, r) => acc + r.fee, 0));
                revPremium.push(revs.filter(r => r.plan === 'premium').reduce((acc, r) => acc + r.fee, 0));
            }
        } else if (currentPeriod === 'ano') {
            // Últimos 12 meses agrupados por mês
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
                labels.push(label);

                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

                const regs = registrations.filter(r => {
                    const rd = parseDate(r.date);
                    return rd && `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, '0')}` === monthKey;
                });
                regFree.push(regs.filter(r => r.plan === 'free').length);
                regPremium.push(regs.filter(r => r.plan === 'premium').length);

                const revs = revenues.filter(r => {
                    const rd = parseDate(r.date);
                    return rd && `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, '0')}` === monthKey;
                });
                revFree.push(revs.filter(r => r.plan === 'free').reduce((acc, r) => acc + r.fee, 0));
                revPremium.push(revs.filter(r => r.plan === 'premium').reduce((acc, r) => acc + r.fee, 0));
            }
        }

        return { labels, regFree, regPremium, revFree, revPremium };
    }

    function updateCharts() {
        const data = groupDataForCharts();

        // 1. Gráfico de Registros de Usuários
        const ctxReg = document.getElementById('chartRegistros').getContext('2d');
        if (chartRegInstance) {
            chartRegInstance.destroy();
        }
        chartRegInstance = new Chart(ctxReg, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Premium',
                        data: data.regPremium,
                        backgroundColor: '#149CB8',
                        borderRadius: 4
                    },
                    {
                        label: 'Free',
                        data: data.regFree,
                        backgroundColor: '#94A3B8',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Manrope' } } }
                },
                scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { stacked: true, ticks: { precision: 0 } }
                }
            }
        });

        // 2. Gráfico de Receitas (Taxas)
        const ctxRev = document.getElementById('chartReceitas').getContext('2d');
        if (chartRevInstance) {
            chartRevInstance.destroy();
        }
        chartRevInstance = new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Premium (1% Taxa)',
                        data: data.revPremium,
                        fill: true,
                        backgroundColor: 'rgba(20, 156, 184, 0.1)',
                        borderColor: '#149CB8',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 3
                    },
                    {
                        label: 'Free (3% Taxa)',
                        data: data.revFree,
                        fill: true,
                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                        borderColor: '#94A3B8',
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Manrope' } } }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        ticks: {
                            callback: function(value) {
                                return formatarMoeda(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // 9. Logout
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = '../login/index.html';
        });
    }

    // Inicializar carregamento
    loadAdminData();
});
