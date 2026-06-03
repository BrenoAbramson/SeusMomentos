document.addEventListener('DOMContentLoaded', () => {
    const resetForm = document.getElementById('resetForm');
    const novaSenha = document.getElementById('novaSenha');
    const confirmarSenha = document.getElementById('confirmarSenha');
    const btnToggle = document.querySelectorAll('.toggle-password');

    // Elementos do Alerta Customizado (certifique-se que estão no seu HTML)
    const alertBox = document.getElementById('customAlert');
    const alertIcon = document.getElementById('alertIcon');
    const alertMessage = document.getElementById('alertMessage');

    // Mapeamento dos requisitos visuais (as bolinhas/checks)
    const requirements = {
        length: document.getElementById('req-length'),
        upper: document.getElementById('req-upper'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special')
    };

    /**
     * FUNÇÃO PARA MOSTRAR O ALERTA ESTILIZADO
     * @param {string} mensagem - O texto que aparecerá
     * @param {string} tipo - 'sucesso', 'erro' ou 'aviso'
     */
    function mostrarAlerta(mensagem, tipo) {
        // Limpa classes anteriores e aplica a nova
        alertBox.className = 'alerta';
        alertBox.classList.add(tipo);
        
        // Define o ícone de texto correspondente
        const icones = {
            sucesso: '✓',
            erro: '✕',
            aviso: '!'
        };
        
        alertIcon.innerText = icones[tipo] || '!';
        alertMessage.innerText = mensagem;

        // Ativa a animação de entrada (CSS .show)
        alertBox.classList.add('show');

        // Esconde automaticamente após 4 segundos
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 4000);
    }

    // --- 0. VALIDAÇÃO DO TOKEN NO CARREGAMENTO ---
    const urlParams = new URLSearchParams(window.location.search);
    const initialToken = urlParams.get('token');
    const initialEmail = urlParams.get('email');

    const mainContent = document.getElementById('mainContent');
    const expiredContent = document.getElementById('expiredContent');

    if (!initialToken || !initialEmail) {
        expiredContent.style.display = 'block'; // Mostra mensagem de erro central
    } else {
        // Verificar se o token expirou via Backend
        fetch(`${window.API_BASE_URL}/auth/reset-password/validate?email=${encodeURIComponent(initialEmail)}&token=${initialToken}`)
            .then(async response => {
                if (response.ok) {
                    // TOKEN VÁLIDO: Mostra o formulário
                    mainContent.style.display = 'flex';
                } else {
                    // TOKEN EXPIRADO: Mostra apenas a mensagem central (sem alert no topo)
                    expiredContent.style.display = 'block';
                }
            })
            .catch(error => {
                console.error("Erro ao validar token:", error);
                mostrarAlerta("Erro de conexão com o servidor.", "erro");
            });
    }

    // --- 1. LÓGICA DO OLHINHO (MOSTRAR/ESCONDER SENHA) ---
    btnToggle.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";
            
            // Feedback visual no ícone
            this.style.opacity = isPassword ? "1" : "0.6";
        });
    });

    // --- 2. VALIDAÇÃO EM TEMPO REAL ---
    const validate = () => {
        const val = novaSenha.value;
        const checks = {
            length: val.length >= 8,
            upper: /[a-z]/.test(val) && /[A-Z]/.test(val),
            number: /[0-9]/.test(val),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(val)
        };

        // Atualiza as classes dos itens da lista (bolinhas azuis)
        requirements.length.classList.toggle('valid', checks.length);
        requirements.upper.classList.toggle('valid', checks.upper);
        requirements.number.classList.toggle('valid', checks.number);
        requirements.special.classList.toggle('valid', checks.special);

        // Retorna true apenas se TODOS os requisitos forem atendidos
        return Object.values(checks).every(v => v === true);
    };

    novaSenha.addEventListener('input', validate);

    // --- 3. SUBMISSÃO E CONEXÃO COM O BACKEND ---
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Pegar token e email da URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        if (!token || !email) {
            mostrarAlerta("Token ou e-mail ausentes na URL. Por favor, use o link enviado no seu e-mail.", "erro");
            return;
        }

        // 2. Validações básicas de frontend
        if (!novaSenha.value || !confirmarSenha.value) {
            mostrarAlerta("Por favor, preencha todos os campos obrigatórios.", "aviso");
            return;
        }

        if (!validate()) {
            mostrarAlerta("Ops! Sua senha não é forte o suficiente", "erro");
            return;
        }

        if (novaSenha.value !== confirmarSenha.value) {
            mostrarAlerta("As senhas não coincidem.", "erro");
            return;
        }

        // 3. Chamada de rede real
        try {
            const response = await fetch(`${window.API_BASE_URL}/auth/reset-password/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    nova_senha: novaSenha.value,
                    confirmar_senha: confirmarSenha.value
                })
            });

            const result = await response.json();

            if (response.ok) {
                mostrarAlerta("Senha alterada com sucesso!", "sucesso");
                
                // Redireciona após o alerta
                setTimeout(() => {
                    window.location.href = "../login/index.html"; 
                }, 2500);
            } else {
                mostrarAlerta(result.message || "Erro ao redefinir senha", "erro");
            }
        } catch (error) {
            mostrarAlerta("Erro de conexão com o servidor", "erro");
            console.error("Erro no fetch:", error);
        }
    });
});