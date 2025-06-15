// ==============================================
// COMPONENTE HEADER
// 
// Header principale del sito con logo, navigazione,
// autenticazione utente e overlay per gestione CV.
// Supporta interfacce diverse per admin, recruiter e candidati.
// ==============================================

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Plus, ChevronDown, Upload } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import CVUploadOverlay from './CVUploadOverlay';
import './Header.css';

const Header = () => {
  // HOOKS E CONTEXT
  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // STATI LOCALI DEL COMPONENTE
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);    // Stato dropdown menu utente
  const [isCVUploadOpen, setIsCVUploadOpen] = useState(false);    // Stato overlay caricamento CV
  const dropdownRef = useRef(null);                               // Ref per gestione click outside

  // DEBUG LOG - Traccia cambiamenti stato utente
  console.log('🔍 Header render - User state:', user);

  // EFFECT: GESTIONE CLICK OUTSIDE DROPDOWN
  // Chiude il dropdown quando si clicca fuori dall'area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // GESTIONE LOGOUT
  const handleLogout = () => {
    logout();                           // Esegue logout dal context
    navigate('/');                      // Redirect alla homepage
    setIsDropdownOpen(false);           // Chiude dropdown
  };
  
  // TOGGLE DROPDOWN MENU UTENTE
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
    // GESTIONE CARICAMENTO CV
  const handleCVUpload = async (file) => {
    try {
      // DEBUG: Verifica stato utente
      console.log('🔍 Debug CV Upload - User:', user);
      console.log('🔍 Debug CV Upload - User ID:', user?.id);
      console.log('🔍 Debug CV Upload - User Type:', typeof user?.id);
      
      // Validazione: verifica autenticazione e presenza ID utente
      if (!user || !user.id || user.id === undefined || user.id === null) {
        console.error('❌ User validation failed:', { user, userId: user?.id });
        throw new Error('Utente non autenticato o ID mancante');
      }

      // Conversione esplicita a stringa per sicurezza
      const userId = String(user.id);
      console.log('🔄 Converted userId to string:', userId);

      // Preparazione FormData per upload file
      const formData = new FormData();
      formData.append('cv', file);
      formData.append('userId', userId);

      console.log('📤 Sending CV upload request with userId:', userId);
      console.log('📋 FormData contents:', Array.from(formData.entries()));

      // Chiamata API per upload CV
      const response = await fetch(`${API_CONFIG.BASE_URL}/upload-cv`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        alert('CV caricato con successo!');
        // Aggiorna dati utente nel context (refresh invece di reload pagina)
        await refreshUser();
        setIsCVUploadOpen(false);         // Chiude overlay
      } else {
        throw new Error(result.error || 'Errore durante il caricamento');
      }
    } catch (error) {
      console.error('Errore durante l\'upload del CV:', error);
      throw error;                        // Rilancia errore per gestione nel componente figlio
    }
  };
  
  // GESTIONE ELIMINAZIONE CV
  const handleCVDelete = async () => {
    // Aggiorna dati utente dopo eliminazione CV
    await refreshUser();
  };

  // DESTINAZIONE LOGO DINAMICA BASATA SU TIPO UTENTE
  const getLogoDestination = () => {
    if (!isAuthenticated) return "/";                    // Ospiti -> Homepage
    if (user?.user_type === 'admin') return "/admin";    // Admin -> Dashboard admin
    if (user?.user_type === 'recruiter') return "/my-jobs"; // Recruiter -> I miei annunci
    return "/jobs";                                      // Candidati -> Lista offerte
  };

  // HELPER: VERIFICA SE LINK È ATTIVO
  const isActive = (path) => location.pathname === path;

  // RENDER HEADER AMMINISTRATORE - Layout minimale e tema scuro
  if (isAuthenticated && user?.user_type === 'admin') {
    return (
      <header className="header admin-header">
        <div className="header-container">
          {/* Logo amministratore con badge */}
          <Link to="/admin" className="logo">
            <div className="custom-logo">
              <span className="logo-text admin-logo">
                <span className="c-first">C</span>
                <span className="logo-middle">areer</span>
                <span className="c-second">C</span>
                <span className="logo-end">onnect</span>
                <span className="admin-badge">Admin</span>
              </span>
            </div>
          </Link>

          {/* Sezione destra con menu utente admin */}
          <div className="header-right">
            <div className="auth-section">
              <div className="user-menu" ref={dropdownRef}>
                {/* Trigger profilo admin */}
                <div className="user-profile-trigger" onClick={toggleDropdown}>
                  <div className="user-info admin-user-info">
                    <User size={20} />
                    <span className="user-name">{user.first_name} {user.last_name}</span>
                    <span className="user-type admin-type">Amministratore</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                  />
                </div>
                
                {/* Dropdown admin (solo logout) */}
                {isDropdownOpen && (
                  <div className="dropdown-menu admin-dropdown">
                    <button onClick={handleLogout} className="dropdown-item admin-logout">
                      <LogOut size={16} />
                      Esci
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // LOGICA VISUALIZZAZIONE ELEMENTI: Determina se mostrare navigazione o sezione auth
  const hasNavOrAuth = (user?.user_type !== 'admin' && isAuthenticated) || isAuthenticated;

  // RENDER HEADER NORMALE - Per ospiti, candidati e recruiter
  return (
    <>
      <header className="header">
        <div className={`header-container ${hasNavOrAuth ? 'has-nav-or-auth' : ''}`}>
          {/* Logo principale con destinazione dinamica */}
          <Link to={getLogoDestination()} className="logo">
            <div className="custom-logo">
              <span className="logo-text">
                <span className="c-first">C</span>
                <span className="logo-middle">areer</span>
                <span className="c-second">C</span>
                <span className="logo-end">onnect</span>
              </span>
            </div>
          </Link>

          {/* Divisore visuale - mostrato solo quando necessario */}
          {hasNavOrAuth && <div className="header-divider"></div>}          {/* NAVIGAZIONE PRINCIPALE */}
          <nav className="nav">
            {/* Navigazione rimossa per tutti i tipi di utente */}
          </nav>

          {/* SEZIONE DESTRA HEADER */}
          <div className="header-right">
            <div className="auth-section">
              {/* RENDERING CONDIZIONALE: Menu utente vs Bottoni guest */}
              {isAuthenticated ? (
                // MENU UTENTE AUTENTICATO
                <div className="user-menu" ref={dropdownRef}>
                  {/* Trigger profilo utente */}
                  <div className="user-profile-trigger" onClick={toggleDropdown}>
                    <div className="user-info">
                      <User size={20} />
                      <span className="user-name">{user.first_name} {user.last_name}</span>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                    />
                  </div>
                  
                  {/* Dropdown con azioni utente */}
                  {isDropdownOpen && (
                    <div className="user-dropdown">                      {/* Opzione "Crea Annuncio" - solo per recruiter */}
                      {user?.user_type === 'recruiter' && (
                        <Link
                          to="/create-job"
                          className="dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Plus size={16} />
                          <span>Crea Annuncio</span>
                        </Link>
                      )}
                      
                      {/* Opzione "Gestisci CV" - solo per candidati */}
                      {user?.user_type === 'candidate' && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsCVUploadOpen(true);
                          }}
                          className="dropdown-item"
                        >
                          <Upload size={16} />
                          <span>
                            {user?.cv_filename ? 'Gestisci CV' : 'Carica CV'}
                            {/* Indicatore CV presente */}
                            {user?.cv_filename && <span className="cv-indicator">•</span>}
                          </span>
                        </button>
                      )}
                      
                      {/* Opzione Logout - sempre presente */}
                      <button onClick={handleLogout} className="dropdown-item logout-item">
                        <LogOut size={16} />
                        <span>Esci</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // BOTTONI PER UTENTI NON AUTENTICATI
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-outline login-btn">
                    Accedi
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* OVERLAY GESTIONE CV - Mostrato condizionalmente */}
      <CVUploadOverlay
        isOpen={isCVUploadOpen}
        onClose={() => setIsCVUploadOpen(false)}
        onUpload={handleCVUpload}
        onDeleteCV={handleCVDelete}
        currentCV={user?.cv_filename}
        userId={user?.id}
      />
    </>
  );
};

export default Header;
