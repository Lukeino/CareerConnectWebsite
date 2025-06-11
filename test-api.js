// Test temporaneo per verificare la configurazione API
import { API_CONFIG } from './src/config/api.js';

console.log('🔧 Configurazione API attuale:');
console.log('BASE_URL:', API_CONFIG.BASE_URL);
console.log('TIMEOUT:', API_CONFIG.TIMEOUT);

// Test di connessione
async function testConnection() {
  try {
    console.log('🔄 Testing API connection...');
    const response = await fetch(`${API_CONFIG.BASE_URL}/test`, {
      method: 'GET',
      headers: API_CONFIG.DEFAULT_HEADERS,
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ API connection successful:', data);
    } else {
      console.log('❌ API connection failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

testConnection();
