# 🚀 CareerConnect - Configurazione Deploy AWS

## ✅ **Configurazione Completata!**

Il tuo frontend CareerConnect è ora configurato per utilizzare il backend su AWS EC2.

### 📋 **Configurazione Attuale:**
- **Backend AWS:** `http://13.51.194.249:3001/api`
- **Frontend Locale:** `http://localhost:5174/`
- **Status Backend:** ✅ Online e funzionante

### 🔧 **File Modificati:**
- `.env` - Configurazione URL backend AWS
- `src/contexts/AuthContext.jsx` - ✅ Corretto `process.env` → `import.meta.env`
- `src/config/api.js` - ✅ Nuovo file configurazione API

### 🛠️ **Errori Risolti:**
- ❌ `ReferenceError: process is not defined` → ✅ Usato `import.meta.env.VITE_API_URL`

### 🌐 **Per Testare:**
1. Apri `http://localhost:5174/` nel browser
2. Testa login/registrazione per verificare la connessione AWS
3. Verifica che le operazioni CRUD funzionino correttamente

### 🔄 **Per Switchare tra Ambienti:**

**Per usare AWS (Produzione):**
```env
VITE_API_URL=http://13.51.194.249:3001/api
```

**Per usare Locale (Sviluppo):**
```env
VITE_API_URL=http://localhost:3001/api
```

### 📦 **Comandi Utili:**
- `npm run dev` - Avvia server sviluppo
- `npm run build` - Compila per produzione
- `npm run preview` - Anteprima build di produzione

### 🚨 **Importante:**
- Il backend AWS deve essere sempre in esecuzione
- Assicurati che la porta 3001 sia aperta nel Security Group EC2
- Il file `.env` è già in `.gitignore` per sicurezza

### 🔍 **Test Backend AWS:**
```powershell
Invoke-WebRequest -Uri "http://13.51.194.249:3001/api/health"
```

---
**Status:** ✅ Configurazione AWS completata e funzionante!
