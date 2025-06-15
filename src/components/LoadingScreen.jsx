// ==============================================
// COMPONENTE LOADING SCREEN
// 
// Schermata di caricamento mostrata durante
// l'inizializzazione dell'app e operazioni asincrone.
// ==============================================

import React from 'react';

const LoadingScreen = () => {
  
  return (
    <div className="loading-screen">
      {/* SPINNER ANIMATO - Definito tramite CSS */}
      <div className="loading-spinner"></div>
      
      {/* TESTO CARICAMENTO */}
      <p>Caricamento...</p>
    </div>
  );
};

export default LoadingScreen;
