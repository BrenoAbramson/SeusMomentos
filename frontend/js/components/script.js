// js/components/script.js
function loadComponents() {
    // Determina o basePath com base na URL atual para corrigir caminhos relativos
    const isRoot = !window.location.pathname.includes('/pages/');
    const basePath = isRoot ? '' : '../../';
    const headerUrl = `${basePath}components/header.html`;
    const footerUrl = `${basePath}components/footer.html`;

    function fixPaths(html) {
        if (isRoot) return html;
        // Corrige atributos src e href que não iniciam com http, #, mailto, ou /
        return html.replace(/(href|src)="((?!http|#|mailto|\/|\.\.\/)[^"]+)"/g, (match, p1, p2) => {
            return `${p1}="${basePath}${p2}"`;
        });
    }

    const headerElement = document.getElementById('header') || document.getElementById('header-placeholder');
    if (headerElement) {
        fetch(headerUrl)
            .then(response => {
                if (!response.ok) throw new Error('Falha ao carregar header');
                return response.text();
            })
            .then(data => {
                headerElement.innerHTML = fixPaths(data);
                
                // Configurações do header
                const mainHeader = document.querySelector('.main-header');
                if (mainHeader) {
                    window.addEventListener('scroll', function () {
                        if (window.scrollY > 20) {
                            mainHeader.classList.add('scrolled');
                        } else {
                            mainHeader.classList.remove('scrolled');
                        }
                    });
                }
            })
            .catch(err => console.error(err));
    }

    const footerElement = document.getElementById('footer') || document.getElementById('footer-placeholder');
    if (footerElement) {
        fetch(footerUrl)
            .then(response => {
                if (!response.ok) throw new Error('Falha ao carregar footer');
                return response.text();
            })
            .then(data => {
                footerElement.innerHTML = fixPaths(data);
            })
            .catch(err => console.error(err));
    }
}

// Carregar componentes quando a página estiver pronta
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}
