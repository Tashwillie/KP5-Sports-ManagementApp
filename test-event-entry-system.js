const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:3001';
const WEBSOCKET_URL = 'http://localhost:3001';
const TEST_MATCH_ID = 'test_match_123';
const TEST_TEAM_ID = 'test_team_456';
const TEST_USER_ID = 'test_user_789';

// Test data
const testEvents = [
  {
    eventType: 'goal',
    minute: 15,
    teamId: TEST_TEAM_ID,
    playerId: 'player_1',
    goalType: 'open_play',
    location: 'center'
  },
  {
    eventType: 'yellow_card',
    minute: 23,
    teamId: TEST_TEAM_ID,
    playerId: 'player_2',
    cardType: 'caution',
    severity: 'minor'
  },
  {
    eventType: 'substitution',
    minute: 45,
    teamId: TEST_TEAM_ID,
    playerId: 'player_3',
    secondaryPlayerId: 'player_4',
    substitutionType: 'tactical'
  },
  {
    eventType: 'injury',
    minute: 67,
    teamId: TEST_TEAM_ID,
    playerId: 'player_5',
    severity: 'major',
    description: 'Ankle injury, player unable to continue'
  },
  {
    eventType: 'corner',
    minute: 78,
    teamId: TEST_TEAM_ID,
    description: 'Corner kick from right side'
  }
];

class EventEntrySystemTester {
  constructor() {
    this.socket = null;
    this.sessionId = null;
    this.testResults = [];
  }

  async runTests() {
    console.log('🚀 Starting Event Entry System Tests...\n');

    try {
      // Test 1: WebSocket Connection
      await this.testWebSocketConnection();

      // Test 2: Event Entry Session Management
      await this.testEventEntrySessionManagement();

      // Test 3: Event Entry Validation
      await this.testEventEntryValidation();

      // Test 4: Event Entry Submission
      await this.testEventEntrySubmission();

      // Test 5: REST API Endpoints
      await this.testRESTAPIEndpoints();

      // Test 6: Real-time Event Broadcasting
      await this.testRealTimeEventBroadcasting();

      // Test 7: Session Cleanup
      await this.testSessionCleanup();

      // Test 8: Error Handling
      await this.testErrorHandling();

      // Test 9: Performance Testing
      await this.testPerformance();

      // Test 10: Integration Testing
      await this.testIntegration();

      this.printTestResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    } finally {
      this.cleanup();
    }
  }

