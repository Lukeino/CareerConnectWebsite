@echo off
echo 🚀 DEPLOY CAREERCONNECT SU EC2
echo ================================

set EC2_IP=13.51.194.249
set EC2_USER=ubuntu
set KEY_PATH=C:\Users\LucaI\Desktop\CareerConnect 23-05 (DA CONTROLLARE DB)\CareerConnect AIUTO\CareerConnectWebsite2\key.pem
set ZIP_FILE=ec2_complete_update_2025-06-11_09-32.zip

echo 📤 Uploading file to EC2...
scp -i "%KEY_PATH%" %ZIP_FILE% %EC2_USER%@%EC2_IP%:~/

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Upload failed!
    pause
    exit /b 1
)

echo ✅ File uploaded successfully!

echo 🔧 Executing deployment on EC2...
ssh -i "%KEY_PATH%" %EC2_USER%@%EC2_IP% "
cd ~/
echo 📦 Extracting files...
unzip -o %ZIP_FILE%

echo 💾 Creating backup...
if [ -f ~/CareerConnect/server/db/database.sqlite ]; then
    cp ~/CareerConnect/server/db/database.sqlite ~/database-backup-$(date +%%Y%%m%%d-%%H%%M).sqlite
    echo ✅ Database backup created
else
    echo ⚠️ Database not found, first deploy?
fi

echo ⏹️ Stopping PM2...
pm2 stop CareerConnect

echo 📁 Creating directories...
mkdir -p ~/CareerConnect
mkdir -p ~/CareerConnect/server/db

echo 📋 Copying files...
cp simple-server.cjs ~/CareerConnect/
cp package.json ~/CareerConnect/
cp migrate-ec2-database.cjs ~/CareerConnect/

if [ ! -f ~/CareerConnect/server/db/database.sqlite ]; then
    echo 📋 Copying local database...
    cp database-backup-local.sqlite ~/CareerConnect/server/db/database.sqlite
fi

cd ~/CareerConnect
echo 📦 Installing dependencies...
npm install

echo 🔄 Migrating database...
node migrate-ec2-database.cjs

echo 🚀 Starting server...
pm2 start simple-server.cjs --name CareerConnect
pm2 save

echo 🧪 Testing server...
sleep 3
curl -s http://localhost:3001/api/health

echo ✅ Deploy completed!
pm2 status
"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 🎉 DEPLOY COMPLETATO CON SUCCESSO!
    echo 🌐 Test your app: https://careerconnectproject.netlify.app
    echo 🔗 API Health: http://%EC2_IP%:3001/api/health
) else (
    echo.
    echo ❌ ERRORE DURANTE IL DEPLOY!
    echo Check logs with: ssh -i "%KEY_PATH%" %EC2_USER%@%EC2_IP% "pm2 logs CareerConnect"
)

pause
