import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Phone, Building, UserCheck, Briefcase, Eye, EyeOff } from 'lucide-react';
import './RegisterPage.css';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialUserType = searchParams.get('type') || 'candidate';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    userType: initialUserType
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register } = useAuth();
  const navigate = useNavigate();

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
    const newErrors = {};    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome è richiesto';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Cognome è richiesto';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email è richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato email non valido';
    }

    if (!formData.password) {
      newErrors.password = 'Password è richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La password deve avere almeno 6 caratteri';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non corrispondono';
    }

    if (formData.userType === 'recruiter' && !formData.company.trim()) {
      newErrors.company = 'Nome azienda è richiesto per i recruiter';
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
      const result = await register({
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company || null,
        phone: formData.phone || null
      });

      if (result.success) {
        navigate('/');      } else {
        setErrors({ submit: result.error });
      }
    } catch (error) {
      setErrors({ submit: 'Errore durante la registrazione. Riprova.' });
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="register-page">
      <div className="register-background-overlay"></div>
      
      <div className="page-header">
        <h1>Entra e connettiti con il mondo professionale</h1>
      </div>
      <div className="register-container">{/* User Type Selection */}
        <div className="user-type-selection">          <label className={`user-type-option ${formData.userType === 'candidate' ? 'selected' : ''}`} data-type="candidate">
            <input
              type="radio"
              name="userType"
              value="candidate"
              checked={formData.userType === 'candidate'}
              onChange={handleInputChange}
            />            <div className="user-type-card">
              <User size={20} />
              <div className="user-type-card-content">
                <h3>Candidato</h3>
              </div>
            </div>
          </label>
          
          <label className={`user-type-option ${formData.userType === 'recruiter' ? 'selected' : ''}`} data-type="recruiter">
            <input
              type="radio"
              name="userType"
              value="recruiter"
              checked={formData.userType === 'recruiter'}
              onChange={handleInputChange}
            />            <div className="user-type-card">
              <Briefcase size={20} />
              <div className="user-type-card-content">
                <h3>Recruiter</h3>
              </div>
            </div>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nome</label>
              <div className="register-input-group">
                <User className="register-input-icon" size={18} />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Inserisci il tuo nome"
                />
              </div>
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Cognome</label>
              <div className="register-input-group">
                <UserCheck className="register-input-icon" size={18} />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Inserisci il tuo cognome"
                />
              </div>
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="register-input-group">
              <Mail className="register-input-icon" size={18} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Inserisci la tua email"
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="register-input-group">
                <Lock className="register-input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Crea una password sicura"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Conferma Password</label>
              <div className="register-input-group">
                <Lock className="register-input-icon" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Ripeti la password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div><div className="form-group">
            <label htmlFor="phone">Telefono (Opzionale)</label>
            <div className="register-input-group">
              <Phone className="register-input-icon" size={18} />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Il tuo numero di telefono"
              />
            </div>
          </div>          {formData.userType === 'recruiter' && (
            <div className="form-group">
              <label htmlFor="company">Nome Azienda</label>
              <div className="register-input-group">
                <Building className="register-input-icon" size={18} />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={errors.company ? 'error' : ''}
                  placeholder="Nome della tua azienda"
                />
              </div>
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>
          )}

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creazione account...' : 'Crea Account'}
          </button>

          <p className="login-link">
            Hai già un account? <Link to="/login">Accedi</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
