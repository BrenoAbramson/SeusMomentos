document.addEventListener('DOMContentLoaded', async () => {
    
    // Pega event_id da URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdParam = urlParams.get('event_id');
    const userId = localStorage.getItem('user_id') || 1;

    let eventId = eventIdParam;
    let eventSlug = '';
    let eventDate = null;

    let dataLoaded = false;
    let iframeLoaded = false;

    function checkFinishLoading() {
        if (dataLoaded && iframeLoaded) {
            document.body.classList.remove('is-loading');
        }
    }

    // Referências DOM - Inputs
    const inputTitle = document.getElementById('inputTitle');
    const inputMessage = document.getElementById('inputMessage');
    const inputBackground = document.getElementById('inputBackground');
    const hiddenBackgroundData = document.getElementById('hiddenBackgroundData');
    const hiddenImageName = document.getElementById('hiddenImageName');
    const inputCeremonyAddress = document.getElementById('inputCeremonyAddress');
    const inputCeremonyMaps = document.getElementById('inputCeremonyMaps');
    const inputCeremonyDetails = document.getElementById('inputCeremonyDetails');
    
    // Referências DOM - Preview (Iframe)
    const iframePreview = document.getElementById('iframePreview');
    let currentEventType = 'casamento';

    // Inicializa carregando o evento do banco (se não vier na URL, busca o último do usuário)
    async function loadData() {
        try {
            let fetchUrl = `${window.API_BASE_URL}/events?user_id=${userId}`;
            const res = await fetch(fetchUrl);
            const data = await res.json();
            
            if(data.status === 'success' && data.data.events.length > 0) {
                // Se tiver id na url acha ele, se não pega o primeiro
                let evento = eventId ? data.data.events.find(e => e.id == eventId) : data.data.events[0];
                if (!evento) evento = data.data.events[0];
                
                eventId = evento.id;
                eventSlug = evento.slug;
                currentEventType = evento.event_type;

                // Definir a URL do iframe com base no tipo de evento
                const templateFile = currentEventType === 'casamento' ? 'casamento_modelo.html' : '15anos_modelo.html';
                iframePreview.src = `${templateFile}?event_id=${eventId}&preview=true`;

                // Precisamos buscar os detalhes via slug para pegar as customizações
                const resDetalhe = await fetch(`${window.API_BASE_URL}/events/${eventSlug}`);
                const dataDetalhe = await resDetalhe.json();

                if (dataDetalhe.status === 'success') {
                    const evData = dataDetalhe.data.event;
                    eventDate = evData.event_date;
                    const c = evData.customizations;

                    // O título padrão pode ser o nome das pessoas
                    let defaultTitle = evData.people.map(p => p.name).join(" & ");

                    // Carregar dados iniciais
                    if (c.background_image) {
                        hiddenBackgroundData.value = c.background_image;
                        hiddenImageName.value = c.image_name || '';
                    }
                    inputTitle.value = c.main_title || defaultTitle;
                    inputMessage.value = c.custom_message || '';
                    
                    let customStyles = {};
                    if (c.custom_styles) {
                        try {
                            customStyles = typeof c.custom_styles === 'string' ? JSON.parse(c.custom_styles) : c.custom_styles;
                        } catch (err) {
                            console.error("Erro ao converter custom_styles", err);
                        }
                    }
                    inputCeremonyAddress.value = customStyles.ceremony_address || '';
                    inputCeremonyMaps.value = customStyles.ceremony_maps || '';
                    inputCeremonyDetails.value = customStyles.ceremony_details || '';
                    // inputBackground remains empty (file input cannot be prefilled)
                }
            }
            dataLoaded = true;
            checkFinishLoading();
        } catch(e) {
            console.error("Erro ao carregar dados", e);
            dataLoaded = true;
            checkFinishLoading();
        }
    }

    // Evento de carregamento do iframe
    iframePreview.onload = () => {
        atualizarPreview();
        iframeLoaded = true;
        checkFinishLoading();
    };

    // Tempo Real: Atualizar Preview ao digitar
    inputTitle.addEventListener('input', atualizarPreview);
    inputMessage.addEventListener('input', atualizarPreview);
    inputCeremonyAddress.addEventListener('input', atualizarPreview);
    inputCeremonyMaps.addEventListener('input', atualizarPreview);
    inputCeremonyDetails.addEventListener('input', atualizarPreview);
    // Listener para upload de imagem
    inputBackground.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            const dataUrl = event.target.result;
            hiddenBackgroundData.value = dataUrl;
            hiddenImageName.value = file.name;
            atualizarPreview();
        };
        reader.readAsDataURL(file);
    });

    function atualizarPreview() {
        const iframeDoc = iframePreview.contentDocument || iframePreview.contentWindow.document;
        if (!iframeDoc) return;

        const iframeTitle = iframeDoc.getElementById('heroTitle');
        const iframeMessage = iframeDoc.getElementById('heroMessage') || iframeDoc.getElementById('historyText');
        const iframeHero = iframeDoc.getElementById('hero');
        const iframeLogo = iframeDoc.getElementById('logoText');
        const iframeFooterLogo = iframeDoc.getElementById('footerLogoText');
        const iframeFooterTitle = iframeDoc.getElementById('footerTitle');
        const iframeFooterCopyright = iframeDoc.getElementById('footerCopyright');

        const titleVal = inputTitle.value || (currentEventType === 'casamento' ? "Ricardo & Luisa" : "Raquel's XV");

        // Calcular iniciais dinamicamente
        let initials = "";
        const cleanTitle = titleVal.replace(/\s+e\s+/gi, '&').replace(/\s+&\s+/gi, '&').replace(/\s+and\s+/gi, '&');
        const parts = cleanTitle.split('&');
        if (parts.length > 1) {
            initials = parts.map(p => p.trim().substring(0, 1).toUpperCase()).join('&');
        } else {
            const words = titleVal.trim().split(/\s+/);
            if (words.length > 1) {
                initials = words[0].substring(0, 1).toUpperCase() + '&' + words[1].substring(0, 1).toUpperCase();
            } else {
                initials = titleVal.substring(0, 1).toUpperCase();
            }
        }

        if (iframeTitle) {
            iframeTitle.innerText = titleVal;
        }
        
        if (iframeMessage) {
            iframeMessage.innerText = inputMessage.value || (currentEventType === 'casamento' ? "Tudo começou com um amor compartilhado..." : "Convido você para uma noite de gala...");
        }

        const iframeCeremonyAddress = iframeDoc.getElementById('ceremonyAddress');
        const iframeCeremonyDetails = iframeDoc.getElementById('ceremonyDetails');
        const iframeBtnCeremonyMaps = iframeDoc.getElementById('btnCeremonyMaps');

        if (iframeCeremonyAddress) {
            iframeCeremonyAddress.innerText = inputCeremonyAddress.value || 'Vale della Libertà, 12, Pienza';
        }
        if (iframeCeremonyDetails) {
            iframeCeremonyDetails.innerText = inputCeremonyDetails.value || 'Às quatro horas da tarde na Capela de Santa Maria. Uma troca íntima de votos seguida por uma procissão de pétalas de rosa.';
        }
        if (iframeBtnCeremonyMaps) {
            iframeBtnCeremonyMaps.href = inputCeremonyMaps.value || 'https://maps.google.com';
        }

        // Atualiza preview usando os valores armazenados
        const backgroundData = hiddenBackgroundData.value;
        // Não altera o hero; mantém o background padrão definido no template
        const coupleImg = iframeDoc.getElementById('coupleImage');
        if (coupleImg) {
            if (backgroundData) {
                coupleImg.src = backgroundData;
            } // caso não haja upload, mantém src padrão do HTML
        }

        if (iframeLogo) {
            iframeLogo.innerText = initials;
        }
        if (iframeFooterLogo) {
            iframeFooterLogo.innerText = initials;
        }
        if (iframeFooterTitle) {
            iframeFooterTitle.innerText = titleVal;
        }
        const eventYear = eventDate ? new Date(eventDate).getUTCFullYear() : new Date().getFullYear();
        if (iframeFooterCopyright) {
            iframeFooterCopyright.innerText = currentEventType === 'casamento' 
                ? `© ${eventYear} ${titleVal} — Feito com Amor`
                : `Celebração de ${titleVal} © ${eventYear}`;
        }
    }

    // Toggle Desktop / Mobile
    const btnDesktop = document.getElementById('btnViewDesktop');
    const btnMobile = document.getElementById('btnViewMobile');
    const previewFrame = document.getElementById('previewFrame');

    btnDesktop.addEventListener('click', () => {
        btnMobile.classList.remove('active');
        btnDesktop.classList.add('active');
        previewFrame.className = 'preview-frame desktop';
    });

    btnMobile.addEventListener('click', () => {
        btnDesktop.classList.remove('active');
        btnMobile.classList.add('active');
        previewFrame.className = 'preview-frame mobile';
    });

    // Salvar
    document.getElementById('editorForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            event_id: parseInt(eventId),
            main_title: inputTitle.value,
            custom_message: inputMessage.value,
            custom_styles: {
                ceremony_address: inputCeremonyAddress.value,
                ceremony_maps: inputCeremonyMaps.value,
                ceremony_details: inputCeremonyDetails.value
            }
        };
        // Inclui imagem somente se houver upload
        if (hiddenBackgroundData.value) {
            payload.background_image = hiddenBackgroundData.value;
            payload.image_name = hiddenImageName.value;
        }

        const btnSave = document.getElementById('btnSave');
        btnSave.innerText = "Salvando...";

        try {
            const res = await fetch(`${window.API_BASE_URL}/events/${eventSlug}/customizations`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            
            if (res.ok) {
                mostrarAlerta("Alterações salvas com sucesso!", "sucesso");
            } else {
                mostrarAlerta(data.message || "Erro ao salvar", "erro");
            }
        } catch(err) {
            mostrarAlerta("Erro de conexão com o servidor", "erro");
        } finally {
            btnSave.innerText = "Salvar Alterações";
        }
    });

    // Utilitário Formatar Data
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

    // Helper Alerta
    function mostrarAlerta(msg, tipo) {
        const div = document.getElementById('alerta');
        document.getElementById('alerta-texto').innerText = msg;
        div.className = 'alerta show ' + tipo;
        setTimeout(() => div.classList.remove('show'), 3000);
    }

    loadData();
});
