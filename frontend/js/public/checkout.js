// ==========================================================================
// CONFIGURAÇÕES E CONSTANTES
// ==========================================================================
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

// ==========================================================================
// ESTADO DA APLICAÇÃO
// ==========================================================================
const MP_PUBLIC_KEY = 'TEST-a3850e8a-6c52-40c5-8779-d379d276907f';

let guestId = null;
let selectedModel = 'classic';
let gifts = [];
let guestMessage = '';
let coupleTitle = '';
let eventDate = '';
let eventSlug = '';
let totalAmount = 0;
let currentPaymentTab = 'pix';
let pollingInterval = null;
let mpInstance = null;
let pixGenerated = false;

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Obter guest_id da URL
  const urlParams = new URLSearchParams(window.location.search);
  guestId = urlParams.get('guest_id');

  // 2. Carregar dados do banco de dados (se houver guestId) ou do localStorage (fallback)
  let dadosCarregados = false;
  if (guestId) {
    try {
      const response = await fetch(`${window.API_BASE_URL}/guests/detail?guest_id=${guestId}`);
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        gifts = data.data.gifts || [];
        guestMessage = data.data.guest.custom_message || '';
        coupleTitle = localStorage.getItem('checkout_couple_title') || 'Breno & Maria';
        eventDate = localStorage.getItem('checkout_event_date') || '';
        eventSlug = data.data.guest.event_slug || localStorage.getItem('checkout_event_slug') || '';

        // Sincroniza no localStorage para consistência
        localStorage.setItem('checkout_gifts', JSON.stringify(gifts));
        localStorage.setItem('checkout_message', guestMessage);

        dadosCarregados = true;
      }
    } catch (err) {
      console.error("Erro ao carregar dados do convidado do banco de dados:", err);
    }
  }

  // Fallback para o localStorage se os dados não foram carregados via API
  if (!dadosCarregados) {
    try {
      gifts = JSON.parse(localStorage.getItem('checkout_gifts')) || [];
      guestMessage = localStorage.getItem('checkout_message') || '';
      coupleTitle = localStorage.getItem('checkout_couple_title') || 'Breno & Maria';
      eventDate = localStorage.getItem('checkout_event_date') || '';
      eventSlug = localStorage.getItem('checkout_event_slug') || '';
    } catch (err) {
      console.error("Erro ao ler dados do localStorage:", err);
    }
  }

  // 3. Inicializar SDK do Mercado Pago
  if (typeof MercadoPago !== 'undefined') {
    mpInstance = new MercadoPago(MP_PUBLIC_KEY);
  } else {
    console.warn("Mercado Pago SDK não foi carregado corretamente.");
  }

  // 4. Renderizar dados na tela
  renderGiftsSummary();
  renderInvitationPreview();
  setupEventListeners();
  setupPaymentFormValidators();

  // 5. Verificar se retornou do Mercado Pago com sucesso ou falha
  const paymentParam = urlParams.get('payment');
  const modelParam = urlParams.get('model');

  if (paymentParam === 'success') {
    try {
      // Atualiza modelo do convite
      await fetch(`${window.API_BASE_URL}/guests/invitation`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: Number(guestId),
          invitation_selected: modelParam || selectedModel
        })
      });
      // Atualiza status de pagamento para PAID
      await fetch(`${window.API_BASE_URL}/guests/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: Number(guestId),
          status: 'PAID'
        })
      });

      // Atualiza o modelo selecionado localmente e finaliza com sucesso
      selectedModel = modelParam || selectedModel;
      finalizarFluxoSucesso();
    } catch (err) {
      console.error("Erro ao confirmar pagamento no retorno:", err);
    }
  } else if (paymentParam === 'failure') {
    alert("O pagamento não foi concluído. Por favor, tente novamente ou escolha outro meio de pagamento no Mercado Pago.");
  }

  // 6. Remover classe de carregamento global
  document.body.classList.remove('is-loading');
});

// ==========================================================================
// RENDERIZAÇÃO
// ==========================================================================
function renderGiftsSummary() {
  const giftsListContainer = document.getElementById('checkoutGiftsList');
  const giftsTotalValueEl = document.getElementById('giftsTotalValue');
  const checkoutTotalValueEl = document.getElementById('checkoutTotalValue');
  const paymentTotalAmountEl = document.getElementById('paymentTotalAmount');

  if (!giftsListContainer) return;

  if (gifts.length === 0) {
    giftsListContainer.innerHTML = `
      <div style="text-align: center; color: var(--neutral-light); padding: 30px 0;">
        Nenhum presente foi selecionado.
      </div>
    `;
    if (giftsTotalValueEl) giftsTotalValueEl.textContent = 'R$ 0,00';
    if (checkoutTotalValueEl) checkoutTotalValueEl.textContent = 'R$ 0,00';
    if (paymentTotalAmountEl) paymentTotalAmountEl.textContent = 'R$ 0,00';
    return;
  }

  // Renderizar cada item
  giftsListContainer.innerHTML = '';
  totalAmount = 0;

  gifts.forEach(gift => {
    totalAmount += Number(gift.gift_value || 0);
    const imgUrl = IMAGENS_MAP[gift.gift_name] || "../../assets/casamento/Mask Group.png";
    const valFormatted = formatarMoeda(gift.gift_value);

    giftsListContainer.innerHTML += `
      <div class="gift-item">
        <img src="${imgUrl}" alt="${gift.gift_name}" class="gift-item-img" onerror="this.src='../../assets/casamento/Mask Group.png'">
        <div class="gift-item-info">
          <h4>${gift.gift_name}</h4>
          <p>${valFormatted}</p>
        </div>
        <button class="btn-remove-gift" title="Excluir presente" onclick="removerPresenteDoCheckout(${gift.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
  });

  // Atualizar totais
  const finalTotalFormatted = formatarMoeda(totalAmount);
  if (giftsTotalValueEl) giftsTotalValueEl.textContent = finalTotalFormatted;
  if (checkoutTotalValueEl) checkoutTotalValueEl.textContent = finalTotalFormatted;
  if (paymentTotalAmountEl) paymentTotalAmountEl.textContent = finalTotalFormatted;

  // Atualizar parcelas dinamicamente no select
  renderInstallments();
}

