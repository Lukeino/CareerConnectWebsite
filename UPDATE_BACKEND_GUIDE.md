# 🚀 UPDATE BACKEND AWS - CORS FIX

## 🎯 **Problema CORS Risolto:**
- **Errore:** ❌ Backend AWS bloccava localhost (CORS)
- **Causa:** Server configurato solo per `https://careerconnectproject.netlify.app`
- **Soluzione:** ✅ CORS aggiornato per includere localhost

## 📋 **Situazione Corrente:**
- ✅ Backend deployato su EC2: `13.51.194.249:3001` 
- ❌ CORS blocca localhost:5173/5174
- ✅ PM2 già configurato e funzionante  
- ✅ Database SQLite operativo

## 🔄 **Per Aggiornare il Backend:**

### **1. Preparazione Files Locali** 
```bash
# Comprimi solo i file modificati
# Non serve trasferire tutto, solo le modifiche
```

### **2. Connessione SSH a EC2**
```bash
ssh -i "tua-chiave.pem" ubuntu@13.51.194.249
```

### **3. Backup del Backend Esistente**
```bash
# Sul server EC2
cd /home/ubuntu
cp -r server server_backup_$(date +%Y%m%d_%H%M%S)
```

### **4. Upload dei File Modificati**
```bash
# Da locale a EC2 (usa SCP o SFTP)
scp -i "tua-chiave.pem" simple-server.cjs ubuntu@13.51.194.249:/home/ubuntu/server/
scp -i "tua-chiave.pem" package.json ubuntu@13.51.194.249:/home/ubuntu/server/
```

### **5. Installazione Dipendenze (se necessario)**
```bash
# Sul server EC2
cd /home/ubuntu/server
npm install
```

### **6. Riavvio PM2**
```bash
# Sul server EC2
pm2 restart all
# oppure
pm2 restart server-name
```

### **7. Verifica Funzionamento**
```bash
# Controlla status
pm2 status
pm2 logs

# Testa API
curl http://localhost:3001/api/health
```

---

## 🎯 **Files da Aggiornare:**

### **Files Principali da Trasferire:**
- `simple-server.cjs` - Server principale
- `package.json` - Dipendenze (se modificato)

### **Files Opzionali:**
- Eventuali nuovi script di database
- File di configurazione modificati

### **NON Trasferire:**
- `node_modules/` (reinstalla con npm install)
- `server/db/database.sqlite` (non sovrascrivere il DB esistente!)
- File di frontend (dist/, src/, etc.)

---

## ⚠️ **IMPORTANTE:**

1. **NON sovrascrivere il database** `database.sqlite` esistente
2. **Fai sempre backup** prima dell'update
3. **Testa l'API** dopo ogni modifica
4. **Controlla PM2 logs** per errori

---

## 🚨 **Se qualcosa va storto:**

### **Ripristina Backup:**
```bash
# Sul server EC2
cd /home/ubuntu
rm -rf server
mv server_backup_[DATA] server
pm2 restart all
```

### **Debug Problemi:**
```bash
pm2 logs
pm2 monit
curl http://localhost:3001/api/health
```

---

**✅ Il tuo backend è pronto per l'update!**
