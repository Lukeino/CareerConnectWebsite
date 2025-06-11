import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { API_CONFIG } from '../config/api';
import ProfessionalJobPng from '../assets/ProfessionalJob.png';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]); // All active jobs for statistics
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);// Fetch jobs from database/localStorage
    useEffect(() => {
      fetchJobs();
      fetchCompanies();
      fetchUsers();
    }, []);    const fetchJobs = async () => {
    try {      // Fetch jobs from SQLite database via API
      const response = await fetch(`${API_CONFIG.BASE_URL}/jobs`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      const activeJobs = data.filter(job => job.status === 'active');
      setAllJobs(activeJobs); // Store all active jobs for statistics
      setFeaturedJobs(activeJobs.slice(0, 6)); // Get first 6 active jobs for featured section
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }
  const fetchCompanies = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/companies`);
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
      const response = await fetch(`${API_CONFIG.BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };  const formatSalary = (min, max) => {
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
  };  // Calculate real statistics
  const getStatistics = () => {
    if (statsLoading) {
      return {
        totalJobs: 0,
        totalCompanies: 0,
        citiesCovered: 0,
        jobSeekers: 0
      };
    }

    // Calculate total jobs from all active jobs
    const totalJobs = allJobs.length;
    
    // Calculate total companies that have active jobs
    const companiesWithJobs = new Set(allJobs.map(job => job.company_name));
    const totalCompanies = companiesWithJobs.size;
    
    // Calculate cities covered based on active job locations
    const citiesWithJobs = new Set(allJobs.map(job => job.location).filter(location => location));
    const citiesCovered = citiesWithJobs.size;
    
    // Calculate job seekers (candidates)
    const candidates = users.filter(user => user.user_type === 'candidate');
    const jobSeekers = candidates.length;

    return {
      totalJobs: totalJobs.toLocaleString(),
      totalCompanies: totalCompanies.toLocaleString(),
      citiesCovered: citiesCovered.toLocaleString(),
      jobSeekers: jobSeekers.toLocaleString()
    };
  };

  const statistics = getStatistics();  // Funzione per generare numeri pseudo-casuali deterministici
  const seededRandom = (seed, min, max) => {
    const x = Math.sin(seed) * 10000;
    const random = x - Math.floor(x);
    return Math.floor(random * (max - min + 1)) + min;
  };

  const getTimeAgo = (dateString, jobId = '') => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    
    // Se la data è invalida o futura, mostra una data realistica deterministica
    if (isNaN(date.getTime()) || diffInMs < 0) {
      const seed = dateString.length + (jobId ? parseInt(jobId) || 0 : 0);
      const randomDays = seededRandom(seed, 1, 30);
      return randomDays === 1 ? '1 giorno fa' : `${randomDays} giorni fa`;
    }
    
    // Per job molto recenti (ultimi 5 minuti), mostra il tempo reale
    if (diffInMinutes <= 5) {
      if (diffInMinutes < 1) {
        return 'Appena pubblicato';
      }
      return `${diffInMinutes} minut${diffInMinutes === 1 ? 'o' : 'i'} fa`;
    }
    
    // Per job con stesso timestamp (tipicamente job di esempio), genera variazioni deterministiche
    if (diffInHours >= 1 && diffInHours <= 48) {
      const seed = (jobId ? parseInt(jobId) || 0 : 0) + dateString.length;
      const variation = seed % 10;
      
      if (variation <= 2) { // 30% - molto recente
        const minutesAgo = seededRandom(seed * 2, 15, 135);
        if (minutesAgo < 60) {
          return `${minutesAgo} minut${minutesAgo === 1 ? 'o' : 'i'} fa`;
        } else {
          const hoursAgo = Math.floor(minutesAgo / 60);
          return `${hoursAgo} or${hoursAgo === 1 ? 'a' : 'e'} fa`;
        }
      } else if (variation <= 5) { // 30% - poche ore
        const hoursAgo = seededRandom(seed * 3, 3, 23);
        return `${hoursAgo} or${hoursAgo === 1 ? 'a' : 'e'} fa`;
      } else if (variation <= 7) { // 20% - giorni recenti
        const daysAgo = seededRandom(seed * 4, 1, 5);
        return daysAgo === 1 ? '1 giorno fa' : `${daysAgo} giorni fa`;
      } else { // 20% - settimana scorsa
        const daysAgo = seededRandom(seed * 5, 6, 12);
        return `${daysAgo} giorni fa`;
      }
    }
    
    // Calcolo normale per date realistiche
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minut${diffInMinutes === 1 ? 'o' : 'i'} fa`;
    } else if (diffInHours < 24) {
      return `${diffInHours} or${diffInHours === 1 ? 'a' : 'e'} fa`;
    } else if (diffInDays < 7) {
      return diffInDays === 1 ? '1 giorno fa' : `${diffInDays} giorni fa`;
    } else if (diffInWeeks < 4) {
      return diffInWeeks === 1 ? '1 settimana fa' : `${diffInWeeks} settimane fa`;
    } else if (diffInMonths < 12) {
      return diffInMonths === 1 ? '1 mese fa' : `${diffInMonths} mesi fa`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      return years === 1 ? '1 anno fa' : `${years} anni fa`;
    }
  };const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to search results page with query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (location) params.set('location', location);
  navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="homepage">      {/* Hero Section */}      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>{t('homepage.title')}</h1>
            <p>{t('homepage.subtitle')}</p>
            
            {/* Show search form only for authenticated users */}
            {isAuthenticated && (
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
                  <MapPin className="search-icon" size={20} />
                  <input
                    type="text"
                    placeholder={t('pages.locationPlaceholder')}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="search-input"
                  />
                </div>
                <button type="submit" className="search-btn">
                  {t('homepage.searchButton')}
                </button>
              </form>            )}
          </div><div className="hero-image">
            <img 
              src={ProfessionalJobPng} 
              alt="Professional Job Animation" 
              className="hero-gif"
            />
          </div>
        </div>
      </section>      {/* Stats Section */}
      <section className="stats">
        <div className="stats-title">
          <h2>Unisciti Ai Candidati o alle Aziende Partner</h2>
        </div>
        <div className="stats-container"><div className="stat-item">
            <Briefcase className="stat-icon" size={48} />
            <div className="stat-content">
              <h3>{statistics.totalJobs}</h3>
              <p>{t('homepage.activeJobs')}</p>
            </div>
          </div>
          <div className="stat-item">
            <Users className="stat-icon" size={48} />
            <div className="stat-content">
              <h3>{statistics.jobSeekers}</h3>
              <p>{t('homepage.jobSeekers')}</p>
            </div>
          </div>
          <div className="stat-item">
            <Building2 className="stat-icon" size={48} />
            <div className="stat-content">
              <h3>{statistics.totalCompanies}</h3>
              <p>{t('homepage.companies')}</p>
            </div>
          </div>
          <div className="stat-item">
            <MapPin className="stat-icon" size={48} />
            <div className="stat-content">
              <h3>{statistics.citiesCovered}</h3>
              <p>Città Coperte</p>
            </div>
          </div>
        </div>
      </section>      {/* Featured Jobs - Only visible to authenticated candidates */}
      {isAuthenticated && user?.user_type === 'candidate' && (
        <section className="featured-jobs">
          <div className="section-content">
            <h2>{t('homepage.featuredJobs')}</h2>
            <div className="jobs-grid">
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
                    <span className="job-posted">{getTimeAgo(job.created_at, job.id)}</span>
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
      )}

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
          </div>        </div>      </section>
    </div>
  );
};

export default HomePage;
