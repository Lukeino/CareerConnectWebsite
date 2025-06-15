import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';
import { formatTimeAgo } from '../utils/dateUtils';
import ProfessionalJobPng from '../assets/ProfessionalJob.png';
import './HomePage.css';

const HomePage = () => {  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();const [searchTerm, setSearchTerm] = useState('');
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
      'full-time': 'Tempo Pieno',
      'part-time': 'Tempo Parziale',
      'contract': 'Contratto',
      'internship': 'Stage'
    };
    return typeLabels[type] || type;
  };// Calculate real statistics
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

  const statistics = getStatistics();

  const handleSearch = (e) => {
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
          <div className="hero-text">            <h1>Trova il Lavoro dei Tuoi Sogni</h1>
            <p>Connetti il tuo talento con le migliori opportunità professionali</p>
            
            {/* Show search form only for authenticated users */}
            {isAuthenticated && (
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-group">
                  <Search className="search-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Cerca lavori, aziende, competenze..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="search-input-group">
                  <MapPin className="search-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Città o provincia"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="search-input"
                  />
                </div>
                <button type="submit" className="search-btn">
                  Cerca Lavoro
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
              <p>Posizioni Attive</p>
            </div>
          </div>
          <div className="stat-item">
            <Users className="stat-icon" size={48} />
            <div className="stat-content">
              <h3>{statistics.jobSeekers}</h3>
              <p>Candidati Registrati</p>
            </div>
          </div>
          <div className="stat-item">
            <Building2 className="stat-icon" size={48} />
            <div className="stat-content">
              <h3>{statistics.totalCompanies}</h3>
              <p>Aziende Partner</p>
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
            <h2>Annunci in Evidenza</h2>
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
                    <span className="job-posted">{formatTimeAgo(job.created_at, job.id)}</span>
                    <Link to={`/jobs/${job.id}`} className="apply-btn">
                      Vedi Dettagli
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all">
              <Link to="/jobs" className="btn btn-outline">
                Vedi Tutti gli Annunci
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}      <section className="how-it-works">
        <div className="section-content">
          <h2>Come Funziona</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>              <h3>Crea il Tuo Profilo</h3>
              <p>Registrati e crea un profilo completo per far emergere il tuo talento</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>              <h3>Cerca e Connetti</h3>
              <p>Trova le opportunità che corrispondono alle tue competenze e aspirazioni</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>              <h3>Candidati e Vinci</h3>
              <p>Invia la tua candidatura e inizia il tuo percorso verso il successo professionale</p>
            </div>
          </div>        </div>      </section>
    </div>
  );
};

export default HomePage;
