// Configurazione API per diversi ambienti
export const API_CONFIG = {  
  // URL base API - priorità: PROD -> DEV -> EC2 default
  // In produzione su Netlify, userà /api (proxy)
  // In sviluppo, userà localhost
  BASE_URL: import.meta.env.VITE_API_URL_PROD || 
            import.meta.env.VITE_API_URL || 
            (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'),
  
  // Timeout per le richieste (in millisecondi)
  TIMEOUT: 10000,
  
  // Headers predefiniti
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Debug: mostra configurazione corrente
console.log('🔧 API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  ENVIRONMENT: import.meta.env.MODE || 'development',
  ALL_ENV_VARS: import.meta.env
});

export default API_CONFIG;
