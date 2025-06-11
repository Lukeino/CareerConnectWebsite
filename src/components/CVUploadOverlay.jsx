// ==============================================
// COMPONENTE CV UPLOAD OVERLAY
// 
// Modal per il caricamento, visualizzazione e gestione dei CV.
// Supporta drag & drop, validazione file e azioni CRUD sui CV.
// ==============================================

import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, Check, Download, Trash2, Eye } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import './CVUploadOverlay.css';

const CVUploadOverlay = ({ isOpen, onClose, onUpload, onDeleteCV, currentCV, userId }) => {
  // STATI DEL COMPONENTE
  const [isDragOver, setIsDragOver] = useState(false);    // Stato drag over per feedback visivo
  const [isUploading, setIsUploading] = useState(false);  // Stato caricamento in corso
  const [isDeleting, setIsDeleting] = useState(false);    // Stato eliminazione in corso  const [selectedFile, setSelectedFile] = useState(null); // File selezionato per upload

  // FUNZIONE HELPER PER URL FILE STATICI  
  // Helper per generare URL corretti per file statici  
  // Utilizza la configurazione API centralizzata per coerenza
  const getStaticFileUrl = (filename) => {
    // Debug del filename ricevuto
    console.log('🔍 Debug filename received:', filename);
    
    if (!filename) {
      console.error('❌ No filename provided to getStaticFileUrl');
      return '';
    }
    
    // Rimuove '/api' dalla base URL e aggiunge '/uploads'
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
    
    const fullUrl = `${baseUrl}/uploads/${filename}`;
    console.log('🔗 Generated CV URL:', fullUrl, 'from filename:', filename);
    console.log('🔧 Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT');
    console.log('🔧 Final Base URL:', baseUrl);
    console.log('🔧 API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
    
    return fullUrl;
  };

  // GESTORI DRAG & DROP
  // useCallback per ottimizzazioni performance - evita re-render inutili
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();           // Previene comportamento default browser
    setIsDragOver(true);         // Attiva stato drag over per stili CSS
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();          // Previene comportamento default browser
    setIsDragOver(false);        // Disattiva stato drag over
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();          // Previene apertura file nel browser
    setIsDragOver(false);        // Reset stato drag
    
    const files = e.dataTransfer.files;  // Ottiene file trascinati
    if (files.length > 0) {
      handleFileSelect(files[0]); // Processa primo file (solo uno supportato)
    }
  }, []);

  // VALIDAZIONE E SELEZIONE FILE
  const handleFileSelect = (file) => {
    // Verifica tipo file - solo PDF accettati
    if (file.type !== 'application/pdf') {
      alert('Per favore seleziona solo file PDF');
      return;
    }

    // Verifica dimensione file - massimo 5MB (5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      alert('Il file deve essere massimo 5MB');
      return;
    }

    setSelectedFile(file);       // Salva file validato nello stato
  };

  // GESTISCE SELEZIONE FILE DA INPUT
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];  // Ottiene primo file selezionato
    if (file) {
      handleFileSelect(file);         // Usa stessa logica validazione
    }
  };

  // CARICAMENTO FILE SUL SERVER
  const handleUpload = async () => {
    if (!selectedFile) return;        // Verifica presenza file

    setIsUploading(true);            // Attiva stato caricamento
    try {
      await onUpload(selectedFile);   // Chiama funzione upload del genitore
      setSelectedFile(null);          // Reset file selezionato
      onClose();                      // Chiude modal
    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      alert('Errore durante il caricamento del CV');
    } finally {
      setIsUploading(false);          // Disattiva stato caricamento sempre
    }
  };

  // CHIUSURA MODAL CON RESET STATI
  const handleClose = () => {
    setSelectedFile(null);            // Reset file selezionato
    setIsDragOver(false);            // Reset stato drag
    onClose();                       // Chiama funzione chiusura del genitore
  };

  // DOWNLOAD CV ESISTENTE
  const handleDownloadCV = async () => {
    if (!currentCV) return;          // Verifica presenza CV

    try {
      console.log('📥 Starting CV download for:', currentCV);
      
      // Fetch del file come blob per download
      const response = await fetch(getStaticFileUrl(currentCV));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();  // Converte risposta in blob
      
      // Crea link temporaneo per download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentCV;           // Nome file per download
      link.style.display = 'none';        // Link invisibile
      
      // Trigger download
      document.body.appendChild(link);
      link.click();                        // Simula click per avviare download
      document.body.removeChild(link);     // Rimuove link dal DOM
      
      // Pulisce URL temporaneo per liberare memoria
      window.URL.revokeObjectURL(url);
      
      console.log('✅ CV download completed');
    } catch (error) {
      console.error('❌ Error downloading CV:', error);
      alert('Errore durante il download del CV. Prova a visualizzarlo invece.');
    }
  };  // VISUALIZZAZIONE CV IN NUOVA TAB
  const handleViewCV = (e) => {
    console.log('🖱️ CV View Button clicked!', { event: e, currentCV });
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (currentCV) {
      const cvUrl = getStaticFileUrl(currentCV);
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
    }
  };

  // ELIMINAZIONE CV DAL SERVER
  const handleDeleteCV = async () => {
    if (!currentCV) return;          // Verifica presenza CV
    
    // Conferma utente prima di eliminazione
    if (!window.confirm('Sei sicuro di voler eliminare il tuo CV? Questa azione non può essere annullata.')) {
      return;
    }

    setIsDeleting(true);             // Attiva stato eliminazione
    try {
      // Chiamata API per eliminazione
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/${userId}/cv`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        if (onDeleteCV) {
          onDeleteCV();              // Callback al genitore per aggiornamento UI
        }
        alert('CV eliminato con successo!');
        onClose();                   // Chiude modal
      } else {
        throw new Error(result.error || 'Errore durante l\'eliminazione');
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del CV:', error);
      alert('Errore durante l\'eliminazione del CV');
    } finally {
      setIsDeleting(false);          // Disattiva stato eliminazione sempre
    }
  };

  // RENDER CONDIZIONALE - non renderizza se modal chiuso
  if (!isOpen) return null;

  return (
    <div className="cv-upload-overlay">
      <div className="cv-upload-modal">
        {/* HEADER DEL MODAL */}
        <div className="cv-upload-header">
          <h2>
            <Upload size={24} />
            Carica il tuo CV
          </h2>
          <button onClick={handleClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        {/* CONTENUTO PRINCIPALE */}
        <div className="cv-upload-content">
          {/* SEZIONE CV ESISTENTE - mostrata solo se presente */}
          {currentCV && (
            <div className="current-cv-section">
              <div className="current-cv-info">
                <FileText size={16} />
                <span>CV attuale: {currentCV}</span>
              </div>
              
              {/* AZIONI SU CV ESISTENTE */}
              <div className="current-cv-actions">                {/* Bottone Visualizza */}
                <button 
                  type="button"
                  onClick={handleViewCV}
                  className="cv-action-btn view-cv-btn"
                  title="Visualizza CV"
                >
                  <Eye size={16} />
                </button>
                
                {/* Bottone Download */}
                <button 
                  onClick={handleDownloadCV}
                  className="cv-action-btn download-cv-btn"
                  title="Scarica CV"
                >
                  <Download size={16} />
                </button>
                
                {/* Bottone Elimina con stato loading */}
                <button 
                  onClick={handleDeleteCV}
                  disabled={isDeleting}
                  className="cv-action-btn delete-cv-btn"
                  title="Elimina CV"
                >
                  {isDeleting ? (
                    <div className="loading-spinner-small"></div>
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ZONA DRAG & DROP */}
          <div
            className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('cv-file-input').click()}
          >
            {/* CONTENUTO CONDIZIONALE DELLA ZONA DROP */}
            {selectedFile ? (
              // Visualizzazione file selezionato
              <div className="selected-file">
                <FileText size={48} />
                <h3>{selectedFile.name}</h3>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="file-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();    // Previene click sulla zona drop
                      setSelectedFile(null);  // Rimuove file selezionato
                    }}
                    className="remove-file-btn"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            ) : (
              // Contenuto default zona drop
              <div className="drop-zone-content">
                <Upload size={48} />
                <h3>Trascina il tuo CV qui</h3>
                <p>oppure clicca per selezionare</p>
                <div className="file-requirements">
                  <small>• Solo file PDF</small>
                  <small>• Massimo 5MB</small>
                </div>
              </div>
            )}
          </div>

          {/* INPUT FILE NASCOSTO - attivato da click zona drop */}
          <input
            id="cv-file-input"
            type="file"
            accept=".pdf"                    // Accetta solo PDF
            onChange={handleFileInputChange}
            style={{ display: 'none' }}     // Nascosto, usato programmaticamente
          />
        </div>

        {/* FOOTER CON BOTTONI AZIONE */}
        <div className="cv-upload-footer">
          {/* Bottone Annulla */}
          <button onClick={handleClose} className="cancel-btn">
            Annulla
          </button>
          
          {/* Bottone Carica con stati condizionali */}
          <button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}  // Disabilitato se no file o caricamento
            className="upload-btn"
          >
            {isUploading ? (
              // Stato caricamento
              <>
                <div className="loading-spinner"></div>
                Caricamento...
              </>
            ) : (
              // Stato normale
              <>
                <Check size={16} />
                Carica CV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CVUploadOverlay;
