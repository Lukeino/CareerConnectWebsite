import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Filter, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock job data - in a real app this would come from your API
  const allJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'Milano, Italy',
      salary: '€45,000 - €65,000',
      type: 'full-time',
      posted: '2 days ago',
      description: 'Sviluppatore Frontend Senior con esperienza in React'
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'InnovateLab',
      location: 'Roma, Italy',
      salary: '€50,000 - €70,000',
      type: 'full-time',
      posted: '1 week ago',
      description: 'Product Manager per gestire il team di sviluppo prodotto'
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      company: 'DesignStudio',
      location: 'Torino, Italy',
      salary: '€35,000 - €50,000',
      type: 'full-time',
      posted: '3 days ago',
      description: 'Designer UX/UI per creare interfacce innovative'
    },
    {
      id: 4,
      title: 'Backend Developer',
      company: 'DataTech',
      location: 'Milano, Italy',
      salary: '€40,000 - €60,000',
      type: 'full-time',
      posted: '5 days ago',
      description: 'Sviluppatore Backend con esperienza in Node.js'
    },
    {
      id: 5,
      title: 'Marketing Specialist',
      company: 'CreativeAgency',
      location: 'Roma, Italy',
      salary: '€30,000 - €45,000',
      type: 'part-time',
      posted: '1 week ago',
      description: 'Specialista Marketing per campagne digitali'
    },
    {
      id: 6,
      title: 'Data Scientist',
      company: 'AI Solutions',
      location: 'Bologna, Italy',
      salary: '€55,000 - €75,000',
      type: 'full-time',
      posted: '3 days ago',
      description: 'Data Scientist per analisi avanzate e machine learning'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobs(allJobs);
      setLoading(false);
    }, 500);
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
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      filtered = filtered.filter(job => job.type === selectedJobType);
    }

    // Filter by salary range
    if (selectedSalaryRange) {
      const [min, max] = selectedSalaryRange.split('-').map(s => parseInt(s.replace(/[€,]/g, '')));
      filtered = filtered.filter(job => {
        const jobSalary = job.salary.replace(/[€,]/g, '');
        const jobMin = parseInt(jobSalary.split(' - ')[0]);
        return jobMin >= min && jobMin <= max;
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
  };

  if (loading) {
    return (
      <div className="search-results-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-results-container">        {/* Search Header */}
        <div className="search-header">
          <h1>{t('searchResults.title')}</h1>
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
          </form>
        </div>

        <div className="search-content">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">            <div className="filters-header">
              <h3><Filter size={20} /> {t('searchResults.filters')}</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="toggle-filters-btn"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
            
            <div className={`filters-content ${showFilters ? 'show' : ''}`}>              {/* Job Type Filter */}
              <div className="filter-group">
                <h4>{t('searchResults.jobType')}</h4>
                <div className="filter-options">
                  <label>
                    <input
                      type="radio"
                      name="jobType"
                      value=""
                      checked={selectedJobType === ''}
                      onChange={(e) => setSelectedJobType(e.target.value)}
                    />
                    {t('searchResults.allTypes')}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jobType"
                      value="full-time"
                      checked={selectedJobType === 'full-time'}
                      onChange={(e) => setSelectedJobType(e.target.value)}
                    />
                    {t('jobDetails.fullTime')}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jobType"
                      value="part-time"
                      checked={selectedJobType === 'part-time'}
                      onChange={(e) => setSelectedJobType(e.target.value)}
                    />
                    {t('jobDetails.partTime')}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jobType"
                      value="contract"
                      checked={selectedJobType === 'contract'}
                      onChange={(e) => setSelectedJobType(e.target.value)}
                    />
                    {t('jobDetails.contract')}
                  </label>
                </div>
              </div>              {/* Salary Range Filter */}
              <div className="filter-group">
                <h4>{t('searchResults.salaryRange')}</h4>
                <div className="filter-options">
                  <label>
                    <input
                      type="radio"
                      name="salaryRange"
                      value=""
                      checked={selectedSalaryRange === ''}
                      onChange={(e) => setSelectedSalaryRange(e.target.value)}
                    />
                    {t('searchResults.allTypes')}
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
                {t('searchResults.clearFilters')}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="search-results">            <div className="results-header">
              <h2>
                {filteredJobs.length === 0 ? t('searchResults.noJobsFound') : 
                 `${filteredJobs.length} ${t('searchResults.jobsFound')}`}
              </h2>
              {(searchTerm || location) && (
                <p className="search-query">
                  {searchTerm && `${t('searchResults.searchFor')} "${searchTerm}"`}
                  {searchTerm && location && ' • '}
                  {location && `${t('searchResults.locationFor')} "${location}"`}
                </p>
              )}
            </div>            {filteredJobs.length === 0 ? (
              <div className="no-results">
                <Briefcase size={48} />
                <h3>{t('searchResults.noResultsTitle')}</h3>
                <p>{t('searchResults.noResultsDesc')}</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  {t('searchResults.clearAllFilters')}
                </button>
              </div>
            ) : (
              <div className="jobs-list">
                {filteredJobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className="job-type">{getJobTypeText(job.type)}</span>
                    </div>
                    <div className="job-company">{job.company}</div>
                    <div className="job-location">
                      <MapPin size={16} />
                      {job.location}
                    </div>
                    <div className="job-salary">{job.salary}</div>
                    <p className="job-description">{job.description}</p>
                    <div className="job-footer">
                      <span className="job-posted">{job.posted}</span>
                      <Link to={`/jobs/${job.id}`} className="apply-btn">
                        {t('homepage.viewDetails')}
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