  async testWebSocketConnection() {
    console.log('🔌 Testing WebSocket Connection...');
    
    try {
      this.socket = io(WEBSOCKET_URL, {
        auth: {
          token: 'test_jwt_token'
        }
      });

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 5000);

        this.socket.on('connect', () => {
          clearTimeout(timeout);
          this.addTestResult('WebSocket Connection', true, 'Connected successfully');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(new Error(`WebSocket connection failed: ${error.message}`));
        });
      });
    } catch (error) {
      this.addTestResult('WebSocket Connection', false, error.message);
      throw error;
    }
  }

  async testEventEntrySessionManagement() {
    console.log('📝 Testing Event Entry Session Management...');

    try {
      // Start event entry session
      await new Promise((resolve, reject) => {
        this.socket.emit('start-event-entry', { matchId: TEST_MATCH_ID });
        
        this.socket.once('event-entry-started', (data) => {
          this.sessionId = data.sessionId;
          this.addTestResult('Start Event Entry Session', true, `Session started: ${data.sessionId}`);
          resolve();
        });

        setTimeout(() => reject(new Error('Session start timeout')), 5000);
      });

      // Get session status
      await new Promise((resolve, reject) => {
        this.socket.emit('get-event-entry-status', { matchId: TEST_MATCH_ID });
        
        this.socket.once('event-entry-status', (data) => {
          if (data.isActive) {
            this.addTestResult('Get Session Status', true, 'Session status retrieved successfully');
            resolve();
          } else {
            reject(new Error('Session not active'));
          }
        });

        setTimeout(() => reject(new Error('Get status timeout')), 5000);
      });

    } catch (error) {
      this.addTestResult('Event Entry Session Management', false, error.message);
      throw error;
    }
  }

  async testEventEntryValidation() {
    console.log('✅ Testing Event Entry Validation...');

    try {
      for (const event of testEvents) {
        const eventData = {
          matchId: TEST_MATCH_ID,
          ...event
        };

        await new Promise((resolve, reject) => {
          this.socket.emit('validate-event-entry', eventData);
          
          this.socket.once('event-entry-validation', (validation) => {
            if (validation.isValid) {
              this.addTestResult(`Validation: ${event.eventType}`, true, 'Event validated successfully');
            } else {
              this.addTestResult(`Validation: ${event.eventType}`, false, `Validation errors: ${validation.errors.join(', ')}`);
            }
            resolve();
          });

          setTimeout(() => reject(new Error(`Validation timeout for ${event.eventType}`)), 5000);
        });
      }
    } catch (error) {
      this.addTestResult('Event Entry Validation', false, error.message);
      throw error;
    }
  }

  async testEventEntrySubmission() {
    console.log('📤 Testing Event Entry Submission...');

    try {
      for (const event of testEvents) {
        const eventData = {
          matchId: TEST_MATCH_ID,
          ...event
        };

        await new Promise((resolve, reject) => {
          this.socket.emit('submit-event-entry', eventData);
          
          this.socket.once('event-entry-submitted', (response) => {
            if (response.success) {
              this.addTestResult(`Submission: ${event.eventType}`, true, `Event submitted: ${response.eventId}`);
            } else {
              this.addTestResult(`Submission: ${event.eventType}`, false, response.message);
            }
            resolve();
          });

          setTimeout(() => reject(new Error(`Submission timeout for ${event.eventType}`)), 5000);
        });

        // Wait a bit between submissions
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      this.addTestResult('Event Entry Submission', false, error.message);
      throw error;
    }
  }

  async testRESTAPIEndpoints() {
    console.log('🌐 Testing REST API Endpoints...');

    try {
      // Test form configuration endpoint
      const configResponse = await axios.get(`${BACKEND_URL}/api/event-entry/config`);
      if (configResponse.status === 200 && configResponse.data.eventTypes) {
        this.addTestResult('REST API: Form Config', true, 'Form configuration retrieved successfully');
      } else {
        this.addTestResult('REST API: Form Config', false, 'Invalid response format');
      }

      // Test session statistics endpoint
      const statsResponse = await axios.get(`${BACKEND_URL}/api/event-entry/sessions/stats/${TEST_MATCH_ID}`);
      if (statsResponse.status === 200) {
        this.addTestResult('REST API: Session Stats', true, 'Session statistics retrieved successfully');
      } else {
        this.addTestResult('REST API: Session Stats', false, 'Failed to get session statistics');
      }

      // Test active sessions endpoint
      const sessionsResponse = await axios.get(`${BACKEND_URL}/api/event-entry/sessions/active/${TEST_MATCH_ID}`);
      if (sessionsResponse.status === 200) {
        this.addTestResult('REST API: Active Sessions', true, 'Active sessions retrieved successfully');
      } else {
        this.addTestResult('REST API: Active Sessions', false, 'Failed to get active sessions');
      }

    } catch (error) {
      this.addTestResult('REST API Endpoints', false, error.message);
    }
  }

  async testRealTimeEventBroadcasting() {
    console.log('📡 Testing Real-time Event Broadcasting...');

    try {
      // Listen for match events
      await new Promise((resolve, reject) => {
        this.socket.once('match-event', (event) => {
          if (event.type && event.matchId === TEST_MATCH_ID) {
            this.addTestResult('Real-time Event Broadcasting', true, `Event broadcasted: ${event.type}`);
            resolve();
          }
        });

        // Submit a test event to trigger broadcasting
        this.socket.emit('submit-event-entry', {
          matchId: TEST_MATCH_ID,
          eventType: 'goal',
          minute: 90,
          teamId: TEST_TEAM_ID,
          playerId: 'test_player',
          goalType: 'penalty'
        });

        setTimeout(() => reject(new Error('Event broadcasting timeout')), 5000);
      });

    } catch (error) {
      this.addTestResult('Real-time Event Broadcasting', false, error.message);
    }
  }

  async testSessionCleanup() {
    console.log('🧹 Testing Session Cleanup...');

    try {
      // End event entry session
      await new Promise((resolve, reject) => {
        this.socket.emit('end-event-entry', { sessionId: this.sessionId });
        
        this.socket.once('event-entry-ended', (data) => {
          if (data.sessionId === this.sessionId) {
            this.addTestResult('Session Cleanup', true, 'Session ended successfully');
            resolve();
          } else {
            reject(new Error('Session ID mismatch'));
          }
        });

        setTimeout(() => reject(new Error('Session cleanup timeout')), 5000);
      });

    } catch (error) {
      this.addTestResult('Session Cleanup', false, error.message);
    }
  }

  async testErrorHandling() {
    console.log('⚠️ Testing Error Handling...');

    try {
      // Test invalid event submission
      await new Promise((resolve, reject) => {
        this.socket.emit('submit-event-entry', {
          matchId: '',
          eventType: '',
          minute: -1,
          teamId: ''
        });
        
        this.socket.once('event-entry-submitted', (response) => {
          if (!response.success) {
            this.addTestResult('Error Handling: Invalid Data', true, 'Properly rejected invalid data');
            resolve();
          } else {
            reject(new Error('Invalid data was accepted'));
          }
        });

        setTimeout(() => reject(new Error('Error handling timeout')), 5000);
      });

      // Test permission validation
      await new Promise((resolve, reject) => {
        this.socket.emit('submit-event-entry', {
          matchId: 'unauthorized_match',
          eventType: 'goal',
          minute: 10,
          teamId: 'unauthorized_team',
          playerId: 'test_player'
        });
        
        this.socket.once('error', (error) => {
          if (error.message.includes('permission')) {
            this.addTestResult('Error Handling: Permissions', true, 'Properly rejected unauthorized access');
            resolve();
          } else {
            reject(new Error('Permission check failed'));
          }
        });

        setTimeout(() => reject(new Error('Permission check timeout')), 5000);
      });

    } catch (error) {
      this.addTestResult('Error Handling', false, error.message);
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');

    try {
      const startTime = Date.now();
      const eventCount = 10;
      const promises = [];

      // Submit multiple events rapidly
      for (let i = 0; i < eventCount; i++) {
        const promise = new Promise((resolve, reject) => {
          this.socket.emit('submit-event-entry', {
            matchId: TEST_MATCH_ID,
            eventType: 'shot',
            minute: 50 + i,
            teamId: TEST_TEAM_ID,
            playerId: `player_${i}`,
            shotType: 'long_range'
          });
          
          this.socket.once('event-entry-submitted', (response) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.message));
            }
          });
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      const eventsPerSecond = (eventCount / duration) * 1000;

      this.addTestResult('Performance: Bulk Events', true, 
        `${eventCount} events processed in ${duration}ms (${eventsPerSecond.toFixed(2)} events/sec)`);

    } catch (error) {
      this.addTestResult('Performance Testing', false, error.message);
    }
  }

  async testIntegration() {
    console.log('🔗 Testing Integration...');

    try {
      // Test integration with match state updates
      await new Promise((resolve, reject) => {
        this.socket.once('match-event', (event) => {
          // Check if match state is updated
          setTimeout(async () => {
            try {
              const matchStateResponse = await axios.get(`${BACKEND_URL}/api/matches/${TEST_MATCH_ID}/state`);
              if (matchStateResponse.status === 200) {
                this.addTestResult('Integration: Match State Updates', true, 'Match state updated after event');
                resolve();
              } else {
                reject(new Error('Failed to get updated match state'));
              }
            } catch (error) {
              reject(new Error('Match state integration failed'));
            }
          }, 1000);
        });

        // Submit a test event
        this.socket.emit('submit-event-entry', {
          matchId: TEST_MATCH_ID,
          eventType: 'goal',
          minute: 95,
          teamId: TEST_TEAM_ID,
          playerId: 'integration_test_player',
          goalType: 'counter_attack'
        });

        setTimeout(() => reject(new Error('Integration test timeout')), 10000);
      });

    } catch (error) {
      this.addTestResult('Integration Testing', false, error.message);
    }
  }

  addTestResult(testName, passed, message) {
    const result = {
      test: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
  }

  printTestResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const successRate = ((passed / total) * 100).toFixed(1);
    
    console.log(`\nOverall Success Rate: ${successRate}% (${passed}/${total})`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! The Event Entry System is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check the implementation.');
      
      const failedTests = this.testResults.filter(r => !r.passed);
      console.log('\nFailed Tests:');
      failedTests.forEach(test => {
        console.log(`❌ ${test.test}: ${test.message}`);
      });
    }
  }

  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Run the tests
async function main() {
  console.log('🏟️ Event Entry System Test Suite');
  console.log('================================\n');
  
  const tester = new EventEntrySystemTester();
  await tester.runTests();
}

// Check if backend is running
async function checkBackend() {
  try {
    const response = await axios.get('http://localhost:3001/health');
    if (response.status === 200) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main execution
if (require.main === module) {
  checkBackend().then(isRunning => {
    if (isRunning) {
      main().catch(console.error);
    } else {
      console.error('❌ Backend server is not running. Please start the server first.');
      console.log('💡 Run: cd backend && npm run dev');
      process.exit(1);
    }
  });
}

module.exports = EventEntrySystemTester;
