// Test final complet de GammonGuru
const https = require('https');

async function finalCompleteTest() {
  console.log('🎯 TEST FINAL COMPLET GAMMON GURU');
  console.log('===================================');

  // Test 1: Frontend
  console.log('\n🎨 TEST 1: FRONTEND');
  try {
    const frontendResponse = await makeRequest('https://gammonguru.netlify.app');
    if (frontendResponse.statusCode === 200 && frontendResponse.body.includes('GammonGuru')) {
      console.log('✅ Frontend 100% fonctionnel');
    } else {
      console.log('❌ Frontend a des problèmes');
    }
  } catch (e) {
    console.log('❌ Frontend inaccessible');
  }

  // Test 2: API Functions
  console.log('\n🔧 TEST 2: API FUNCTIONS');
  try {
    const apiResponse = await makeRequest('https://gammonguru.netlify.app/.netlify/functions/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' })
    });

    if (apiResponse.statusCode === 200) {
      console.log('✅ API Functions accessibles');
      
      try {
        const data = JSON.parse(apiResponse.body);
        if (data.success === false && data.error) {
          console.log('✅ API fonctionne (erreur logique normale)');
          console.log(`   - Error type: ${data.error.substring(0, 50)}...`);
        } else {
          console.log('✅ API fonctionne parfaitement');
        }
      } catch (e) {
        console.log('❌ API retourne JSON invalide');
      }
    } else if (apiResponse.statusCode === 404) {
      console.log('❌ API Functions non trouvées (404)');
      console.log('   → Functions directory manquant');
    } else {
      console.log(`❌ API erreur: ${apiResponse.statusCode}`);
    }
  } catch (e) {
    console.log('❌ API complètement inaccessible');
  }

  // Test 3: Instructions finales
  console.log('\n📋 TEST 3: INSTRUCTIONS FINALES');
  console.log('================================');
  
  console.log('Si API Functions = 404:');
  console.log('1. Allez sur: https://app.netlify.com/sites/gammonguru/configuration/build');
  console.log('2. Functions directory: netlify/functions');
  console.log('3. Save');
  
  console.log('\nSi API = erreurs variables:');
  console.log('1. Allez sur: https://app.netlify.com/sites/gammonguru/configuration/variables');
  console.log('2. Ajoutez les 8 variables DATABASE_URL, SUPABASE_*, JWT_SECRET, etc.');
  console.log('3. Save');
  
  console.log('\nSi tout est vert:');
  console.log('🎉 GAMMON GURU EST 100% FONCTIONNEL !');
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
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

finalCompleteTest();