function renderInstallments() {
  const selectInstallments = document.getElementById('cardInstallments');
  if (!selectInstallments) return;

  selectInstallments.innerHTML = '';

  // Parcelamento até 12x sem juros com parcela mínima de R$ 5,00
  const maxInstallments = Math.min(12, Math.floor(totalAmount / 5) || 1);

  for (let i = 1; i <= maxInstallments; i++) {
    const installmentValue = totalAmount / i;
    const formattedVal = formatarMoeda(installmentValue);

    if (i === 1) {
      selectInstallments.innerHTML += `<option value="1">1x de ${formattedVal} sem juros</option>`;
    } else {
      selectInstallments.innerHTML += `<option value="${i}">${i}x de ${formattedVal} sem juros</option>`;
    }
  }
}

function renderInvitationPreview() {
  const nameDisplays = document.querySelectorAll('.couple-names-display');
  nameDisplays.forEach(el => {
    el.textContent = coupleTitle;
  });

  const messageDisplays = document.querySelectorAll('.guest-message-display');
  messageDisplays.forEach(el => {
    if (guestMessage && guestMessage.trim() !== '') {
      el.textContent = `"${guestMessage}"`;
    } else {
      el.textContent = '"Desejamos toda a felicidade do mundo nesta nova etapa!"';
    }
  });

  const previewDateClassic = document.getElementById('previewDateClassic');
  const previewDateModern = document.getElementById('previewDateModern');
  const previewDateMinimal = document.getElementById('previewDateMinimal');

  if (previewDateClassic) {
    previewDateClassic.textContent = eventDate || new Date().toLocaleDateString('pt-BR');
  }
  if (previewDateModern) {
    previewDateModern.textContent = eventDate ? eventDate.replace(/\//g, ' / ') : new Date().toLocaleDateString('pt-BR').replace(/\//g, ' / ');
  }
  if (previewDateMinimal) {
    if (eventDate) {
      previewDateMinimal.textContent = formatarDataExtenso(eventDate);
    } else {
      previewDateMinimal.textContent = formatarDataExtenso(new Date().toLocaleDateString('pt-BR'));
    }
  }
}

// ==========================================================================
// CONFIGURAÇÃO DE LISTENERS
// ==========================================================================
function setupEventListeners() {
  // Alternar entre modelos de convite
  const selectorCards = document.querySelectorAll('.selector-card');
  selectorCards.forEach(card => {
    card.addEventListener('click', () => {
      selectorCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedModel = card.getAttribute('data-model');

      const previewContainer = document.getElementById('invitationPreview');
      if (previewContainer) {
        previewContainer.className = `invitation-preview-container ${selectedModel}`;
      }

      const classicStyle = document.querySelector('.classic-style');
      const modernStyle = document.querySelector('.modern-style');
      const minimalStyle = document.querySelector('.minimal-style');

      if (classicStyle) classicStyle.style.display = selectedModel === 'classic' ? 'flex' : 'none';
      if (modernStyle) modernStyle.style.display = selectedModel === 'modern' ? 'flex' : 'none';
      if (minimalStyle) minimalStyle.style.display = selectedModel === 'minimal' ? 'flex' : 'none';
    });
  });

  // Redirecionar para o Mercado Pago
  const btnOpenPaymentModal = document.getElementById('btnOpenPaymentModal');
  if (btnOpenPaymentModal) {
    btnOpenPaymentModal.addEventListener('click', async () => {
      if (gifts.length === 0) {
        alert("Por favor, selecione pelo menos um presente antes de continuar.");
        return;
      }

      btnOpenPaymentModal.disabled = true;
      const originalText = btnOpenPaymentModal.innerHTML;
      btnOpenPaymentModal.innerHTML = 'Redirecionando para o Mercado Pago...';

      try {
        const response = await fetch(`${window.API_BASE_URL}/payments/create-checkout-preference`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guest_id: Number(guestId),
            model: selectedModel,
            host: window.location.origin
          })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success' && data.data && data.data.sandbox_init_point) {
          window.location.href = data.data.sandbox_init_point;
        } else {
          alert(data.message || 'Erro ao gerar o link de pagamento do Mercado Pago.');
          btnOpenPaymentModal.disabled = false;
          btnOpenPaymentModal.innerHTML = originalText;
        }
      } catch (err) {
        console.error("Erro ao conectar ao Mercado Pago:", err);
        alert("Erro de conexão ao gerar o pagamento. Por favor, verifique se o servidor backend está ativo.");
        btnOpenPaymentModal.disabled = false;
        btnOpenPaymentModal.innerHTML = originalText;
      }
    });
  }

  // Fechar modal de pagamento
  const btnClosePaymentModal = document.getElementById('btnClosePaymentModal');
  if (btnClosePaymentModal && paymentModal) {
    btnClosePaymentModal.addEventListener('click', () => {
      paymentModal.classList.remove('active');
      detenerPollingStatus();
    });
  }

  // Alternar abas do modal de pagamento
  const paymentTabs = document.querySelectorAll('.payment-tab');
  paymentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      paymentTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentPaymentTab = tab.getAttribute('data-tab');

      const tabContentPix = document.getElementById('tabContentPix');
      const tabContentCard = document.getElementById('tabContentCard');
      const btnConfirmPayment = document.getElementById('btnConfirmPayment');

      if (currentPaymentTab === 'pix') {
        if (tabContentPix) tabContentPix.style.display = 'block';
        if (tabContentCard) tabContentCard.style.display = 'none';

        // Se o pix já tiver sido gerado, atualizamos o botão para mostrar status
        if (pixGenerated) {
          if (btnConfirmPayment) {
            btnConfirmPayment.innerHTML = 'Aguardando Pagamento Pix... <span class="spinner"></span>';
            btnConfirmPayment.disabled = true;
          }
        } else {
          resetBtnConfirmarPagamento();
        }
      } else {
        if (tabContentPix) tabContentPix.style.display = 'none';
        if (tabContentCard) tabContentCard.style.display = 'block';
        resetBtnConfirmarPagamento();
      }
    });
  });

  // Copiar chave Pix
  const btnCopyPix = document.getElementById('btnCopyPix');
  const pixKeyInput = document.getElementById('pixKeyInput');
  if (btnCopyPix && pixKeyInput) {
    btnCopyPix.addEventListener('click', () => {
      navigator.clipboard.writeText(pixKeyInput.value).then(() => {
        const btnTextSpan = btnCopyPix.querySelector('span') || btnCopyPix;
        const originalText = btnTextSpan.textContent;
        btnTextSpan.textContent = 'Copiado! ✓';
        btnCopyPix.style.backgroundColor = '#2e7d32';

        setTimeout(() => {
          btnTextSpan.textContent = originalText;
          btnCopyPix.style.backgroundColor = '';
        }, 2000);
      }).catch(err => {
        console.error("Erro ao copiar Pix:", err);
      });
    });
  }

  // Processar pagamento
  const btnConfirmPayment = document.getElementById('btnConfirmPayment');
  if (btnConfirmPayment) {
    btnConfirmPayment.addEventListener('click', processarPagamentoESalvar);
  }

  // Fechar modal de sucesso final
  const btnCloseModal = document.getElementById('btnCloseModal');
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', voltarParaOEvento);
  }
}

