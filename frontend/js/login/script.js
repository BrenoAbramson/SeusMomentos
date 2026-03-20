const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const senha = document.getElementById("senha");

const alerta = document.getElementById("alerta");
const alertaTexto = document.getElementById("alerta-texto");
const alertaIcone = document.getElementById("alerta-icone");

function mostrarAlerta(texto,tipo){

let icone = "";

if(tipo === "sucesso"){
icone = "✔";
}

if(tipo === "erro"){
icone = "✖";
}

if(tipo === "aviso"){
icone = "!";
}

alertaTexto.innerText = texto;
alertaIcone.innerText = icone;

alerta.className = "alerta show " + tipo;

setTimeout(()=>{
alerta.classList.remove("show");
},3000);

}


// LOGIN

form.addEventListener("submit", function(event){

event.preventDefault();

if(email.value === "" || senha.value === ""){
mostrarAlerta("Preencha todos os campos obrigatórios","aviso");
return;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

if(!emailRegex.test(email.value)){
mostrarAlerta("Formato de e-mail inválido","aviso");
return; 
}

const emailCorreto = "teste@email.com";
const senhaCorreta = "123456";

if(email.value !== emailCorreto || senha.value !== senhaCorreta){
mostrarAlerta("E-mail ou senha inválidos","erro");
return;
}

mostrarAlerta("Login realizado com sucesso","sucesso");

setTimeout(()=>{
window.location.href = "home.html";
},1500);

});


// ---------------- MODAL ----------------


// ABRIR MODAL

const abrirModal = document.getElementById("abrirModal");
const modal = document.getElementById("modalOverlay");
const fecharModal = document.getElementById("closeModal");

abrirModal.addEventListener("click", function(e){
e.preventDefault();
modal.style.display = "flex";
});


// FECHAR NO X

fecharModal.addEventListener("click", function(){
modal.style.display = "none";
});


// FECHAR CLICANDO FORA

modal.addEventListener("click", function(e){

if(e.target === modal){
modal.style.display = "none";
}

});


// VALIDAÇÃO EMAIL MODAL

const modalForm = document.querySelector(".modal-form");
const modalEmail = document.querySelector(".modal-input");

modalForm.addEventListener("submit", function(e){

e.preventDefault();

const emailValor = modalEmail.value.trim();

const modalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!modalEmailRegex.test(emailValor)){

mostrarAlerta("Formato de e-mail inválido","aviso");

return;
}

mostrarAlerta("Link de recuperação enviado","sucesso");

modal.style.display = "none";

});