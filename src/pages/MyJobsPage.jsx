import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Eye, Calendar, MapPin, DollarSign, Users, Briefcase, Clock, Building, ChevronRight, Mail, Phone, FileText } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import './MyJobsPage.css';

const MyJobsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);  useEffect(() => {
    if (user?.user_type === 'recruiter' && user?.id) {
      fetchMyJobs();
    }
  }, [user?.id, user?.user_type]);
  // Load applications when selected job changes
  useEffect(() => {
    if (selectedJob) {
      fetchApplications(selectedJob.id);
    }
    // Reset selections when job changes
    setSelectedApplications([]);
    setSelectAll(false);
  }, [selectedJob]);

  // Update selectAll state when applications or selectedApplications change
  useEffect(() => {
    if (applications.length > 0) {
      const allSelected = applications.every(app => selectedApplications.includes(app.id));
      setSelectAll(allSelected && selectedApplications.length === applications.length);    } else {
      setSelectAll(false);
    }
  }, [applications, selectedApplications]);

  // Helper function to get the correct URL for static files
  const getStaticFileUrl = (filename) => {
    // Debug del filename ricevuto
    console.log('🔍 Debug filename received:', filename);
    
    if (!filename) {
      console.error('❌ No filename provided to getStaticFileUrl');
      return '';
    }
    
    // Utilizza la configurazione API centralizzata per coerenza
    let baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    console.log('🔧 Base URL from config:', baseUrl);
    
    // Per produzione, assicuriamo che l'URL sia completo
    if (import.meta.env.PROD && baseUrl.startsWith('/')) {
      // Se siamo in produzione e l'URL è relativo, usa l'origin corrente
      baseUrl = window.location.origin + baseUrl;
      console.log('🔧 Production relative URL converted to:', baseUrl);
    }
      // Se l'URL di base non contiene http/https, aggiungiamo il protocollo
    if (!baseUrl.startsWith('http')) {
      // In produzione HTTPS (Netlify), usar HTTPS anche per backend se possibile
      // Altrimenti usa HTTP per sviluppo locale
      const protocol = import.meta.env.PROD && window.location.protocol === 'https:' ? 'https' : 'http';
      baseUrl = `${protocol}://${baseUrl}`;
      console.log('🔧 Added protocol:', protocol, 'to baseUrl:', baseUrl);
    }
    
    // FALLBACK SICURO: Se baseUrl è vuoto, usa window.location.origin
    if (!baseUrl || baseUrl === '') {
      baseUrl = window.location.origin;
      console.log('🔧 Using fallback baseUrl:', baseUrl);
    }
    
    const fullUrl = `${baseUrl}/uploads/${filename}`;
    console.log('🔗 Generated CV URL:', fullUrl, 'from filename:', filename);
    console.log('🔧 Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT');
    console.log('🔧 Final Base URL:', baseUrl);
    console.log('🔧 API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
    
    return fullUrl;
  };

  const fetchMyJobs = async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingJobs) return;
    
    console.log('🔄 fetchMyJobs called - Loading jobs for recruiter:', user?.id);
    
    try {
      setIsLoadingJobs(true);
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/jobs/recruiter/${user.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setJobs([]);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Errore del server: ${response.status}`);
      }        const data = await response.json();
        if (Array.isArray(data)) {
        console.log('🔍 Debug - Jobs received:', data); // Debug line
        setJobs(data);
        
        // Only update selectedJob if needed to avoid infinite loops
        if (selectedJob) {
          const updatedSelectedJob = data.find(job => job.id === selectedJob.id);
          if (updatedSelectedJob) {
            // Only update if the job data actually changed (to avoid infinite re-renders)
            if (JSON.stringify(updatedSelectedJob) !== JSON.stringify(selectedJob)) {
              setSelectedJob(updatedSelectedJob);
            }
          } else if (data.length > 0) {
            setSelectedJob(data[0]);
          } else {
            setSelectedJob(null);
          }
        } else if (data.length > 0) {
          setSelectedJob(data[0]);
        }
      } else {
        console.warn('Risposta inaspettata dal server:', data);
        setJobs([]);
      }
      
    } catch (err) {
      console.error('Errore nel caricamento degli annunci:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Impossibile connettersi al server. Controlla la connessione.');
      } else {
        setError(err.message || 'Errore sconosciuto nel caricamento degli annunci');
      }
      setJobs([]);    } finally {
      setLoading(false);
      setIsLoadingJobs(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const jobToDelete = jobs.find(job => job.id === jobId);
    const jobTitle = jobToDelete ? jobToDelete.title : 'questo annuncio';
    
    if (!window.confirm(`Sei sicuro di voler eliminare l'annuncio "${jobTitle}"?\n\nQuesta azione non può essere annullata.`)) {
      return;
    }    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione dell\'annuncio');
      }

      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      
      // Se l'annuncio eliminato era selezionato, seleziona il primo disponibile
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(updatedJobs.length > 0 ? updatedJobs[0] : null);
      }
      
      alert(`Annuncio "${jobTitle}" eliminato con successo!`);
    } catch (err) {
      console.error('Errore nell\'eliminazione:', err);
      alert('Errore nell\'eliminazione dell\'annuncio. Riprova più tardi.');
    }  };

  const fetchApplications = async (jobId) => {
    if (!jobId) return;
      try {
      setLoadingApplications(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/jobs/${jobId}/applications`);
      
      if (!response.ok) {
        throw new Error('Errore nel caricamento delle candidature');
      }
      
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Errore nel caricamento delle candidature:', err);
      setApplications([]);
    } finally {
      setLoadingApplications(false);
    }  };  const deleteApplication = async (applicationId, candidateName) => {
    if (!window.confirm(`Sei sicuro di voler eliminare la candidatura di ${candidateName}?\n\nQuesta azione non può essere annullata.`)) {
      return;
    }    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della candidatura');
      }

      // Rimuovi la candidatura dalla lista
      setApplications(applications.filter(app => app.id !== applicationId));
      
      // Aggiorna anche il conteggio delle candidature nel job selezionato
      if (selectedJob) {
        const updatedJob = { ...selectedJob, applications_count: (selectedJob.applications_count || 1) - 1 };
        setSelectedJob(updatedJob);
        
        // Aggiorna anche la lista dei jobs
        setJobs(jobs.map(job => 
          job.id === selectedJob.id ? updatedJob : job
        ));
      }

      alert(`Candidatura di ${candidateName} eliminata con successo!`);
    } catch (err) {
      console.error('Errore nell\'eliminazione della candidatura:', err);
      alert('Errore nell\'eliminazione della candidatura. Riprova più tardi.');
    }
  };
  // Handle checkbox selection
  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  // Handle select all checkbox
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.id));
    }
    setSelectAll(!selectAll);
  };

  // Delete multiple applications
  const deleteSelectedApplications = async () => {
    if (selectedApplications.length === 0) return;

    if (!window.confirm(`Sei sicuro di voler eliminare ${selectedApplications.length} candidature selezionate?\n\nQuesta azione non può essere annullata.`)) {
      return;
    }    try {
      const deletePromises = selectedApplications.map(applicationId =>
        fetch(`${API_CONFIG.BASE_URL}/applications/${applicationId}`, {
          method: 'DELETE'
        })
      );

      const results = await Promise.all(deletePromises);
      const failedDeletions = results.filter(response => !response.ok);
      
      if (failedDeletions.length > 0) {
        throw new Error(`Errore nell'eliminazione di ${failedDeletions.length} candidature`);
      }

      // Remove deleted applications from list
      setApplications(applications.filter(app => !selectedApplications.includes(app.id)));
      
      // Update job applications count
      if (selectedJob) {
        const updatedJob = { 
          ...selectedJob, 
          applications_count: Math.max(0, (selectedJob.applications_count || 0) - selectedApplications.length)
        };
        setSelectedJob(updatedJob);
        
        // Update jobs list
        setJobs(jobs.map(job => 
          job.id === selectedJob.id ? updatedJob : job
        ));
      }

      // Reset selections
      setSelectedApplications([]);
      setSelectAll(false);

      alert(`${selectedApplications.length} candidature eliminate con successo!`);
    } catch (err) {
      console.error('Errore nell\'eliminazione delle candidature:', err);
      alert('Errore nell\'eliminazione delle candidature. Riprova più tardi.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const jobDate = new Date(dateString);
    const diffInDays = Math.floor((now - jobDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Oggi';
    if (diffInDays === 1) return 'Ieri';
    if (diffInDays < 7) return `${diffInDays} giorni fa`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} settimane fa`;
    return `${Math.floor(diffInDays / 30)} mesi fa`;
  };

  const formatSalary = (salaryMin, salaryMax) => {
    if (!salaryMin && !salaryMax) return 'Stipendio da concordare';
    if (salaryMin && salaryMax) return `€${salaryMin.toLocaleString()} - €${salaryMax.toLocaleString()}`;
    if (salaryMin) return `Da €${salaryMin.toLocaleString()}`;
    if (salaryMax) return `Fino a €${salaryMax.toLocaleString()}`;
    return 'Stipendio da concordare';
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  if (loading) {
    return (
      <div className="my-jobs-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Caricamento annunci...</p>
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="my-jobs-page">
        <div className="error-container">
          <div className="error-icon">
            <Briefcase size={48} />
          </div>
          <h2>Errore nel caricamento</h2>
          <p>{error}</p>
          <button onClick={fetchMyJobs} className="retry-btn">
            Riprova
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="my-jobs-page email-layout">
      {/* Main Content */}
      <div className="email-container">
        {/* Left Sidebar - Jobs List */}        <div className="jobs-sidebar">          <div className="sidebar-header">
            <button 
              onClick={() => navigate('/create-job')}
              className="create-job-main-btn"
            >
              <Plus size={20} />
              Crea Annuncio
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-sidebar">
              <Briefcase size={40} />
              <p>Nessun annuncio</p>
              <button 
                onClick={() => navigate('/create-job')}
                className="create-first-btn"
              >
                Crea il primo
              </button>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className={`job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                  onClick={() => handleJobSelect(job)}
                >                  <div className="job-item-header">
                    <div className="job-title-row">
                      <h3 className="job-title">{job.title}</h3>
                    </div>                    <div className="job-meta">
                      <div className="job-meta-first-line">
                        <span className="job-location">
                          <MapPin size={12} />
                          {job.location || '-'}
                        </span>
                        <span className="job-time">
                          <Clock size={12} />
                          {formatTimeAgo(job.created_at)}
                        </span>
                      </div>
                      <span className="applications-count">
                        <Users size={12} />
                        {job.applications_count || 0} candidature
                      </span>
                    </div>
                  </div>
                  
                  <ChevronRight size={16} className="chevron-icon" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Job Details */}
        <div className="job-details-panel">
          {selectedJob ? (
            <div className="job-details-content">              <div className="job-details-header">
                <div className="job-title-section">
                  <h2>{selectedJob.title}</h2>
                </div>
                  <div className="job-actions">
                  <button 
                    onClick={() => navigate(`/jobs/${selectedJob.id}`)}
                    className="action-btn view-btn"
                    title="Visualizza pubblicamente"
                  >
                    <Eye size={20} />
                  </button>
                  <button 
                    onClick={() => handleDeleteJob(selectedJob.id)}
                    className="action-btn delete-btn"
                    title="Elimina annuncio"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="job-info-grid">
                <div className="info-item">
                  <MapPin size={16} />
                  <div>
                    <label>Località</label>
                    <span>{selectedJob.location}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <Building size={16} />
                  <div>
                    <label>Azienda</label>
                    <span>{selectedJob.company_name || 'Non specificata'}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <Calendar size={16} />
                  <div>
                    <label>Data Pubblicazione</label>
                    <span>{formatDate(selectedJob.created_at)}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <Users size={16} />
                  <div>
                    <label>Candidature</label>
                    <span>{selectedJob.applications_count || 0} ricevute</span>
                  </div>
                </div>
                  {(selectedJob.salary_min || selectedJob.salary_max) && (
                  <div className="info-item">
                    <DollarSign size={16} />
                    <div>
                      <label>Stipendio</label>
                      <span>{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</span>
                    </div>
                  </div>
                )}
                
                <div className="info-item">
                  <Briefcase size={16} />
                  <div>
                    <label>Tipo Contratto</label>
                    <span>{selectedJob.job_type || 'Non specificato'}</span>
                  </div>
                </div>
              </div>

              <div className="job-description-section">
                <h3>Descrizione del Lavoro</h3>
                <div className="description-content">
                  <p>{selectedJob.description}</p>
                </div>
              </div>

              {selectedJob.requirements && (
                <div className="job-requirements-section">
                  <h3>Requisiti</h3>
                  <div className="requirements-content">
                    <p>{selectedJob.requirements}</p>
                  </div>
                </div>
              )}              {selectedJob.benefits && (
                <div className="job-benefits-section">
                  <h3>Benefici</h3>
                  <div className="benefits-content">
                    <p>{selectedJob.benefits}</p>
                  </div>
                </div>
              )}              {/* Applications Section */}
              <div className="job-applications-section">
                <div className="applications-header">
                  <h3>Candidature Ricevute ({applications.length})</h3>
                  {applications.length > 0 && (
                    <div className="applications-toolbar">
                      <label className="select-all-container">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={toggleSelectAll}
                          className="select-all-checkbox"
                        />
                        <span className="select-all-text">Seleziona tutte</span>
                      </label>
                      {selectedApplications.length > 0 && (
                        <button
                          onClick={deleteSelectedApplications}
                          className="delete-selected-btn"
                        >
                          <Trash2 size={16} />
                          Elimina selezionate ({selectedApplications.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {loadingApplications ? (
                  <div className="loading-applications">
                    <div className="loading-spinner"></div>
                    <p>Caricamento candidature...</p>
                  </div>
                ) : applications.length > 0 ? (
                  <div className="applications-list">
                    {applications.map((application) => (
                      <div key={application.id} className="application-item compact">
                        <div className="application-row">
                          <div className="application-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedApplications.includes(application.id)}
                              onChange={() => toggleApplicationSelection(application.id)}
                              className="application-select-checkbox"
                            />
                          </div>                          <div className="candidate-info-compact">
                            <div className="candidate-main-info">                              <div className="candidate-details">
                                <h4 className="candidate-name">{application.candidate_name}</h4>
                                <div className="candidate-contact">
                                  <Mail size={14} />
                                  <span className="candidate-email">{application.candidate_email}</span>
                                </div>
                                {application.phone && (
                                  <div className="candidate-contact">
                                    <Phone size={14} />
                                    <span className="candidate-phone">{application.phone}</span>
                                  </div>
                                )}                                {application.cv_filename && (
                                  <div className="candidate-contact">
                                    <FileText size={14} />                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        console.log('🖱️ CV Button clicked!', {
                                          event: e,
                                          filename: application.cv_filename,
                                          application: application
                                        });
                                        
                                        e.preventDefault();
                                        e.stopPropagation();
                                        
                                        const cvUrl = getStaticFileUrl(application.cv_filename);
                                        console.log('🔍 Opening CV URL:', cvUrl);
                                        
                                        // Test diretto dell'URL
                                        console.log('🌐 Testing URL accessibility...');
                                        fetch(cvUrl)
                                          .then(response => {
                                            console.log('📊 URL Response:', response.status, response.statusText);
                                            return response;
                                          })
                                          .catch(err => {
                                            console.error('❌ URL not accessible:', err);
                                          });
                                        
                                        // Prova window.open, se fallisce usa location.href
                                        try {
                                          const newWindow = window.open(cvUrl, '_blank');
                                          console.log('🪟 Window.open result:', newWindow);
                                          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                                            // Fallback se il popup è bloccato
                                            console.log('⚠️ Popup blocked, using location.href');
                                            window.location.href = cvUrl;
                                          }
                                        } catch (error) {
                                          console.error('❌ Error opening window:', error);
                                          window.location.href = cvUrl;
                                        }
                                      }}
                                      className="cv-link-btn"
                                    >
                                      Visualizza CV
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="application-date-compact">
                              {formatDate(application.applied_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-applications">
                    <Users size={48} />
                    <p>Nessuna candidatura ricevuta per questo annuncio</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <Briefcase size={64} />
              <h3>Seleziona un annuncio</h3>
              <p>Clicca su un annuncio dalla lista per visualizzarne i dettagli</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyJobsPage;
