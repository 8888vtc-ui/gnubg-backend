/**
 * WebSocket Test Suite - GammonGuru Real-time Validation
 * Tests all WebSocket connections and message flows
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketTester {
  constructor() {
    this.testResults = [];
    this.connections = [];
    this.testToken = this.generateTestToken();
  }

  generateTestToken() {
    return jwt.sign(
      { 
        userId: 'test-user-123',
        email: 'test@gammonguru.com',
        username: 'TestPlayer'
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }

  async runAllTests() {
    console.log('🧪 Starting WebSocket Test Suite...\n');

    try {
      // Test 1: Basic Connection
      await this.testBasicConnection();
      
      // Test 2: Game Room Connection
      await this.testGameRoomConnection();
      
      // Test 3: Chat Room Connection
      await this.testChatRoomConnection();
      
      // Test 4: Message Broadcasting
      await this.testMessageBroadcasting();
      
      // Test 5: Multiplayer Sync
      await this.testMultiplayerSync();
      
      // Test 6: Error Handling
      await this.testErrorHandling();
      
      // Test 7: Reconnection Logic
      await this.testReconnection();
      
      // Test 8: Performance Test
      await this.testPerformance();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }

    this.printResults();
    this.cleanup();
    return this.testResults;
  }

  async testBasicConnection() {
    console.log('🔌 Test 1: Basic WebSocket Connection');
    
    try {
      const ws = new WebSocket(`ws://localhost:3000/ws/notifications?token=${this.testToken}`);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
        
        ws.on('open', () => {
          clearTimeout(timeout);
          this.addResult('Basic Connection', true, 'Connected successfully');
          resolve();
        });
        
        ws.on('error', (error) => {
          clearTimeout(timeout);
          this.addResult('Basic Connection', false, error.message);
          reject(error);
        });
      });
      
      this.connections.push(ws);
      
    } catch (error) {
      this.addResult('Basic Connection', false, error.message);
    }
  }

  async testGameRoomConnection() {
    console.log('🎮 Test 2: Game Room Connection');
    
    try {
      const gameId = 'test-game-123';
      const ws = new WebSocket(`ws://localhost:3000/ws/game/${gameId}?token=${this.testToken}`);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Game connection timeout')), 5000);
        
        ws.on('open', () => {
          clearTimeout(timeout);
          this.addResult('Game Room Connection', true, `Connected to game ${gameId}`);
          resolve();
        });
        
        ws.on('error', (error) => {
          clearTimeout(timeout);
          this.addResult('Game Room Connection', false, error.message);
          reject(error);
        });
      });
      
      this.connections.push(ws);
      
    } catch (error) {
      this.addResult('Game Room Connection', false, error.message);
    }
  }

  async testChatRoomConnection() {
    console.log('💬 Test 3: Chat Room Connection');
    
    try {
      const gameId = 'test-game-123';
      const ws = new WebSocket(`ws://localhost:3000/ws/chat/${gameId}?token=${this.testToken}`);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Chat connection timeout')), 5000);
        
        ws.on('open', () => {
          clearTimeout(timeout);
          this.addResult('Chat Room Connection', true, `Connected to chat ${gameId}`);
          resolve();
        });
        
        ws.on('error', (error) => {
          clearTimeout(timeout);
          this.addResult('Chat Room Connection', false, error.message);
          reject(error);
        });
      });
      
      this.connections.push(ws);
      
    } catch (error) {
      this.addResult('Chat Room Connection', false, error.message);
    }
  }

  async testMessageBroadcasting() {
    console.log('📡 Test 4: Message Broadcasting');
    
    try {
      const gameId = 'test-game-broadcast';
      const messages = [];
      
      // Create two connections
      const ws1 = new WebSocket(`ws://localhost:3000/ws/chat/${gameId}?token=${this.testToken}`);
      const ws2 = new WebSocket(`ws://localhost:3000/ws/chat/${gameId}?token=${this.testToken}`);
      
      await Promise.all([
        new Promise((resolve) => {
          ws1.on('open', resolve);
        }),
        new Promise((resolve) => {
          ws2.on('open', resolve);
        })
      ]);
      
      // Setup message listeners
      ws2.on('message', (data) => {
        messages.push(JSON.parse(data.toString()));
      });
      
      // Send test message
      const testMessage = {
        type: 'chat_message',
        message: 'Hello from test!',
        username: 'TestPlayer',
        messageType: 'TEXT'
      };
      
      ws1.send(JSON.stringify(testMessage));
      
      // Wait for message reception
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      
      if (messages.length > 0 && messages[0].message === 'Hello from test!') {
        this.addResult('Message Broadcasting', true, 'Message broadcasted successfully');
      } else {
        this.addResult('Message Broadcasting', false, 'Message not received');
      }
      
      this.connections.push(ws1, ws2);
      
    } catch (error) {
      this.addResult('Message Broadcasting', false, error.message);
    }
  }

  async testMultiplayerSync() {
    console.log('🔄 Test 5: Multiplayer Synchronization');
    
    try {
      const gameId = 'test-game-sync';
      const gameEvents = [];
      
      // Create game connection
      const ws = new WebSocket(`ws://localhost:3000/ws/game/${gameId}?token=${this.testToken}`);
      
      await new Promise((resolve) => {
        ws.on('open', resolve);
      });
      
      // Listen for game events
      ws.on('message', (data) => {
        const event = JSON.parse(data.toString());
        gameEvents.push(event);
      });
      
      // Send game move
      const testMove = {
        type: 'game_move',
        move: { from: 1, to: 4, player: 'white' }
      };
      
      ws.send(JSON.stringify(testMove));
      
      // Send dice roll
      const testRoll = {
        type: 'game_roll',
        dice: [3, 5]
      };
      
      ws.send(JSON.stringify(testRoll));
      
      // Wait for processing
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      
      if (gameEvents.length >= 2) {
        this.addResult('Multiplayer Sync', true, `Synced ${gameEvents.length} events`);
      } else {
        this.addResult('Multiplayer Sync', false, 'Insufficient sync events');
      }
      
      this.connections.push(ws);
      
    } catch (error) {
      this.addResult('Multiplayer Sync', false, error.message);
    }
  }

  async testErrorHandling() {
    console.log('⚠️ Test 6: Error Handling');
    
    try {
      // Test invalid token
      const ws1 = new WebSocket('ws://localhost:3000/ws/game/test?token=invalid-token');
      
      const errorResult = await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(false), 3000);
        
        ws1.on('error', () => {
          clearTimeout(timeout);
          resolve(true);
        });
        
        ws1.on('close', (code) => {
          clearTimeout(timeout);
          resolve(code === 4002); // Authentication failed code
        });
      });
      
      if (errorResult) {
        this.addResult('Error Handling', true, 'Invalid token rejected');
      } else {
        this.addResult('Error Handling', false, 'Invalid token accepted');
      }
      
    } catch (error) {
      this.addResult('Error Handling', false, error.message);
    }
  }

  async testReconnection() {
    console.log('🔄 Test 7: Reconnection Logic');
    
    try {
      let reconnectAttempts = 0;
      const gameId = 'test-game-reconnect';
      
      // Create connection with reconnection simulation
      const ws = new WebSocket(`ws://localhost:3000/ws/game/${gameId}?token=${this.testToken}`);
      
      await new Promise((resolve) => {
        ws.on('open', resolve);
      });
      
      // Simulate disconnection
      ws.close();
      
      // Wait and try to reconnect
      setTimeout(async () => {
        try {
          const ws2 = new WebSocket(`ws://localhost:3000/ws/game/${gameId}?token=${this.testToken}`);
          
          await new Promise((resolve) => {
            ws2.on('open', resolve);
          });
          
          this.addResult('Reconnection Logic', true, 'Reconnected successfully');
          this.connections.push(ws2);
          
        } catch (error) {
          this.addResult('Reconnection Logic', false, error.message);
        }
      }, 1000);
      
      this.connections.push(ws);
      
    } catch (error) {
      this.addResult('Reconnection Logic', false, error.message);
    }
  }

  async testPerformance() {
    console.log('⚡ Test 8: Performance Test');
    
    try {
      const gameId = 'test-game-performance';
      const messageCount = 100;
      const receivedMessages = [];
      
      // Create connection
      const ws = new WebSocket(`ws://localhost:3000/ws/chat/${gameId}?token=${this.testToken}`);
      
      await new Promise((resolve) => {
        ws.on('open', resolve);
      });
      
      // Track received messages
      ws.on('message', (data) => {
        receivedMessages.push(JSON.parse(data.toString()));
      });
      
      // Send multiple messages rapidly
      const startTime = Date.now();
      
      for (let i = 0; i < messageCount; i++) {
        const message = {
          type: 'chat_message',
          message: `Performance test message ${i}`,
          username: 'TestPlayer',
          messageType: 'TEXT'
        };
        
        ws.send(JSON.stringify(message));
      }
      
      // Wait for processing
      await new Promise((resolve) => {
        setTimeout(resolve, 5000);
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      const messagesPerSecond = (receivedMessages.length / duration) * 1000;
      
      if (messagesPerSecond > 10) {
        this.addResult('Performance Test', true, `${messagesPerSecond.toFixed(2)} msg/sec`);
      } else {
        this.addResult('Performance Test', false, `Low performance: ${messagesPerSecond.toFixed(2)} msg/sec`);
      }
      
      this.connections.push(ws);
      
    } catch (error) {
      this.addResult('Performance Test', false, error.message);
    }
  }

  addResult(testName, passed, details) {
    this.testResults.push({
      test: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`   ${status} ${testName}: ${details}`);
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const failed = total - passed;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`   ❌ ${r.test}: ${r.details}`));
    }
  }

  cleanup() {
    console.log('\n🧹 Cleaning up test connections...');
    this.connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.connections = [];
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new WebSocketTester();
  tester.runAllTests()
    .then(results => {
      console.log('\n🎉 WebSocket testing completed!');
      process.exit(results.filter(r => r.passed).length === results.length ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = WebSocketTester;
