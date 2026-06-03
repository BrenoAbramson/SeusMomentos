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
// CARREGAMENTO DINÂMICO & API
// ===============================
let eventData = null;
let presentesSelecionadosIds = [];

async function inicializarDadosEventos() {
  // Limpa seleções de checkout anteriores no localStorage
  localStorage.removeItem('checkout_gifts');
  localStorage.removeItem('checkout_message');
  localStorage.removeItem('checkout_couple_title');
  localStorage.removeItem('checkout_event_date');
  localStorage.removeItem('checkout_event_slug');

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
      } else {
        gerarPresentesPadrao();
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
          } else {
            gerarPresentesPadrao();
          }
        } else {
          gerarPresentesPadrao();
        }
      } else {
        gerarPresentesPadrao();
      }
    } else {
      // Sem eventSlug nem eventId (ex: visualização estática do template)
      gerarPresentesPadrao();
    }
  } catch (e) {
    console.error("Erro ao carregar dados dinâmicos do evento:", e);
    gerarPresentesPadrao();
  }
}

function renderEvent(event) {
  eventData = event;
  const c = event.customizations;
  const heroTitle = document.getElementById('heroTitle');
  const heroSubtitle = document.getElementById('heroSubtitle');
  const historyText = document.getElementById('historyText');
  const hero = document.getElementById('hero');
  const logoText = document.getElementById('logoText');
  const footerTitle = document.getElementById('footerTitle');
  const footerCopyright = document.getElementById('footerCopyright');

  const titleVal = c.main_title || event.people.map(p => p.name).join(" & ");

  // Calcular iniciais
  let initials = "";
  if (event.people && event.people.length > 0) {
    initials = event.people.map(p => p.name.trim().substring(0, 1).toUpperCase()).join('&');
  } else {
    const cleanTitle = titleVal.replace(/\s+e\s+/gi, '&').replace(/\s+&\s+/gi, '&').replace(/\s+and\s+/gi, '&');
    const parts = cleanTitle.split('&');
    if (parts.length > 1) {
      initials = parts.map(p => p.trim().substring(0, 1).toUpperCase()).join('&');
    } else {
      initials = titleVal.substring(0, 1).toUpperCase();
    }
  }
  if (!initials) initials = "R&L";

  if (heroTitle) {
    heroTitle.innerText = titleVal;
  }
  if (heroSubtitle) {
    heroSubtitle.innerText = `${formatarData(event.event_date)} • ${event.location || "Toscana, Itália"}`;
  }
  if (historyText) {
    historyText.innerText = c.custom_message || "Tudo começou com um amor compartilhado...";
  }
  const coupleImg = document.getElementById('coupleImage');
  if (coupleImg && c.background_image) {
    coupleImg.src = c.background_image;
  }
  if (logoText) {
    logoText.innerText = initials;
  }
  if (footerTitle) {
    footerTitle.innerText = titleVal;
  }
  const eventYear = event.event_date ? new Date(event.event_date).getUTCFullYear() : new Date().getFullYear();
  if (footerCopyright) {
    footerCopyright.innerText = `© ${eventYear} ${titleVal} — Feito com Amor`;
  }

  // Carregar dados de cerimônia do custom_styles
  let customStyles = {};
  if (c.custom_styles) {
    try {
      customStyles = typeof c.custom_styles === 'string' ? JSON.parse(c.custom_styles) : c.custom_styles;
    } catch (err) {
      console.error("Erro ao converter custom_styles", err);
    }
  }

  const ceremonyAddress = document.getElementById('ceremonyAddress');
  const ceremonyDetails = document.getElementById('ceremonyDetails');
  const btnCeremonyMaps = document.getElementById('btnCeremonyMaps');

  if (ceremonyAddress) {
    ceremonyAddress.innerText = customStyles.ceremony_address || event.location || 'Vale della Libertà, 12, Pienza';
  }
  if (ceremonyDetails) {
    ceremonyDetails.innerText = customStyles.ceremony_details || 'Às quatro horas da tarde na Capela de Santa Maria. Uma troca íntima de votos seguida por uma procissão de pétalas de rosa.';
  }
  if (btnCeremonyMaps) {
    btnCeremonyMaps.href = customStyles.ceremony_maps || 'https://maps.google.com';
  }
  
  if (event.id) {
    carregarPresentesDoEvento(event.id);
  }
}

