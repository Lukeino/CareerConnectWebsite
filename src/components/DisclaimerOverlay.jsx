import React, { useState, useEffect } from 'react';
import './DisclaimerOverlay.css';

const DisclaimerOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted the disclaimer
    const hasAccepted = localStorage.getItem('careerconnect-disclaimer-accepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('careerconnect-disclaimer-accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">
        <div className="disclaimer-header">
          <div className="disclaimer-icon">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2L1 21H23L12 2Z" 
                stroke="#f59e0b" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="#fef3c7"
              />
              <path 
                d="M12 9V13" 
                stroke="#f59e0b" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M12 17H12.01" 
                stroke="#f59e0b" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="disclaimer-title">Avviso Importante</h2>
        </div>
        
        <div className="disclaimer-content">
          <p className="disclaimer-text">
            Il sito web <strong>CareerConnect</strong> è stato sviluppato 
            esclusivamente come progetto universitario per l'esame di Ingegneria del Software, 
            realizzato in un arco di tempo limitato seguendo una metodologia Agile.
          </p>
          
          <div className="disclaimer-warning-box">            <ul className="disclaimer-list">
              <li>Il sito <strong>non è monitorato né gestito</strong> attivamente</li>
              <li>Può contenere <strong>informazioni e account fittizi</strong></li>
              <li>È destinato esclusivamente a <strong>scopi di portfolio</strong> e dimostrativi</li>
              <li>Alcune funzionalità potrebbero essere <strong>semplificate o simulate</strong> per esigenze accademiche</li>
            </ul>
          </div>
          
          <p className="disclaimer-footer-text">
            Procedendo con la navigazione, accetti di utilizzare il sito consapevole 
            della sua natura dimostrativa e didattica.
          </p>
        </div>
        
        <div className="disclaimer-actions">
          <button 
            className="disclaimer-accept-btn" 
            onClick={handleAccept}
          >
            Ho Capito, Continua
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerOverlay;
