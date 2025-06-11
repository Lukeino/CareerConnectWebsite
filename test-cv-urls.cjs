// Use built-in fetch (Node.js 18+) or fallback
const fetch = globalThis.fetch || require('node-fetch');

async function testCVUrls() {
    console.log('Testing CV URLs...\n');
    
    // Test the direct CV file URL
    const cvUrl = 'http://localhost:3001/uploads/test-cv.pdf';
    console.log(`Testing direct CV URL: ${cvUrl}`);
    
    try {
        const response = await fetch(cvUrl);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log(`Content-Length: ${response.headers.get('content-length')}`);
        
        if (response.ok) {
            console.log('✅ CV file is accessible\n');
        } else {
            console.log('❌ CV file is not accessible\n');
        }
    } catch (error) {
        console.log(`❌ Error accessing CV: ${error.message}\n`);
    }
    
    // Test the API endpoints
    const apiEndpoints = [
        'http://localhost:3001/api/users/2',  // Get user with CV
        'http://localhost:3001/api/applications'  // Get applications
    ];
    
    for (const endpoint of apiEndpoints) {
        console.log(`Testing API endpoint: ${endpoint}`);
        try {
            const response = await fetch(endpoint);
            console.log(`Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', JSON.stringify(data, null, 2));
                console.log('✅ API endpoint works\n');
            } else {
                console.log('❌ API endpoint failed\n');
            }
        } catch (error) {
            console.log(`❌ Error accessing API: ${error.message}\n`);
        }
    }
}

testCVUrls().catch(console.error);
