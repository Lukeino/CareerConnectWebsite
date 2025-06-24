# 🚀 CareerConnect

> **Una piattaforma web per il recruiting e la gestione delle candidature**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CareerConnect è una piattaforma completa per il recruiting che connette candidati e recruiters attraverso un'interfaccia moderna e intuitiva.

🌐 **Live Demo:** [careerconnectproject.netlify.app](https://careerconnectproject.netlify.app)

---

## ✨ Caratteristiche Principali

### 👥 Per i Candidati
- **Registrazione e Profilo**: Creazione profilo personalizzato con CV upload
- **Ricerca Intelligente**: Filtra opportunità per titolo, località e tipo di contratto
- **Candidature Facili**: Sistema di candidatura con un click

### 🏢 Per i Recruiters
- **Gestione Annunci**: Crea e gestisci le tue offerte di lavoro
- **Candidature Centralizzate**: Visualizza e gestisci tutte le candidature e i CV ricevuti


### 🔐 Per gli Amministratori
- **Dashboard Completa**: Panoramica utenti, aziende e statistiche
- **Gestione Utenti**: Moderazione e gestione degli account
- **Controllo Contenuti**: Supervisione degli annunci di lavoro

---

## 🛠️ Tecnologie Utilizzate

**Frontend:**
- ⚛️ React 18
- ⚡ Vite per build
- 🎨 CSS3 con design responsive
- 🔍 React Router per SPA navigation
  
**Backend:**
- 🟢 Node.js con Express
- 🗄️ SQLite per persistenza dati
- 📁 Multer per upload file
- 🔒 CORS e sicurezza implementati

**Deploy & Infrastructure:**
- 🌍 Netlify per frontend hosting
- ☁️ AWS EC2 per backend
- 🔄 Proxy configuration per CORS

**Sviluppo:**
- 📋 Metodologia Agile - Scrum

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm o yarn
- Git

### Installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/yourusername/careerconnect.git
   cd careerconnect
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura l'ambiente**
   ```bash
   # Copia il file di ambiente di esempio
   cp .env.example .env
   
   # Modifica le variabili secondo le tue necessità
   # VITE_API_URL_DEV=http://localhost:3001/api
   ```

4. **Avvia in modalità sviluppo**
   ```bash
   npm run dev
   ```

5. **Apri il browser**
   ```
   http://localhost:5173
   ```

### Build per Produzione

```bash
# Build dell'applicazione
npm run build

# Preview del build
npm run preview
```

---

## 📁 Struttura del Progetto

```
CareerConnect/
├── public/                 # File statici e configurazioni
│   ├── _redirects         # Netlify redirects per SPA
│   └── vite.svg          
├── src/
│   ├── components/        # Componenti React riutilizzabili
│   ├── pages/            # Pagine principali dell'applicazione
│   ├── contexts/         # Context API (Auth, Language)
│   ├── config/           # Configurazioni (API endpoints)
│   ├── hooks/            # Custom React hooks
│   ├── locales/          # File di traduzione
│   └── assets/           # Immagini e risorse statiche
├── server/               # Dati di esempio e configurazione DB
├── uploads/              # Directory per file uploadati
└── package.json
```

---

## 🌐 Deploy

### Frontend (Netlify)
Il frontend è automaticamente deployato su Netlify ad ogni push sul main branch.

**Configurazioni Netlify necessarie:**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: `VITE_API_URL_PROD=/api`

### Backend (AWS EC2)
Il backend richiede un server Node.js configurato con:
- SQLite database
- Configurazione CORS per il dominio Netlify
- Gestione upload file

---

## 🔧 Configurazione

### Variabili d'Ambiente

**Frontend (.env):**
```env
VITE_API_URL_DEV=http://localhost:3001/api
VITE_API_URL_PROD=/api
```

**Backend:**
- Configurazione database SQLite
- CORS origins per Netlify
- Upload directory permissions

---

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per maggiori dettagli.

---

## 👥 Team

Sviluppato da un team di 4 studenti del corso di Informatica e Tecnologie per la Produzione del Software, utilizzando metodologie Agile Scrum per garantire qualità e collaborazione efficace.

---
