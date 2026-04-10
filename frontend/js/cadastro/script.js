const form = document.getElementById('registerForm');
const btnSubmit = document.getElementById('btnSubmit');

// Elementos do sistema de alerta
const alerta = document.getElementById("alerta");
const alertaTexto = document.getElementById("alerta-texto");
const alertaIcone = document.getElementById("alerta-icone");

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function mostrarAlerta(texto, tipo) {
    let icone = tipo === "sucesso" ? "✔" : (tipo === "erro" ? "✖" : "!");
    alertaTexto.innerText = texto;
    alertaIcone.innerText = icone;
    alerta.className = "alerta show " + tipo;
    setTimeout(() => alerta.classList.remove("show"), 3000);
}

function setLoading(loading) {
    if (btnSubmit) {
        btnSubmit.disabled = loading;
        btnSubmit.textContent = loading ? 'Processando...' : 'Criar minha conta';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeVal = document.getElementById('nome').value.trim();
    const emailVal = document.getElementById('email').value.trim();
    const senhaVal = document.getElementById('senha').value;
    const confirmarSenhaVal = document.getElementById('confirmarSenha').value;

    // Validações no Front-end (Campos obrigatórios e formato)
    if (!nomeVal || !emailVal || !senhaVal || !confirmarSenhaVal) {
        return mostrarAlerta("Preencha todos os campos obrigatórios", "aviso");
    }

    if (!validarEmail(emailVal)) {
        return mostrarAlerta("Formato de e-mail inválido", "aviso");
    }

    if (senhaVal !== confirmarSenhaVal) {
        return mostrarAlerta("As senhas não coincidem", "aviso");
    }                               
    if (senhaVal.length < 8) {
        return mostrarAlerta("A senha deve ter pelo menos 8 caracteres", "aviso");
    }


    setLoading(true);

    try {

        const response = await fetch('http://127.0.0.1:8080/auth/cadastro', {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nomeVal,
                email: emailVal,
                senha: senhaVal,
                confirmar_senha: confirmarSenhaVal
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Sucesso retornado pelo Back-end
            mostrarAlerta("Cadastro realizado com sucesso!", "sucesso");
            setTimeout(() => {
                window.location.href = "../../pages/login/index.html"; // Redireciona após sucesso
            }, 2000);
        } else {
            // Erro validado pelo Back-end
            mostrarAlerta(data.message || "Erro ao realizar cadastro", "erro");
        }

    } catch (error) {
        mostrarAlerta("Não foi possível conectar ao servidor", "erro");
    } finally {
        setLoading(false);
    }
});