# 🚀 Guida per Aggiornamento Completo EC2

## 📦 File nel Pacchetto `ec2_complete_update_2025-06-11_09-32.zip`

- **`simple-server.cjs`** - Server backend aggiornato
- **`package.json`** - Dipendenze NPM
- **`migrate-ec2-database.cjs`** - Script di migrazione database
- **`database-backup-local.sqlite`** - Backup del database locale (riferimento)

## 🔧 Procedura di Deploy su EC2

### Passo 1: Backup del Database EC2 Corrente
```bash
# Crea backup del database EC2 esistente
cp server/db/database.sqlite database_ec2_backup_$(date +%Y%m%d_%H%M).sqlite
```

### Passo 2: Ferma il Server
```bash
# Ferma il server Node.js
sudo pkill -f "node.*simple-server.cjs"
```

### Passo 3: Carica e Estrai i File
```bash
# Carica il file zip su EC2 (via SCP/SFTP)
# Poi estrai nella directory dell'app
unzip ec2_complete_update_2025-06-11_09-32.zip
```

### Passo 4: Sostituisci i File
```bash
# Sostituisci i file principali
cp simple-server.cjs /path/to/your/app/
cp package.json /path/to/your/app/
cp migrate-ec2-database.cjs /path/to/your/app/
```

### Passo 5: Reinstalla le Dipendenze
```bash
cd /path/to/your/app/
npm install
```

### Passo 6: ⚠️ IMPORTANTE - Migrazione Database
```bash
# ESEGUI QUESTO SCRIPT PER AGGIORNARE IL DATABASE
node migrate-ec2-database.cjs
```

### Passo 7: Riavvia il Server
```bash
# Riavvia il server in background
nohup node simple-server.cjs > server.log 2>&1 &
```

### Passo 8: Verifica
```bash
# Controlla che il server sia in esecuzione
curl http://localhost:3001/api/health

# Controlla i log
tail -f server.log
```

## 🆕 Nuove Funzionalità Aggiunte

### Database:
- ✅ **users.cv_filename** - Upload CV per candidati
- ✅ **users.is_blocked** - Blocco utenti da admin
- ✅ **jobs.company_description** - Descrizione azienda nei job
- ✅ **applications** table - Sistema candidature
- ✅ **companies** table - Gestione aziende

### API Endpoints:
- 📝 `/api/upload-cv` - Upload CV candidati
- 📋 `/api/applications` - Gestione candidature
- 👥 `/api/admin/users/:id/block` - Blocco utenti
- 🏢 `/api/companies` - Lista aziende

## ⚠️ Note Importanti

1. **LO SCRIPT DI MIGRAZIONE È OBBLIGATORIO** - Senza di questo il database EC2 non avrà le nuove colonne/tabelle
2. **Fai sempre backup** prima di eseguire modifiche
3. **Il database locale di backup** è incluso solo come riferimento, NON sostituirlo a quello EC2
4. **Controlla i log** dopo il riavvio per verificare che tutto funzioni

## 🐛 Troubleshooting

Se qualcosa va storto:
```bash
# Ripristina il backup del database
cp database_ec2_backup_YYYYMMDD_HHMM.sqlite server/db/database.sqlite

# Riavvia il server
nohup node simple-server.cjs > server.log 2>&1 &
```

## 📞 Contatti
In caso di problemi durante il deploy, controlla prima i log del server per identificare eventuali errori.
