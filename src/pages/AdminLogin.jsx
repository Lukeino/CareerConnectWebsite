import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Users,
  Activity,
  Database
} from 'lucide-react';
import WebsiteLogo from '../assets/WebsiteLogo.png';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  // Redirect if already authenticated as admin
  if (isAuthenticated && user?.user_type === 'admin') {
    return <Navigate to="/admin" />;
  }

  // Show unauthorized message for non-admin users
  if (isAuthenticated && user?.user_type !== 'admin') {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <div className="unauthorized-container">
            <div className="unauthorized-content">
              <Shield size={64} className="unauthorized-icon" />
              <h2>Accesso Non Autorizzato</h2>
              <p>
                Questa area è riservata esclusivamente agli amministratori del sistema.
                <br />
                Il tuo account attuale non dispone dei privilegi necessari per accedere a questa sezione.
              </p>              <div className="unauthorized-actions">
                <button 
                  onClick={() => {
                    // Navigate to appropriate page based on user type
                    if (user?.user_type === 'recruiter') {
                      navigate('/my-jobs');
                    } else if (user?.user_type === 'candidate') {
                      navigate('/jobs');
                    } else {
                      navigate('/');
                    }
                  }} 
                  className="btn-primary"
                >
                  {user?.user_type === 'recruiter' ? 'Torna ai Miei Annunci' : 'Torna alle Offerte'}
                </button>
                <button 
                  onClick={() => {
                    // Logout and redirect to admin login
                    logout();
                    window.location.href = '/adminlogin';
                  }} 
                  className="btn-secondary"
                >
                  Accedi come Amministratore
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email amministratore richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }

    if (!formData.password) {
      newErrors.password = 'Password richiesta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Check if user is admin
        if (result.user?.user_type === 'admin') {
          navigate('/admin');
        } else {
          setErrors({ submit: 'Accesso negato. Solo amministratori autorizzati.' });
        }
      } else {
        setErrors({ submit: 'Credenziali non valide o accesso non autorizzato' });
      }
    } catch (error) {
      setErrors({ submit: 'Errore di connessione al sistema' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="admin-login-page">
      {/* Main Container */}
      <div className="admin-login-container">
        {/* Left Side - Branding */}
        <div className="admin-branding">
          <div className="admin-brand-content">            <div className="admin-logo-section">
              <div className="logo-wrapper">
                <img src={WebsiteLogo} alt="CareerConnect" className="logo-image" />
              </div>
              <p className="admin-subtitle">
                Sistema di Amministrazione
              </p>
            </div>            <div className="admin-features">
              <div className="feature-item">
                <Users size={20} />
                <span>Gestione utenti registrati</span>
              </div>
              <div className="feature-item">
                <Activity size={20} />
                <span>Monitoraggio delle attività</span>
              </div>
              <div className="feature-item">
                <Database size={20} />
                <span>Gestione del Database</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="admin-form-section">
          <div className="admin-form-container">            <div className="admin-form-header">
              <h2>Accesso Amministratore</h2>
              <p>Inserisci le tue credenziali per accedere al sistema di gestione</p>
            </div>

            <form onSubmit={handleSubmit} className="admin-login-form">              <div className="admin-form-group">
                <label htmlFor="email">Email Amministratore</label>
                <div className="admin-input-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Inserisci email amministratore"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="admin-error-message">{errors.email}</span>}
              </div>

              <div className="admin-form-group">
                <label htmlFor="password">Password</label>
                <div className="admin-input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="Inserisci password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {errors.password && <span className="admin-error-message">{errors.password}</span>}
              </div>

              {errors.submit && (
                <div className="admin-submit-error">
                  <AlertTriangle size={18} />
                  <span>{errors.submit}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="admin-submit-btn"
              >
                {loading ? 'Accesso in corso...' : 'Accedi al Sistema'}
              </button>
            </form>            <div className="admin-form-footer">
              <p>
                Accesso riservato al personale autorizzato
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
