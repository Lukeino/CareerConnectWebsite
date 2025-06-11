import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Building2, 
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';
import { formatTimeAgo } from '../utils/dateUtils';
import './JobDetailsPage.css';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, isCandidate, user } = useAuth();  

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    // Fetch job data from API
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/jobs/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setJob(null);
          } else {
            throw new Error('Failed to fetch job');
          }
        } else {
          const jobData = await response.json();
          setJob(jobData);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);
  // Check if user has already applied for this job
  useEffect(() => {
    const checkApplication = async () => {
      if (isAuthenticated && isCandidate && user && job) {
        try {
          const response = await fetch(`${API_CONFIG.BASE_URL}/applications/check/${id}/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setHasApplied(data.hasApplied);
          }
        } catch (error) {
          console.error('Error checking application status:', error);
        }
      }
    };

    checkApplication();
  }, [id, isAuthenticated, isCandidate, user, job]);

  const getJobTypeText = (type) => {
    const typeMap = {
      'full-time': t('jobDetails.fullTime'),
      'part-time': t('jobDetails.partTime'),
      'contract': t('jobDetails.contract'),
      'internship': t('jobDetails.internship')
    };
    return typeMap[type] || type;
  };  const formatSalary = (min, max) => {
    if (!min && !max) return '-';
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
    if (min) return `Da €${min.toLocaleString()}`;
    if (max) return `Fino a €${max.toLocaleString()}`;
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isCandidate) {
      alert('Solo i candidati possono candidarsi per i lavori.');
      return;
    }

    if (hasApplied) {
      alert('Ti sei già candidato per questo lavoro!');
      return;
    }

    setApplying(true);
      try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: parseInt(id),
          candidate_id: user.id
        })
      });

      const data = await response.json();      if (data.success) {
        setHasApplied(true);
        // Candidatura inviata senza messaggio di overlay
      } else {
        alert(data.error || 'Errore nell\'invio della candidatura');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Errore di connessione. Riprova più tardi.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="job-details-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-not-found">
        <div className="not-found-content">
          <h1>{t('jobDetails.jobNotFound')}</h1>
          <p>{t('jobDetails.jobNotFoundDesc')}</p>
          <Link to="/" className="btn btn-primary">
            {t('jobDetails.backToJobs')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-page">
      <div className="job-details-container">        {/* Header */}
        <div className="job-details-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Ritorna
          </button>
          <div className="job-actions">
          </div>
        </div>{/* Job Info */}
        <div className="job-info-section">
          <div className="job-header">
            <div className="job-title-section">
              <h1>{job.title}</h1>
              <div className="job-meta">
                <div className="meta-item">
                  <Building2 size={16} />
                  <span>{job.company_name || '-'}</span>
                </div>
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{job.location || '-'}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{job.job_type ? getJobTypeText(job.job_type) : '-'}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{formatTimeAgo(job.created_at, job.id)}</span>
                </div>
              </div>
            </div>
              <div className="salary-section">
              <div className="salary">
                <span>{formatSalary(job.salary_min, job.salary_max)}</span>
              </div>              {isCandidate && (
                <button 
                  onClick={handleApply} 
                  className={`apply-button ${hasApplied ? 'applied' : ''}`}
                  disabled={applying || hasApplied}
                >
                  {applying ? 'Invio in corso...' : 
                   hasApplied ? 'Già candidato ✓' : 
                   t('jobDetails.applyNow')}
                </button>
              )}
            </div>
          </div>
        </div>        {/* Main Content */}
        <div className="job-content">
          <div className="job-main">            {/* Job Description */}
            <section className="content-section">
              <h2>{t('jobDetails.jobDescription')}</h2>
              <div className="description-content">
                {job.description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Requirements */}
            {job.requirements && (
              <section className="content-section">
                <h2>{t('jobDetails.requirements')}</h2>
                <ul className="requirements-list">
                  {job.requirements.split(',').map((requirement, index) => (
                    <li key={index}>
                      <CheckCircle size={16} />
                      <span>{requirement.trim()}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Benefits */}
            {job.benefits && (
              <section className="content-section">
                <h2>{t('jobDetails.benefits')}</h2>
                <ul className="benefits-list">
                  {job.benefits.split(',').map((benefit, index) => (
                    <li key={index}>
                      <CheckCircle size={16} />
                      <span>{benefit.trim()}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>          {/* Sidebar */}
          <div className="job-sidebar">
            <div className="company-card">
              <h3>{t('jobDetails.companyInfo')}</h3>              <div className="company-details">
                <h4>{job.company_name}</h4>
                <p>{job.company_description || '-'}</p>
                <div className="company-stats">
                  <div className="stat">
                    <span className="label">{t('jobDetails.location')}:</span>
                    <span className="value">{job.location || '-'}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Recruiter:</span>
                    <span className="value">{job.recruiter_name || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
