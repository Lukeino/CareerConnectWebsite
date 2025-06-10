import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>CareerConnect</h3>
            <p>Connetti talenti e opportunità</p>
          </div>          <div className="footer-section">
            <h4>Candidati</h4>
            <ul>
              <li><a href="/jobs">Cerca Lavori</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Aziende</h4>
            <ul>
              <li><a href="/create-job">Pubblica Offerta</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Supporto</h4>
            <ul>
              <li><a href="/privacy">Privacy</a></li>
            </ul>
          </div>
        </div>        <div className="footer-bottom">
          <p>&copy; 2025 CareerConnect. Tutti i diritti riservati.</p>
          {/* Discrete admin access link */}
          <a href="/adminlogin" className="admin-access-link" title="Accesso Amministratore">
            •
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
