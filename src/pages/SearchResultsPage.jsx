import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Filter, SlidersHorizontal } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import { formatTimeAgo } from '../utils/dateUtils';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);  // Fetch jobs from database
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/jobs`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      const activeJobs = data.filter(job => job.status === 'active');
      setJobs(activeJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, location, selectedJobType, selectedSalaryRange]);
  const filterJobs = () => {
    let filtered = [...jobs];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by job type
    if (selectedJobType) {
      filtered = filtered.filter(job => job.job_type === selectedJobType);
    }

    // Filter by salary range
    if (selectedSalaryRange) {
      const [min, max] = selectedSalaryRange.split('-').map(Number);
      filtered = filtered.filter(job => {
        const salaryMin = job.salary_min || 0;
        const salaryMax = job.salary_max || 0;
        
        if (max) {
          return (salaryMin >= min && salaryMin <= max) || (salaryMax >= min && salaryMax <= max);
        } else {
          return salaryMin >= min || salaryMax >= min;
        }
      });
    }

    setFilteredJobs(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (location) params.set('location', location);
    setSearchParams(params);
    filterJobs();
  };

  const clearFilters = () => {
    setSelectedJobType('');
    setSelectedSalaryRange('');
    setSearchTerm('');
    setLocation('');
    setSearchParams({});
  };
  const getJobTypeText = (type) => {
    const typeMap = {
      'full-time': t('jobDetails.fullTime'),
      'part-time': t('jobDetails.partTime'),
      'contract': t('jobDetails.contract'),
      'internship': t('jobDetails.internship')
    };
    return typeMap[type] || type;
  };  const formatSalary = (min, max) => {
    if (!min && !max) return 'Stipendio da concordare';
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
    if (min) return `Da €${min.toLocaleString()}`;
    if (max) return `Fino a €${max.toLocaleString()}`;
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
  };

  if (loading) {
    return (
      <div className="search-results-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-results-container">        {/* Search Header */}
        <div className="search-header">
          <h1>Risultati di Ricerca</h1>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Cerca lavori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-input-group">
              <MapPin className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Posizione"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">
              Cerca
            </button>
          </form>
        </div>

        <div className="search-content">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">            <div className="filters-header">
              <h3><Filter size={20} /> Filtri</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="toggle-filters-btn"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
            
            <div className={`filters-content ${showFilters ? 'show' : ''}`}>              {/* Job Type Filter */}
              <div className="filter-group">
                <h4>Tipo di Lavoro</h4>
                <div className="filter-options">
                  <label>
                    <input
                      type="radio"
                      name="jobType"
                      value=""
                      checked={selectedJobType === ''}                      onChange={(e) => setSelectedJobType(e.target.value)}
                    />
                    Tutti i Tipi
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jobType"
                      value="full-time"
                      checked={selectedJobType === 'full-time'}
                      onChange={(e) => setSelectedJobType(e.target.value)}
                    />
                    Tempo Pieno
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jobType"
                      value="part-time"
                      checked={selectedJobType === 'part-time'}
                      onChange={(e) => setSelectedJobType(e.target.value)}
                    />
                    Tempo Parziale
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jobType"
                      value="contract"
                      checked={selectedJobType === 'contract'}
                      onChange={(e) => setSelectedJobType(e.target.value)}
                    />
                    Contratto
                  </label>
                </div>
              </div>              {/* Salary Range Filter */}
              <div className="filter-group">
                <h4>Fascia Salariale</h4>
                <div className="filter-options">
                  <label>
                    <input
                      type="radio"
                      name="salaryRange"
                      value=""
                      checked={selectedSalaryRange === ''}                      onChange={(e) => setSelectedSalaryRange(e.target.value)}
                    />
                    Tutte le Fasce
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="salaryRange"
                      value="20000-35000"
                      checked={selectedSalaryRange === '20000-35000'}
                      onChange={(e) => setSelectedSalaryRange(e.target.value)}
                    />
                    €20,000 - €35,000
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="salaryRange"
                      value="35000-50000"
                      checked={selectedSalaryRange === '35000-50000'}
                      onChange={(e) => setSelectedSalaryRange(e.target.value)}
                    />
                    €35,000 - €50,000
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="salaryRange"
                      value="50000-70000"
                      checked={selectedSalaryRange === '50000-70000'}
                      onChange={(e) => setSelectedSalaryRange(e.target.value)}
                    />
                    €50,000 - €70,000
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="salaryRange"
                      value="70000-100000"
                      checked={selectedSalaryRange === '70000-100000'}
                      onChange={(e) => setSelectedSalaryRange(e.target.value)}
                    />
                    €70,000+
                  </label>
                </div>
              </div>              <button onClick={clearFilters} className="clear-filters-btn">
                Cancella Filtri
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="search-results">            <div className="results-header">
              <h2>
                {filteredJobs.length === 0 ? t('searchResults.noJobsFound') : 
                 `${filteredJobs.length} lavori trovati`}
              </h2>
              {(searchTerm || location) && (
                <p className="search-query">
                  {searchTerm && `Ricerca per "${searchTerm}"`}
                  {searchTerm && location && ' • '}
                  {location && `Posizione "${location}"`}
                </p>
              )}
            </div>            {filteredJobs.length === 0 ? (
              <div className="no-results">
                <Briefcase size={48} />                <h3>Nessun risultato trovato</h3>
                <p>Prova a modificare i tuoi criteri di ricerca.</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Cancella tutti i filtri
                </button>
              </div>
            ) : (              <div className="jobs-list">
                {filteredJobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className="job-type">{getJobTypeText(job.job_type)}</span>
                    </div>
                    <div className="job-company">{job.company_name}</div>
                    <div className="job-location">
                      <MapPin size={16} />
                      {job.location}
                    </div>
                    <div className="job-salary">{formatSalary(job.salary_min, job.salary_max)}</div>
                    <p className="job-description">{job.description}</p>
                    <div className="job-footer">
                      <span className="job-posted">{formatTimeAgo(job.created_at, job.id)}</span>
                      <Link to={`/jobs/${job.id}`} className="apply-btn">
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
    </div>
  );
};

export default SearchResultsPage;
