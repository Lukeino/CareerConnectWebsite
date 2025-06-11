// Test per debug timestamp
const API_CONFIG = {
  BASE_URL: 'http://16.170.241.18:3001/api'
};

async function testTimestamps() {
  try {
    console.log('=== DEBUG TIMESTAMP ===');
    console.log('Ora locale JavaScript:', new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
    console.log('Ora UTC JavaScript:', new Date().toISOString());
    
    // Fetch jobs dal server
    const response = await fetch(`${API_CONFIG.BASE_URL}/jobs`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    
    const jobs = await response.json();
    console.log('\n=== PRIMI 3 JOB DAL DATABASE ===');
    
    jobs.slice(0, 3).forEach((job, index) => {
      console.log(`\nJob ${index + 1}:`);
      console.log('ID:', job.id);
      console.log('Titolo:', job.title);
      console.log('created_at RAW:', job.created_at);
      console.log('Tipo di dato:', typeof job.created_at);
      
      // Test parsing normale
      const dateNormal = new Date(job.created_at);
      console.log('new Date() normale:', dateNormal.toISOString());
      console.log('toLocaleString IT:', dateNormal.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
      
      // Test parsing con Z forzato
      const dateUtc = new Date(job.created_at + 'Z');
      console.log('new Date() + Z:', dateUtc.toISOString());
      console.log('toLocaleString IT con Z:', dateUtc.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
    });
    
  } catch (error) {
    console.error('Errore nel test:', error);
  }
}

// Esegui il test
testTimestamps();
