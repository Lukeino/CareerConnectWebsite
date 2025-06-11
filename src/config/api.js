// ==============================================
// CONFIGURAZIONE API
// 
// Gestisce la configurazione degli endpoint API per
// diversi ambienti (sviluppo, produzione, staging).
// Utilizza variabili d'ambiente Vite per flessibilità.
// ==============================================

// CONFIGURAZIONE PRINCIPALE API
export const API_CONFIG = {  
  // URL BASE API - LOGICA DI FALLBACK A CASCATA
  // Priorità: PROD -> DEV -> Default basato su ambiente
  // 1. VITE_API_URL_PROD: URL produzione (es. https://api.careerconnect.com)
  // 2. VITE_API_URL: URL sviluppo personalizzato
  // 3. Fallback automatico:
  //    - Produzione: '/api' (usa proxy Netlify/Vercel)
  //    - Sviluppo: 'http://localhost:3001/api' (server locale)
  BASE_URL: import.meta.env.VITE_API_URL_PROD || 
            import.meta.env.VITE_API_URL || 
            (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api'),
  
  // TIMEOUT RICHIESTE HTTP
  TIMEOUT: 10000,                      // 10 secondi - timeout globale per tutte le richieste
  
  // HEADERS HTTP PREDEFINITI
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json', // Tipo contenuto standard per API REST
  }
};

// DEBUG: LOGGING CONFIGURAZIONE CORRENTE
// Utile per troubleshooting problemi di connessione API
console.log('🔧 API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  ENVIRONMENT: import.meta.env.MODE || 'development',   // Modalità corrente (dev/prod)
  ALL_ENV_VARS: import.meta.env                         // Tutte le variabili ambiente (per debug)
});

// EXPORT DEFAULT PER RETROCOMPATIBILITÀ
export default API_CONFIG;
