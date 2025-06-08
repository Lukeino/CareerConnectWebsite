import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Mail, Lock, Phone, Building, UserCheck, Briefcase } from 'lucide-react';
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
  
  const { register } = useAuth();
  const { t } = useLanguage();
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
      newErrors.firstName = t('auth.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsNotMatch');
    }

    if (formData.userType === 'recruiter' && !formData.company.trim()) {
      newErrors.company = t('auth.companyRequired');
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
      setErrors({ submit: t('auth.registrationFailed') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">        <div className="register-header">
          <h1>{t('auth.registerTitle')}</h1>
          <p>CareerConnect</p>
        </div>

        {/* User Type Selection */}
        <div className="user-type-selection">          <label className={`user-type-option ${formData.userType === 'candidate' ? 'selected' : ''}`} data-type="candidate">
            <input
              type="radio"
              name="userType"
              value="candidate"
              checked={formData.userType === 'candidate'}
              onChange={handleInputChange}
            />            <div className="user-type-card">
              <User size={32} />
              <h3>{t('auth.candidate')}</h3>
              <p>{t('homepage.findDreamJobDesc')}</p>
            </div>
          </label>
          
          <label className={`user-type-option ${formData.userType === 'recruiter' ? 'selected' : ''}`} data-type="recruiter">
            <input
              type="radio"
              name="userType"
              value="recruiter"
              checked={formData.userType === 'recruiter'}
              onChange={handleInputChange}
            />
            <div className="user-type-card">
              <Briefcase size={32} />
              <h3>{t('auth.recruiter')}</h3>
              <p>{t('homepage.findTalentDesc')}</p>
            </div>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">{t('auth.firstName')}</label>
              <div className="register-input-group">
                <User className="register-input-icon" size={18} />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder={t('auth.firstName')}
                />
              </div>
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">{t('auth.lastName')}</label>
              <div className="register-input-group">
                <UserCheck className="register-input-icon" size={18} />
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder={t('auth.lastName')}
                />
              </div>
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <div className="register-input-group">
              <Mail className="register-input-icon" size={18} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder={t('auth.enterEmail')}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">{t('auth.password')}</label>
              <div className="register-input-group">
                <Lock className="register-input-icon" size={18} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder={t('auth.enterPassword')}
                />
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
              <div className="register-input-group">
                <Lock className="register-input-icon" size={18} />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                />
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>          <div className="form-group">
            <label htmlFor="phone">{t('auth.phoneOptional')}</label>
            <div className="register-input-group">
              <Phone className="register-input-icon" size={18} />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('auth.enterPhone')}
              />
            </div>
          </div>          {formData.userType === 'recruiter' && (
            <div className="form-group">
              <label htmlFor="company">{t('auth.companyName')}</label>
              <div className="register-input-group">
                <Building className="register-input-icon" size={18} />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={errors.company ? 'error' : ''}
                  placeholder={t('auth.enterCompany')}
                />
              </div>
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>
          )}

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
          </button>

          <p className="login-link">
            {t('auth.alreadyHaveAccount')} <Link to="/login">{t('header.login')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
