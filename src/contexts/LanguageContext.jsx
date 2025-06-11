// ==============================================
// CONTEXT INTERNAZIONALIZZAZIONE
// 
// Context React per gestire la localizzazione dell'applicazione.
// Supporta italiano e inglese con persistenza localStorage
// e rilevamento automatico lingua browser.
// ==============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

// CREAZIONE CONTEXT LINGUE
const LanguageContext = createContext();

// HOOK PERSONALIZZATO PER UTILIZZARE IL CONTEXT
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  // Validazione: hook utilizzato solo dentro LanguageProvider
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// PROVIDER COMPONENTE - Gestisce stato lingua globale
export const LanguageProvider = ({ children }) => {
  // STATO LINGUA CORRENTE
  const [currentLanguage, setCurrentLanguage] = useState('it'); // Default italiano

  // EFFECT: INIZIALIZZAZIONE LINGUA AL MOUNT
  useEffect(() => {
    // PRIORITÀ 1: Lingua salvata in localStorage (preferenza utente)
    const savedLanguage = localStorage.getItem('careerconnect_language');
    if (savedLanguage && ['it', 'en'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // PRIORITÀ 2: Rilevamento automatico lingua browser
      const browserLang = navigator.language.split('-')[0]; // Estrae codice lingua (es. 'it' da 'it-IT')
      if (['it', 'en'].includes(browserLang)) {
        setCurrentLanguage(browserLang);
      }
      // Se nessuna delle due è supportata, mantiene default 'it'
    }
  }, []);

  // FUNZIONE CAMBIO LINGUA
  const changeLanguage = (lang) => {
    // Validazione: solo lingue supportate
    if (['it', 'en'].includes(lang)) {
      setCurrentLanguage(lang);
      // Persistenza scelta utente
      localStorage.setItem('careerconnect_language', lang);
    }
  };

  // FUNZIONE TRADUZIONE - Navigazione oggetto traduzioni tramite chiave dotted
  const t = (key) => {
    // Split chiave per navigazione nested (es. 'common.loading' -> ['common', 'loading'])
    const keys = key.split('.');
    let value = translations[currentLanguage]; // Parte dall'oggetto lingua corrente
    
    // Navigazione ricorsiva nell'oggetto traduzioni
    for (const k of keys) {
      value = value?.[k]; // Optional chaining per sicurezza
    }
    
    // Fallback: restituisce chiave se traduzione non trovata
    return value || key;
  };

  // VALORE DEL CONTEXT - Oggetto esposto a tutti i componenti figli
  const value = {
    // Stato corrente
    currentLanguage,                    // Codice lingua attiva ('it' | 'en')
    
    // Funzioni
    changeLanguage,                     // Funzione per cambiare lingua
    t,                                  // Funzione di traduzione
    
    // Helper computed properties per controlli rapidi
    isItalian: currentLanguage === 'it', // True se lingua italiana
    isEnglish: currentLanguage === 'en'  // True se lingua inglese
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