function formatarData(dataISO) {
  if (!dataISO) return "";
  const partes = dataISO.split('T')[0].split(' ')[0].split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  const d = new Date(dataISO);
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getUTCFullYear()}`;
}

// Inicializar no carregamento
document.addEventListener('DOMContentLoaded', inicializarDadosEventos);

// ===============================
// VALIDAÇÃO & ENVIO RSVP
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
      feedback.textContent = 'Enviando resposta...';
      feedback.style.color = '#8c5a44';

      const payload = {
        event_id: eventData ? eventData.id : null,
        guest_name: nome.value,
        guest_email: email.value,
        guest_phone: "",
        confirmed_presence: presenca.value === 'sim',
        custom_message: document.getElementById('restricoes') ? document.getElementById('restricoes').value : "",
        invitation_selected: 'classic',
        selected_gift_ids: presentesSelecionadosIds
      };

      if (!payload.event_id) {
        feedback.textContent = 'Aviso: Edição simulada. RSVP não enviado.';
        feedback.style.color = '#c44d4d';
        form.reset();
        setTimeout(() => { feedback.textContent = ''; }, 4000);
        return;
      }

      // Salva no localStorage os presentes, mensagem e casal para o preview do checkout
      const presentesDetalhados = presentesFiltrados.filter(g => presentesSelecionadosIds.map(Number).includes(Number(g.id)));
      localStorage.setItem('checkout_gifts', JSON.stringify(presentesDetalhados));
      localStorage.setItem('checkout_message', payload.custom_message);
      localStorage.setItem('checkout_couple_title', eventData ? (eventData.customizations.main_title || eventData.people.map(p => p.name).join(" & ")) : "Ricardo & Luisa");
      localStorage.setItem('checkout_event_date', eventData ? formatarData(eventData.event_date) : "");
      localStorage.setItem('checkout_event_slug', eventData ? eventData.slug : "");

      fetch(`${window.API_BASE_URL}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            feedback.textContent = 'Confirmação enviada! Redirecionando para seleção do convite... ✨';
            feedback.style.color = '#8c5a44';
            form.reset();
            setTimeout(() => {
              window.location.href = `checkout.html?guest_id=${data.data.guest_id}`;
            }, 1500);
          } else {
            feedback.textContent = data.message || 'Erro ao enviar resposta.';
            feedback.style.color = '#c44d4d';
          }
          setTimeout(() => {
            feedback.textContent = '';
          }, 5000);
        })
        .catch(err => {
          feedback.textContent = 'Erro ao conectar ao servidor.';
          feedback.style.color = '#c44d4d';
          setTimeout(() => {
            feedback.textContent = '';
          }, 5000);
        });
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

// ===============================
// INTEGRAÇÃO DA LISTA DE PRESENTES
// ===============================
let presentesFiltrados = [];
let presentesExibidos = 6;

