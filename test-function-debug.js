// Test de debug des functions Netlify
const https = require('https');

async function debugFunction() {
  console.log('🔍 DEBUG DES FUNCTIONS NETLIFY');
  console.log('===============================');

  try {
    // Test 1: Vérifier si la function répond
    console.log('\n📡 TEST 1: CONNECTIVITÉ AUTH/LOGIN');
    const response = await makeRequest('https://gammonguru.netlify.app/.netlify/functions/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test'
      })
    });

    console.log(`Status: ${response.statusCode}`);
    console.log(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
    console.log(`Body length: ${response.body.length}`);
    console.log(`Body content: "${response.body}"`);
    
    if (response.body.length === 0) {
      console.log('❌ Réponse vide - Erreur dans la function');
    } else if (response.body.startsWith('<')) {
      console.log('❌ Réponse HTML - 404 ou erreur page');
    } else {
      try {
        const json = JSON.parse(response.body);
        console.log('✅ JSON valide');
        console.log('Response:', json);
      } catch (e) {
        console.log('❌ JSON invalide mais réponse présente');
        console.log('Error:', e.message);
      }
    }

  } catch (error) {
    console.error('\n❌ ERREUR RÉSEAU:');
    console.error('Message:', error.message);
  }
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

debugFunction();
