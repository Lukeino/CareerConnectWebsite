import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Search, 
  Filter, 
  Users, 
  ExternalLink,
  ChevronRight,
  Globe,
  Eye,
  BookmarkPlus
} from 'lucide-react';
import './CompaniesList.css';

const CompaniesList = () => {  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('jobs'); // 'jobs', 'name', 'location'

  // Fetch companies from API
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Filter and sort companies
  useEffect(() => {
    let filtered = companies;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchLower) ||
        company.description.toLowerCase().includes(searchLower)
      );
    }

    // Location filter
    if (locationFilter) {
      const locationLower = locationFilter.toLowerCase();
      filtered = filtered.filter(company => 
        company.locations.some(location => 
          location.toLowerCase().includes(locationLower)
        )
      );
    }

    // Sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'location':
        filtered.sort((a, b) => {
          const aLocation = a.locations[0] || '';
          const bLocation = b.locations[0] || '';
          return aLocation.localeCompare(bLocation);
        });
        break;
      case 'jobs':
      default:
        filtered.sort((a, b) => b.job_count - a.job_count);
        break;
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, locationFilter, sortBy]);  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching companies from API...');
      const response = await fetch(`${API_CONFIG.BASE_URL}/companies`);
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🏢 Companies fetched from API:', data);
      console.log('📈 Number of companies:', data.length);
      setCompanies(data);
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      // Fallback to empty array if API fails
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setSortBy('jobs');
  };

  const getCompanySize = (jobCount) => {
    if (jobCount >= 20) return 'Grande Azienda';
    if (jobCount >= 10) return 'Media Azienda';
    if (jobCount >= 5) return 'Piccola Azienda';
    return 'Startup';
  };

  if (loading) {
    return (
      <div className="companies-list-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="companies-list-page">
      <div className="companies-container">        {/* Header Section */}
        <div className="page-header">
          <h1>Aziende</h1>
          <p className="page-subtitle">
            Scopri le migliori aziende che stanno assumendo • {filteredCompanies.length} aziende disponibili
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
                  placeholder="Cerca aziende..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="location-input-wrapper">
                <MapPin size={20} />
                <input
                  type="text"
                  placeholder="Località"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="location-input"
                />
              </div>
              <div className="sort-wrapper">
                <Filter size={20} />
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="jobs">Ordina per Posizioni</option>
                  <option value="name">Ordina per Nome</option>
                  <option value="location">Ordina per Località</option>
                </select>
              </div>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Cancella Filtri
              </button>
            </div>
          </div>
        </div>        {/* Results Section */}
        <div className="content-layout">
          <div className="main-content">
            {filteredCompanies.length === 0 ? (
              <div className="no-results">
                <Building2 size={64} className="no-results-icon" />
                <h3>Nessuna azienda trovata</h3>
                <p>Prova a modificare i criteri di ricerca o i filtri.</p>
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Cancella tutti i filtri
                </button>
              </div>
            ) : (
              <div className="companies-grid">
                {filteredCompanies.map((company, index) => (
                <div key={index} className="company-card">
                  <div className="company-card-header">
                    <div className="company-logo">
                      <Building2 size={32} />
                    </div>
                    <div className="company-title-section">
                      <h3 className="company-name">{company.name}</h3>
                      <div className="company-meta">
                        <span className="company-size">{getCompanySize(company.job_count)}</span>
                        <span className="separator">•</span>
                        <span className="job-count">{company.job_count} posizioni</span>
                      </div>
                    </div>                    <div className="company-actions">
                      <button 
                        className="action-btn save-btn"
                        title="Salva azienda"
                      >
                        <BookmarkPlus size={16} />
                      </button>
                      <Link 
                        to={`/companies/${encodeURIComponent(company.name)}`} 
                        className="action-btn view-btn"
                        title="Visualizza azienda"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>

                  <div className="company-description">
                    <p>{company.description}</p>
                  </div>

                  <div className="company-info">
                    <div className="info-item">
                      <MapPin size={16} />
                      <span>
                        {company.locations.length > 0 
                          ? company.locations.slice(0, 2).join(', ') 
                          : 'Località non specificata'
                        }
                        {company.locations.length > 2 && ` +${company.locations.length - 2}`}
                      </span>
                    </div>
                    <div className="info-item">
                      <Briefcase size={16} />
                      <span>{company.job_count} posizioni aperte</span>
                    </div>
                    <div className="info-item">
                      <Globe size={16} />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="website-link"
                      >
                        Visita sito web
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>                  <div className="company-card-footer">
                    <div className="company-stats">
                      <div className="stat">
                        <Users size={14} />
                        <span>{getCompanySize(company.job_count)}</span>
                      </div>
                      <div className="stat">
                        <Building2 size={14} />
                        <span>Settore IT</span>
                      </div>
                    </div>
                    <div className="company-card-actions">
                      <Link 
                        to={`/companies/${encodeURIComponent(company.name)}`} 
                        className="btn btn-outline"
                      >
                        <Eye size={16} />
                        Visualizza
                      </Link>
                      <Link 
                        to={`/jobs?company=${encodeURIComponent(company.name)}`} 
                        className="btn btn-primary"
                      >
                        <Briefcase size={16} />
                        {company.job_count} Posizioni
                      </Link>
                    </div>
                  </div>                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-card">
              <h3>Industrie Principali</h3>
              <div className="industry-list">
                <div className="industry-item">
                  <span>Tecnologia</span>
                  <span className="industry-count">{Math.floor(companies.length * 0.4)}</span>
                </div>
                <div className="industry-item">
                  <span>Fintech</span>
                  <span className="industry-count">{Math.floor(companies.length * 0.2)}</span>
                </div>
                <div className="industry-item">
                  <span>Consulenza</span>
                  <span className="industry-count">{Math.floor(companies.length * 0.15)}</span>
                </div>
                <div className="industry-item">
                  <span>E-commerce</span>
                  <span className="industry-count">{Math.floor(companies.length * 0.1)}</span>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Suggerimenti per Te</h3>
              <p className="sidebar-text">
                Segui le aziende che ti interessano per ricevere aggiornamenti sui nuovi lavori e notizie aziendali.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="companies-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{companies.length}</div>
              <div className="stat-label">Aziende Partner</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {companies.reduce((total, company) => total + company.job_count, 0)}
              </div>
              <div className="stat-label">Posizioni Totali</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {new Set(companies.flatMap(c => c.locations)).size}
              </div>
              <div className="stat-label">Città Coperte</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesList;