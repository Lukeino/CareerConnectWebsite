import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Building2, 
  Share2, 
  Heart,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './JobDetailsPage.css';

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, isCandidate } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {    // Fetch job data from API
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/jobs/${id}`);
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
  const getJobTypeText = (type) => {
    const typeMap = {
      'full-time': t('jobDetails.fullTime'),
      'part-time': t('jobDetails.partTime'),
      'contract': t('jobDetails.contract'),
      'internship': t('jobDetails.internship')
    };
    return typeMap[type] || type;
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Stipendio da concordare';
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
    if (min) return `Da €${min.toLocaleString()}`;
    if (max) return `Fino a €${max.toLocaleString()}`;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} ore fa`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} giorn${diffInDays === 1 ? 'o' : 'i'} fa`;
    }
  };

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    // In a real app, this would save to the database
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job opportunity: ${job.title} at ${job.company}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // In a real app, this would handle the application process
    alert(t('jobDetails.applyNow') + ' - Feature coming soon!');
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
      <div className="job-details-container">
        {/* Header */}
        <div className="job-details-header">
          <Link to="/" className="back-button">
            <ArrowLeft size={20} />
            {t('jobDetails.backToJobs')}
          </Link>
          
          <div className="job-actions">
            <button onClick={handleShare} className="action-btn">
              <Share2 size={18} />
              {t('jobDetails.shareJob')}
            </button>
            {isCandidate && (
              <button 
                onClick={handleSaveJob} 
                className={`action-btn ${isSaved ? 'saved' : ''}`}
              >
                <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                {t('jobDetails.saveJob')}
              </button>
            )}
          </div>
        </div>        {/* Job Info */}
        <div className="job-info-section">
          <div className="job-header">
            <div className="job-title-section">
              <h1>{job.title}</h1>
              <div className="job-meta">
                <div className="meta-item">
                  <Building2 size={16} />
                  <span>{job.company_name}</span>
                </div>
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{job.location}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{getJobTypeText(job.job_type)}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{getTimeAgo(job.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="salary-section">
              <div className="salary">
                <DollarSign size={20} />
                <span>{formatSalary(job.salary_min, job.salary_max)}</span>
              </div>
              {isCandidate && (
                <button onClick={handleApply} className="apply-button">
                  {t('jobDetails.applyNow')}
                </button>
              )}
            </div>
          </div>
        </div>        {/* Main Content */}
        <div className="job-content">
          <div className="job-main">
            {/* Job Description */}
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
              <h3>{t('jobDetails.companyInfo')}</h3>
              <div className="company-details">
                <h4>{job.company_name}</h4>
                <p>Informazioni azienda non disponibili</p>
                <div className="company-stats">
                  <div className="stat">
                    <span className="label">{t('jobDetails.location')}:</span>
                    <span className="value">{job.location}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Recruiter:</span>
                    <span className="value">{job.recruiter_name}</span>
                  </div>
                </div>
              </div>
            </div>

            {isCandidate && (
              <div className="apply-card">
                <button onClick={handleApply} className="apply-button-large">
                  {t('jobDetails.applyNow')}
                </button>
                <p className="apply-note">
                  {t('jobDetails.applyNote')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
