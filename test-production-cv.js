// Test rapido per verificare la funzionalità CV in produzione
const API_CONFIG = {
  BASE_URL: 'http://16.170.241.18:3001/api'
};

// Simula la funzione getStaticFileUrl come nell'app
function getStaticFileUrl(filename) {
  console.log('🔍 Debug filename received:', filename);
  
  if (!filename) {
    console.error('❌ No filename provided to getStaticFileUrl');
    return '';
  }

  // Ottieni base URL rimuovendo /api
  let baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
  console.log('📍 Base URL from config:', baseUrl);

  // Se siamo in produzione e l'URL inizia con /, aggiungi origin
  if (process.env.NODE_ENV === 'production' && baseUrl.startsWith('/')) {
    baseUrl = 'https://careerconnectproject.netlify.app' + baseUrl;
  }

  // Assicurati che l'URL abbia il protocollo
  if (!baseUrl.startsWith('http')) {
    baseUrl = `http://${baseUrl}`;
  }

  const fullUrl = `${baseUrl}/uploads/${filename}`;
  console.log('🔗 Generated CV URL:', fullUrl, 'from filename:', filename);
  
  return fullUrl;
}

// Test con filename di esempio
const testFilename = 'test-cv.pdf';
const generatedUrl = getStaticFileUrl(testFilename);

console.log('\n=== TEST PRODUZIONE CV ===');
console.log('📁 Test filename:', testFilename);
console.log('🔗 URL generato:', generatedUrl);
console.log('✅ URL corretto per produzione:', generatedUrl === 'http://16.170.241.18:3001/uploads/test-cv.pdf');

// Test con fetch se disponibile
if (typeof fetch !== 'undefined') {
  console.log('\n🌐 Testing connectivity...');
  fetch(generatedUrl, { method: 'HEAD' })
    .then(response => {
      console.log('📊 Status:', response.status);
      console.log('📄 Content-Type:', response.headers.get('content-type'));
      if (response.ok) {
        console.log('✅ CV accessibile dal backend EC2!');
      } else {
        console.log('❌ Problema di accesso al CV');
      }
    })
    .catch(error => {
      console.log('❌ Errore di connessione:', error.message);
    });
} else {
  console.log('\n📝 Per testare la connettività, apri questo URL nel browser:');
  console.log(generatedUrl);
}
