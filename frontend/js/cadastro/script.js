const form = document.getElementById('registerForm'); // ou 'loginForm'
const msgBox = document.getElementById('message');
const btnSubmit = document.getElementById('btnSubmit');

// Elementos do seu sistema de alerta personalizado
const alerta = document.getElementById("alerta");
const alertaTexto = document.getElementById("alerta-texto");
const alertaIcone = document.getElementById("alerta-icone");

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Função de alerta integrada
function mostrarAlerta(texto, tipo) {
    let icone = "";
    if (tipo === "sucesso") icone = "✔";
    if (tipo === "erro") icone = "✖";
    if (tipo === "aviso") icone = "!";

    alertaTexto.innerText = texto;
    alertaIcone.innerText = icone;

    // Remove classes antigas e adiciona as novas
    alerta.className = "alerta show " + tipo;

    setTimeout(() => {
        alerta.classList.remove("show");
    }, 3000);
}

function setLoading(loading) {
    if (btnSubmit) {
        btnSubmit.disabled = loading;
        btnSubmit.textContent = loading ? 'Processando...' : 'Entrar / Cadastrar';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailVal = document.getElementById('email').value.trim();
    const senhaVal = document.getElementById('senha').value;

    // 1. Validação de Campos Vazios
    if (emailVal === "" || senhaVal === "") {
        return mostrarAlerta("Preencha todos os campos obrigatórios", "aviso");
    }

    // 2. Validação de Formato de E-mail
    if (!validarEmail(emailVal)) {
        return mostrarAlerta("Formato de e-mail inválido", "aviso");
    }

    setLoading(true);

    try {
            const response = await fetch('https://api.exemplo.com/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailVal,
                password: senhaVal
            })
        });
        if (!response.ok) {
            const erroData = await response.json();
            throw new Error(erroData.message || "Credenciais inválidas");
        }
            mostrarAlerta("Login realizado com sucesso", "sucesso");

            setTimeout(() => {
                window.location.href = "home.html";
            }, 1500);
        

    } catch (error) {
        mostrarAlerta( error.message, "erro");
    } finally {
        setLoading(false);
    }
});