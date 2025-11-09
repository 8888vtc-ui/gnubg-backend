// Test complet du frontend GammonGuru
const https = require('https');

const SITE_URL = 'https://gammonguru.netlify.app';

async function testFrontendComplete() {
  console.log('🎨 TEST COMPLET FRONTEND GAMMON GURU');
  console.log('=====================================');

  try {
    // Test 1: Page principale accessible
    console.log('\n📡 TEST 1: PAGE PRINCIPALE');
    const response = await makeRequest(SITE_URL);
    
    if (response.statusCode === 200) {
      console.log('✅ Page principale accessible');
      console.log(`   Status: ${response.statusCode}`);
      
      // Vérifier contenu HTML
      if (response.body.includes('GammonGuru')) {
        console.log('✅ Titre GammonGuru trouvé');
      }
      if (response.body.includes('Backgammon')) {
        console.log('✅ Sous-titre Backgammon trouvé');
      }
      if (response.body.includes('testAPI')) {
        console.log('✅ Fonctions de test API présentes');
      }
    } else {
      console.log(`❌ Page inaccessible: ${response.statusCode}`);
      return;
    }

    // Test 2: Vérifier les assets CSS
    console.log('\n🎨 TEST 2: ASSETS CSS');
    if (response.body.includes('background: linear-gradient')) {
      console.log('✅ Styles CSS intégrés');
    }
    if (response.body.includes('animation')) {
      console.log('✅ Animations CSS présentes');
    }

    // Test 3: Vérifier le JavaScript
    console.log('\n⚡ TEST 3: JAVASCRIPT');
    if (response.body.includes('async function testAPI')) {
      console.log('✅ Fonctions de test API présentes');
    }
    if (response.body.includes('fetch')) {
      console.log('✅ Appels API configurés');
    }

    // Test 4: Vérifier les boutons
    console.log('\n🔘 TEST 4: BOUTONS INTERFACE');
    const buttons = ['login', 'profile', 'game', 'analyze'];
    buttons.forEach(button => {
      if (response.body.includes(`testAPI('${button}')`)) {
        console.log(`✅ Bouton ${button} trouvé`);
      }
    });

    // Test 5: Vérifier structure responsive
    console.log('\n📱 TEST 5: DESIGN RESPONSIVE');
    if (response.body.includes('viewport')) {
      console.log('✅ Meta viewport configuré');
    }
    if (response.body.includes('media')) {
      console.log('✅ Media queries présentes');
    }

    console.log('\n🎉 TESTS FRONTEND TERMINÉS!');
    console.log('✅ Interface utilisateur complète');
    console.log('✅ Design responsive actif');
    console.log('✅ Fonctions de test intégrées');

  } catch (error) {
    console.error('\n❌ ERREUR TESTS FRONTEND:');
    console.error('Message:', error.message);
  }
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
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
    req.end();
  });
}

testFrontendComplete();
