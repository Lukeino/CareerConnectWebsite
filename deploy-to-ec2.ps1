# Script PowerShell per deploy automatico su EC2
# CareerConnect Backend Update

Write-Host "🚀 DEPLOY CAREERCONNECT SU EC2" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Configurazione
$EC2_IP = "13.51.194.249"
$EC2_USER = "ubuntu"
$KEY_PATH = "C:\Users\LucaI\Desktop\CareerConnect 23-05 (DA CONTROLLARE DB)\CareerConnect AIUTO\CareerConnectWebsite2\key.pem"
$ZIP_FILE = "ec2_complete_update_2025-06-11_09-32.zip"
$APP_PATH = "~/CareerConnect"

Write-Host "📋 Configurazione:" -ForegroundColor Yellow
Write-Host "   EC2 IP: $EC2_IP"
Write-Host "   User: $EC2_USER"
Write-Host "   File: $ZIP_FILE"

# Verifica che il file zip esista
if (-not (Test-Path $ZIP_FILE)) {
    Write-Host "❌ File $ZIP_FILE non trovato!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ File $ZIP_FILE trovato" -ForegroundColor Green

# Step 1: Carica file su EC2
Write-Host "`n📤 STEP 1: Caricamento file su EC2..." -ForegroundColor Cyan
$scpCommand = "scp -i `"$KEY_PATH`" $ZIP_FILE ${EC2_USER}@${EC2_IP}:~/"
Write-Host "Comando: $scpCommand" -ForegroundColor Gray
Invoke-Expression $scpCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore nel caricamento del file!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ File caricato con successo" -ForegroundColor Green

# Step 2: Deploy su EC2
Write-Host "`n🔧 STEP 2: Deploy ed aggiornamento..." -ForegroundColor Cyan

$sshCommands = @"
# Estrai i file
echo "📦 Estraendo i file..."
cd ~/
unzip -o $ZIP_FILE

# Backup del database attuale (se esiste)
echo "💾 Backup database..."
if [ -f $APP_PATH/server/db/database.sqlite ]; then
    cp $APP_PATH/server/db/database.sqlite $APP_PATH/database-backup-\$(date +%Y%m%d-%H%M).sqlite
    echo "✅ Database backup creato"
else
    echo "⚠️ Database non trovato, primo deploy?"
fi

# Ferma PM2
echo "⏹️ Fermando PM2..."
pm2 stop CareerConnect

# Crea directory se non esiste
mkdir -p $APP_PATH
mkdir -p $APP_PATH/server/db

# Copia i nuovi file
echo "📁 Copiando i nuovi file..."
cp simple-server.cjs $APP_PATH/
cp package.json $APP_PATH/
cp migrate-ec2-database.cjs $APP_PATH/

# Se non esiste il database, copia quello locale
if [ ! -f $APP_PATH/server/db/database.sqlite ]; then
    echo "📋 Copiando database locale..."
    cp database-backup-local.sqlite $APP_PATH/server/db/database.sqlite
fi

# Aggiorna dipendenze
echo "📦 Aggiornando dipendenze..."
cd $APP_PATH
npm install

# Migra il database
echo "🔄 Migrando database..."
node migrate-ec2-database.cjs

# Riavvia PM2
echo "🚀 Riavviando server..."
pm2 start simple-server.cjs --name CareerConnect
pm2 save

# Test del server
echo "🧪 Testando server..."
sleep 3
curl -s http://localhost:3001/api/health | head -1

echo "✅ Deploy completato!"
pm2 status
"@

# Esegui i comandi SSH
$fullSSHCommand = "ssh -i `"$KEY_PATH`" ${EC2_USER}@${EC2_IP} '$sshCommands'"
Write-Host "Eseguendo comandi su EC2..." -ForegroundColor Gray
Invoke-Expression $fullSSHCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 DEPLOY COMPLETATO CON SUCCESSO!" -ForegroundColor Green
    Write-Host "🌐 Testa la tua app: https://careerconnectproject.netlify.app" -ForegroundColor Cyan
    Write-Host "🔗 API Health: http://$EC2_IP:3001/api/health" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ ERRORE DURANTE IL DEPLOY!" -ForegroundColor Red
    Write-Host "Controlla i log su EC2 con: ssh -i `"$KEY_PATH`" ${EC2_USER}@${EC2_IP} 'pm2 logs CareerConnect'" -ForegroundColor Yellow
}
