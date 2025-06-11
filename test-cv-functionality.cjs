// Test script to verify CV viewing functionality
console.log('🧪 Testing CV Viewing Functionality...\n');

// Use built-in fetch (Node.js 18+) or fallback
const fetch = globalThis.fetch || require('node-fetch');

// Test CV file accessibility
async function testCVFileAccess() {
    console.log('1️⃣ Testing CV file direct access...');
    const cvUrl = 'http://localhost:3001/uploads/test-cv.pdf';
    
    try {
        const response = await fetch(cvUrl);
        if (response.ok) {
            console.log('✅ CV file is accessible at:', cvUrl);
            console.log('   Status:', response.status);
            console.log('   Content-Type:', response.headers.get('content-type'));
            return true;
        } else {
            console.log('❌ CV file not accessible:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Error accessing CV file:', error.message);
        return false;
    }
}

// Test frontend accessibility
async function testFrontendAccess() {
    console.log('\n2️⃣ Testing frontend accessibility...');
    try {
        const response = await fetch('http://localhost:5174');
        if (response.ok) {
            console.log('✅ Frontend is accessible at: http://localhost:5174');
            return true;
        } else {
            console.log('❌ Frontend not accessible:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Error accessing frontend:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    const test1 = await testCVFileAccess();
    const test2 = await testFrontendAccess();
    
    console.log('\n📊 Test Results Summary:');
    console.log(`CV File Access: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Frontend Access: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
    
    if (test1 && test2) {
        console.log('\n🎉 All systems are ready for CV viewing functionality!');
        console.log('\n📋 Testing Instructions:');
        console.log('1. Open http://localhost:5174 in browser');
        console.log('2. Test Scenario A - Recruiter viewing candidate CV:');
        console.log('   - Log in as recruiter: recruiter@gmail.com (password: password)');
        console.log('   - Go to "I Miei Annunci" to see job applications');
        console.log('   - Click "Visualizza CV" button for candidate applications');
        console.log('3. Test Scenario B - Candidate viewing own CV:');
        console.log('   - Log in as candidate: lucaiantosco000@gmail.com (password: password)');
        console.log('   - Click user dropdown > "Gestisci CV" to view own CV');
        console.log('   - Click the eye icon to view CV');
        console.log('\n🔍 What to check:');
        console.log('- CV viewing buttons should open PDF in new tab/window');
        console.log('- URLs should be: http://localhost:3001/uploads/test-cv.pdf');
        console.log('- Console should show detailed debugging logs');
    } else {
        console.log('\n⚠️ Some systems are not ready. Please fix the failing tests first.');
    }
}

runAllTests().catch(console.error);
