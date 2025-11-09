/**
 * Quick WebSocket Test - Non-blocking validation
 */

const WebSocket = require('ws');

function quickTest() {
  console.log('🧪 Quick WebSocket Test Starting...');
  
  const testResults = {
    connection: false,
    gameRoom: false,
    chatRoom: false,
    messageSend: false
  };
  
  let completedTests = 0;
  const totalTests = 4;
  
  // Test 1: Basic connection
  try {
    const ws1 = new WebSocket('ws://localhost:3000/ws/notifications?token=test-token');
    
    ws1.on('open', () => {
      testResults.connection = true;
      console.log('✅ Basic connection: SUCCESS');
      checkComplete();
    });
    
    ws1.on('error', () => {
      console.log('❌ Basic connection: FAILED (server not running)');
      testResults.connection = false;
      checkComplete();
    });
    
    setTimeout(() => {
      if (!testResults.connection) {
        console.log('❌ Basic connection: TIMEOUT');
        checkComplete();
      }
    }, 2000);
    
  } catch (error) {
    console.log('❌ Basic connection: ERROR -', error.message);
    checkComplete();
  }
  
  // Test 2: Game room
  try {
    const ws2 = new WebSocket('ws://localhost:3000/ws/game/test123?token=test-token');
    
    ws2.on('open', () => {
      testResults.gameRoom = true;
      console.log('✅ Game room: SUCCESS');
      ws2.close();
      checkComplete();
    });
    
    ws2.on('error', () => {
      console.log('❌ Game room: FAILED');
      checkComplete();
    });
    
    setTimeout(() => {
      if (!testResults.gameRoom) {
        console.log('❌ Game room: TIMEOUT');
        checkComplete();
      }
    }, 2000);
    
  } catch (error) {
    console.log('❌ Game room: ERROR -', error.message);
    checkComplete();
  }
  
  // Test 3: Chat room
  try {
    const ws3 = new WebSocket('ws://localhost:3000/ws/chat/test123?token=test-token');
    
    ws3.on('open', () => {
      testResults.chatRoom = true;
      console.log('✅ Chat room: SUCCESS');
      ws3.close();
      checkComplete();
    });
    
    ws3.on('error', () => {
      console.log('❌ Chat room: FAILED');
      checkComplete();
    });
    
    setTimeout(() => {
      if (!testResults.chatRoom) {
        console.log('❌ Chat room: TIMEOUT');
        checkComplete();
      }
    }, 2000);
    
  } catch (error) {
    console.log('❌ Chat room: ERROR -', error.message);
    checkComplete();
  }
  
  // Test 4: Message sending
  try {
    const ws4 = new WebSocket('ws://localhost:3000/ws/chat/testmsg?token=test-token');
    
    ws4.on('open', () => {
      const testMessage = {
        type: 'chat_message',
        message: 'Test message',
        username: 'TestUser'
      };
      
      ws4.send(JSON.stringify(testMessage));
      testResults.messageSend = true;
      console.log('✅ Message send: SUCCESS');
      ws4.close();
      checkComplete();
    });
    
    ws4.on('error', () => {
      console.log('❌ Message send: FAILED');
      checkComplete();
    });
    
    setTimeout(() => {
      if (!testResults.messageSend) {
        console.log('❌ Message send: TIMEOUT');
        checkComplete();
      }
    }, 2000);
    
  } catch (error) {
    console.log('❌ Message send: ERROR -', error.message);
    checkComplete();
  }
  
  function checkComplete() {
    completedTests++;
    
    if (completedTests === totalTests) {
      console.log('\n📊 Test Results:');
      console.log('================');
      
      const passed = Object.values(testResults).filter(r => r).length;
      const total = totalTests;
      
      console.log(`Passed: ${passed}/${total}`);
      
      if (passed === total) {
        console.log('🎉 All WebSocket tests PASSED!');
      } else {
        console.log('⚠️ Some tests failed - server may not be running');
      }
      
      console.log('\n💡 To test with server running:');
      console.log('   cd backend && npm start');
      console.log('   Then run this test again');
    }
  }
}

// Run test
quickTest();
