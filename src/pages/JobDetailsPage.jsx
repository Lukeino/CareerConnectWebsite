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

  useEffect(() => {
    // Simulate fetching job data
    // In a real app, this would fetch from your API
    const fetchJob = () => {
      // Get job data based on current language
      const jobTranslations = t('jobDetails.jobs');
      const baseJobData = {
        1: {
          id: 1,
          location: 'Milano, Italy',
          salary: '€45,000 - €65,000',
          type: 'full-time',
          posted: '2 days ago',
          companyInfo: {
            employees: '200-500',
            industry: 'Technology',
            website: 'https://techcorp.com'
          }
        },
        2: {
          id: 2,
          location: 'Roma, Italy',
          salary: '€50,000 - €70,000',
          type: 'full-time',
          posted: '1 week ago',
          companyInfo: {
            employees: '50-200',
            industry: 'Technology',
            website: 'https://innovatelab.com'
          }
        },
        3: {
          id: 3,
          location: 'Torino, Italy',
          salary: '€35,000 - €50,000',
          type: 'full-time',
          posted: '3 days ago',
          companyInfo: {
            employees: '20-50',
            industry: 'Design',
            website: 'https://designstudio.com'
          }
        }
      };

      const baseData = baseJobData[id];
      const translatedData = jobTranslations[id];
      
      if (baseData && translatedData) {
        const jobData = {
          ...baseData,
          title: translatedData.title,
          company: translatedData.company,
          description: translatedData.description,
          requirements: translatedData.requirements,
          benefits: translatedData.benefits,
          companyInfo: {
            ...baseData.companyInfo,
            name: translatedData.company,
            description: translatedData.companyInfo.description
          }
        };
        setJob(jobData);
      }
      setLoading(false);
    };

    fetchJob();
  }, [id, t]);

  const getJobTypeText = (type) => {
    const typeMap = {
      'full-time': t('jobDetails.fullTime'),
      'part-time': t('jobDetails.partTime'),
      'contract': t('jobDetails.contract'),
      'internship': t('jobDetails.internship')
    };
    return typeMap[type] || type;
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
        </div>

        {/* Job Info */}
        <div className="job-info-section">
          <div className="job-header">
            <div className="job-title-section">
              <h1>{job.title}</h1>
              <div className="job-meta">
                <div className="meta-item">
                  <Building2 size={16} />
                  <span>{job.company}</span>
                </div>
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{job.location}</span>
                </div>
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{getJobTypeText(job.type)}</span>
                </div>
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>{job.posted}</span>
                </div>
              </div>
            </div>
            
            <div className="salary-section">
              <div className="salary">
                <DollarSign size={20} />
                <span>{job.salary}</span>
              </div>
              {isCandidate && (
                <button onClick={handleApply} className="apply-button">
                  {t('jobDetails.applyNow')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
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
            <section className="content-section">
              <h2>{t('jobDetails.requirements')}</h2>
              <ul className="requirements-list">
                {job.requirements.map((requirement, index) => (
                  <li key={index}>
                    <CheckCircle size={16} />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Benefits */}
            <section className="content-section">
              <h2>{t('jobDetails.benefits')}</h2>
              <ul className="benefits-list">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>
                    <CheckCircle size={16} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="job-sidebar">
            <div className="company-card">
              <h3>{t('jobDetails.companyInfo')}</h3>
              <div className="company-details">
                <h4>{job.companyInfo.name}</h4>
                <p>{job.companyInfo.description}</p>
                <div className="company-stats">
                  <div className="stat">
                    <span className="label">{t('jobDetails.industry')}:</span>
                    <span className="value">{job.companyInfo.industry}</span>
                  </div>
                  <div className="stat">
                    <span className="label">{t('jobDetails.companySize')}:</span>
                    <span className="value">{job.companyInfo.employees} {t('jobDetails.employees')}</span>
                  </div>
                  <div className="stat">
                    <span className="label">{t('jobDetails.website')}:</span>
                    <a href={job.companyInfo.website} target="_blank" rel="noopener noreferrer" className="value">
                      {job.companyInfo.website}
                    </a>
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
