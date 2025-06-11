// ==============================================
// COMPONENTE PLACEHOLDER PAGE
// 
// Componente generico per pagine in sviluppo o temporanee.
// Mostra messaggi localizzati passati come props.
// Utile per prototipazione rapida e sezioni non ancora implementate.
// ==============================================

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const PlaceholderPage = ({ messageKey }) => {
  // HOOK INTERNAZIONALIZZAZIONE
  const { t } = useLanguage();  // Funzione di traduzione dal context lingue
  
  return (
    <div className="placeholder-page">
      {/* MESSAGGIO LOCALIZZATO - Chiave passata come prop */}
      {t(messageKey)}
    </div>
  );
};

export default PlaceholderPage;