const IMAGENS_MAP = {
  "2 Passagens Aéreas para a Lua de Mel": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=300&auto=format&fit=crop",
  "Abajur Decorativo": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=300&auto=format&fit=crop",
  "Adega de Vinhos Climatizada": "https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?q=80&w=300&auto=format&fit=crop",
  "Aluguel de Carro para a Lua de Mel": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=300&auto=format&fit=crop",
  "Aparador em Madeira Jequitibá 200 cm": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=300&auto=format&fit=crop",
  "Aparelho de Fondue Preto": "https://images.unsplash.com/photo-1574085733277-851d9d856a3a?q=80&w=300&auto=format&fit=crop",
  "Aparelho de Jantar Branco - 30 Peças": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=300&auto=format&fit=crop",
  "Ar Condicionado Split Inverter 12000 BTUs": "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=300&auto=format&fit=crop",
  "Aspirador de Pó Vertical": "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=300&auto=format&fit=crop",
  "Batedeira Planetária Inox": "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?q=80&w=300&auto=format&fit=crop",
  "Cafeteira Expresso Automática": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&auto=format&fit=crop",
  "Jogo de Cama Egípcio - Casal": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=300&auto=format&fit=crop",
  "Jogo de Panelas Antiaderente - 7 Peças": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=300&auto=format&fit=crop",
  "Liquidificador com Copo de Vidro": "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?q=80&w=300&auto=format&fit=crop",
  "Micro-ondas Espelhado 30L": "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=300&auto=format&fit=crop",
  "Fritadeira Elétrica Airfryer": "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?q=80&w=300&auto=format&fit=crop",
  "Aparelho de Fondue de Chocolate": "https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=300&auto=format&fit=crop",
  "Conjunto de Taças de Cristal (6 peças)": "https://images.unsplash.com/photo-1571244856003-885e3a890457?q=80&w=300&auto=format&fit=crop",
  "Smart TV LED 55\" 4K": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=300&auto=format&fit=crop",
  "Caixa de Som Inteligente com Alexa": "https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=300&auto=format&fit=crop",
  "Robô Aspirador de Pó Inteligente": "https://images.unsplash.com/photo-1589156229477-466aa820df31?q=80&w=300&auto=format&fit=crop",
  "Mesa de Cabeceira Industrial": "https://images.unsplash.com/photo-1532372320978-9b4d8a3a8245?q=80&w=300&auto=format&fit=crop",
  "Câmera Instantânea Instax": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=300&auto=format&fit=crop",
  "Conjunto de Churrasco com Maleta (18 pcs)": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop",
  "Faqueiro em Aço Inox - 72 Peças": "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=300&auto=format&fit=crop",
  "Quadro Decorativo Moderno": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop",
  "Fim de Semana em Resort All Inclusive": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=300&auto=format&fit=crop",
  "Jantar Romântico para o Casal": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=300&auto=format&fit=crop",
  "Espremedor de Frutas Automático": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop",
  "Jogo de Toalhas de Banho (5 peças)": "https://images.unsplash.com/photo-1616627547474-be041322f1d2?q=80&w=300&auto=format&fit=crop"
};

async function carregarPresentesDoEvento(eventId) {
  try {
    const res = await fetch(`${window.API_BASE_URL}/gifts?event_id=${eventId}&enabled=true`);
    const data = await res.json();
    if (data.status === 'success') {
      presentesFiltrados = data.data.gifts;
      if (presentesFiltrados && presentesFiltrados.length > 0) {
        renderPresentesPublicos();
      } else {
        gerarPresentesPadrao();
      }
    } else {
      gerarPresentesPadrao();
    }
  } catch (e) {
    console.error("Erro ao carregar presentes do evento:", e);
    gerarPresentesPadrao();
  }
}

function gerarPresentesPadrao() {
  presentesFiltrados = [
    { id: 101, gift_name: "2 Passagens Aéreas para a Lua de Mel", gift_value: 3500.00 },
    { id: 102, gift_name: "Jogo de Jantar Branco - 30 Peças", gift_value: 450.00 },
    { id: 103, gift_name: "Cafeteira Expresso Automática", gift_value: 890.00 },
    { id: 104, gift_name: "Smart TV LED 55\" 4K", gift_value: 2499.00 },
    { id: 105, gift_name: "Robô Aspirador de Pó Inteligente", gift_value: 1200.00 },
    { id: 106, gift_name: "Batedeira Planetária Inox", gift_value: 650.00 },
    { id: 107, gift_name: "Fritadeira Elétrica Airfryer", gift_value: 399.00 },
    { id: 108, gift_name: "Jogo de Panelas Antiaderente - 7 Peças", gift_value: 299.00 },
    { id: 109, gift_name: "Aparelho de Fondue Preto", gift_value: 180.00 },
    { id: 110, gift_name: "Caixa de Som Inteligente com Alexa", gift_value: 350.00 },
    { id: 111, gift_name: "Conjunto de Taças de Cristal (6 peças)", gift_value: 250.00 },
    { id: 112, gift_name: "Fim de Semana em Resort All Inclusive", gift_value: 1800.00 },
    { id: 113, gift_name: "Jantar Romântico para o Casal", gift_value: 350.00 },
    { id: 114, gift_name: "Adega de Vinhos Climatizada", gift_value: 1500.00 },
    { id: 115, gift_name: "Jogo de Cama Egípcio - Casal", gift_value: 400.00 }
  ];
  
  if (window.location.pathname.endsWith('casamento.html')) {
    presentesExibidos = 15;
  }
  
  renderPresentesPublicos();
}

