import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Clock, DollarSign, Building, Search, Filter, ChevronRight } from 'lucide-react';
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
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div className="job-title-section">
                      <h3 className="job-title">{job.title}</h3>
                      <div className="company-info">
                        <Building size={16} />
                        <span className="company-name">{job.company_name}</span>
                      </div>
                    </div>
                    <div className="job-actions">
                      <Link to={`/jobs/${job.id}`} className="view-details-btn">
                        <ChevronRight size={20} />
                      </Link>
                    </div>
                  </div>

                  <div className="job-meta">
                    <div className="meta-item">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={16} />
                      <span>{getJobTypeLabel(job.job_type)}</span>
                    </div>
                    <div className="meta-item">
                      <DollarSign size={16} />
                      <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                    </div>
                  </div>

                  <div className="job-description">
                    <p>{job.description}</p>
                  </div>

                  <div className="job-card-footer">
                    <div className="job-tags">
                      {job.requirements && job.requirements.split(',').slice(0, 3).map((req, index) => (
                        <span key={index} className="job-tag">{req.trim()}</span>
                      ))}
                    </div>
                    <div className="posted-time">
                      <Clock size={14} />
                      <span>{getTimeAgo(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="job-card-actions">
                    <Link to={`/jobs/${job.id}`} className="btn btn-primary">
                      Vedi Dettagli
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;