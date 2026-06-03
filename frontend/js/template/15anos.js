// ===============================
// COUNTDOWN TIMER
// ===============================
const countdown = () => {
  const countDate = new Date("October 24, 2024 19:00:00").getTime();
  const now = new Date().getTime();
  const gap = countDate - now;

  // Time calculations
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Calculate the remaining time
  const textDay = Math.floor(gap / day);
  const textHour = Math.floor((gap % day) / hour);
  const textMinute = Math.floor((gap % hour) / minute);

  // Update HTML
  if (document.querySelector(".count-day")) {
    document.querySelector(".count-day").innerText = textDay < 10 ? "0" + textDay : textDay;
    document.querySelector(".count-hour").innerText = textHour < 10 ? "0" + textHour : textHour;
    document.querySelector(".count-min").innerText = textMinute < 10 ? "0" + textMinute : textMinute;
  }
};

setInterval(countdown, 1000);

// ===============================
// CARREGAMENTO DINÂMICO & API
// ===============================
let eventData = null;

async function inicializarDadosEventos() {
  if (window.eventData) {
    renderEvent(window.eventData);
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('event_id');
  let eventSlug = '';
  if (!eventId && window.location.search) {
    const searchStr = decodeURIComponent(window.location.search.substring(1));
    eventSlug = searchStr.startsWith('evento=') ? searchStr.substring(7) : searchStr;
  }
  const userId = localStorage.getItem('user_id') || 1;

  try {
    if (eventSlug) {
      // Modo Convidado Público
      const res = await fetch(`${window.API_BASE_URL}/events/${encodeURIComponent(eventSlug)}`);
      const data = await res.json();
      if (data.status === 'success') {
        renderEvent(data.data.event);
      }
    } else if (eventId) {
      // Modo Preview do Editor
      const res = await fetch(`${window.API_BASE_URL}/events?user_id=${userId}`);
      const data = await res.json();
      if (data.status === 'success') {
        const evento = data.data.events.find(e => e.id == eventId);
        if (evento) {
          const resDetalhe = await fetch(`${window.API_BASE_URL}/events/${evento.slug}`);
          const dataDetalhe = await resDetalhe.json();
          if (dataDetalhe.status === 'success') {
            renderEvent(dataDetalhe.data.event);
          }
        }
      }
    }
  } catch (e) {
    console.error("Erro ao carregar dados dinâmicos do evento:", e);
  }
}

function renderEvent(event) {
  eventData = event;
  const c = event.customizations;
  const heroTitle = document.getElementById('heroTitle');
  const heroMessage = document.getElementById('heroMessage');
  const hero = document.getElementById('hero');
  const logoText = document.getElementById('logoText');
  const footerLogoText = document.getElementById('footerLogoText');
  const footerCopyright = document.getElementById('footerCopyright');

  const titleVal = c.main_title || (event.people && event.people[0] ? event.people[0].name : "Debutante");

  // Calcular iniciais
  let initials = "";
  if (event.people && event.people.length > 0) {
    initials = event.people.map(p => p.name.trim().substring(0, 1).toUpperCase()).join('&');
  } else {
    initials = titleVal.substring(0, 2).toUpperCase();
  }

  if (heroTitle) {
    const parts = titleVal.split(":");
    if (parts.length > 1) {
      heroTitle.innerHTML = `${parts[0]}:<br><span>${parts[1].trim()}</span>`;
    } else {
      heroTitle.innerText = titleVal;
    }
  }
  if (heroMessage) {
    heroMessage.innerText = c.custom_message || "Convido você para uma noite de gala e encanto, onde celebraremos a transição e a beleza dos 15 anos de Raquel.";
  }
  if (hero && c.background_image) {
    hero.style.backgroundImage = `url('${c.background_image}')`;
  }
  if (logoText) {
    logoText.innerText = initials;
  }
  if (footerLogoText) {
    footerLogoText.innerText = initials;
  }
  if (footerCopyright) {
    footerCopyright.innerText = `Celebração de ${titleVal} © 2024`;
  }
}

// Inicializar no carregamento
document.addEventListener('DOMContentLoaded', inicializarDadosEventos);

// ===============================
// FORM HANDLING & RSVP REAL
// ===============================
const rsvpForm = document.getElementById('rsvp-form');
if (rsvpForm) {
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = rsvpForm.querySelector('.btn-submit');
    const originalText = btn.innerText;
    
    const nomeInput = rsvpForm.querySelector('input[type="text"]');
    const emailInput = rsvpForm.querySelector('input[type="email"]');
    const convidadosSelect = rsvpForm.querySelector('select');

    btn.innerText = "ENVIANDO...";
    btn.disabled = true;

    const payload = {
      event_id: eventData ? eventData.id : null,
      guest_name: nomeInput.value,
      guest_email: emailInput.value,
      guest_phone: "",
      confirmed_presence: true,
      custom_message: convidadosSelect ? `Convidados: ${convidadosSelect.value}` : "",
      invitation_selected: 'modern',
      selected_gift_ids: []
    };

    if (!payload.event_id) {
      alert("Aviso: Edição simulada. RSVP não enviado.");
      btn.innerText = originalText;
      btn.disabled = false;
      rsvpForm.reset();
      return;
    }

    fetch(`${window.API_BASE_URL}/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert("Sua presença foi confirmada com sucesso! Mal podemos esperar por esse dia. ✨");
        rsvpForm.reset();
      } else {
        alert(data.message || "Erro ao registrar sua presença.");
      }
    })
    .catch(err => {
      alert("Erro ao conectar com o servidor.");
    })
    .finally(() => {
      btn.innerText = originalText;
      btn.disabled = false;
    });
  });
}

// ===============================
// SMOOTH SCROLL FOR NAV LINKS
// ===============================
document.querySelectorAll('.nav-menu a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetSection = document.querySelector(this.getAttribute('href'));
    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});
