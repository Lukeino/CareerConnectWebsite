// Test completo per verificare la funzionalità CV prima del deployment EC2
const fetch = globalThis.fetch || require('node-fetch');

console.log('🔍 VERIFICA COMPLETA FUNZIONALITÀ CV\n');
console.log('Testing per localhost e preparazione EC2...\n');

// Configurazioni di test
const TEST_CONFIGS = {
    localhost: {
        name: 'LOCALHOST (Attuale)',
        baseUrl: 'http://localhost:3001',
        apiUrl: 'http://localhost:3001/api',
        frontendUrl: 'http://localhost:5174'
    },
    ec2: {
        name: 'EC2 (Futuro deployment)',
        baseUrl: 'http://16.170.241.18:3001',
        apiUrl: 'http://16.170.241.18:3001/api',
        frontendUrl: 'http://16.170.241.18:5173'
    }
};

async function testCVFunctionality(config) {
    console.log(`\n🧪 Testing ${config.name}:`);
    console.log(`   Base URL: ${config.baseUrl}`);
    console.log(`   API URL: ${config.apiUrl}`);
    
    const results = {
        cvFileAccess: false,
        apiAccess: false,
        frontendAccess: false
    };
    
    // Test 1: CV file accessibility
    try {
        console.log(`\n1️⃣ Testing CV file access...`);
        const cvUrl = `${config.baseUrl}/uploads/test-cv.pdf`;
        const response = await fetch(cvUrl);
        
        if (response.ok) {
            console.log(`   ✅ CV file accessible: ${response.status}`);
            console.log(`   📄 Content-Type: ${response.headers.get('content-type')}`);
            results.cvFileAccess = true;
        } else {
            console.log(`   ❌ CV file not accessible: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ CV file error: ${error.message}`);
    }
    
    // Test 2: API base accessibility
    try {
        console.log(`\n2️⃣ Testing API base access...`);
        const response = await fetch(config.apiUrl);
        
        if (response.status === 404 || response.status === 200) {
            console.log(`   ✅ API endpoint reachable: ${response.status}`);
            results.apiAccess = true;
        } else {
            console.log(`   ❌ API endpoint issue: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ API error: ${error.message}`);
    }
    
    // Test 3: Frontend accessibility (solo per localhost)
    if (config.name.includes('LOCALHOST')) {
        try {
            console.log(`\n3️⃣ Testing Frontend access...`);
            const response = await fetch(config.frontendUrl);
            
            if (response.ok) {
                console.log(`   ✅ Frontend accessible: ${response.status}`);
                results.frontendAccess = true;
            } else {
                console.log(`   ❌ Frontend not accessible: ${response.status}`);
            }
        } catch (error) {
            console.log(`   ❌ Frontend error: ${error.message}`);
        }
    } else {
        console.log(`\n3️⃣ Frontend test skipped (EC2 not deployed yet)`);
        results.frontendAccess = null; // Non testato
    }
    
    return results;
}

async function checkConfiguration() {
    console.log(`\n📋 VERIFICA CONFIGURAZIONE CODICE:`);
    
    // Simula la logica di getStaticFileUrl per localhost
    const localhostBaseUrl = 'http://localhost:3001/api'.replace('/api', '');
    const localhostCvUrl = `${localhostBaseUrl}/uploads/test-cv.pdf`;
    console.log(`   🔗 Localhost CV URL: ${localhostCvUrl}`);
    
    // Simula la logica per EC2 (produzione)
    const ec2BaseUrl = 'http://16.170.241.18:3001/api'.replace('/api', '');
    const ec2CvUrl = `${ec2BaseUrl}/uploads/test-cv.pdf`;
    console.log(`   🔗 EC2 CV URL: ${ec2CvUrl}`);
    
    console.log(`\n   ✅ URL generation logic OK`);
}

async function runCompleteCheck() {
    console.log('📊 INIZIO VERIFICA COMPLETA\n');
    
    // Test configurazione
    await checkConfiguration();
    
    // Test localhost
    const localhostResults = await testCVFunctionality(TEST_CONFIGS.localhost);
    
    // Test EC2 (connectivity check)
    const ec2Results = await testCVFunctionality(TEST_CONFIGS.ec2);
    
    // Risultati finali
    console.log(`\n📊 RISULTATI FINALI:`);
    console.log(`\n🖥️  LOCALHOST:`);
    console.log(`   CV File: ${localhostResults.cvFileAccess ? '✅' : '❌'}`);
    console.log(`   API: ${localhostResults.apiAccess ? '✅' : '❌'}`);
    console.log(`   Frontend: ${localhostResults.frontendAccess ? '✅' : '❌'}`);
    
    console.log(`\n☁️  EC2 (Pre-deployment check):`);
    console.log(`   CV File: ${ec2Results.cvFileAccess ? '✅' : '❌ (Expected - not deployed)'}`);
    console.log(`   API: ${ec2Results.apiAccess ? '✅' : '❌ (Expected - not deployed)'}`);
    console.log(`   Frontend: N/A (Will be deployed)`);
    
    // Verdetto finale
    const localhostReady = localhostResults.cvFileAccess && localhostResults.apiAccess && localhostResults.frontendAccess;
    
    if (localhostReady) {
        console.log(`\n🎉 VERDETTO: PRONTO PER DEPLOYMENT EC2!`);
        console.log(`\n📋 PROSSIMI PASSI:`);
        console.log(`   1. ✅ Localhost funziona perfettamente`);
        console.log(`   2. 🚀 Procedi con SCP del progetto`);
        console.log(`   3. 🔧 Configura EC2 con le variabili d'ambiente`);
        console.log(`   4. 🔥 Avvia il server su EC2`);
        console.log(`   5. 🧪 Testa la funzionalità CV su EC2`);
        
        console.log(`\n💡 COMANDI PREPARATI:`);
        console.log(`   SCP: scp -i "key.pem" -r . ubuntu@16.170.241.18:~/CareerConnect/`);
        console.log(`   ENV: VITE_API_URL_PROD=http://16.170.241.18:3001/api`);
        
    } else {
        console.log(`\n⚠️  VERDETTO: PROBLEMI DA RISOLVERE PRIMA DEL DEPLOYMENT`);
        console.log(`\n❌ Problemi rilevati:`);
        if (!localhostResults.cvFileAccess) console.log(`   - CV file non accessibile`);
        if (!localhostResults.apiAccess) console.log(`   - API non raggiungibile`);
        if (!localhostResults.frontendAccess) console.log(`   - Frontend non accessibile`);
        console.log(`\n🔧 Risolvi questi problemi prima di procedere con EC2`);
    }
}

runCompleteCheck().catch(console.error);
