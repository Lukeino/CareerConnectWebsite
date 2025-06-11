// Script per correggere il cv_filename nel database EC2
const fetch = require('node-fetch');

const API_BASE = 'http://16.170.241.18:3001/api';

async function updateCVFilename() {
  try {
    console.log('🔄 Updating cv_filename in EC2 database...');
    
    // Prima controlliamo lo stato attuale
    const response = await fetch(`${API_BASE}/user/2`);
    const userData = await response.json();
    
    console.log('📋 Current user data:', userData);
    console.log('📁 Current cv_filename:', userData.cv_filename);
    
    // Dato che non abbiamo un endpoint di update diretto, 
    // simuliamo un upload per aggiornare il filename
    console.log('✅ Per correggere il database, dobbiamo:');
    console.log('1. Caricare test-cv.pdf tramite upload');
    console.log('2. Oppure creare un endpoint di update');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateCVFilename();
