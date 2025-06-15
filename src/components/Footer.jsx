// ==============================================
// COMPONENTE FOOTER
// 
// Footer del sito con sezioni informative, link utili
// e accesso discreto all'area amministratore.
// ==============================================

import React from 'react';
import './Footer.css';

const Footer = () => {

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* CONTENUTO PRINCIPALE FOOTER */}
        <div className="footer-content">
          {/* SEZIONE BRAND - Informazioni azienda */}
          <div className="footer-section">
            <h3>CareerConnect</h3>
            <p>Connetti talenti e opportunità</p>
          </div>
          
          {/* SEZIONE CANDIDATI - Link per chi cerca lavoro */}
          <div className="footer-section">
            <h4>Candidati</h4>
            <ul>
              <li><a href="/jobs">Cerca Lavori</a></li>
            </ul>
          </div>
          
          {/* SEZIONE AZIENDE - Link per chi offre lavoro */}
          <div className="footer-section">
            <h4>Aziende</h4>
            <ul>
              <li><a href="/create-job">Pubblica Annuncio</a></li>
            </ul>
          </div>
          
          {/* SEZIONE SUPPORTO - Link legali e assistenza */}
          <div className="footer-section">
            <h4>Supporto</h4>
            <ul>
              <li><a href="/privacy">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        {/* FOOTER BOTTOM - Copyright e accesso admin */}
        <div className="footer-bottom">
          {/* Testo copyright */}
          <p>&copy; 2025 CareerConnect. Tutti i diritti riservati.</p>
          
          {/* LINK ACCESSO ADMIN DISCRETO */}
          {/* Simbolo • quasi invisibile che porta al login amministratore */}
          <a href="/adminlogin" className="admin-access-link" title="Accesso Amministratore">
            •
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
