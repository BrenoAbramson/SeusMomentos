const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const senha = document.getElementById("senha");

const alerta = document.getElementById("alerta");
const alertaTexto = document.getElementById("alerta-texto");
const alertaIcone = document.getElementById("alerta-icone");

function mostrarAlerta(texto, tipo) {

    let icone = "";

    if (tipo === "sucesso") {
        icone = "✔";
    }

    if (tipo === "erro") {
        icone = "✖";
    }

    if (tipo === "aviso") {
        icone = "!";
    }

    alertaTexto.innerText = texto;
    alertaIcone.innerText = icone;

    alerta.className = "alerta show " + tipo;

    setTimeout(() => {
        alerta.classList.remove("show");
    }, 3000);

}


// LOGIN

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (email.value === "" || senha.value === "") {
        mostrarAlerta("Preencha todos os campos obrigatórios", "aviso");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    if (!emailRegex.test(email.value)) {
        mostrarAlerta("Formato de e-mail inválido", "aviso");
        return;
    }

    // --- CONEXÃO COM O BACKEND REAL ---
    try {
        const response = await fetch("http://127.0.0.1:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email.value,
                senha: senha.value
            })
        });

        const result = await response.json();

        if (response.ok) {
            mostrarAlerta("Login realizado com sucesso", "sucesso");
            setTimeout(() => {
                window.location.href = "home.html";
            }, 1500);
        } else {
            mostrarAlerta(result.message || "E-mail ou senha inválidos", "erro");
        }
    } catch (error) {
        mostrarAlerta("Erro de conexão com o servidor", "erro");
        console.error("Erro no login:", error);
    }

});


// ---------------- MODAL ----------------


// ABRIR MODAL

const abrirModal = document.getElementById("abrirModal");
const modal = document.getElementById("modalOverlay");
const fecharModal = document.getElementById("closeModal");

abrirModal.addEventListener("click", function (e) {
    e.preventDefault();
    modal.style.display = "flex";
});


// FECHAR NO X

fecharModal.addEventListener("click", function () {
    modal.style.display = "none";
});


// FECHAR CLICANDO FORA

modal.addEventListener("click", function (e) {

    if (e.target === modal) {
        modal.style.display = "none";
    }

});


// VALIDAÇÃO EMAIL MODAL

const modalForm = document.querySelector(".modal-form");
const modalEmail = document.querySelector(".modal-input");

modalForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailValor = modalEmail.value.trim();
    const modalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!modalEmailRegex.test(emailValor)) {
        mostrarAlerta("Formato de e-mail inválido", "aviso");
        return;
    }

    // --- CONEXÃO COM O BACKEND ---
    try {
        const response = await fetch("http://127.0.0.1:8080/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailValor })
        });

        const result = await response.json();

        if (response.ok) {
            mostrarAlerta(result.data.message || "Link enviado com sucesso", "sucesso");
            modal.style.display = "none";
            modalEmail.value = ""; // Limpa o campo
        } else {
            mostrarAlerta(result.message || "Erro ao solicitar recuperação", "erro");
        }
    } catch (error) {
        mostrarAlerta("Erro de conexão com o servidor", "erro");
        console.error("Erro no fetch:", error);
    }
});