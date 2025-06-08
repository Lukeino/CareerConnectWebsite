import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, LogOut, Briefcase, LogIn, UserPlus, Globe, Plus } from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug log per vedere quando l'user cambia
  console.log('🔍 Header render - User state:', user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <Briefcase size={32} />
          <span>CareerConnect</span>
        </Link>        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            {t('header.home')}
          </Link>
          <Link 
            to="/jobs" 
            className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
          >
            {t('header.jobs')}
          </Link>
          <Link 
            to="/companies" 
            className={`nav-link ${isActive('/companies') ? 'active' : ''}`}
          >          {t('header.companies')}
          </Link>
        </nav>

        <div className="header-right">
          <div className="language-selector">
            <button 
              className={`lang-btn ${currentLanguage === 'it' ? 'active' : ''}`}
              onClick={() => changeLanguage('it')}
            >
              <Globe size={16} />
              IT
            </button>
            <button 
              className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
            >
              <Globe size={16} />
              EN
            </button>
          </div>

          <div className="auth-section">
          {isAuthenticated ? (            <div className="user-menu">
              {/* Pulsante "Crea Offerta" per i reclutatori - stile professionale */}
              {user?.user_type === 'recruiter' && (
                <Link
                  to="/create-job" 
                  className={`create-job-link ${isActive('/create-job') ? 'active' : ''}`}
                >
                  <Plus size={16} />
                  <span>{t('header.createJob')}</span>
                </Link>
              )}
              
              <div className="user-info">
                <User size={20} />
                <span>{user.first_name} {user.last_name}</span>
                <span className="user-type">({user.user_type})</span>
              </div><button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
                {t('header.logout')}
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                <LogIn size={16} />
                {t('header.login')}
              </Link>
              <Link to="/register" className="btn btn-primary">
                <UserPlus size={16} />
                {t('header.signup')}
              </Link>
            </div>            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
