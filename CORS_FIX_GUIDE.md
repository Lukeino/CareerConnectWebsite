# 🚀 GUIDA AGGIORNAMENTO BACKEND AWS

## ✅ **Problemi Risolti:**

### 🔴 **Problema 1: CORS Error**
```
Access to fetch at 'http://13.51.194.249:3001/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causa:** Backend AWS non configurato per accettare localhost
**Soluzione:** ✅ Aggiornato `simple-server.cjs` con CORS che include localhost

### 🔴 **Problema 2: Netlify 404 su /adminlogin**
```
Page not found - /adminlogin
```

**Causa:** Netlify non sa che deve servire index.html per tutte le route React
**Soluzione:** ✅ Creato `public/_redirects` per SPA routing

---

## 📋 **COSA DEVI FARE ADESSO:**

### **1. Aggiorna il Backend su AWS EC2:**

```bash
# Connettiti al tuo server EC2
ssh -i your-key.pem ubuntu@13.51.194.249

# Naviga alla directory del server
cd ~/server

# Fai backup del file corrente
cp simple-server.cjs simple-server.cjs.backup

# Sostituisci il file server (puoi usare nano/vim o upload del nuovo file)
nano simple-server.cjs
```

**Copia il contenuto aggiornato di `simple-server.cjs` dal tuo progetto locale**

### **2. Riavvia PM2:**
```bash
# Riavvia il processo
pm2 restart all

# Verifica che sia attivo
pm2 status
pm2 logs
```

### **3. Testa il Backend:**
```bash
# Dal tuo PC Windows
curl http://13.51.194.249:3001/api/health
```

### **4. Deploya su Netlify:**
```bash
# Dal tuo progetto locale
npm run build

# Upload della cartella dist/ su Netlify
# Il file _redirects è già nella cartella public/ e verrà incluso nel build
```

---

## 🔧 **Comandi di Test:**

### **Test CORS:**
```javascript
// Console browser su localhost:5173
fetch('http://13.51.194.249:3001/api/health')
  .then(r => r.json())
  .then(console.log)
```

### **Test Netlify Routing:**
- Vai su `https://careerconnectproject.netlify.app/adminlogin`
- Dovrebbe caricare la pagina invece di 404

---

## 🎯 **Risultato Atteso:**
✅ Localhost può accedere al backend AWS  
✅ Netlify `/adminlogin` funziona correttamente  
✅ Admin login funziona sia in locale che in produzione  

---

**Il tuo CareerConnect sarà completamente operativo su tutti gli ambienti!** 🚀
