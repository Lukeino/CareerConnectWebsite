#!/bin/bash
# EC2 Deployment Script for CareerConnect
# Usage: ./deploy-ec2.sh [EC2_PUBLIC_IP]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 CareerConnect EC2 Deployment Script${NC}"
echo "=============================================="

# Check if EC2 IP is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide EC2 public IP${NC}"
    echo "Usage: ./deploy-ec2.sh YOUR-EC2-PUBLIC-IP"
    exit 1
fi

EC2_IP=$1
EC2_USER=${2:-ec2-user}  # Default to ec2-user
KEY_FILE=${3:-key.pem}   # Default to key.pem

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "EC2 IP: $EC2_IP"
echo "EC2 User: $EC2_USER" 
echo "Key File: $KEY_FILE"
echo ""

# Step 1: Create environment file
echo -e "${YELLOW}1️⃣ Creating production environment file...${NC}"
cp .env.production.example .env.production
sed -i "s/YOUR-EC2-PUBLIC-IP/$EC2_IP/g" .env.production
echo "✅ Environment file created"

# Step 2: Build frontend
echo -e "${YELLOW}2️⃣ Building frontend for production...${NC}"
export VITE_API_URL_PROD="http://$EC2_IP:3001/api"
npm run build
echo "✅ Frontend built"

# Step 3: Create deployment package
echo -e "${YELLOW}3️⃣ Creating deployment package...${NC}"
mkdir -p deploy-package
cp -r dist/ deploy-package/
cp simple-server.cjs deploy-package/
cp package.json deploy-package/
cp -r server/ deploy-package/
cp -r uploads/ deploy-package/
cp .env.production deploy-package/.env
echo "✅ Deployment package created"

# Step 4: Upload to EC2
echo -e "${YELLOW}4️⃣ Uploading to EC2...${NC}"
if [ ! -f "$KEY_FILE" ]; then
    echo -e "${RED}❌ Error: Key file $KEY_FILE not found${NC}"
    exit 1
fi

# Create app directory on EC2
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_IP" "mkdir -p ~/careerconnect"

# Upload files
scp -i "$KEY_FILE" -r deploy-package/* "$EC2_USER@$EC2_IP":~/careerconnect/
echo "✅ Files uploaded to EC2"

# Step 5: Setup on EC2
echo -e "${YELLOW}5️⃣ Setting up application on EC2...${NC}"
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_IP" << EOF
    cd ~/careerconnect
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    fi
    
    # Install dependencies
    npm install --production
    
    # Set permissions
    chmod -R 755 uploads/
    chmod +x simple-server.cjs
    
    # Create systemd service
    sudo tee /etc/systemd/system/careerconnect.service > /dev/null << EOL
[Unit]
Description=CareerConnect Application
After=network.target

[Service]
Type=simple
User=$EC2_USER
WorkingDirectory=/home/$EC2_USER/careerconnect
ExecStart=/usr/bin/node simple-server.cjs
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOL

    # Enable and start service
    sudo systemctl daemon-reload
    sudo systemctl enable careerconnect
    sudo systemctl start careerconnect
    
    echo "✅ Application setup completed"
EOF

# Step 6: Configure security group (instructions)
echo -e "${YELLOW}6️⃣ Security Group Configuration (Manual):${NC}"
echo "Please ensure your EC2 security group allows:"
echo "- Port 3001 (HTTP) from 0.0.0.0/0"
echo "- Port 22 (SSH) from your IP"
echo ""

# Step 7: Verification
echo -e "${YELLOW}7️⃣ Verifying deployment...${NC}"
sleep 5  # Wait for service to start

# Test API
echo "Testing API endpoint..."
if curl -f "http://$EC2_IP:3001/api/health" > /dev/null 2>&1; then
    echo "✅ API is responding"
else
    echo "❌ API not responding (check security group)"
fi

# Test uploads
echo "Testing uploads endpoint..."
if curl -f "http://$EC2_IP:3001/uploads/test-cv.pdf" > /dev/null 2>&1; then
    echo "✅ Uploads are accessible"
else
    echo "❌ Uploads not accessible"
fi

# Cleanup
rm -rf deploy-package
rm .env.production

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo "=============================================="
echo "Application URLs:"
echo "Frontend: http://$EC2_IP:3000 (serve dist/ with nginx/apache)"
echo "Backend API: http://$EC2_IP:3001/api"
echo "CV Files: http://$EC2_IP:3001/uploads/"
echo ""
echo "Service management:"
echo "sudo systemctl status careerconnect"
echo "sudo systemctl restart careerconnect"
echo "sudo journalctl -u careerconnect -f"
