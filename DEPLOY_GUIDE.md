# 🚀 Guida Deploy CareerConnect su AWS

## Setup Backend su EC2

### 1. Configurazione Server EC2
Assicurati che il tuo server EC2 abbia:
- **Porto 3001 aperto** nel Security Group
- **Node.js** installato
- **PM2** per gestire il processo server (consigliato)

### 2. Avviare il Backend su EC2
```bash
# Copia i file del server su EC2
scp -i your-key.pem simple-server.cjs ubuntu@TUO_IP_EC2:~/
scp -r server/ ubuntu@TUO_IP_EC2:~/

# Connessione SSH
ssh -i your-key.pem ubuntu@TUO_IP_EC2

# Installare dipendenze
npm install express cors better-sqlite3 bcryptjs multer

# Avviare il server (produzione)
pm2 start simple-server.cjs --name "careerconnect-api"
pm2 save
pm2 startup

# O semplicemente:
node simple-server.cjs
```

## Setup Frontend (Locale o Netlify)

### 1. Configurare l'URL del Backend
Modifica il file `.env`:
```env
VITE_API_URL=http://TUO_IP_EC2:3001/api
```

### 2. Build e Deploy
```bash
# Build locale
npm run build

# Per Netlify drag & drop
# Carica la cartella 'dist' su Netlify

# O usando Netlify CLI
netlify deploy --prod --dir=dist
```

## 🔧 Configurazioni EC2 Security Group

Aggiungi queste regole in Inbound:
- **HTTP (80)**: 0.0.0.0/0
- **HTTPS (443)**: 0.0.0.0/0  
- **Custom TCP (3001)**: 0.0.0.0/0
- **SSH (22)**: La tua IP

## 🛠️ Troubleshooting

### Backend non raggiungibile:
1. Verifica che il server sia in esecuzione: `pm2 list`
2. Controlla i log: `pm2 logs careerconnect-api`
3. Testa direttamente: `curl http://TUO_IP_EC2:3001/api/health`

### CORS Errors:
Il server è già configurato con CORS. Se ci sono problemi, aggiungi l'URL Netlify nel file `simple-server.cjs`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-netlify-app.netlify.app']
}));
```

### Database non funziona:
1. Verifica che il file `database.sqlite` esista
2. Esegui lo script di creazione admin: `node create-admin.cjs`

## 📊 Monitoraggio

- **Server status**: `pm2 status`
- **Logs**: `pm2 logs`
- **Restart**: `pm2 restart careerconnect-api`
- **Health check**: `curl http://TUO_IP_EC2:3001/api/health`
