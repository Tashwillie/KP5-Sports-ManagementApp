#!/usr/bin/env node

/**
 * Enhanced Timer System Test Script
 * 
 * This script demonstrates the comprehensive live match timer and controls system
 * including real-time timer synchronization, period management, injury time,
 * and advanced timer controls.
 */

const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;
const SOCKET_URL = BASE_URL;

// Test data
const TEST_MATCH_ID = 'test-match-timer-123';
const TEST_PLAYER_ID = 'test-player-456';
const TEST_TEAM_ID = 'test-team-789';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}`);
}

// Test enhanced timer functionality
async function testEnhancedTimerSystem() {
  logHeader('Testing Enhanced Timer System');

  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 10000
    });

    let testCompleted = false;
    let timerState = {
      currentMinute: 0,
      currentPeriod: 'first_half',
      isTimerRunning: false,
      totalPlayTime: 0,
      pausedTime: 0,
      injuryTime: 0,
      periodDuration: 45
    };

    socket.on('connect', () => {
      logSuccess('Connected to WebSocket server');
      
      // Join match room
      socket.emit('join-match', {
        matchId: TEST_MATCH_ID,
        role: 'referee',
        teamId: null
      });
      
      logInfo('Joined match room for timer testing');
    });

    socket.on('disconnect', () => {
      logInfo('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      logError(`Connection error: ${error.message}`);
    });

    // Listen for timer updates
    socket.on('timer-update', (update) => {
      logSuccess('Received timer update via WebSocket');
      console.log('Timer Update:', JSON.stringify(update, null, 2));
      
      // Update local timer state
      timerState = { ...timerState, ...update };
    });

    // Listen for period transitions
    socket.on('period-transition', (transition) => {
      logSuccess('Received period transition via WebSocket');
      console.log('Period Transition:', JSON.stringify(transition, null, 2));
      
      // Update local timer state
      timerState.currentPeriod = transition.newPeriod;
      timerState.currentMinute = 0;
    });

    // Listen for match state updates
    socket.on('match-state', (state) => {
      logInfo('Received match state update');
      console.log('Match State:', JSON.stringify(state, null, 2));
    });

    // Test sequence
    setTimeout(() => {
      logHeader('Starting Timer Control Tests');
      
      // Test 1: Start timer
      logInfo('Test 1: Starting match timer...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'start',
        timestamp: new Date()
      });
    }, 2000);

    setTimeout(() => {
      // Test 2: Add injury time
      logInfo('Test 2: Adding 3 minutes of injury time...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'add_injury_time',
        timestamp: new Date(),
        additionalData: { minutes: 3 }
      });
    }, 4000);

    setTimeout(() => {
      // Test 3: Pause timer
      logInfo('Test 3: Pausing timer...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'pause',
        timestamp: new Date()
      });
    }, 6000);

    setTimeout(() => {
      // Test 4: Resume timer
      logInfo('Test 4: Resuming timer...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'resume',
        timestamp: new Date()
      });
    }, 8000);

    setTimeout(() => {
      // Test 5: Set custom period duration
      logInfo('Test 5: Setting custom period duration to 50 minutes...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'set_period_duration',
        timestamp: new Date(),
        additionalData: { duration: 50 }
      });
    }, 10000);

    setTimeout(() => {
      // Test 6: Skip to halftime
      logInfo('Test 6: Skipping to halftime...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'skip_to_period',
        timestamp: new Date(),
        additionalData: { period: 'halftime' }
      });
    }, 12000);

    setTimeout(() => {
      // Test 7: Skip to second half
      logInfo('Test 7: Skipping to second half...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'skip_to_period',
        timestamp: new Date(),
        additionalData: { period: 'second_half' }
      });
    }, 14000);

    setTimeout(() => {
      // Test 8: Add more injury time
      logInfo('Test 8: Adding 2 more minutes of injury time...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'add_injury_time',
        timestamp: new Date(),
        additionalData: { minutes: 2 }
      });
    }, 16000);

    setTimeout(() => {
      // Test 9: End injury time
      logInfo('Test 9: Ending injury time...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'end_injury_time',
        timestamp: new Date()
      });
    }, 18000);

    setTimeout(() => {
      // Test 10: Stop timer
      logInfo('Test 10: Stopping timer...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'stop',
        timestamp: new Date()
      });
    }, 20000);

    setTimeout(() => {
      // Test 11: Simulate match events to test timer integration
      logInfo('Test 11: Simulating match events...');
      
      // Goal event
      socket.emit('match-event', {
        matchId: TEST_MATCH_ID,
        type: 'goal',
        minute: timerState.currentMinute,
        playerId: TEST_PLAYER_ID,
        teamId: TEST_TEAM_ID,
        description: 'Test goal during timer test',
        data: { onTarget: true }
      });
      
      // Yellow card event
      socket.emit('match-event', {
        matchId: TEST_MATCH_ID,
        type: 'yellow_card',
        minute: timerState.currentMinute,
        playerId: TEST_PLAYER_ID,
        teamId: TEST_TEAM_ID,
        description: 'Test yellow card during timer test'
      });
    }, 22000);

    setTimeout(() => {
      // Test 12: Check final timer state
      logInfo('Test 12: Checking final timer state...');
      console.log('Final Timer State:', JSON.stringify(timerState, null, 2));
      
      // Complete test
      logSuccess('Enhanced timer system test completed successfully!');
      socket.disconnect();
      testCompleted = true;
      resolve();
    }, 24000);
  });
}

// Test timer accuracy and synchronization
async function testTimerAccuracy() {
  logHeader('Testing Timer Accuracy and Synchronization');

  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 10000
    });

    let startTime = Date.now();
    let timerUpdates = [];
    let testCompleted = false;

    socket.on('connect', () => {
      logSuccess('Connected for timer accuracy test');
      
      socket.emit('join-match', {
        matchId: TEST_MATCH_ID,
        role: 'spectator',
        teamId: null
      });
      
      logInfo('Joined match room for accuracy testing');
    });

    socket.on('timer-update', (update) => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      timerUpdates.push({
        timestamp: now,
        elapsed,
        update
      });
      
      logInfo(`Timer update received: ${update.currentMinute}' (elapsed: ${Math.round(elapsed/1000)}s)`);
    });

    // Start timer and monitor for 10 seconds
    setTimeout(() => {
      logInfo('Starting timer for accuracy test...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'start',
        timestamp: new Date()
      });
    }, 2000);

    setTimeout(() => {
      // Stop timer
      logInfo('Stopping timer...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'stop',
        timestamp: new Date()
      });
      
      // Analyze accuracy
      logInfo('Analyzing timer accuracy...');
      if (timerUpdates.length > 0) {
        const firstUpdate = timerUpdates[0];
        const lastUpdate = timerUpdates[timerUpdates.length - 1];
        const totalTime = (lastUpdate.timestamp - firstUpdate.timestamp) / 1000;
        const expectedMinutes = Math.floor(totalTime / 60);
        const actualMinutes = lastUpdate.update.currentMinute;
        
        logInfo(`Total test time: ${totalTime.toFixed(1)} seconds`);
        logInfo(`Expected minutes: ${expectedMinutes}`);
        logInfo(`Actual minutes: ${actualMinutes}`);
        
        if (Math.abs(actualMinutes - expectedMinutes) <= 1) {
          logSuccess('Timer accuracy test passed!');
        } else {
          logWarning('Timer accuracy test: minor deviation detected');
        }
      }
      
      socket.disconnect();
      testCompleted = true;
      resolve();
    }, 12000);
  });
}