function renderPresentesPublicos() {
  const grid = document.getElementById('giftsGridList');
  const verMaisContainer = document.getElementById('verMaisContainer');
  if (!grid) return;

  const isStaticTemplatePreview = window.location.pathname.endsWith('casamento.html');
  if (isStaticTemplatePreview) {
    presentesExibidos = 15;
  }

  grid.innerHTML = '';

  if (presentesFiltrados.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-light); padding: 40px 0;">Nenhum presente selecionado ainda.</div>';
    if (verMaisContainer) verMaisContainer.style.display = 'none';
    return;
  }

  const visiveis = presentesFiltrados.slice(0, presentesExibidos);

  visiveis.forEach(gift => {
    const isSelected = presentesSelecionadosIds.includes(gift.id);
    const imgUrl = IMAGENS_MAP[gift.gift_name] || "../../assets/casamento/Mask Group.png";
    const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.gift_value);

    // Se for a página casamento.html (visualização estática do template), não exibe o botão
    const isStaticTemplatePreview = window.location.pathname.endsWith('casamento.html');

    const buttonHtml = isStaticTemplatePreview ? '' : `
        <button class="btn-primary btn-presentear" style="margin-top: 18px; width: 100%; ${isSelected ? 'background: #2e7d32;' : ''}" onclick="togglePresenteConvidado(${gift.id}, this)">
          ${isSelected ? '✔ Selecionado' : 'Presentear'}
        </button>
    `;

    grid.innerHTML += `
      <div class="gift-card ${isSelected ? 'selected' : ''}" id="gift-card-${gift.id}">
        <img src="${imgUrl}" alt="${gift.gift_name}" onerror="this.src='../../assets/casamento/Mask Group.png'">
        <h3>${gift.gift_name}</h3>
        <p>${valorFormatado}</p>
        ${buttonHtml}
      </div>
    `;
  });

  if (verMaisContainer) {
    if (presentesFiltrados.length > presentesExibidos) {
      verMaisContainer.style.display = 'block';
    } else {
      verMaisContainer.style.display = 'none';
    }
  }
}

function togglePresenteConvidado(giftId, btnElement) {
  const card = document.getElementById(`gift-card-${giftId}`);
  const index = presentesSelecionadosIds.indexOf(giftId);

  if (index > -1) {
    // Desmarcar
    presentesSelecionadosIds.splice(index, 1);
    if (card) card.classList.remove('selected');
    btnElement.innerText = "Presentear";
    btnElement.style.background = "";
  } else {
    // Marcar
    presentesSelecionadosIds.push(giftId);
    if (card) card.classList.add('selected');
    btnElement.innerText = "✔ Selecionado";
    btnElement.style.background = "#2e7d32";

    // Rola suavemente até o formulário do RSVP
    const rsvp = document.getElementById('rsvp');
    if (rsvp) {
      window.scrollTo({
        top: rsvp.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  }
}

// Expõe globalmente
window.togglePresenteConvidado = togglePresenteConvidado;

document.addEventListener('DOMContentLoaded', () => {
  const btnVerMais = document.getElementById('btnVerMaisPresentes');
  if (btnVerMais) {
    btnVerMais.addEventListener('click', () => {
      presentesExibidos += 6;
      renderPresentesPublicos();
    });
  }
});