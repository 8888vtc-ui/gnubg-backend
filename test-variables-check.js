// Test de vérification des variables d'environnement
const https = require('https');

const API_BASE = 'https://gammonguru.netlify.app/.netlify/functions';

async function checkEnvironmentVariables() {
  console.log('🔍 VÉRIFICATION VARIABLES ENVIRONNEMENT');
  console.log('=======================================');

  try {
    // Test 1: Vérifier si les functions répondent
    console.log('\n📡 TEST 1: CONNECTIVITÉ FUNCTIONS');
    const response = await makeRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test'
      })
    });

    console.log(`Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Functions répondent');
      
      // Vérifier le contenu de la réponse
      if (response.body.includes('success')) {
        console.log('✅ Format JSON correct');
        const data = JSON.parse(response.body);
        if (data.success === false) {
          console.log('⚠️ API fonctionne mais erreur logique');
          console.log(`   - Error: ${data.error}`);
          
          // Analyser l'erreur pour déterminer la variable manquante
          if (data.error.includes('DATABASE')) {
            console.log('❌ DATABASE_URL manquante');
          }
          if (data.error.includes('SUPABASE')) {
            console.log('❌ Variables SUPABASE manquantes');
          }
          if (data.error.includes('JWT')) {
            console.log('❌ JWT_SECRET manquant');
          }
          if (data.error.includes('prisma')) {
            console.log('❌ DATABASE_URL ou Prisma configuration');
          }
        }
      } else {
        console.log('❌ Format JSON incorrect');
        console.log('Response brute:', response.body.substring(0, 200));
      }
    } else if (response.statusCode === 404) {
      console.log('❌ Functions non trouvées (404)');
      console.log('   - Vérifiez netlify.toml functions directory');
    } else if (response.statusCode === 500) {
      console.log('❌ Erreur serveur (500)');
      console.log('   - Variables manquantes ou incorrectes');
    } else {
      console.log(`❌ Erreur inattendue: ${response.statusCode}`);
    }

    // Test 2: Vérifier les logs Netlify
    console.log('\n📋 TEST 2: CONSEILS DÉBOGAGE');
    console.log('1. Allez sur: https://app.netlify.com/sites/gammonguru/functions');
    console.log('2. Vérifiez les logs des functions');
    console.log('3. Cherchez les erreurs de variables manquantes');
    console.log('4. Ajoutez les 8 variables requises');

    console.log('\n📝 VARIABLES REQUISES:');
    console.log('=====================');
    console.log('NODE_VERSION = 18');
    console.log('DATABASE_URL = postgresql://postgres:...');
    console.log('SUPABASE_URL = https://nhhxgnmjsmpyyfmngoyf.supabase.co');
    console.log('SUPABASE_ANON_KEY = eyJhbGciOiJI...');
    console.log('SUPABASE_SERVICE_KEY = eyJhbGciOiJI...');
    console.log('JWT_SECRET = gammon-guru-jwt-secret...');
    console.log('GNUBG_SERVICE_URL = https://gammonguru-gnu.up.railway.app');
    console.log('GNUBG_API_KEY = gnu-bg-api-key-production-2024');

  } catch (error) {
    console.error('\n❌ ERREUR VÉRIFICATION:');
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

checkEnvironmentVariables();
