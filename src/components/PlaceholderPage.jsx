// ==============================================
// COMPONENTE PLACEHOLDER PAGE
// 
// Componente generico per pagine in sviluppo o temporanee.
// Mostra messaggi localizzati passati come props.
// Utile per prototipazione rapida e sezioni non ancora implementate.
// ==============================================

import React from 'react';

const PlaceholderPage = ({ message = "Pagina in sviluppo" }) => {
  
  return (
    <div className="placeholder-page">
      {/* MESSAGGIO PLACEHOLDER */}
      {message}
    </div>
  );
};

export default PlaceholderPage;
