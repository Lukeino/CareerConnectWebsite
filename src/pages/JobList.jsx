import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Clock, Building, Search, Filter } from 'lucide-react';
import './JobList.css';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();

  // Fetch jobs from database/localStorage
  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company_name.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower)
      );
    }

    if (locationFilter) {
      const locationLower = locationFilter.toLowerCase();
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }

    if (jobTypeFilter && jobTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.job_type === jobTypeFilter);
    }    setFilteredJobs(filtered);
  }, [jobs, searchTerm, locationFilter, jobTypeFilter]);
  
  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Fetch jobs from SQLite database via API
      const response = await fetch('http://localhost:3001/api/jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      console.log('📋 Jobs fetched from API:', data);
      const activeJobs = data.filter(job => job.status === 'active');
      setJobs(activeJobs);
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
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
  };  // Funzione per generare numeri pseudo-casuali deterministici
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
    
    // Se la data è invalida o futura, mostra un messaggio di errore
    if (isNaN(date.getTime()) || diffInMs < 0) {
      return 'Data non valida';
    }
    
    // Usa sempre il tempo reale - nessuna variazione artificiale
    if (diffInMinutes < 1) {
      return 'Appena pubblicato';
    } else if (diffInMinutes < 60) {
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
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setJobTypeFilter('');
    setShowFilters(false);
  };

  if (loading) {
    return (
      <div className="job-list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading') || 'Caricamento...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-list-page">
      <div className="job-list-container">
        {/* Header Section */}
        <div className="page-header">
          <h1>Offerte di Lavoro</h1>
          <p className="page-subtitle">
            Scopri {filteredJobs.length} opportunità lavorative dalle migliori aziende
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-row">
            <div className="search-group">
              <div className="search-input-wrapper">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Cerca lavori, aziende, posizioni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="location-input-wrapper">
                <MapPin size={20} />
                <input
                  type="text"
                  placeholder="Città o località"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="location-input"
                />
              </div>
              <button 
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} />
                Filtri
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Tipo di Contratto</label>
                <select 
                  value={jobTypeFilter} 
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tutti</option>
                  <option value="full-time">Tempo Pieno</option>
                  <option value="part-time">Tempo Parziale</option>
                  <option value="contract">Contratto</option>
                  <option value="internship">Stage</option>
                </select>
              </div>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Cancella Filtri
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="results-section">
          {filteredJobs.length === 0 ? (
            <div className="no-results">
              <h3>Nessun lavoro trovato</h3>
              <p>Prova a modificare i criteri di ricerca o i filtri.</p>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Cancella tutti i filtri
              </button>
            </div>
          ) : (            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="job-card-link">
                  <div className="job-card">
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
                      <span className="apply-btn">
                        Visualizza Dettagli
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;