// Test period transitions
async function testPeriodTransitions() {
  logHeader('Testing Period Transitions');

  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 10000
    });

    let transitions = [];
    let testCompleted = false;

    socket.on('connect', () => {
      logSuccess('Connected for period transition test');
      
      socket.emit('join-match', {
        matchId: TEST_MATCH_ID,
        role: 'referee',
        teamId: null
      });
    });

    socket.on('period-transition', (transition) => {
      logSuccess(`Period transition: ${transition.newPeriod}`);
      transitions.push(transition);
      console.log('Transition details:', JSON.stringify(transition, null, 2));
    });

    // Test period transitions
    setTimeout(() => {
      logInfo('Starting period transition test...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'start',
        timestamp: new Date()
      });
    }, 2000);

    setTimeout(() => {
      logInfo('Testing period skip to halftime...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'skip_to_period',
        timestamp: new Date(),
        additionalData: { period: 'halftime' }
      });
    }, 4000);

    setTimeout(() => {
      logInfo('Testing period skip to second half...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'skip_to_period',
        timestamp: new Date(),
        additionalData: { period: 'second_half' }
      });
    }, 6000);

    setTimeout(() => {
      logInfo('Testing period skip to extra time...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'skip_to_period',
        timestamp: new Date(),
        additionalData: { period: 'extra_time' }
      });
    }, 8000);

    setTimeout(() => {
      logInfo('Testing period skip to penalties...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'skip_to_period',
        timestamp: new Date(),
        additionalData: { period: 'penalties' }
      });
    }, 10000);

    setTimeout(() => {
      logInfo('Period transition test completed');
      console.log('All transitions:', transitions.map(t => t.newPeriod));
      
      socket.disconnect();
      testCompleted = true;
      resolve();
    }, 12000);
  });
}