// ==========================================================================
// MÁSCARAS E VALIDAÇÕES DO FORMULÁRIO DE CARTÃO
// ==========================================================================
function setupPaymentFormValidators() {
  const cardNumberInput = document.getElementById('cardNumber');
  const cardExpiryInput = document.getElementById('cardExpiry');
  const cardCvvInput = document.getElementById('cardCvv');
  const cardBrandIcon = document.getElementById('cardBrandIcon');

  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');

      if (cardBrandIcon) {
        if (value.startsWith('4')) {
          cardBrandIcon.textContent = ' Visa 💳';
        } else if (value.startsWith('5')) {
          cardBrandIcon.textContent = ' MC 💳';
        } else if (value.startsWith('3')) {
          cardBrandIcon.textContent = ' Amex 💳';
        } else {
          cardBrandIcon.textContent = ' 💳';
        }
      }

      let formatted = value.match(/.{1,4}/g);
      e.target.value = formatted ? formatted.join(' ') : value;
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 2) {
        e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
      } else {
        e.target.value = value;
      }
    });
  }

  if (cardCvvInput) {
    cardCvvInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
}

function validarCamposCartao() {
  const cardNumber = document.getElementById('cardNumber').value.trim();
  const cardName = document.getElementById('cardName').value.trim();
  const cardExpiry = document.getElementById('cardExpiry').value.trim();
  const cardCvv = document.getElementById('cardCvv').value.trim();

  if (cardNumber.length < 15) {
    alert("Por favor, preencha o número do cartão corretamente.");
    return false;
  }
  if (cardName.length < 3) {
    alert("Por favor, insira o nome impresso no cartão.");
    return false;
  }
  if (cardExpiry.length < 5) {
    alert("Por favor, preencha a data de expiração (MM/AA).");
    return false;
  }
  if (cardCvv.length < 3) {
    alert("Por favor, preencha o CVV corretamente.");
    return false;
  }

  return true;
}

