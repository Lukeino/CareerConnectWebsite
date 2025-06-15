import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDisableNumberInputWheel } from '../hooks/useDisableNumberInputWheel';
import { API_CONFIG } from '../config/api';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Clock, 
  FileText, 
  Tag, 
  Gift,
  Eye
} from 'lucide-react';
import './CreateJobPage.css';

const CreateJobPage = () => {  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full-time',
    salary_min: '',
    salary_max: '',
    requirements: '',
    benefits: '',
    company_description: ''
  });
    const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Use the custom hook to disable mouse wheel on number inputs
  useDisableNumberInputWheel();
  
  // Redirect if not a recruiter
  React.useEffect(() => {
    if (!isAuthenticated || !user || user.user_type !== 'recruiter') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è richiesto';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descrizione è richiesta';
    }
    
    if (formData.salary_min && formData.salary_max) {
      if (parseInt(formData.salary_min) > parseInt(formData.salary_max)) {
        newErrors.salary_max = 'Lo stipendio massimo deve essere maggiore del minimo';
      }
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
    
    try {      const jobData = {
        ...formData,
        recruiter_id: user.id,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null
      };
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      const responseText = await response.text();
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error('Invalid response format from server');
      }
      
      if (result.success) {
        // Redirect to My Jobs page
        navigate('/my-jobs');
      } else {
        setErrors({ submit: result.error || 'Errore nella creazione dell\'annuncio' });
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setErrors({ submit: 'Errore di connessione. Riprova più tardi.' });
    } finally {
      setLoading(false);
    }  };

  if (!isAuthenticated || !user || user.user_type !== 'recruiter') {
    return null; // Component will redirect
  }

  return (
    <div className="create-job-page">
      <div className="create-job-container">        {/* Header */}        <div className="page-header">
          <button 
            className="back-btn" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/my-jobs');
            }}
            type="button"
          >
            <ArrowLeft size={20} />
            Annulla
          </button><h1>Crea Nuovo Annuncio di Lavoro</h1>
          <p className="page-subtitle">
            Completa il form per pubblicare un nuovo annuncio di lavoro per {user.company}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="create-job-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h2>
                <FileText size={20} />
                Informazioni Base
              </h2>
              
              <div className="form-group">
                <label htmlFor="title">
                  Titolo della Posizione *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="es. Frontend Developer, Marketing Manager..."
                  className={errors.title ? 'error' : ''}
                  required
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Descrizione del Lavoro *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrivi le responsabilità, le competenze richieste e cosa offre la posizione..."
                  rows={6}
                  className={errors.description ? 'error' : ''}
                  required
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">
                    <MapPin size={16} />
                    Località
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="es. Milano, Roma, Remoto..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="job_type">
                    <Clock size={16} />
                    Tipo di Contratto
                  </label>
                  <select
                    id="job_type"
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleInputChange}
                  >
                    <option value="full-time">Tempo Pieno</option>
                    <option value="part-time">Tempo Parziale</option>
                    <option value="contract">Contratto</option>
                    <option value="internship">Stage</option>
                  </select>                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="form-section">
              <h2>
                <Building size={20} />
                Informazioni sull'Azienda
              </h2>
              
              <div className="form-group">
                <label htmlFor="company_description">
                  Descrizione dell'Azienda
                </label>
                <textarea
                  id="company_description"
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleInputChange}
                  placeholder="Descrivi la tua azienda, la missione, i valori e l'ambiente di lavoro..."
                  rows={4}
                />
                <small className="form-hint">
                  Aiuta i candidati a conoscere meglio la tua azienda (cultura, valori, storia, ecc.)
                </small>
              </div>
            </div>

            {/* Salary Information */}
            <div className="form-section">
              <h2>
                Informazioni Retributive
              </h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="salary_min">
                    Stipendio Minimo (€)
                  </label>
                  <input
                    type="number"
                    id="salary_min"
                    name="salary_min"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                    placeholder="30000"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="salary_max">
                    Stipendio Massimo (€)
                  </label>
                  <input
                    type="number"
                    id="salary_max"
                    name="salary_max"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                    placeholder="50000"
                    min="0"
                    className={errors.salary_max ? 'error' : ''}
                  />
                  {errors.salary_max && <span className="error-text">{errors.salary_max}</span>}
                </div>
              </div>
            </div>

            {/* Requirements and Benefits */}
            <div className="form-section">
              <h2>
                <Tag size={20} />
                Competenze e Benefici
              </h2>
              
              <div className="form-group">
                <label htmlFor="requirements">
                  Competenze Richieste
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="React, TypeScript, CSS, Git (separa con virgole)"
                  rows={3}
                />
                <small className="form-hint">
                  Inserisci le competenze separate da virgole (es. React, Node.js, SQL)
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="benefits">
                  <Gift size={16} />
                  Benefici e Vantaggi
                </label>
                <textarea
                  id="benefits"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  placeholder="Assicurazione sanitaria, buoni pasto, smart working..."
                  rows={3}
                />
                <small className="form-hint">
                  Descrivi i benefici offerti (assicurazione, formazione, flessibilità, ecc.)
                </small>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            {errors.submit && (
              <div className="error-message">
                {errors.submit}
              </div>
            )}
              <div className="action-buttons">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  'Creazione in corso...'
                ) : (
                  <>
                    <Eye size={16} />
                    Pubblica Annuncio
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;