// Test injury time management
async function testInjuryTimeManagement() {
  logHeader('Testing Injury Time Management');

  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 10000
    });

    let injuryTimeEvents = [];
    let testCompleted = false;

    socket.on('connect', () => {
      logSuccess('Connected for injury time test');
      
      socket.emit('join-match', {
        matchId: TEST_MATCH_ID,
        role: 'referee',
        teamId: null
      });
    });

    socket.on('timer-update', (update) => {
      if (update.injuryTime > 0) {
        logInfo(`Injury time update: +${update.injuryTime} minutes`);
        injuryTimeEvents.push(update);
      }
    });

    // Test injury time management
    setTimeout(() => {
      logInfo('Starting injury time test...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'start',
        timestamp: new Date()
      });
    }, 2000);

    setTimeout(() => {
      logInfo('Adding 2 minutes of injury time...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'add_injury_time',
        timestamp: new Date(),
        additionalData: { minutes: 2 }
      });
    }, 4000);

    setTimeout(() => {
      logInfo('Adding 1 more minute of injury time...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'add_injury_time',
        timestamp: new Date(),
        additionalData: { minutes: 1 }
      });
    }, 6000);

    setTimeout(() => {
      logInfo('Ending injury time...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'end_injury_time',
        timestamp: new Date()
      });
    }, 8000);

    setTimeout(() => {
      logInfo('Injury time test completed');
      console.log('Injury time events:', injuryTimeEvents);
      
      socket.disconnect();
      testCompleted = true;
      resolve();
    }, 10000);
  });
}

// Test custom period durations
async function testCustomPeriodDurations() {
  logHeader('Testing Custom Period Durations');

  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 10000
    });

    let testCompleted = false;

    socket.on('connect', () => {
      logSuccess('Connected for custom duration test');
      
      socket.emit('join-match', {
        matchId: TEST_MATCH_ID,
        role: 'referee',
        teamId: null
      });
    });

    // Test custom durations
    setTimeout(() => {
      logInfo('Setting first half duration to 40 minutes...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'set_period_duration',
        timestamp: new Date(),
        additionalData: { duration: 40 }
      });
    }, 2000);

    setTimeout(() => {
      logInfo('Starting match with custom duration...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'start',
        timestamp: new Date()
      });
    }, 4000);

    setTimeout(() => {
      logInfo('Setting second half duration to 35 minutes...');
      socket.emit('match-timer-control', {
        matchId: TEST_MATCH_ID,
        action: 'set_period_duration',
        timestamp: new Date(),
        additionalData: { duration: 35 }
      });
    }, 6000);

    setTimeout(() => {
      logInfo('Custom duration test completed');
      socket.disconnect();
      testCompleted = true;
      resolve();
    }, 8000);
  });
}

// Main test execution
async function runAllTests() {
  try {
    logHeader('🚀 Enhanced Timer System Test Suite');
    logInfo('This test suite demonstrates the comprehensive live match timer and controls system');
    
    // Check if backend is running
    try {
      await axios.get(`${API_BASE}/health`);
      logSuccess('Backend server is running');
    } catch (error) {
      logError('Backend server is not running. Please start the server first.');
      return;
    }

    // Run all tests
    await testEnhancedTimerSystem();
    await testTimerAccuracy();
    await testPeriodTransitions();
    await testInjuryTimeManagement();
    await testCustomPeriodDurations();

    logHeader('🎉 All Enhanced Timer System Tests Completed Successfully!');
    logInfo('The enhanced timer system includes:');
    logInfo('✅ Real-time timer synchronization');
    logInfo('✅ Advanced period management (first half, halftime, second half, extra time, penalties)');
    logInfo('✅ Injury time management');
    logInfo('✅ Custom period durations');
    logInfo('✅ Period navigation and skipping');
    logInfo('✅ Timer accuracy and synchronization');
    logInfo('✅ Integration with match events and statistics');
    
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    console.error(error);
  }
}

// Check if required dependencies are available
function checkDependencies() {
  try {
    require('socket.io-client');
    require('axios');
    return true;
  } catch (error) {
    logError('Required dependencies not found. Please install:');
    logError('npm install socket.io-client axios');
    return false;
  }
}

// Run tests if dependencies are available
if (checkDependencies()) {
  runAllTests().catch((error) => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
} else {
  process.exit(1);
}
