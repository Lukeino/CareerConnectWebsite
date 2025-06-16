// ==============================================
// DASHBOARD AMMINISTRATORE
// 
// Interfaccia completa per gestione backend con:
// - Panoramica statistiche sistema
// - Gestione CRUD utenti (candidati, recruiter)
// - Gestione annunci di lavoro e aziende
// - Funzioni debug e sicurezza avanzata
// ==============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';
import { formatDate } from '../utils/dateUtils';
import { 
  CheckCircle,
  LogOut
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // HOOKS E NAVIGATION
  const navigate = useNavigate();
  const { logout, user, isAuthenticated } = useAuth();
  
  // STATI LOCALI COMPONENTE
  const [loading, setLoading] = useState(true);           // Stato caricamento dati
  const [stats, setStats] = useState(null);               // Statistiche sistema
  const [users, setUsers] = useState([]);                 // Lista utenti
  const [jobs, setJobs] = useState([]);                   // Lista annunci lavoro
  const [applications, setApplications] = useState([]);   // Candidature (non utilizzato attualmente)
  const [companies, setCompanies] = useState([]);         // Lista aziende
  const [activeTab, setActiveTab] = useState('overview'); // Tab attiva nella navigazione
  // SECURITY CHECK: Redirect utenti non admin e controllo scadenza sessione
  useEffect(() => {
    if (!isAuthenticated || user?.user_type !== 'admin') {
      navigate('/adminlogin');
      return;
    }

    // Controllo scadenza sessione admin (solo per admin)
    const adminSessionKey = 'careerconnect_admin_session';
    const currentTime = Date.now();
    const sessionData = sessionStorage.getItem(adminSessionKey);
    
    if (sessionData) {
      try {
        const { timestamp, userId } = JSON.parse(sessionData);
        const sessionAge = currentTime - timestamp;
        const maxSessionAge = 30 * 60 * 1000; // 30 minuti
        
        // Se la sessione è scaduta o appartiene a un altro utente, logout
        if (sessionAge > maxSessionAge || userId !== user.id) {
          console.log('Admin session expired or invalid, logging out...');
          logout();
          navigate('/adminlogin');
          return;
        }
      } catch (error) {
        console.error('Error parsing admin session data:', error);
        logout();
        navigate('/adminlogin');
        return;
      }
    }
    
    // Imposta/aggiorna timestamp sessione admin
    sessionStorage.setItem(adminSessionKey, JSON.stringify({
      timestamp: currentTime,
      userId: user.id
    }));
    
  }, [isAuthenticated, user, navigate, logout]);
  // EFFECT: Caricamento dati iniziale
  useEffect(() => {
    fetchAllData();
  }, []);

  // CONTROLLO PERIODICO SESSIONE ADMIN
  useEffect(() => {
    const sessionInterval = setInterval(() => {
      const adminSessionKey = 'careerconnect_admin_session';
      const sessionData = sessionStorage.getItem(adminSessionKey);
      
      if (!sessionData || !user?.id) {
        logout();
        navigate('/adminlogin');
        return;
      }
      
      try {
        const { timestamp, userId } = JSON.parse(sessionData);
        const sessionAge = Date.now() - timestamp;
        const maxSessionAge = 30 * 60 * 1000; // 30 minuti
        
        if (sessionAge > maxSessionAge || userId !== user.id) {
          console.log('Admin session expired during check, logging out...');
          logout();
          navigate('/adminlogin');
          return;
        }
      } catch (error) {
        console.error('Error during session check:', error);
        logout();
        navigate('/adminlogin');
      }
    }, 60000); // Controlla ogni minuto

    return () => clearInterval(sessionInterval);
  }, [user, logout, navigate]);

  // AGGIORNAMENTO ATTIVITÀ UTENTE (rinnova la sessione)
  useEffect(() => {
    const updateActivity = () => {
      if (user?.user_type === 'admin') {
        const adminSessionKey = 'careerconnect_admin_session';
        sessionStorage.setItem(adminSessionKey, JSON.stringify({
          timestamp: Date.now(),
          userId: user.id
        }));
      }
    };

    // Event listeners per attività utente
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [user]);  // AUTO LOGOUT: Sicurezza su chiusura browser/tab per admin
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Per gli admin, rimuovi la sessione su chiusura per sicurezza
      if (user?.user_type === 'admin') {
        sessionStorage.removeItem('careerconnect_admin_session');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && user?.user_type === 'admin') {
        // Imposta un timer per logout se la pagina rimane nascosta troppo a lungo
        const logoutTimer = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            sessionStorage.removeItem('careerconnect_admin_session');
            logout();
          }
        }, 5 * 60 * 1000); // 5 minuti di inattività

        // Salva il timer per poterlo cancellare se necessario
        sessionStorage.setItem('careerconnect_logout_timer', logoutTimer.toString());
      } else if (document.visibilityState === 'visible') {
        // Cancella il timer se l'utente torna sulla pagina
        const timerId = sessionStorage.getItem('careerconnect_logout_timer');
        if (timerId) {
          clearTimeout(parseInt(timerId));
          sessionStorage.removeItem('careerconnect_logout_timer');
        }
      }
    };

    // Registrazione event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup listeners
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logout, user]);

  // GESTIONE LOGOUT MANUALE
  const handleLogout = () => {
    logout();
    navigate('/adminlogin');
  };  // FETCH TUTTI I DATI - Funzione aggregata per caricamento parallelo
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Esecuzione parallela di tutte le chiamate API
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

  // FETCH STATISTICHE SISTEMA
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // FETCH LISTA UTENTI
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };  // FETCH LISTA ANNUNCI LAVORO
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // FETCH LISTA AZIENDE
  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/companies`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // ELIMINAZIONE ANNUNCIO LAVORO
  const deleteJob = async (jobId) => {
    // Conferma utente con messaggio specifico
    if (window.confirm('Sei sicuro di voler eliminare questo annuncio di lavoro?')) {
      try {
        // console.log('Deleting job with ID:', jobId);
        const response = await fetch(`${API_CONFIG.BASE_URL}/jobs/${jobId}`, {
          method: 'DELETE'
        });
        
        // console.log('Delete response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          // console.log('Delete response data:', result);
          
          // Refresh dati dopo eliminazione
          await fetchJobs();
          await fetchStats();
          alert('Annuncio eliminato con successo!');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Delete error:', errorData);
          alert(`Errore nell'eliminazione dell'annuncio: ${errorData.error || 'Errore sconosciuto'}`);
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert(`Errore di connessione: ${error.message}`);
      }
    }
  };

  // BLOCCA/SBLOCCA UTENTE
  const toggleUserBlock = async (userId, isCurrentlyBlocked) => {
    const action = isCurrentlyBlocked ? 'sbloccare' : 'bloccare';
    const confirmMessage = `Sei sicuro di voler ${action} questo utente?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // console.log(`${action} user ID:`, userId);
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users/${userId}/block`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isBlocked: !isCurrentlyBlocked })
        });
        
        if (response.ok) {
          const result = await response.json();
          // console.log('Block/Unblock response:', result);
          
          // Refresh dati utenti
          await fetchUsers();
          alert(`Utente ${isCurrentlyBlocked ? 'sbloccato' : 'bloccato'} con successo!`);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Block/Unblock error:', errorData);
          alert(`Errore: ${errorData.error || 'Operazione fallita'}`);
        }
      } catch (error) {
        console.error('Error blocking/unblocking user:', error);
        alert(`Errore di connessione: ${error.message}`);
      }
    }
  };

  // ELIMINAZIONE DEFINITIVA UTENTE
  const deleteUser = async (userId, userName) => {
    // Conferma multipla per operazione critica
    const confirmMessage = `ATTENZIONE: Sei sicuro di voler ELIMINARE DEFINITIVAMENTE l'utente "${userName}"?\n\nQuesta azione:\n• Eliminerà permanentemente l'account\n• Rimuoverà tutti i dati associati\n• NON PUÒ ESSERE ANNULLATA\n\nDigita "ELIMINA" per confermare:`;
    
    const userConfirmation = prompt(confirmMessage);
    
    if (userConfirmation === "ELIMINA") {
      try {
        // console.log('Deleting user ID:', userId);
        const response = await fetch(`${API_CONFIG.BASE_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          // console.log('Delete user response:', result);
          
          // Refresh dati utenti e statistiche
          await fetchUsers();
          await fetchStats();
          alert('Utente eliminato con successo!');
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Delete user error:', errorData);
          alert(`Errore nell'eliminazione dell'utente: ${errorData.error || 'Errore sconosciuto'}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Errore di connessione: ${error.message}`);
      }
    } else if (userConfirmation !== null) {
      alert('Operazione annullata. Devi digitare esattamente "ELIMINA" per confermare.');
    }  };

  // HELPER: Messaggio saluto basato su orario
  const getGreetingMessage = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Buongiorno';
    } else if (hour >= 12 && hour < 18) {
      return 'Buon pomeriggio';
    } else {
      return 'Buonasera';
    }
  };

  // HELPER: Formattazione range stipendio
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Non specificato';
    if (min && max) return `€${min.toLocaleString()} - €${max.toLocaleString()}`;
    if (min) return `Da €${min.toLocaleString()}`;
    if (max) return `Fino a €${max.toLocaleString()}`;
    return 'Non specificato';
  };

  // HELPER: Traduzione tipo lavoro
  const getJobTypeText = (type) => {
    const types = {
      'full-time': 'Tempo Pieno',
      'part-time': 'Tempo Parziale',
      'contract': 'Contratto',
      'internship': 'Stage'
    };
    return types[type] || type;
  };

  // SECURITY: Controllo autorizzazione finale
  if (!isAuthenticated || user?.user_type !== 'admin') {
    return null; // Non renderizza nulla durante redirect
  }
  // LOADING STATE: Schermata caricamento
  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <h2>Caricamento Dashboard Admin...</h2>
          <p>Recupero dei dati in corso...</p>
        </div>
      </div>
    );
  }// RENDER PANORAMICA: Statistiche e analytics
  const renderOverview = () => {
    // Debug: Verificare i dati    // console.log('Debug Dashboard - Users:', users.length);
    // console.log('Debug Dashboard - Jobs:', jobs.length);
    // console.log('Debug Dashboard - Companies:', companies.length);
    // console.log('Debug Dashboard - Stats:', stats);
    
    return (
    <>      {/* Griglia Statistiche - Design Professionale Senza Icone */}
      <div className="stats-grid">        <div className="stat-card total-users">
          <div className="stat-content">
            <h3>{users.length || 0}</h3>
            <p>Utenti Totali</p>
          </div>
        </div>

        <div className="stat-card candidates">
          <div className="stat-content">
            <h3>{users.filter(u => u.user_type === 'candidate').length || 0}</h3>
            <p>Candidati</p>
          </div>
        </div>

        <div className="stat-card recruiters">
          <div className="stat-content">
            <h3>{users.filter(u => u.user_type === 'recruiter').length || 0}</h3>
            <p>Recruiter</p>
          </div>
        </div>

        <div className="stat-card jobs">
          <div className="stat-content">
            <h3>{jobs.length || 0}</h3>
            <p>Annunci di Lavoro</p>
          </div>
        </div>

        <div className="stat-card active-jobs">
          <div className="stat-content">
            <h3>{jobs.filter(j => j.status === 'active').length || 0}</h3>
            <p>Annunci Attivi</p>
          </div>
        </div>

        <div className="stat-card companies">
          <div className="stat-content">
            <h3>{companies.length || 0}</h3>
            <p>Aziende</p>
          </div>
        </div>

        <div className="stat-card applications">
          <div className="stat-content">
            <h3>{stats?.applications || 0}</h3>
            <p>Candidature</p>
          </div>
        </div>        <div className="stat-card new-users">
          <div className="stat-content">
            <h3>{stats?.recentActivity?.users || 0}</h3>
            <p>Nuovi Utenti (30gg)</p>
          </div>
        </div>
      </div>{/* Sezione Analytics - Design Pulito */}
      <div className="analytics-section">
        <div className="analytics-card">
          <div className="analytics-header">
            <h2>Panoramica Sistema</h2>
          </div>
          <div className="analytics-content">
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
  )};

  // RENDER GESTIONE UTENTI: Tabella completa con azioni CRUD
  const renderUsers = () => (
    <div className="data-section">
      <div className="data-card">        <div className="data-header">
          <h2>
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
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.first_name} {user.last_name}</td>                  <td>{user.email}</td>
                  <td>
                    <span className={`user-type-badge ${user.user_type}`}>
                      {user.user_type === 'candidate' ? 'Candidato' : 
                       user.user_type === 'recruiter' ? 'Recruiter' : 
                       user.user_type === 'admin' ? 'Amministratore' : user.user_type}
                    </span>
                  </td>
                  <td>{user.company || 'N/A'}</td>                  <td>
                    {user.phone || 'N/A'}
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <span className={`status-badge ${user.is_blocked ? 'blocked' : 'active'}`}>
                      {user.is_blocked ? 'Bloccato' : 'Attivo'}
                    </span>
                  </td>
                  <td>                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* Azioni solo per non-admin */}
                      {user.user_type !== 'admin' && (
                        <>
                          <button
                            onClick={() => toggleUserBlock(user.id, user.is_blocked)}
                            className={`action-btn ${user.is_blocked ? 'unblock-btn' : 'block-btn'}`}
                            title={user.is_blocked ? 'Sblocca utente' : 'Blocca utente'}
                          >
                            {user.is_blocked ? 'Sblocca' : 'Blocca'}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, `${user.first_name} ${user.last_name}`)}
                            className="action-btn delete-user-btn"
                            title="Elimina utente definitivamente"
                          >
                            Elimina
                          </button>
                        </>
                      )}
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

  // RENDER GESTIONE ANNUNCI: Tabella offerte lavoro con visualizzazione e eliminazione
  const renderJobs = () => (
    <div className="data-section">
      <div className="data-card">        <div className="data-header">
          <h2>
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
                  <td>{job.recruiter_name || 'N/A'}</td>                  <td>{job.location || 'N/A'}</td>
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
                  <td>                    <div style={{ display: 'flex', gap: '0.5rem' }}>                      {/* Bottone visualizza - apre nella stessa pagina */}
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="action-btn view-btn"
                        title="Visualizza annuncio"
                      >
                        Visualizza
                      </button>
                      {/* Bottone elimina */}
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="action-btn delete-btn"
                        title="Elimina annuncio"
                      >
                        Elimina
                      </button>
                    </div>
                  </td>
                </tr>            ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // RENDER PRINCIPALE DASHBOARD
  return (
    <div className="admin-dashboard">
      {/* Sezione Header con Logout */}
      <div className="admin-logout-section">
        <div className="logout-info">
          <span className="admin-welcome">
            {getGreetingMessage()}, {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.name || 'Amministratore'}
          </span>
          <div className="admin-status">
            <CheckCircle size={16} />
            Sistema Operativo
          </div>
        </div>        <div className="admin-actions">
          {/* Bottone Logout */}
          <button 
            className="logout-button"
            onClick={handleLogout}
            title="Disconnetti"
          >
            <LogOut size={16} />
            Disconnetti
          </button>
        </div>
      </div>      {/* Navigazione Tab - Design Pulito Senza Icone */}
      <div className="admin-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Panoramica
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Utenti ({users.length})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Annunci ({jobs.length})
        </button>
      </div>      {/* Contenuto Dinamico Basato su Tab Attiva */}
      <div className="admin-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'jobs' && renderJobs()}
      </div>
    </div>
  );
};

export default AdminDashboard;