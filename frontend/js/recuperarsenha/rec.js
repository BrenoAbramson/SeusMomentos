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

    // --- 3. SUBMISSÃO E CRITÉRIOS DE ACEITAÇÃO ---
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Critério: Não permite campos obrigatórios vazios
        if (!novaSenha.value || !confirmarSenha.value) {
            mostrarAlerta("Por favor, preencha todos os campos obrigatórios.", "aviso");
            return;
        }

        // Critério: Formato de senha inválido / Requisitos não atendidos
        if (!validate()) {
            mostrarAlerta("Ops! Sua senha não é forte o suficiente", "erro");
            return;
        }

        // Critério: Senhas diferentes (Confirmar se coincidem)
        if (novaSenha.value !== confirmarSenha.value) {
            mostrarAlerta("As senhas não coincidem.", "erro");
            return;
        }

        // Critério: Sucesso (Tudo OK)
        mostrarAlerta("Senha alterada com sucesso.", "sucesso");
        
        // Pequena pausa para o usuário ler o alerta antes de redirecionar
    setTimeout(() => {
            // Caminho ajustado para o seu padrão de pastas
            window.location.href = "../login/index.html"; 
        }, 2500);
    });
});