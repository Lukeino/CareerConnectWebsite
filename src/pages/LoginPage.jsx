import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import LoginGif from '../assets/Login.gif';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

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
      newErrors.email = 'Email è richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.password) {
      newErrors.password = 'Password è richiesta';
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
        navigate(from, { replace: true });
      } else {
        setErrors({ submit: result.error });
      }    } catch (error) {
      setErrors({ submit: 'Errore durante il login. Riprova.' });
    } finally {
      setLoading(false);
    }
  };  return (    
    <div className="login-page">
      <div className="background-overlay"></div>
      <div className="login-background-gif">
        <img src={LoginGif} alt="Login Animation" className="background-gif" />
      </div>
      
      <div className="login-container">        
        <div className="login-header">
          <h1>Accedi al tuo Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form"><div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="login-input-group">
              <Mail className="login-input-icon" size={18} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Inserisci la tua email"
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="login-input-group">
              <Lock className="login-input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}                placeholder="Inserisci la tua password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Accedendo...' : 'Accedi'}
          </button>          <div className="divider">
            <span></span>
          </div>          <p className="register-link">
            Non hai un account? <Link to="/register">Registrati</Link>
          </p>        </form>
      </div>
      
      <div className="side-disclaimer">
        <div className="side-disclaimer-content">
          <h3>Accesso Unico</h3>
          <p>
            <strong>Per Candidati e Recruiter</strong>
          </p>
          <p>
            Utilizza le tue credenziali per accedere. Verrai automaticamente indirizzato alla tua dashboard personalizzata in base al tuo ruolo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
