// ==============================================
// UTILITY PER GESTIONE DATE E TIMESTAMP
// 
// Funzioni centralizzate per formattare date e calcolare 
// il tempo trascorso, con correzione automatica del fuso orario
// ==============================================

/**
 * Converte una data string dal database in un oggetto Date corretto
 * SOLUZIONE SEMPLICE: Aggiunge sempre +2 ore per compensare lo sfasamento del database
 */
export const parseDbDate = (dateString) => {
  if (!dateString) return null;
  
  // Parsing normale del timestamp
  const date = new Date(dateString);
  
  // Se la data è invalida, restituisci null
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // CORREZIONE FISSA: Aggiungi sempre 2 ore per compensare lo sfasamento
  const correctedDate = new Date(date.getTime() + (2 * 60 * 60 * 1000)); // +2 ore
  
  return correctedDate;
};

/**
 * Calcola il tempo trascorso da una data in formato human-readable
 */
export const formatTimeAgo = (dateString, jobId = null) => {
  const now = new Date();
  const date = parseDbDate(dateString);
  
  if (!date || isNaN(date.getTime())) {
    return 'Data non valida';
  }
  
  const diffInMs = now - date;
  
  // Se la data è nel futuro (errore), mostra messaggio appropriato
  if (diffInMs < 0) {
    return 'Appena pubblicato';
  }
  
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  
  if (diffInMinutes < 1) {
    return 'Appena pubblicato';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minut${diffInMinutes === 1 ? 'o' : 'i'} fa`;
  } else if (diffInHours < 24) {
    return `${diffInHours} or${diffInHours === 1 ? 'a' : 'e'} fa`;
  } else if (diffInDays < 7) {
    return diffInDays === 1 ? '1 giorno fa' : `${diffInDays} giorni fa`;
  } else if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 settimana fa' : `${diffInWeeks} settimane fa`;
  } else if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 mese fa' : `${diffInMonths} mesi fa`;
  } else {
    const years = Math.floor(diffInMonths / 12);
    return years === 1 ? '1 anno fa' : `${years} anni fa`;
  }
};

/**
 * Formatta una data in formato italiano standard
 */
export const formatDate = (dateString, options = {}) => {
  const date = parseDbDate(dateString);
  
  if (!date || isNaN(date.getTime())) {
    return 'Data non valida';
  }
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome' // Forza fuso orario italiano
  };
  
  return date.toLocaleDateString('it-IT', { ...defaultOptions, ...options });
};

/**
 * Formatta solo la data senza orario
 */
export const formatDateOnly = (dateString) => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Versione semplificata per MyJobsPage (solo giorni)
 */
export const formatTimeAgoSimple = (dateString) => {
  const now = new Date();
  const date = parseDbDate(dateString);
  
  if (!date || isNaN(date.getTime())) {
    return 'Data non valida';
  }
  
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Oggi';
  if (diffInDays === 1) return 'Ieri';
  if (diffInDays < 7) return `${diffInDays} giorni fa`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} settimane fa`;
  return `${Math.floor(diffInDays / 30)} mesi fa`;
};
