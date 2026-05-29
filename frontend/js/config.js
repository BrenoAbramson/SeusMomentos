// Configuração da URL da API do backend
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8080'
  : 'https://seus-momentos-backend.onrender.com'; // IMPORTANTE: Substitua por sua URL do Render após criá-la

window.API_BASE_URL = API_BASE_URL;
