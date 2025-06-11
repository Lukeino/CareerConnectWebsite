#!/bin/bash
# ==============================================
# EC2 Server Deployment Script
# ==============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EC2_HOST="16.170.241.18"
PROJECT_DIR="/home/ubuntu/CareerConnectWebsite"
SERVER_FILE="simple-server.cjs"
REPO_URL="https://github.com/Lukeino/CareerConnectWebsite.git"

echo -e "${BLUE}🚀 CareerConnect Server Deployment Script${NC}"
echo -e "${BLUE}=========================================${NC}"

# Function to run commands on EC2
run_on_ec2() {
    echo -e "${YELLOW}Running on EC2:${NC} $1"
    ssh -i ~/key.pem ubuntu@$EC2_HOST "$1"
}

# Function to check if we can connect to EC2
check_connection() {
    echo -e "${BLUE}📡 Checking EC2 connection...${NC}"
    if ssh -i ~/key.pem ubuntu@$EC2_HOST "echo 'Connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✅ EC2 connection successful${NC}"
        return 0
    else
        echo -e "${RED}❌ Cannot connect to EC2${NC}"
        echo -e "${YELLOW}💡 Please ensure:${NC}"
        echo "   - key.pem file is in your home directory"
        echo "   - EC2 instance is running"
        echo "   - Security group allows SSH (port 22)"
        echo "   - Key file has correct permissions: chmod 400 ~/key.pem"
        return 1
    fi
}

# Function to update code
update_code() {
    echo -e "${BLUE}📥 Updating code from GitHub...${NC}"
    
    run_on_ec2 "cd $PROJECT_DIR && git status"
    run_on_ec2 "cd $PROJECT_DIR && git pull origin main"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Code updated successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to update code${NC}"
        return 1
    fi
}

# Function to restart server
restart_server() {
    echo -e "${BLUE}🔄 Restarting Node.js server...${NC}"
    
    # Kill existing Node.js processes
    run_on_ec2 "pkill -f 'node.*$SERVER_FILE' || true"
    
    # Wait a moment
    sleep 2
    
    # Start server in background with nohup
    run_on_ec2 "cd $PROJECT_DIR && nohup node $SERVER_FILE > server.log 2>&1 &"
    
    # Wait a moment for server to start
    sleep 3
    
    # Check if server is running
    if run_on_ec2 "pgrep -f 'node.*$SERVER_FILE'"; then
        echo -e "${GREEN}✅ Server restarted successfully${NC}"
        
        # Show server status
        echo -e "${BLUE}📊 Server status:${NC}"
        run_on_ec2 "ps aux | grep -v grep | grep 'node.*$SERVER_FILE'"
        
        # Test API endpoint
        echo -e "${BLUE}🧪 Testing API endpoint...${NC}"
        sleep 2
        if curl -s "http://$EC2_HOST:3001/api/test" > /dev/null; then
            echo -e "${GREEN}✅ API is responding${NC}"
        else
            echo -e "${YELLOW}⚠️  API test failed, but server process is running${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}❌ Failed to start server${NC}"
        echo -e "${YELLOW}📋 Checking server logs:${NC}"
        run_on_ec2 "cd $PROJECT_DIR && tail -20 server.log"
        return 1
    fi
}

# Function to show server logs
show_logs() {
    echo -e "${BLUE}📋 Server logs (last 20 lines):${NC}"
    run_on_ec2 "cd $PROJECT_DIR && tail -20 server.log"
}

# Main deployment function
deploy() {
    echo -e "${BLUE}🚀 Starting deployment...${NC}"
    
    if ! check_connection; then
        exit 1
    fi
    
    if ! update_code; then
        exit 1
    fi
    
    if ! restart_server; then
        echo -e "${RED}❌ Deployment failed${NC}"
        show_logs
        exit 1
    fi
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}📍 Server is running at: http://$EC2_HOST:3001${NC}"
    echo -e "${BLUE}📍 API endpoint: http://$EC2_HOST:3001/api${NC}"
}

# Script options
case "$1" in
    "logs")
        check_connection && show_logs
        ;;
    "restart")
        check_connection && restart_server
        ;;
    "update")
        check_connection && update_code
        ;;
    "status")
        if check_connection; then
            echo -e "${BLUE}📊 Server processes:${NC}"
            run_on_ec2 "ps aux | grep -v grep | grep node"
            echo -e "${BLUE}📊 Listening ports:${NC}"
            run_on_ec2 "netstat -tlnp | grep :3001 || echo 'Port 3001 not in use'"
        fi
        ;;
    *)
        deploy
        ;;
esac
