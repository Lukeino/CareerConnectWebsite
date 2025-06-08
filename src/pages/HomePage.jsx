import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);   // Fetch jobs from database/localStorage
    useEffect(() => {
      fetchJobs();
      fetchCompanies();
      fetchUsers();
    }, []);
      const fetchJobs = async () => {
    try {      // Fetch jobs from SQLite database via API
      const response = await fetch('http://localhost:3001/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      const activeJobs = data.filter(job => job.status === 'active');
      setFeaturedJobs(activeJobs.slice(0, 6)); // Get first 6 active jobs for featured section
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }

  const fetchCompanies = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('http://localhost:3001/api/companies');
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Stipendio da concordare';
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
    if (min) return `Da €${min.toLocaleString()}`;
    if (max) return `Fino a €${max.toLocaleString()}`;
  };

  const getJobTypeLabel = (type) => {
    const typeLabels = {
      'full-time': t('jobDetails.fullTime') || 'Tempo Pieno',
      'part-time': t('jobDetails.partTime') || 'Tempo Parziale',
      'contract': t('jobDetails.contract') || 'Contratto',
      'internship': t('jobDetails.internship') || 'Stage'
    };
    return typeLabels[type] || type;
  };
  // Calculate real statistics
  const getStatistics = () => {
    if (statsLoading || companies.length === 0) {
      return {
        totalJobs: 0,
        totalCompanies: 0,
        citiesCovered: 0,
        jobSeekers: 0
      };
    }

    const totalJobs = companies.reduce((total, company) => total + company.job_count, 0);
    const totalCompanies = companies.length;
    const citiesCovered = new Set(companies.flatMap(c => c.locations)).size;
    const candidates = users.filter(user => user.user_type === 'candidate');

    return {
      totalJobs: totalJobs.toLocaleString(),
      totalCompanies: totalCompanies.toLocaleString(),
      citiesCovered: citiesCovered.toLocaleString(),
      jobSeekers: candidates.length.toLocaleString()
    };
  };

  const statistics = getStatistics();

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
  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to search results page with query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (location) params.set('location', location);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="homepage">
      {/* Hero Section */}      <section className="hero">
        <div className="hero-content">
          <h1>{t('homepage.title')}</h1>
          <p>{t('homepage.subtitle')}</p>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder={t('homepage.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-input-group">
              <MapPin className="search-icon" size={20} />              <input
                type="text"
                placeholder={t('pages.locationPlaceholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="search-input"
              /></div>
            <button type="submit" className="search-btn">
              {t('homepage.searchButton')}
            </button>
          </form>

          {!isAuthenticated && (
            <div className="cta-buttons">
              <Link to="/register?type=candidate" className="btn btn-primary">
                {t('homepage.getStarted')}
              </Link>
              <Link to="/register?type=recruiter" className="btn btn-outline">
                {t('homepage.getStarted')}
              </Link>
            </div>
          )}
        </div>
      </section>      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <Briefcase className="stat-icon" size={32} />
            <div className="stat-content">
              <h3>{statistics.totalJobs}</h3>
              <p>{t('homepage.activeJobs')}</p>
            </div>
          </div>
          <div className="stat-item">
            <Users className="stat-icon" size={32} />
            <div className="stat-content">
              <h3>{statistics.jobSeekers}</h3>
              <p>{t('homepage.jobSeekers')}</p>
            </div>
          </div>
          <div className="stat-item">
            <Building2 className="stat-icon" size={32} />
            <div className="stat-content">
              <h3>{statistics.totalCompanies}</h3>
              <p>{t('homepage.companies')}</p>
            </div>
          </div>
          <div className="stat-item">
            <MapPin className="stat-icon" size={32} />
            <div className="stat-content">
              <h3>{statistics.citiesCovered}</h3>
              <p>Città Coperte</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}      <section className="featured-jobs">
        <div className="section-content">
          <h2>{t('homepage.featuredJobs')}</h2>          <div className="jobs-grid">
            {featuredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-type">{getJobTypeLabel(job.job_type)}</span>
                </div>
                <div className="job-company">{job.company_name}</div>
                <div className="job-location">
                  <MapPin size={16} />
                  {job.location}
                </div>
                <div className="job-salary">{formatSalary(job.salary_min, job.salary_max)}</div>
                <div className="job-footer">
                  <span className="job-posted">{getTimeAgo(job.created_at)}</span>
                  <Link to={`/jobs/${job.id}`} className="apply-btn">
                    {t('homepage.viewDetails')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all">
            <Link to="/jobs" className="btn btn-outline">
              {t('homepage.viewAllJobs')}
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}      <section className="how-it-works">
        <div className="section-content">
          <h2>{t('homepage.howItWorks')}</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>{t('homepage.createProfile')}</h3>
              <p>{t('homepage.createProfileDesc')}</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>{t('homepage.searchConnect')}</h3>
              <p>{t('homepage.searchConnectDesc')}</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>{t('homepage.applySucceed')}</h3>
              <p>{t('homepage.applySucceedDesc')}</p>
            </div>
          </div>
        </div>
      </section>      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta">
          <div className="section-content">
            <h2>{t('pages.readyNextStep')}</h2>
            <p>{t('pages.joinThousands')}</p>
            <div className="cta-buttons">
              <Link to="/register?type=candidate" className="btn btn-primary">
                {t('pages.lookingForJob')}
              </Link>
              <Link to="/register?type=recruiter" className="btn btn-outline">
                {t('pages.hiringTalent')}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
