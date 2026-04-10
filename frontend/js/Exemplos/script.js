const templates = [
  // corporativo
  {
    id: "corp-1",
    title: "Template Casamento",
    category: "corporativo",
    thumbClass: "thumb-1"
  },
  {
    id: "corp-2",
    title: "Template Formatura",
    category: "corporativo",
    thumbClass: "thumb-2"
  },
  {
    id: "corp-3",
    title: "Template Aniversário",
    category: "corporativo",
    thumbClass: "thumb-3"
  },
  {
    id: "corp-4",
    title: "Template Outros Eventos",
    category: "corporativo",
    thumbClass: "thumb-4"
  },

  // social
  {
    id: "soc-1",
    title: "Template Noivado",
    category: "social",
    thumbClass: "thumb-1"
  },
  {
    id: "soc-2",
    title: "Template Chá Bar",
    category: "social",
    thumbClass: "thumb-2"
  },
  {
    id: "soc-3",
    title: "Template Festa Social",
    category: "social",
    thumbClass: "thumb-3"
  },
  {
    id: "soc-4",
    title: "Template Recepção",
    category: "social",
    thumbClass: "thumb-4"
  },

  // festivo
  {
    id: "fest-1",
    title: "Template Festival",
    category: "festivo",
    thumbClass: "thumb-1"
  },
  {
    id: "fest-2",
    title: "Template Show",
    category: "festivo",
    thumbClass: "thumb-2"
  },
  {
    id: "fest-3",
    title: "Template Comemoração",
    category: "festivo",
    thumbClass: "thumb-3"
  },
  {
    id: "fest-4",
    title: "Template Evento Temático",
    category: "festivo",
    thumbClass: "thumb-4"
  },

  // acadêmico
  {
    id: "acad-1",
    title: "Template Seminário",
    category: "academico",
    thumbClass: "thumb-1"
  },
  {
    id: "acad-2",
    title: "Template Formatura Premium",
    category: "academico",
    thumbClass: "thumb-2"
  },
  {
    id: "acad-3",
    title: "Template Palestra",
    category: "academico",
    thumbClass: "thumb-3"
  },
  {
    id: "acad-4",
    title: "Template Congresso",
    category: "academico",
    thumbClass: "thumb-4"
  }
];

const buttons = document.querySelectorAll(".filter-btn");
const grid = document.getElementById("templatesGrid");
const startButton = document.getElementById("ctaStartButton");

let activeCategory = sessionStorage.getItem("selectedCategory") || "corporativo";
let selectedTemplateId = sessionStorage.getItem("selectedTemplateId") || null;

function updateButtons() {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.category === activeCategory);
  });
}

function renderTemplates() {
  const filtered = templates.filter((template) => template.category === activeCategory);

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        Nenhum template disponível nesta categoria.
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((template) => {
    const isSelected = template.id === selectedTemplateId;

    return `
      <article class="template-card ${isSelected ? "selected" : ""}" data-id="${template.id}" tabindex="0">
        <div class="template-thumb ${template.thumbClass}">
          <span class="selection-badge">Selecionado</span>
        </div>

        <div class="template-info">
          <h3 class="template-title">${template.title}</h3>
          <span class="template-link">Ver modelo →</span>
        </div>
      </article>
    `;
  }).join("");

  bindCards();
}

function bindCards() {
  const cards = document.querySelectorAll(".template-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      selectTemplate(card.dataset.id);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectTemplate(card.dataset.id);
      }
    });
  });
}

function selectTemplate(id) {
  selectedTemplateId = id;
  sessionStorage.setItem("selectedTemplateId", id);
  renderTemplates();
  showToast("Template selecionado com sucesso.", "success");
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    sessionStorage.setItem("selectedCategory", activeCategory);
    updateButtons();
    renderTemplates();
  });
});

startButton.addEventListener("click", () => {
  if (!selectedTemplateId) {
    showToast("Selecione um template antes de continuar.");
    return;
  }

  sessionStorage.setItem("selectedTemplateId", selectedTemplateId);
  window.location.href = "criacao-evento.html";
});

function showToast(message, type = "") {
  const oldToast = document.querySelector(".toast");
  if (oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<p>${message}</p>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2400);
}

updateButtons();
renderTemplates();