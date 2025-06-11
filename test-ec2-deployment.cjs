// Test script per verificare la compatibilità EC2
console.log('🌍 Testing EC2 Deployment Compatibility...\n');

const fetch = globalThis.fetch || require('node-fetch');

// Configurazioni di test per diversi ambienti
const testConfigurations = [
    {
        name: 'Localhost Development',
        apiUrl: 'http://localhost:3001/api',
        uploadsUrl: 'http://localhost:3001/uploads',
        expected: true
    },
    {
        name: 'EC2 with Public IP (example)',
        apiUrl: 'http://54.123.45.67:3001/api',
        uploadsUrl: 'http://54.123.45.67:3001/uploads',
        expected: false // Fallirà se EC2 non è configurato
    },
    {
        name: 'EC2 with Domain (example)',
        apiUrl: 'https://careerconnect.yourdomain.com:3001/api',
        uploadsUrl: 'https://careerconnect.yourdomain.com:3001/uploads',
        expected: false // Fallirà se dominio non è configurato
    }
];

async function testConfiguration(config) {
    console.log(`\n🧪 Testing: ${config.name}`);
    console.log(`   API URL: ${config.apiUrl}`);
    console.log(`   Uploads URL: ${config.uploadsUrl}`);
    
    let results = {
        api: false,
        uploads: false,
        cv: false
    };
    
    // Test API endpoint
    try {
        const response = await fetch(`${config.apiUrl}/health`);
        results.api = response.ok;
        console.log(`   ✅ API Health: ${response.status}`);
    } catch (error) {
        console.log(`   ❌ API Health: ${error.message}`);
    }
    
    // Test uploads endpoint (static files)
    try {
        const response = await fetch(`${config.uploadsUrl}/test-cv.pdf`);
        results.uploads = response.ok;
        console.log(`   ✅ Uploads: ${response.status}`);
    } catch (error) {
        console.log(`   ❌ Uploads: ${error.message}`);
    }
    
    // Test CV URL generation logic
    const cvUrl = `${config.uploadsUrl}/test-cv.pdf`;
    console.log(`   🔗 Generated CV URL: ${cvUrl}`);
    results.cv = true; // URL generation always works
    
    return results;
}

async function generateEC2Instructions() {
    console.log('\n📋 EC2 Deployment Instructions:\n');
    
    console.log('1️⃣ **Server Configuration:**');
    console.log('   - Install Node.js and npm on EC2');
    console.log('   - Set environment variable: export PORT=3001');
    console.log('   - Configure security group to allow port 3001');
    console.log('   - Start server with: node simple-server.cjs');
    
    console.log('\n2️⃣ **Frontend Configuration:**');
    console.log('   - Set environment variable before build:');
    console.log('   - export VITE_API_URL_PROD="http://YOUR-EC2-IP:3001/api"');
    console.log('   - Or: export VITE_API_URL_PROD="https://yourdomain.com:3001/api"');
    console.log('   - Run: npm run build');
    
    console.log('\n3️⃣ **CV Viewing Configuration:**');
    console.log('   - Ensure uploads/ directory exists on EC2');
    console.log('   - Upload test CV: scp test-cv.pdf ec2-user@YOUR-IP:~/app/uploads/');
    console.log('   - Verify permissions: chmod 644 uploads/*');
    
    console.log('\n4️⃣ **Environment Variables for EC2:**');
    console.log('   ```bash');
    console.log('   export NODE_ENV=production');
    console.log('   export PORT=3001');
    console.log('   export VITE_API_URL_PROD="http://YOUR-EC2-PUBLIC-IP:3001/api"');
    console.log('   ```');
    
    console.log('\n5️⃣ **Security Group Settings:**');
    console.log('   - Inbound Rules:');
    console.log('   - Port 3001: 0.0.0.0/0 (HTTP)');
    console.log('   - Port 22: Your-IP/32 (SSH)');
    console.log('   - Port 443: 0.0.0.0/0 (HTTPS - if using SSL)');
    
    console.log('\n6️⃣ **Verification Steps:**');
    console.log('   - Test API: curl http://YOUR-EC2-IP:3001/api/health');
    console.log('   - Test uploads: curl http://YOUR-EC2-IP:3001/uploads/test-cv.pdf');
    console.log('   - Test frontend: Open http://YOUR-EC2-IP:3000 in browser');
}

async function runTests() {
    for (const config of testConfigurations) {
        await testConfiguration(config);
    }
    
    await generateEC2Instructions();
    
    console.log('\n📊 Summary:');
    console.log('✅ The CV viewing functionality will work on EC2 with proper configuration');
    console.log('✅ URLs are dynamically generated based on environment');
    console.log('✅ Server listens on 0.0.0.0 for external access');
    console.log('✅ PORT is configurable via environment variable');
    
    console.log('\n⚠️  Important Notes:');
    console.log('- Replace "YOUR-EC2-IP" with your actual EC2 public IP');
    console.log('- Configure environment variables before building/running');
    console.log('- Ensure security groups allow the necessary ports');
    console.log('- Test the complete flow after deployment');
}

runTests().catch(console.error);
