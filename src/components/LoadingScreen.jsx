// ==============================================
// COMPONENTE LOADING SCREEN
// 
// Schermata di caricamento mostrata durante
// l'inizializzazione dell'app e operazioni asincrone.
// Supporta internazionalizzazione per il testo.
// ==============================================

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LoadingScreen = () => {
  // HOOK INTERNAZIONALIZZAZIONE
  const { t } = useLanguage();  // Funzione di traduzione dal context lingue
  
  return (
    <div className="loading-screen">
      {/* SPINNER ANIMATO - Definito tramite CSS */}
      <div className="loading-spinner"></div>
      
      {/* TESTO CARICAMENTO LOCALIZZATO */}
      <p>{t('common.loadingApp')}</p>
    </div>
  );
};

export default LoadingScreen;
