import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Shield, Eye, Database, Lock, UserCheck, Mail, Phone } from 'lucide-react';
import './PrivacyPage.css';

const PrivacyPage = () => {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        {/* Header */}
        <div className="privacy-header">
          <Link to="/" className="back-button">
            <ChevronLeft size={20} />
            Torna alla Home
          </Link>
          <div className="privacy-title">
            <Shield size={32} className="privacy-icon" />
            <h1>Privacy Policy</h1>
          </div>
          <p className="privacy-subtitle">
            Ultimo aggiornamento: 10 Giugno 2025
          </p>
        </div>

        {/* Content */}
        <div className="privacy-content">
          {/* Introduction */}
          <section className="privacy-section">
            <h2>Introduzione</h2>
            <p>
              Benvenuto in CareerConnect. La tua privacy è estremamente importante per noi. 
              Questa Privacy Policy spiega come raccogliamo, utilizziamo, proteggiamo e 
              condividiamo le tue informazioni personali quando utilizzi il nostro servizio.
            </p>
            <p>
              CareerConnect è una piattaforma di recruiting che connette candidati e aziende, 
              facilitando il processo di ricerca e selezione del personale.
            </p>
          </section>

          {/* Data Collection */}
          <section className="privacy-section">
            <div className="section-header">
              <Database size={24} />
              <h2>Informazioni che Raccogliamo</h2>
            </div>
            
            <h3>Informazioni Personali</h3>
            <ul>
              <li><strong>Per i Candidati:</strong> Nome, cognome, email, telefono, esperienza lavorativa, competenze, CV</li>
              <li><strong>Per i Recruiter:</strong> Nome, cognome, email, telefono, azienda di appartenenza</li>
              <li><strong>Per tutti gli utenti:</strong> Indirizzo IP, dati di navigazione, preferenze del sito</li>
            </ul>

            <h3>Come Raccogliamo i Dati</h3>
            <ul>
              <li>Direttamente da te durante la registrazione e l'utilizzo del servizio</li>
              <li>Automaticamente attraverso cookies e tecnologie simili</li>
              <li>Da fonti pubbliche quando necessario per verificare informazioni</li>
            </ul>
          </section>

          {/* Data Usage */}
          <section className="privacy-section">
            <div className="section-header">
              <Eye size={24} />
              <h2>Come Utilizziamo le Tue Informazioni</h2>
            </div>
            
            <ul>
              <li>Fornire e migliorare i nostri servizi di recruiting</li>
              <li>Facilitare il matching tra candidati e opportunità lavorative</li>
              <li>Comunicare con te riguardo al tuo account e alle opportunità</li>
              <li>Personalizzare la tua esperienza sulla piattaforma</li>
              <li>Garantire la sicurezza e prevenire frodi</li>
              <li>Rispettare obblighi legali e normativi</li>
            </ul>
          </section>

          {/* Data Protection */}
          <section className="privacy-section">
            <div className="section-header">
              <Lock size={24} />
              <h2>Protezione dei Dati</h2>
            </div>
            
            <p>
              Implementiamo misure di sicurezza appropriate per proteggere le tue informazioni:
            </p>
            <ul>
              <li>Crittografia dei dati sensibili</li>
              <li>Accesso limitato solo al personale autorizzato</li>
              <li>Monitoraggio continuo per attività sospette</li>
              <li>Backup sicuri e procedure di disaster recovery</li>
              <li>Aggiornamenti regolari dei sistemi di sicurezza</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="privacy-section">
            <h2>Condivisione delle Informazioni</h2>
            
            <h3>Con Chi Condividiamo i Tuoi Dati</h3>
            <ul>
              <li><strong>Aziende Partner:</strong> Quando ti candidi per una posizione, condividiamo le tue informazioni pertinenti con l'azienda</li>
              <li><strong>Fornitori di Servizi:</strong> Partner tecnici che ci aiutano a gestire la piattaforma</li>
              <li><strong>Autorità Legali:</strong> Quando richiesto dalla legge o per proteggere i nostri diritti</li>
            </ul>

            <h3>Non Condividiamo Mai</h3>
            <ul>
              <li>I tuoi dati con terze parti per scopi commerciali non correlati</li>
              <li>Informazioni senza il tuo consenso, eccetto quando richiesto dalla legge</li>
              <li>Dati sensibili non necessari per il servizio richiesto</li>
            </ul>
          </section>

          {/* User Rights */}
          <section className="privacy-section">
            <div className="section-header">
              <UserCheck size={24} />
              <h2>I Tuoi Diritti</h2>
            </div>
            
            <p>In conformità con il GDPR e le normative sulla privacy, hai i seguenti diritti:</p>
            <ul>
              <li><strong>Accesso:</strong> Richiedere una copia dei tuoi dati personali</li>
              <li><strong>Rettifica:</strong> Correggere informazioni inesatte o incomplete</li>
              <li><strong>Cancellazione:</strong> Richiedere la rimozione dei tuoi dati ("diritto all'oblio")</li>
              <li><strong>Portabilità:</strong> Ricevere i tuoi dati in un formato strutturato</li>
              <li><strong>Limitazione:</strong> Limitare il trattamento dei tuoi dati</li>
              <li><strong>Opposizione:</strong> Opporti al trattamento per scopi di marketing</li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="privacy-section">
            <h2>Cookies e Tecnologie Simili</h2>
            
            <p>Utilizziamo cookies per:</p>
            <ul>
              <li>Mantenere il tuo login attivo</li>
              <li>Ricordare le tue preferenze</li>
              <li>Analizzare l'utilizzo del sito per miglioramenti</li>
              <li>Fornire contenuti personalizzati</li>
            </ul>
            
            <p>
              Puoi gestire le preferenze sui cookies attraverso le impostazioni del tuo browser. 
              Nota che disabilitare alcuni cookies potrebbe limitare alcune funzionalità del sito.
            </p>
          </section>

          {/* Data Retention */}
          <section className="privacy-section">
            <h2>Conservazione dei Dati</h2>
            
            <ul>
              <li><strong>Account attivi:</strong> Conserviamo i dati finché mantieni l'account</li>
              <li><strong>Account cancellati:</strong> Eliminazione entro 30 giorni dalla richiesta</li>
              <li><strong>Dati di log:</strong> Conservati per 12 mesi per scopi di sicurezza</li>
              <li><strong>Comunicazioni:</strong> Conservate secondo necessità legali</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="privacy-section">
            <div className="section-header">
              <Mail size={24} />
              <h2>Contattaci</h2>
            </div>
            
            <p>
              Per qualsiasi domanda riguardo questa Privacy Policy o per esercitare i tuoi diritti, 
              puoi contattarci:
            </p>
              <div className="contact-info">
              <div className="contact-item">
                <Mail size={20} />
                <span>lucaiantosco000@gmail.com</span>
              </div>
              <div className="contact-item">
                <Phone size={20} />
                <span>320 066 0461</span>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="privacy-section">
            <h2>Aggiornamenti della Privacy Policy</h2>
            
            <p>
              Questa Privacy Policy può essere aggiornata periodicamente per riflettere 
              cambiamenti nei nostri servizi o nelle normative applicabili. Ti notificheremo 
              eventuali modifiche sostanziali tramite email o attraverso un avviso sulla piattaforma.
            </p>
            
            <p>
              Ti incoraggiamo a rivedere regolarmente questa pagina per rimanere informato 
              su come proteggiamo le tue informazioni.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
