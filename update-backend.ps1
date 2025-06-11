# Script PowerShell per Update Backend AWS - CORS FIX
# Esegui con: .\update-backend.ps1

Write-Host "🚀 CareerConnect - Backend CORS Update" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "🎯 Fixing CORS issue for localhost access" -ForegroundColor Yellow

# Configurazione
$EC2_IP = "13.51.194.249"
$EC2_USER = "ubuntu"
$KEY_FILE = "tua-chiave.pem"  # Modifica con il percorso della tua chiave
$REMOTE_PATH = "/home/ubuntu/server"

Write-Host ""
Write-Host "📋 Preparazione files per l'update..." -ForegroundColor Yellow

# Crea cartella temporanea per i file da trasferire
$updateFolder = "backend_update_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Name $updateFolder -Force

# Copia i file necessari
Write-Host "📂 Copiando file modificati..." -ForegroundColor Yellow
Copy-Item "simple-server.cjs" "$updateFolder/"
Copy-Item "package.json" "$updateFolder/"

# Comprimi per facilità di trasferimento  
Write-Host "📦 Creando archivio di update..." -ForegroundColor Yellow
Compress-Archive -Path "$updateFolder\*" -DestinationPath "backend_update.zip" -Force

Write-Host ""
Write-Host "✅ Files preparati per l'update:" -ForegroundColor Green
Write-Host "- simple-server.cjs (backend principale)" -ForegroundColor White
Write-Host "- package.json (dipendenze)" -ForegroundColor White
Write-Host ""

Write-Host "🔄 PROSSIMI PASSI MANUALI:" -ForegroundColor Cyan
Write-Host "1. Trasferisci 'backend_update.zip' su EC2" -ForegroundColor White
Write-Host "2. Estrai e copia i file nella cartella server" -ForegroundColor White
Write-Host "3. Riavvia PM2: pm2 restart all" -ForegroundColor White
Write-Host "4. Verifica: curl http://localhost:3001/api/health" -ForegroundColor White
Write-Host ""

Write-Host "💡 COMANDI SSH PER EC2:" -ForegroundColor Cyan
Write-Host "ssh -i $KEY_FILE $EC2_USER@$EC2_IP" -ForegroundColor White
Write-Host "scp -i $KEY_FILE backend_update.zip ${EC2_USER}@${EC2_IP}:~/" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Update package creato: backend_update.zip" -ForegroundColor Green

# Cleanup
Remove-Item $updateFolder -Recurse -Force

Read-Host "Premi ENTER per continuare..."
