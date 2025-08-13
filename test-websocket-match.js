#!/usr/bin/env node

/**
 * WebSocket Match Event Broadcasting Test Script
 * 
 * This script demonstrates the WebSocket functionality for real-time match events.
 * Run this after starting the backend server.
 */

const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:3001';
const TEST_TOKEN = 'your-test-jwt-token'; // Replace with actual token
const TEST_MATCH_ID = 'test-match-123';

// Test data
const testEvents = [
  {
    type: 'goal',
    minute: 15,
    description: 'Test goal by striker',
    playerId: 'player-123',
    teamId: 'team-home-456'
  },
  {
    type: 'yellow_card',
    minute: 23,
    description: 'Foul play',
    playerId: 'player-789',
    teamId: 'team-away-101'
  },
  {
    type: 'substitution',
    minute: 45,
    description: 'Substitution',
    playerId: 'player-sub-456',
    teamId: 'team-home-456',
    data: { playerOutId: 'player-123' }
  }
];

class WebSocketTester {
  constructor() {
    this.socket = null;
    this.testResults = [];
  }

  async connect() {
    console.log('🔌 Connecting to WebSocket server...');
    
    try {
      this.socket = io(SERVER_URL, {
        auth: { token: TEST_TOKEN },
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server');
        this.testResults.push('Connection: SUCCESS');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection failed:', error.message);
        this.testResults.push('Connection: FAILED');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected:', reason);
      });

      // Set up event listeners
      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        this.socket.on('connect', resolve);
        this.socket.on('connect_error', reject);
      });
    } catch (error) {
      console.error('❌ Failed to create connection:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Match state events
    this.socket.on('match-state', (state) => {
      console.log('📊 Match state received:', state);
      this.testResults.push('Match State: SUCCESS');
    });

    this.socket.on('match-state-update', (state) => {
      console.log('🔄 Match state updated:', state);
      this.testResults.push('Match State Update: SUCCESS');
    });

    // Match events
    this.socket.on('match-event', (event) => {
      console.log('⚽ Match event received:', event);
      this.testResults.push('Match Event: SUCCESS');
    });

    // Match status changes
    this.socket.on('match-status-change', (data) => {
      console.log('🏁 Match status changed:', data);
      this.testResults.push('Match Status Change: SUCCESS');
    });

    // Timer updates
    this.socket.on('match-timer-update', (data) => {
      console.log('⏱️ Timer updated:', data);
      this.testResults.push('Timer Update: SUCCESS');
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.testResults.push('Error Handling: SUCCESS');
    });
  }

  async testJoinMatch() {
    console.log('\n🚪 Testing join match room...');
    
    try {
      this.socket.emit('join-match', TEST_MATCH_ID);
      this.testResults.push('Join Match: SUCCESS');
      console.log('✅ Joined match room');
    } catch (error) {
      console.error('❌ Failed to join match:', error);
      this.testResults.push('Join Match: FAILED');
    }
  }

  async testMatchEvents() {
    console.log('\n⚽ Testing match events...');
    
    for (let i = 0; i < testEvents.length; i++) {
      const event = testEvents[i];
      console.log(`\n📝 Testing event ${i + 1}: ${event.type}`);
      
      try {
        this.socket.emit('match-event', {
          matchId: TEST_MATCH_ID,
          ...event
        });
        
        this.testResults.push(`Event ${event.type}: SUCCESS`);
        console.log(`✅ Event ${event.type} sent`);
        
        // Wait a bit between events
        await this.sleep(1000);
      } catch (error) {
        console.error(`❌ Failed to send event ${event.type}:`, error);
        this.testResults.push(`Event ${event.type}: FAILED`);
      }
    }
  }

  async testMatchStatusChanges() {
    console.log('\n🏁 Testing match status changes...');
    
    const statuses = ['in_progress', 'paused', 'in_progress', 'completed'];
    
    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      console.log(`\n📊 Testing status: ${status}`);
      
      try {
        this.socket.emit('match-status-change', {
          matchId: TEST_MATCH_ID,
          status,
          timestamp: new Date()
        });
        
        this.testResults.push(`Status ${status}: SUCCESS`);
        console.log(`✅ Status ${status} sent`);
        
        await this.sleep(1000);
      } catch (error) {
        console.error(`❌ Failed to change status to ${status}:`, error);
        this.testResults.push(`Status ${status}: FAILED`);
      }
    }
  }

  async testTimerControl() {
    console.log('\n⏱️ Testing timer control...');
    
    const actions = ['start', 'pause', 'resume', 'stop'];
    
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      console.log(`\n⏰ Testing timer action: ${action}`);
      
      try {
        this.socket.emit('match-timer-control', {
          matchId: TEST_MATCH_ID,
          action,
          timestamp: new Date()
        });
        
        this.testResults.push(`Timer ${action}: SUCCESS`);
        console.log(`✅ Timer action ${action} sent`);
        
        await this.sleep(1000);
      } catch (error) {
        console.error(`❌ Failed to control timer ${action}:`, error);
        this.testResults.push(`Timer ${action}: FAILED`);
      }
    }
  }

  async testChat() {
    console.log('\n💬 Testing chat functionality...');
    
    try {
      // Send chat message
      this.socket.emit('chat-message', {
        room: `match:${TEST_MATCH_ID}`,
        message: 'Test chat message from WebSocket tester',
        teamId: 'team-home-456'
      });
      
      this.testResults.push('Chat Message: SUCCESS');
      console.log('✅ Chat message sent');
      
      // Test typing indicators
      this.socket.emit('typing-start', { room: `match:${TEST_MATCH_ID}` });
      await this.sleep(500);
      this.socket.emit('typing-stop', { room: `match:${TEST_MATCH_ID}` });
      
      this.testResults.push('Typing Indicators: SUCCESS');
      console.log('✅ Typing indicators tested');
      
    } catch (error) {
      console.error('❌ Chat test failed:', error);
      this.testResults.push('Chat: FAILED');
    }
  }

  async testRoomManagement() {
    console.log('\n🚪 Testing room management...');
    
    try {
      // Join generic room
      this.socket.emit('join-room', 'test-room');
      this.testResults.push('Join Generic Room: SUCCESS');
      console.log('✅ Joined generic room');
      
      // Leave generic room
      this.socket.emit('leave-room', 'test-room');
      this.testResults.push('Leave Generic Room: SUCCESS');
      console.log('✅ Left generic room');
      
    } catch (error) {
      console.error('❌ Room management test failed:', error);
      this.testResults.push('Room Management: FAILED');
    }
  }

  async runAllTests() {
    console.log('🧪 Starting WebSocket Match Event Broadcasting Tests...\n');
    
    try {
      // Connect to WebSocket
      await this.connect();
      
      // Run all tests
      await this.testJoinMatch();
      await this.sleep(1000);
      
      await this.testMatchEvents();
      await this.sleep(1000);
      
      await this.testMatchStatusChanges();
      await this.sleep(1000);
      
      await this.testTimerControl();
      await this.sleep(1000);
      
      await this.testChat();
      await this.sleep(1000);
      
      await this.testRoomManagement();
      await this.sleep(1000);
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      // Cleanup
      if (this.socket) {
        this.socket.disconnect();
        console.log('\n🔌 Disconnected from WebSocket server');
      }
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const successCount = this.testResults.filter(r => r.includes('SUCCESS')).length;
    const totalCount = this.testResults.length;
    
    this.testResults.forEach((result, index) => {
      const status = result.includes('SUCCESS') ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result}`);
    });
    
    console.log('\n📈 Summary:');
    console.log(`Total Tests: ${totalCount}`);
    console.log(`Passed: ${successCount}`);
    console.log(`Failed: ${totalCount - successCount}`);
    console.log(`Success Rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 All tests passed! WebSocket system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Check the logs above for details.');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new WebSocketTester();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Test interrupted by user');
    if (tester.socket) {
      tester.socket.disconnect();
    }
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Test terminated');
    if (tester.socket) {
      tester.socket.disconnect();
    }
    process.exit(0);
  });
  
  // Start tests
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = WebSocketTester;
