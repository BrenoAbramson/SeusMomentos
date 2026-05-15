// ===============================
// SCROLL SUAVE MENU + LINK ATIVO
// ===============================
const allLinks = document.querySelectorAll('a[href^="#"]');
const menuLinks = document.querySelectorAll('.nav-menu a');

allLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    const id = this.getAttribute('href');
    const section = document.querySelector(id);

    if (section) {
      window.scrollTo({
        top: section.offsetTop - 70,
        behavior: 'smooth'
      });
    }

    menuLinks.forEach(item => item.classList.remove('active'));

    if (this.classList.contains('active') || this.closest('.nav-menu')) {
      this.classList.add('active');
    }
  });
});

// ===============================
// HEADER AO ROLAR + LINK ATIVO
// ===============================
const header = document.querySelector('.header');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;

    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  menuLinks.forEach(link => {
    link.classList.remove('active');

    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ===============================
// VALIDAÇÃO RSVP
// ===============================
const form = document.getElementById('rsvpForm');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome');
    const email = document.getElementById('email');
    const presenca = document.getElementById('presenca');
    const feedback = document.getElementById('formFeedback');

    clearErrors();

    let valido = true;

    if (nome.value.trim() === '') {
      showError(nome, 'Nome obrigatório');
      valido = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.trim() === '') {
      showError(email, 'E-mail obrigatório');
      valido = false;
    } else if (!emailRegex.test(email.value)) {
      showError(email, 'Digite um e-mail válido');
      valido = false;
    }

    if (presenca.value === '') {
      showError(presenca, 'Selecione uma opção');
      valido = false;
    }

    if (valido) {
      feedback.textContent = 'Resposta enviada com sucesso!';
      feedback.style.color = '#8c5a44';

      form.reset();

      setTimeout(() => {
        feedback.textContent = '';
      }, 4000);
    }
  });
}

// ===============================
// MOSTRAR ERRO
// ===============================
function showError(input, message) {
  input.style.borderColor = '#c44d4d';

  const error = input.parentElement.querySelector('.error-message');

  if (error) {
    error.textContent = message;
  }
}

// ===============================
// LIMPAR ERROS
// ===============================
function clearErrors() {
  const inputs = document.querySelectorAll(
    '.form-group input, .form-group select'
  );

  inputs.forEach(input => {
    input.style.borderColor = '#d8c8bf';
  });

  const errors = document.querySelectorAll('.error-message');

  errors.forEach(error => {
    error.textContent = '';
  });
}

// ===============================
// HOVER SUAVE CARDS
// ===============================
const cards = document.querySelectorAll('.gift-card, .event-card');

cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-6px)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0px)';
  });
});

// ===============================
// BOTÃO VER LISTA
// ===============================
const btnLista = document.querySelector('.btn-secondary');

if (btnLista) {
  btnLista.addEventListener('click', () => {
    alert('Lista completa em breve 💌');
  });
}