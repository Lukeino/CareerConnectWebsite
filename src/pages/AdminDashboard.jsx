import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  MoreHorizontal,
  UserCheck,
  UserMinus,
  Calendar,
  MapPin,
  Mail,
  Phone,
  LogOut
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Security check: redirect non-admin users
  useEffect(() => {
    if (!isAuthenticated || user?.user_type !== 'admin') {
      navigate('/adminlogin');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    fetchAllData();
  }, []);
  // Auto logout when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Only logout on actual page unload, not refresh
      if (event.type === 'beforeunload') {
        logout();
      }
    };

    const handlePopState = () => {
      // Logout when navigating away from admin page
      logout();
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [logout]);  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchJobs(),
        fetchCompanies()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo annuncio di lavoro?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/jobs/${jobId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchJobs();
          await fetchStats();
          alert('Annuncio eliminato con successo!');
        } else {
          alert('Errore nell\'eliminazione dell\'annuncio');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Errore di connessione');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Non specificato';
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
    if (min) return `Da €${min.toLocaleString()}`;
    if (max) return `Fino a €${max.toLocaleString()}`;
    return 'Non specificato';
  };
  const getJobTypeText = (type) => {
    const types = {
      'full-time': 'Tempo Pieno',
      'part-time': 'Tempo Parziale',
      'contract': 'Contratto',
      'internship': 'Stage'
    };
    return types[type] || type;
  };

  // Authorization check
  if (!isAuthenticated || user?.user_type !== 'admin') {
    return null; // Don't render anything while redirecting
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <BarChart3 size={48} className="loading-icon" />
          <h2>Caricamento Dashboard Admin...</h2>
          <p>Recupero dei dati in corso...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <>
      {/* Statistics Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Utenti Totali</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.user_type === 'candidate').length}</h3>
            <p>Candidati</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <UserMinus size={24} />
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.user_type === 'recruiter').length}</h3>
            <p>Recruiter</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <h3>{jobs.length}</h3>
            <p>Annunci di Lavoro</p>
          </div>
        </div>

        <div className="stat-card primary">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{jobs.filter(j => j.status === 'active').length}</h3>
            <p>Annunci Attivi</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <h3>{companies.length}</h3>
            <p>Aziende</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.applications || 0}</h3>
            <p>Candidature</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.recentActivity?.users || 0}</h3>
            <p>Nuovi Utenti (30gg)</p>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <div className="analytics-card">
          <div className="analytics-header">
            <BarChart3 size={20} />
            <h2>Panoramica Sistema</h2>
          </div>
          <div className="analytics-content">
            <div className="analytics-item">
              <span className="analytics-label">Tasso di conversione candidature</span>
              <span className="analytics-value">
                {jobs.length > 0 ? Math.round((stats?.applications || 0) / jobs.length * 100) / 100 : 0}%
              </span>
            </div>
            <div className="analytics-item">
              <span className="analytics-label">Media annunci per recruiter</span>
              <span className="analytics-value">
                {users.filter(u => u.user_type === 'recruiter').length > 0 ? 
                  Math.round(jobs.length / users.filter(u => u.user_type === 'recruiter').length * 100) / 100 : 0}
              </span>
            </div>
            <div className="analytics-item">
              <span className="analytics-label">Crescita utenti recenti</span>
              <span className="analytics-value">+{stats?.recentActivity?.users || 0} questo mese</span>
            </div>
            <div className="analytics-item">
              <span className="analytics-label">Nuovi annunci recenti</span>
              <span className="analytics-value">+{stats?.recentActivity?.jobs || 0} questo mese</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderUsers = () => (
    <div className="data-section">
      <div className="data-card">
        <div className="data-header">
          <h2>
            <Users size={20} />
            Gestione Utenti
            <span className="data-count">{users.length}</span>
          </h2>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Azienda</th>
                <th>Telefono</th>
                <th>Registrato</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} />
                      {user.email}
                    </div>
                  </td>                  <td>
                    <span className={`user-type-badge ${user.user_type}`}>
                      {user.user_type === 'candidate' ? 'Candidato' : 
                       user.user_type === 'recruiter' ? 'Recruiter' : 
                       user.user_type === 'admin' ? 'Amministratore' : user.user_type}
                    </span>
                  </td>
                  <td>{user.company || 'N/A'}</td>
                  <td>
                    {user.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={14} />
                        {user.phone}
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="data-section">
      <div className="data-card">
        <div className="data-header">
          <h2>
            <Briefcase size={20} />
            Gestione Annunci di Lavoro
            <span className="data-count">{jobs.length}</span>
          </h2>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titolo</th>
                <th>Azienda</th>
                <th>Recruiter</th>
                <th>Posizione</th>
                <th>Tipo</th>
                <th>Stipendio</th>
                <th>Status</th>
                <th>Creato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>
                    <div className="job-title">
                      {job.title}
                    </div>
                  </td>
                  <td>{job.company_name || 'N/A'}</td>
                  <td>{job.recruiter_name || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} />
                      {job.location || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className="job-type-badge">
                      {getJobTypeText(job.job_type)}
                    </span>
                  </td>
                  <td>{formatSalary(job.salary_min, job.salary_max)}</td>
                  <td>
                    <span className={`status-badge ${job.status}`}>
                      {job.status === 'active' ? 'Attivo' : 'Chiuso'}
                    </span>
                  </td>
                  <td>{formatDate(job.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                        className="action-btn view-btn"
                        title="Visualizza annuncio"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="action-btn delete-btn"
                        title="Elimina annuncio"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCompanies = () => (
    <div className="data-section">
      <div className="data-card">
        <div className="data-header">
          <h2>
            <Building2 size={20} />
            Gestione Aziende
            <span className="data-count">{companies.length}</span>
          </h2>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrizione</th>
                <th>Sito Web</th>
                <th>Posizione</th>
                <th>Annunci Attivi</th>
                <th>Creata</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(company => (
                <tr key={company.id}>
                  <td>{company.id}</td>
                  <td>{company.name}</td>
                  <td>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {company.description || 'Nessuna descrizione'}
                    </div>
                  </td>
                  <td>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>
                        Visita sito
                      </a>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} />
                      {company.location || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active">
                      {company.job_count || 0}
                    </span>
                  </td>
                  <td>{formatDate(company.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  return (
    <div className="admin-dashboard">
      {/* Logout Button */}
      <div className="admin-logout-section">        <div className="logout-info">
          <span className="admin-welcome">
            Benvenuto, {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.name || 'Amministratore'}
          </span>
          <div className="admin-status">
            <CheckCircle size={16} />
            Sistema Operativo
          </div>
        </div>
        <button 
          className="logout-button"
          onClick={handleLogout}
          title="Disconnetti"
        >
          <LogOut size={16} />
          Disconnetti
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          Panoramica
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          Utenti ({users.length})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase size={16} />
          Annunci ({jobs.length})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'companies' ? 'active' : ''}`}
          onClick={() => setActiveTab('companies')}
        >
          <Building2 size={16} />
          Aziende ({companies.length})
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'jobs' && renderJobs()}
        {activeTab === 'companies' && renderCompanies()}
      </div>
    </div>
  );
};

export default AdminDashboard;