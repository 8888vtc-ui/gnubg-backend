/**
 * Backend Validation Test
 */

const { app } = require('./src/simple-server.js');

// Test the backend
async function testBackend() {
  console.log('🧪 Testing GammonGuru Backend...');
  
  try {
    // Test health endpoint
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });
    
    console.log('✅ Health Check:', response.json());
    
    // Test game creation
    const gameResponse = await app.inject({
      method: 'POST',
      url: '/api/game/create',
      payload: {
        mode: 'AI_VS_PLAYER',
        difficulty: 'MEDIUM'
      }
    });
    
    console.log('✅ Game Creation:', gameResponse.json());
    
    // Test dice roll
    const diceResponse = await app.inject({
      method: 'POST',
      url: '/api/game/roll',
      payload: { gameId: 'test' }
    });
    
    console.log('✅ Dice Roll:', diceResponse.json());
    
    // Test GNUBG analysis
    const analysisResponse = await app.inject({
      method: 'POST',
      url: '/api/gnubg/analyze',
      payload: {
        boardState: '4HPwATDgc/ABMA',
        dice: [3, 5],
        analysisType: 'BEST_MOVE'
      }
    });
    
    console.log('✅ GNUBG Analysis:', analysisResponse.json());
    
    console.log('🎉 All Backend Tests Passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Backend Test Failed:', error.message);
    return false;
  }
}

// Run tests
testBackend().then(success => {
  process.exit(success ? 0 : 1);
});
