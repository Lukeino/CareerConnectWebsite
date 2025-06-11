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
  Database,
  Activity
} from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  if (isAuthenticated && user?.user_type === 'admin') {
    return <Navigate to="/admin" />;
  }

  // Redirect non-admin users to regular login
  if (isAuthenticated && user?.user_type !== 'admin') {
    return <Navigate to="/login" />;
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
      {/* Background Pattern */}
      <div className="admin-bg-pattern"></div>
      
      {/* Main Container */}
      <div className="admin-login-container">
        {/* Left Side - Branding */}
        <div className="admin-branding">
          <div className="admin-brand-content">
            <div className="admin-logo-section">
              <Shield size={48} className="admin-shield-icon" />
              <h1 className="admin-brand-title">
                <span className="brand-career">Career</span>
                <span className="brand-connect">Connect</span>
              </h1>
              <div className="admin-subtitle">
                <Database size={16} />
                <span>Sistema di Amministrazione</span>
              </div>
            </div>
            
            <div className="admin-features">
              <div className="feature-item">
                <Activity size={20} />
                <span>Monitoraggio Real-time</span>
              </div>
              <div className="feature-item">
                <Shield size={20} />
                <span>Accesso Sicuro</span>
              </div>
              <div className="feature-item">
                <Database size={20} />
                <span>Gestione Database</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="admin-form-section">
          <div className="admin-form-container">
            <div className="admin-form-header">
              <div className="admin-form-icon">
                <Lock size={24} />
              </div>
              <h2>Accesso Amministratore</h2>
              <p>Inserisci le credenziali per accedere al pannello di controllo</p>
            </div>

            <form onSubmit={handleSubmit} className="admin-login-form">
              <div className="admin-form-group">
                <label htmlFor="email">Email Amministratore</label>
                <div className="admin-input-group">
                  <Mail className="admin-input-icon" size={18} />                  <input
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
                  <Lock className="admin-input-icon" size={18} />                  <input
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
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                {loading ? (
                  <>
                    <Activity className="loading-spinner" size={18} />
                    Accesso in corso...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Accedi al Sistema
                  </>
                )}
              </button>
            </form>

            <div className="admin-form-footer">
              <p>
                <Lock size={14} />
                Accesso riservato esclusivamente al personale autorizzato
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
