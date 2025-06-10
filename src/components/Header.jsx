import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Plus, ChevronDown } from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Debug log per vedere quando l'user cambia
  console.log('🔍 Header render - User state:', user);

  // Chiudi il dropdown quando si clicca fuori
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

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };  const getLogoDestination = () => {
    if (!isAuthenticated) return "/";
    if (user?.user_type === 'admin') return "/admin";
    if (user?.user_type === 'recruiter') return "/my-jobs";
    return "/jobs"; // For candidates
  };

  const isActive = (path) => location.pathname === path;

  // If user is admin, show minimal header
  if (isAuthenticated && user?.user_type === 'admin') {
    return (
      <header className="header admin-header">
        <div className="header-container">
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

          <div className="header-right">
            <div className="auth-section">
              <div className="user-menu" ref={dropdownRef}>
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

  return (
    <header className="header">
      <div className="header-container">        <Link to={getLogoDestination()} className="logo">
          <div className="custom-logo">
            <span className="logo-text">
              <span className="c-first">C</span>
              <span className="logo-middle">areer</span>
              <span className="c-second">C</span>
              <span className="logo-end">onnect</span>
            </span>
          </div>
        </Link>        <nav className="nav">
          {/* Hide navigation for admin users and guests */}
          {user?.user_type !== 'admin' && isAuthenticated && (
            <>
              {/* Show Jobs link only for authenticated candidates */}
              {user?.user_type === 'candidate' && (
                <Link 
                  to="/jobs" 
                  className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
                >
                  Lista Offerte
                </Link>
              )}
              
              {/* Show My Jobs link only for authenticated recruiters */}
              {user?.user_type === 'recruiter' && (
                <Link 
                  to="/my-jobs" 
                  className={`nav-link ${isActive('/my-jobs') ? 'active' : ''}`}
                >
                  I Miei Annunci
                </Link>
              )}
            </>
          )}
        </nav><div className="header-right">
          <div className="auth-section">{isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <div className="user-profile-trigger" onClick={toggleDropdown}>
                <div className="user-info">
                  <User size={20} />
                  <span className="user-name">{user.first_name} {user.last_name}</span>
                  <span className="user-type">({user.user_type})</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                />
              </div>
              
              {isDropdownOpen && (
                <div className="user-dropdown">
                  {user?.user_type === 'recruiter' && (
                    <Link
                      to="/create-job" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Plus size={16} />                      <span>Crea Offerta</span>
                    </Link>
                  )}
                  
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <LogOut size={16} />
                    <span>Esci</span>
                  </button>
                </div>
              )}
            </div>) : (            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline login-btn">
                Accedi
              </Link>
            </div>)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
