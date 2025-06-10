import React, { useState, useCallback } from 'react';
import { X, Upload, FileText, Check, Download, Trash2, Eye } from 'lucide-react';
import './CVUploadOverlay.css';

const CVUploadOverlay = ({ isOpen, onClose, onUpload, onDeleteCV, currentCV, userId }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file) => {
    // Verifica che sia un PDF
    if (file.type !== 'application/pdf') {
      alert('Per favore seleziona solo file PDF');
      return;
    }

    // Verifica dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Il file deve essere massimo 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error('Errore durante il caricamento:', error);
      alert('Errore durante il caricamento del CV');
    } finally {
      setIsUploading(false);
    }
  };
  const handleClose = () => {
    setSelectedFile(null);
    setIsDragOver(false);
    onClose();
  };
  const handleDownloadCV = async () => {
    if (!currentCV) return;
    
    try {
      console.log('📥 Starting CV download for:', currentCV);
      
      // Fetch the file as blob
      const response = await fetch(`http://localhost:3001/uploads/${currentCV}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentCV;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url);
      
      console.log('✅ CV download completed');
    } catch (error) {
      console.error('❌ Error downloading CV:', error);
      alert('Errore durante il download del CV. Prova a visualizzarlo invece.');
    }
  };

  const handleViewCV = () => {
    if (currentCV) {
      window.open(`http://localhost:3001/uploads/${currentCV}`, '_blank');
    }
  };

  const handleDeleteCV = async () => {
    if (!currentCV) return;
    
    if (!window.confirm('Sei sicuro di voler eliminare il tuo CV? Questa azione non può essere annullata.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/user/${userId}/cv`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        if (onDeleteCV) {
          onDeleteCV();
        }
        alert('CV eliminato con successo!');
        onClose();
      } else {
        throw new Error(result.error || 'Errore durante l\'eliminazione');
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del CV:', error);
      alert('Errore durante l\'eliminazione del CV');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cv-upload-overlay">
      <div className="cv-upload-modal">
        <div className="cv-upload-header">
          <h2>
            <Upload size={24} />
            Carica il tuo CV
          </h2>
          <button onClick={handleClose} className="close-btn">
            <X size={20} />
          </button>
        </div>        <div className="cv-upload-content">
          {currentCV && (
            <div className="current-cv-section">
              <div className="current-cv-info">
                <FileText size={16} />
                <span>CV attuale: {currentCV}</span>
              </div>
              <div className="current-cv-actions">
                <button 
                  onClick={handleViewCV}
                  className="cv-action-btn view-cv-btn"
                  title="Visualizza CV"
                >
                  <Eye size={16} />
                </button>
                <button 
                  onClick={handleDownloadCV}
                  className="cv-action-btn download-cv-btn"
                  title="Scarica CV"
                >
                  <Download size={16} />
                </button>
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

          <div
            className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('cv-file-input').click()}
          >
            {selectedFile ? (
              <div className="selected-file">
                <FileText size={48} />
                <h3>{selectedFile.name}</h3>
                <p>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <div className="file-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="remove-file-btn"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            ) : (
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

          <input
            id="cv-file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="cv-upload-footer">
          <button onClick={handleClose} className="cancel-btn">
            Annulla
          </button>
          <button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="upload-btn"
          >
            {isUploading ? (
              <>
                <div className="loading-spinner"></div>
                Caricamento...
              </>
            ) : (
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
