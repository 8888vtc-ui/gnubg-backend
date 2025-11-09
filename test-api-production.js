// Test complet des API Functions en production
const https = require('https');

const API_BASE = 'https://gammonguru.netlify.app/.netlify/functions';

// Données de test
const testUser = {
  email: `test-prod-${Date.now()}@gammon-guru.com`,
  password: 'Password123!',
  username: `TestProd${Date.now()}`
};

let authToken = '';
let userId = '';
let gameId = '';

async function testProductionAPI() {
  console.log('🚀 TEST COMPLET API PRODUCTION');
  console.log('=================================');

  try {
    // Test 1: Register
    console.log('\n📝 TEST 1: REGISTER UTILISATEUR');
    const registerResult = await testEndpoint('auth/register', 'POST', testUser);
    if (registerResult.success) {
      console.log('✅ Register réussi');
      console.log(`   - Email: ${registerResult.data.user.email}`);
      console.log(`   - Username: ${registerResult.data.user.username}`);
      console.log(`   - ELO: ${registerResult.data.user.elo}`);
      userId = registerResult.data.user.id;
    } else {
      console.log('⚠️ Register échoué (peut être normal si user existe)');
      console.log(`   - Error: ${registerResult.error}`);
    }

    // Test 2: Login avec utilisateur existant
    console.log('\n🔐 TEST 2: LOGIN UTILISATEUR');
    const loginResult = await testEndpoint('auth/login', 'POST', {
      email: 'codespaces-test@example.com',
      password: 'password123'
    });
    
    if (loginResult.success) {
      console.log('✅ Login réussi');
      authToken = loginResult.data.token;
      console.log(`   - Token: ${authToken.substring(0, 30)}...`);
    } else {
      console.log('❌ Login échoué');
      console.log(`   - Error: ${loginResult.error}`);
      
      // Si login échoue, on essaie de créer un utilisateur
      console.log('\n🔄 Tentative de créer un utilisateur pour les tests...');
      const createResult = await testEndpoint('auth/register', 'POST', {
        email: 'test-production@gammon-guru.com',
        password: 'Password123!',
        username: 'TestProduction'
      });
      
      if (createResult.success) {
        console.log('✅ Utilisateur de test créé');
        // Retenter le login
        const retryLogin = await testEndpoint('auth/login', 'POST', {
          email: 'test-production@gammon-guru.com',
          password: 'Password123!'
        });
        if (retryLogin.success) {
          authToken = retryLogin.data.token;
          console.log('✅ Login réussi avec utilisateur de test');
        }
      }
    }

    // Test 3: Profile (nécessite auth)
    if (authToken) {
      console.log('\n👤 TEST 3: GET PROFILE');
      const profileResult = await testEndpoint('user/profile', 'GET', null, authToken);
      if (profileResult.success) {
        console.log('✅ Profile récupéré');
        console.log(`   - Username: ${profileResult.data.user.username}`);
        console.log(`   - ELO: ${profileResult.data.user.elo}`);
        console.log(`   - Level: ${profileResult.data.user.level}`);
      } else {
        console.log('❌ Profile échoué');
        console.log(`   - Error: ${profileResult.error}`);
      }

      // Test 4: Create Game
      console.log('\n🎮 TEST 4: CREATE GAME');
      const gameResult = await testEndpoint('game/create', 'POST', {
        gameMode: 'AI_VS_PLAYER',
        difficulty: 'MEDIUM'
      }, authToken);
      
      if (gameResult.success) {
        console.log('✅ Game créé');
        gameId = gameResult.data.game.id;
        console.log(`   - Game ID: ${gameId}`);
        console.log(`   - Status: ${gameResult.data.game.status}`);
      } else {
        console.log('❌ Create game échoué');
        console.log(`   - Error: ${gameResult.error}`);
      }

      // Test 5: GNUBG Analyze
      console.log('\n🧠 TEST 5: GNUBG ANALYZE');
      const analyzeResult = await testEndpoint('gnubg/analyze', 'POST', {
        boardState: '4HPwATDgc/ABMA',
        dice: [3, 1],
        move: '8/5 6/5',
        analysisType: 'full'
      }, authToken);
      
      if (analyzeResult.success) {
        console.log('✅ Analyse GNUBG réussie');
        console.log(`   - Best Move: ${analyzeResult.data.bestMove}`);
        console.log(`   - Equity: ${analyzeResult.data.equity?.toFixed(3)}`);
        console.log(`   - Quota: ${analyzeResult.data.quotaRemaining}`);
      } else {
        console.log('❌ Analyse GNUBG échouée');
        console.log(`   - Error: ${analyzeResult.error}`);
      }
    } else {
      console.log('\n⚠️ Tests suivants annulés - Pas de token auth');
    }

    // Test 6: Test sans auth (doit échouer)
    console.log('\n🚫 TEST 6: ERREUR AUTHENTIFICATION');
    const noAuthResult = await testEndpoint('user/profile', 'GET');
    if (noAuthResult.statusCode === 401) {
      console.log('✅ Erreur 401 correctement gérée');
    } else {
      console.log('❌ Erreur 401 non gérée');
    }

    // Résumé
    console.log('\n📊 RÉSUMÉ TESTS API');
    console.log('==================');
    console.log('✅ Endpoint register testé');
    console.log('✅ Endpoint login testé');
    console.log(authToken ? '✅ Endpoint profile testé' : '❌ Endpoint profile non testé');
    console.log(authToken ? '✅ Endpoint game testé' : '❌ Endpoint game non testé');
    console.log(authToken ? '✅ Endpoint gnubg testé' : '❌ Endpoint gnubg non testé');
    console.log('✅ Gestion erreurs testée');

  } catch (error) {
    console.error('\n❌ ERREUR GLOBALE TESTS API:');
    console.error('Message:', error.message);
  }
}

async function testEndpoint(endpoint, method = 'GET', body = null, token = null) {
  return new Promise((resolve) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(`${API_BASE}/${endpoint}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            success: result.success || false,
            data: result.data || null,
            error: result.error || null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            success: false,
            data: null,
            error: 'Invalid JSON response'
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        statusCode: 0,
        success: false,
        data: null,
        error: error.message
      });
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

testProductionAPI();