// ==========================================================================
// INTEGRAÇÃO COM MERCADO PAGO E BACKEND
// ==========================================================================
async function processarPagamentoESalvar() {
  const btnConfirmPayment = document.getElementById('btnConfirmPayment');

  if (currentPaymentTab === 'pix') {
    // ----------------------------------------
    // FLUXO PIX REAL DE SANDBOX
    // ----------------------------------------
    if (btnConfirmPayment) {
      btnConfirmPayment.disabled = true;
      btnConfirmPayment.innerHTML = 'Gerando Pix... <span class="spinner"></span>';
    }

    try {
      const response = await fetch(`${window.API_BASE_URL}/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guestId ? Number(guestId) : null,
          payment_method: 'pix'
        })
      });

      const data = await response.json();

      if (data.status === 'success' || data.qr_code) {
        pixGenerated = true;

        // 1. Atualizar o QR Code Base64 retornado pelo Mercado Pago
        const qrCodeBox = document.querySelector('.pix-qr-code-box');
        if (qrCodeBox && data.qr_code_base64) {
          qrCodeBox.innerHTML = `<img src="data:image/png;base64,${data.qr_code_base64}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }

        // 2. Atualizar o valor da chave copia-e-cola
        const pixKeyInput = document.getElementById('pixKeyInput');
        if (pixKeyInput && data.qr_code) {
          pixKeyInput.value = data.qr_code;
        }

        // 3. Atualizar textos de orientação
        const instructions = document.querySelector('.pix-instructions p');
        if (instructions) {
          instructions.innerHTML = '<strong>Pix gerado com sucesso!</strong> Escaneie o QR Code acima ou copie a chave Pix. A aprovação é automática em Sandbox.';
        }

        // 4. Mudar botão para modo de espera
        if (btnConfirmPayment) {
          btnConfirmPayment.innerHTML = 'Aguardando Pagamento... <span class="spinner"></span>';
          btnConfirmPayment.disabled = true;
        }

        // 5. Iniciar consulta periódica (polling) para identificar se o Pix foi pago
        iniciarPollingStatus();
      } else {
        alert(data.message || "Erro ao gerar o Pix com o Mercado Pago.");
        resetBtnConfirmarPagamento();
      }
    } catch (err) {
      console.error("Erro ao processar Pix:", err);
      alert("Erro ao conectar ao servidor de pagamentos.");
      resetBtnConfirmarPagamento();
    }

  } else {
    // ----------------------------------------
    // FLUXO CARTÃO TRANSPARENTE DE SANDBOX
    // ----------------------------------------
    if (!validarCamposCartao()) return;

    if (btnConfirmPayment) {
      btnConfirmPayment.disabled = true;
      btnConfirmPayment.innerHTML = 'Validando cartão... <span class="spinner"></span>';
    }

    try {
      // 1. Capturar dados
      const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
      const cardName = document.getElementById('cardName').value.trim();
      const cardExpiry = document.getElementById('cardExpiry').value.trim().split('/');
      const cardCvv = document.getElementById('cardCvv').value.trim();

      const month = parseInt(cardExpiry[0]);
      const year = parseInt("20" + cardExpiry[1]);

      // Detectar bandeira localmente
      let paymentMethodId = 'visa';
      if (cardNumber.startsWith('4')) paymentMethodId = 'visa';
      else if (cardNumber.startsWith('5')) paymentMethodId = 'master';
      else if (cardNumber.startsWith('3')) paymentMethodId = 'amex';
      else if (cardNumber.startsWith('6')) paymentMethodId = 'elo';

      if (btnConfirmPayment) {
        btnConfirmPayment.innerHTML = 'Processando com Mercado Pago... <span class="spinner"></span>';
      }

      // Enviar os dados do cartão diretamente ao nosso backend para tokenizar sem erro de CORS
      const response = await fetch(`${window.API_BASE_URL}/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: guestId ? Number(guestId) : null,
          payment_method: 'card',
          card_number: cardNumber,
          card_name: cardName,
          card_expiry: document.getElementById('cardExpiry').value.trim(),
          card_cvv: cardCvv,
          installments: Number(document.getElementById('cardInstallments').value),
          payment_method_id: paymentMethodId
        })
      });

      const data = await response.json();

      if (data.status === 'success' || data.data?.status === 'approved') {
        const paymentStatus = data.data?.status || data.status;

        if (paymentStatus === 'approved' || data.status === 'approved') {
          // Atualizar o design do convite no banco de dados
          await fetch(`${window.API_BASE_URL}/guests/invitation`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guest_id: guestId ? Number(guestId) : null,
              invitation_selected: selectedModel
            })
          });

          finalizarFluxoSucesso();
        } else {
          // Casos de cartões rejeitados por falta de saldo, etc (Mercado Pago Sandbox)
          let statusMessage = "Pagamento recusado pelo banco. Verifique os dados ou utilize outro cartão.";
          if (data.status_detail === 'cc_rejected_insufficient_amount') {
            statusMessage = "Saldo insuficiente. Cartão recusado.";
          } else if (data.status_detail === 'cc_rejected_bad_filled_security_code') {
            statusMessage = "Código de segurança (CVV) inválido.";
          }
          alert("Erro: " + statusMessage);
          resetBtnConfirmarPagamento();
        }
      } else {
        alert(data.message || "Erro no processamento do cartão.");
        resetBtnConfirmarPagamento();
      }

    } catch (err) {
      console.error("Erro no processamento do cartão:", err);
      alert("Falha no pagamento: " + err.message);
      resetBtnConfirmarPagamento();
    }
  }
}

// ==========================================================================
// CONSULTA PERIÓDICA DE STATUS (POLLING)
// ==========================================================================
function iniciarPollingStatus() {
  detenerPollingStatus();

  if (!guestId) return;

  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`${window.API_BASE_URL}/payments/status?guest_id=${guestId}`);
      const data = await res.json();

      if (data.status === 'success' && data.data.payment_status === 'PAID') {
        detenerPollingStatus();

        // Salva a customização de modelo do convite ao identificar o pagamento
        await fetch(`${window.API_BASE_URL}/guests/invitation`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guest_id: Number(guestId),
            invitation_selected: selectedModel
          })
        });

        finalizarFluxoSucesso();
      }
    } catch (err) {
      console.error("Erro ao consultar status do Pix:", err);
    }
  }, 4000); // Consulta a cada 4 segundos
}

function detenerPollingStatus() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

function finalizarFluxoSucesso() {
  const paymentModal = document.getElementById('paymentModal');
  if (paymentModal) paymentModal.classList.remove('active');

  const successModal = document.getElementById('successModal');
  const modalSelectedModel = document.getElementById('modalSelectedModel');
  const modalGiftsCount = document.getElementById('modalGiftsCount');

  if (modalSelectedModel) {
    modalSelectedModel.textContent = selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1);
  }
  if (modalGiftsCount) {
    const totalGifts = gifts.length;
    modalGiftsCount.textContent = totalGifts === 1 ? '1 presente' : `${totalGifts} presentes`;
  }

  if (successModal) {
    successModal.classList.add('active');
  }

  resetBtnConfirmarPagamento();
}

function resetBtnConfirmarPagamento() {
  const btnConfirmPayment = document.getElementById('btnConfirmPayment');
  if (btnConfirmPayment) {
    btnConfirmPayment.disabled = false;
    btnConfirmPayment.innerHTML = 'Confirmar Pagamento <span class="arrow-icon">→</span>';
  }
}

function voltarParaOEvento() {
  detenerPollingStatus();

  localStorage.removeItem('checkout_gifts');
  localStorage.removeItem('checkout_message');
  localStorage.removeItem('checkout_couple_title');
  localStorage.removeItem('checkout_event_date');

  if (eventSlug) {
    window.location.href = `index.html?${eventSlug}`;
  } else {
    window.location.href = 'index.html';
  }
}

// ==========================================================================
// FUNÇÕES AUXILIARES
// ==========================================================================
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

function formatarDataExtenso(dateStr) {
  if (!dateStr) return '';
  const partes = dateStr.split('/');
  if (partes.length !== 3) return dateStr;

  const dia = parseInt(partes[0]);
  const ano = partes[2];
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mesNum = parseInt(partes[1]) - 1;
  const mesNome = meses[mesNum] || '';

  return `${dia} de ${mesNome} de ${ano}`;
}

async function removerPresenteDoCheckout(giftId) {
  // 1. Filtrar o array global de presentes removendo o ID correspondente
  gifts = gifts.filter(gift => Number(gift.id) !== Number(giftId));

  // 2. Atualizar o localStorage
  localStorage.setItem('checkout_gifts', JSON.stringify(gifts));

  // 3. Re-renderizar o resumo de presentes (que recalcula totais e atualiza parcelas)
  renderGiftsSummary();

  // 4. Sincronizar com o banco de dados via API se tivermos guestId
  if (guestId) {
    try {
      const restIds = gifts.map(gift => Number(gift.id));
      await fetch(`${window.API_BASE_URL}/guests/gifts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_id: Number(guestId),
          selected_gift_ids: restIds
        })
      });
    } catch (err) {
      console.error("Erro ao atualizar presentes no banco de dados:", err);
    }
  }
}

// Expõe a função para que o onclick global a encontre
window.removerPresenteDoCheckout = removerPresenteDoCheckout;
