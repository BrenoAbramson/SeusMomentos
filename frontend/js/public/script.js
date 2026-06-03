document.addEventListener('DOMContentLoaded', async () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const eventSlug = urlParams.get('evento');
    
    let eventData = null;
    let selectedGifts = [];
    let selectedTemplate = 'classic';
    let totalValue = 0;
    let guestIdCreated = null;

    if (!eventSlug) {
        mostrarAlerta("Evento não encontrado", "erro");
        return;
    }

    // 1. Carregar Evento
    try {
        const res = await fetch(`http://127.0.0.1:8080/events/${eventSlug}`);
        const data = await res.json();
        
        if (data.status === 'success') {
            eventData = data.data.event;
            renderEvent(eventData);
            loadGifts(eventData.id);
        } else {
            mostrarAlerta("Evento não encontrado!", "erro");
        }
    } catch(e) {
        mostrarAlerta("Erro ao carregar o site", "erro");
    }

    function renderEvent(event) {
        const c = event.customizations;
        document.getElementById('pageTitle').innerText = (c.main_title || "Convite") + " - Seus Momentos";
        document.getElementById('eventTitle').innerText = c.main_title || "Nosso Evento";
        document.getElementById('eventMessage').innerText = c.custom_message || "Estamos muito felizes em compartilhar esse momento!";
        document.getElementById('eventDate').innerText = formatarData(event.event_date);
        document.getElementById('eventLocation').innerText = event.location || "";
        
        if (c.background_image) {
            document.getElementById('heroSection').style.backgroundImage = `url('${c.background_image}')`;
        } else {
            document.getElementById('heroSection').style.backgroundImage = `url('../../assets/login/brinde2.jpeg')`;
        }
    }

    // 2. Carregar Presentes Ativos
    async function loadGifts(eventId) {
        try {
            const res = await fetch(`http://127.0.0.1:8080/gifts?event_id=${eventId}&enabled=true`);
            const data = await res.json();
            
            const giftsList = document.getElementById('giftsList');
            if (data.status === 'success' && data.data.gifts.length > 0) {
                giftsList.innerHTML = '';
                data.data.gifts.forEach(gift => {
                    const el = document.createElement('div');
                    el.className = 'gift-item';
                    el.dataset.id = gift.id;
                    el.dataset.value = gift.gift_value;
                    el.innerHTML = `
                        <div class="gift-info">
                            <strong>${gift.gift_name}</strong>
                            <span>R$ ${parseFloat(gift.gift_value).toFixed(2).replace('.', ',')}</span>
                        </div>
                        <input type="checkbox" class="gift-checkbox">
                    `;
                    el.addEventListener('click', () => toggleGift(el, gift.id, gift.gift_value));
                    giftsList.appendChild(el);
                });
            } else {
                giftsList.innerHTML = '<p>Os anfitriões não cadastraram presentes ainda.</p>';
            }
        } catch(e) {
            console.error(e);
        }
    }

    function toggleGift(element, id, value) {
        const checkbox = element.querySelector('.gift-checkbox');
        if (element.classList.contains('selected')) {
            element.classList.remove('selected');
            checkbox.checked = false;
            selectedGifts = selectedGifts.filter(g => g !== id);
            totalValue -= parseFloat(value);
        } else {
            element.classList.add('selected');
            checkbox.checked = true;
            selectedGifts.push(id);
            totalValue += parseFloat(value);
        }
        
        document.getElementById('giftTotalValue').innerText = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
    }

    // 3. Escolha do Template
    document.querySelectorAll('.t-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.t-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTemplate = card.dataset.model;
        });
    });

    // 4. Scroll suave
    document.getElementById('btnScrollToForm').addEventListener('click', () => {
        document.getElementById('rsvpArea').scrollIntoView({behavior: 'smooth'});
    });

    // 5. Submit RSVP e abrir PIX
    document.getElementById('btnOpenCheckout').addEventListener('click', async () => {
        const name = document.getElementById('guestName').value;
        const email = document.getElementById('guestEmail').value;
        const phone = document.getElementById('guestPhone').value;
        const confirm = document.getElementById('guestConfirm').value;
        const message = document.getElementById('guestMessage').value;

        if (!name || !email) {
            return mostrarAlerta("Nome e E-mail são obrigatórios!", "erro");
        }

        const btn = document.getElementById('btnOpenCheckout');
        btn.innerText = "Registrando...";

        const payload = {
            event_id: eventData.id,
            guest_name: name,
            guest_email: email,
            guest_phone: phone,
            confirmed_presence: confirm === "1",
            custom_message: message,
            invitation_selected: selectedTemplate,
            selected_gift_ids: selectedGifts
        };

        try {
            const res = await fetch(`http://127.0.0.1:8080/guests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                guestIdCreated = data.data.guest_id;
                
                if (totalValue > 0) {
                    // Abrir modal PIX
                    document.getElementById('pixValue').innerText = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;
                    document.getElementById('pixModal').style.display = 'flex';
                } else {
                    mostrarAlerta("Presença confirmada com sucesso!", "sucesso");
                    setTimeout(() => window.location.reload(), 2000);
                }
            } else {
                mostrarAlerta(data.message || "Erro", "erro");
            }
        } catch(e) {
            mostrarAlerta("Erro ao confirmar", "erro");
        } finally {
            btn.innerText = "Confirmar e Ir para o Pagamento";
        }
    });

    // 6. Fechar PIX e Simular Pagamento
    document.getElementById('closePixModal').addEventListener('click', () => {
        document.getElementById('pixModal').style.display = 'none';
        mostrarAlerta("Presença confirmada (Pagamento pendente)", "aviso");
        setTimeout(() => window.location.reload(), 2000);
    });

    document.getElementById('btnCopyPix').addEventListener('click', () => {
        const input = document.getElementById('pixKey');
        input.select();
        document.execCommand('copy');
        mostrarAlerta("Chave PIX copiada!", "sucesso");
    });

    document.getElementById('btnSimulatePaid').addEventListener('click', async () => {
        if (!guestIdCreated) return;
        
        try {
            await fetch(`http://127.0.0.1:8080/guests/payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guest_id: guestIdCreated, status: 'PAID' })
            });
            
            document.getElementById('pixModal').style.display = 'none';
            mostrarAlerta("Pagamento Confirmado com Sucesso! Obrigado!", "sucesso");
            setTimeout(() => window.location.reload(), 2500);
        } catch(e) {
            mostrarAlerta("Erro ao atualizar pagamento", "erro");
        }
    });

    // Utilitário Formatar Data
    function formatarData(dataISO) {
        if (!dataISO) return "";
        const d = new Date(dataISO);
        const dia = String(d.getDate() + 1).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        return `${dia}/${mes}/${d.getFullYear()}`;
    }

    // Helper Alerta
    function mostrarAlerta(msg, tipo) {
        const div = document.getElementById('alerta');
        document.getElementById('alerta-texto').innerText = msg;
        div.className = 'alerta show ' + tipo;
        setTimeout(() => div.classList.remove('show'), 3000);
    }
});
