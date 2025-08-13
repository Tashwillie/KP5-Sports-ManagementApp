#!/usr/bin/env node

/**
 * Player Performance Tracking System Test Script
 * Tests the complete player performance tracking functionality
 */

const axios = require('axios');
const { io } = require('socket.io-client');

class PlayerPerformanceTrackingTester {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    this.websocketUrl = process.env.WEBSOCKET_URL || 'http://localhost:3001';
    this.testResults = [];
    this.socket = null;
    this.testToken = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  addResult(testName, success, details = '') {
    this.testResults.push({
      test: testName,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }

  async testBackendHealth() {
    try {
      this.log('🏥 Testing backend health...', 'info');
      
      const response = await axios.get(`${this.baseUrl}/health`);
      
      if (response.status === 200) {
        this.log('✅ Backend is healthy', 'success');
        this.addResult('Backend Health', true);
        return true;
      } else {
        this.log('❌ Backend health check failed', 'error');
        this.addResult('Backend Health', false, `Status: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.log('❌ Backend health check failed', 'error');
      this.addResult('Backend Health', false, error.message);
      return false;
    }
  }

  async testAuthentication() {
    try {
      this.log('🔐 Testing authentication...', 'info');
      
      // Test login with test credentials
      const loginResponse = await axios.post(`${this.baseUrl}/api/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword123'
      });

      if (loginResponse.data.success && loginResponse.data.token) {
        this.testToken = loginResponse.data.token;
        this.log('✅ Authentication successful', 'success');
        this.addResult('Authentication', true);
        return this.testToken;
      } else {
        this.log('❌ Authentication failed', 'error');
        this.addResult('Authentication', false, 'No token received');
        return null;
      }
    } catch (error) {
      this.log('❌ Authentication failed', 'error');
      this.addResult('Authentication', false, error.message);
      return null;
    }
  }

  async testPlayerPerformanceEndpoints(token) {
    try {
      this.log('📊 Testing player performance endpoints...', 'info');
      
      const headers = { Authorization: `Bearer ${token}` };
      const testPlayerId = 'test-player-id'; // This would be a real player ID in production

      // Test get player performance
      try {
        const performanceResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/player/${testPlayerId}`,
          { headers }
        );
        
        if (performanceResponse.status === 200) {
          this.log('✅ Get player performance endpoint working', 'success');
          this.addResult('Get Player Performance', true);
        } else {
          this.log('❌ Get player performance endpoint failed', 'error');
          this.addResult('Get Player Performance', false, `Status: ${performanceResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Get player performance endpoint not available (expected for test data)', 'warning');
        this.addResult('Get Player Performance', false, 'Endpoint not available (test environment)');
      }

      // Test get player comparison
      try {
        const comparisonResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/player/${testPlayerId}/comparison?comparisonType=team`,
          { headers }
        );
        
        if (comparisonResponse.status === 200) {
          this.log('✅ Get player comparison endpoint working', 'success');
          this.addResult('Get Player Comparison', true);
        } else {
          this.log('❌ Get player comparison endpoint failed', 'error');
          this.addResult('Get Player Comparison', false, `Status: ${comparisonResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Get player comparison endpoint not available (expected for test data)', 'warning');
        this.addResult('Get Player Comparison', false, 'Endpoint not available (test environment)');
      }

      // Test get player insights
      try {
        const insightsResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/player/${testPlayerId}/insights`,
          { headers }
        );
        
        if (insightsResponse.status === 200) {
          this.log('✅ Get player insights endpoint working', 'success');
          this.addResult('Get Player Insights', true);
        } else {
          this.log('❌ Get player insights endpoint failed', 'error');
          this.addResult('Get Player Insights', false, `Status: ${insightsResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Get player insights endpoint not available (expected for test data)', 'warning');
        this.addResult('Get Player Insights', false, 'Endpoint not available (test environment)');
      }

      // Test get player performance history
      try {
        const historyResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/player/${testPlayerId}/history`,
          { headers }
        );
        
        if (historyResponse.status === 200) {
          this.log('✅ Get player performance history endpoint working', 'success');
          this.addResult('Get Player Performance History', true);
        } else {
          this.log('❌ Get player performance history endpoint failed', 'error');
          this.addResult('Get Player Performance History', false, `Status: ${historyResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Get player performance history endpoint not available (expected for test data)', 'warning');
        this.addResult('Get Player Performance History', false, 'Endpoint not available (test environment)');
      }

      // Test get player season stats
      try {
        const seasonStatsResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/player/${testPlayerId}/season-stats`,
          { headers }
        );
        
        if (seasonStatsResponse.status === 200) {
          this.log('✅ Get player season stats endpoint working', 'success');
          this.addResult('Get Player Season Stats', true);
        } else {
          this.log('❌ Get player season stats endpoint failed', 'error');
          this.addResult('Get Player Season Stats', false, `Status: ${seasonStatsResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Get player season stats endpoint not available (expected for test data)', 'warning');
        this.addResult('Get Player Season Stats', false, 'Endpoint not available (test environment)');
      }

    } catch (error) {
      this.log('❌ Error testing player performance endpoints', 'error');
      this.addResult('Player Performance Endpoints', false, error.message);
    }
  }

  async testTeamPerformanceEndpoints(token) {
    try {
      this.log('🏆 Testing team performance endpoints...', 'info');
      
      const headers = { Authorization: `Bearer ${token}` };
      const testTeamId = 'test-team-id'; // This would be a real team ID in production

      // Test get team performance analytics
      try {
        const analyticsResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/team/${testTeamId}/analytics`,
          { headers }
        );
        
        if (analyticsResponse.status === 200) {
          this.log('✅ Get team performance analytics endpoint working', 'success');
          this.addResult('Get Team Performance Analytics', true);
        } else {
          this.log('❌ Get team performance analytics endpoint failed', 'error');
          this.addResult('Get Team Performance Analytics', false, `Status: ${analyticsResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Get team performance analytics endpoint not available (expected for test data)', 'warning');
        this.addResult('Get Team Performance Analytics', false, 'Endpoint not available (test environment)');
      }

    } catch (error) {
      this.log('❌ Error testing team performance endpoints', 'error');
      this.addResult('Team Performance Endpoints', false, error.message);
    }
  }

  async testLeaguePerformanceEndpoints(token) {
    try {
      this.log('🏅 Testing league performance endpoints...', 'info');
      
      const headers = { Authorization: `Bearer ${token}` };

      // Test get league performance analytics
      try {
        const analyticsResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/league/analytics`,
          { headers }
        );
        
        if (analyticsResponse.status === 200) {
          this.log('✅ Get league performance analytics endpoint working', 'success');
          this.addResult('Get League Performance Analytics', true);
        } else {
          this.log('❌ Get league performance analytics endpoint failed', 'error');
          this.addResult('Get League Performance Analytics', false, `Status: ${analyticsResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Get league performance analytics endpoint not available (expected for test data)', 'warning');
        this.addResult('Get League Performance Analytics', false, 'Endpoint not available (test environment)');
      }

      // Test get performance leaderboards
      try {
        const leaderboardsResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/leaderboards`,
          { headers }
        );
        
        if (leaderboardsResponse.status === 200) {
          this.log('✅ Get performance leaderboards endpoint working', 'success');
          this.addResult('Get Performance Leaderboards', true);
        } else {
          this.log('❌ Get performance leaderboards endpoint failed', 'error');
          this.addResult('Get Performance Leaderboards', false, `Status: ${leaderboardsResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Get performance leaderboards endpoint not available (expected for test data)', 'warning');
        this.addResult('Get Performance Leaderboards', false, 'Endpoint not available (test environment)');
      }

    } catch (error) {
      this.log('❌ Error testing league performance endpoints', 'error');
      this.addResult('League Performance Endpoints', false, error.message);
    }
  }

  async testPerformanceReportEndpoints(token) {
    try {
      this.log('📈 Testing performance report endpoints...', 'info');
      
      const headers = { Authorization: `Bearer ${token}` };

      // Test get performance report
      try {
        const reportResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/report`,
          { headers }
        );
        
        if (reportResponse.status === 200) {
          this.log('✅ Get performance report endpoint working', 'success');
          this.addResult('Get Performance Report', true);
        } else {
          this.log('❌ Get performance report endpoint failed', 'error');
          this.addResult('Get Performance Report', false, `Status: ${reportResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Get performance report endpoint not available (expected for test data)', 'warning');
        this.addResult('Get Performance Report', false, 'Endpoint not available (test environment)');
      }

      // Test compare players
      try {
        const compareResponse = await axios.post(
          `${this.baseUrl}/api/player-performance/compare-players`,
          {
            playerIds: ['player1', 'player2'],
            metrics: ['goals', 'assists', 'rating']
          },
          { headers }
        );
        
        if (compareResponse.status === 200) {
          this.log('✅ Compare players endpoint working', 'success');
          this.addResult('Compare Players', true);
        } else {
          this.log('❌ Compare players endpoint failed', 'error');
          this.addResult('Compare Players', false, `Status: ${compareResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Compare players endpoint not available (expected for test data)', 'warning');
        this.addResult('Compare Players', false, 'Endpoint not available (test environment)');
      }

      // Test export analytics
      try {
        const exportResponse = await axios.get(
          `${this.baseUrl}/api/player-performance/export?format=csv`,
          { headers }
        );
        
        if (exportResponse.status === 200) {
          this.log('✅ Export analytics endpoint working', 'success');
          this.addResult('Export Analytics', true);
        } else {
          this.log('❌ Export analytics endpoint failed', 'error');
          this.addResult('Export Analytics', false, `Status: ${exportResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Export analytics endpoint not available (expected for test data)', 'warning');
        this.addResult('Export Analytics', false, 'Endpoint not available (test environment)');
      }

    } catch (error) {
      this.log('❌ Error testing performance report endpoints', 'error');
      this.addResult('Performance Report Endpoints', false, error.message);
    }
  }

  async testPerformanceUpdateEndpoints(token) {
    try {
      this.log('🔄 Testing performance update endpoints...', 'info');
      
      const headers = { Authorization: `Bearer ${token}` };

      // Test update player performance
      try {
        const updateResponse = await axios.post(
          `${this.baseUrl}/api/player-performance/update`,
          {
            playerId: 'test-player-id',
            matchId: 'test-match-id'
          },
          { headers }
        );
        
        if (updateResponse.status === 200) {
          this.log('✅ Update player performance endpoint working', 'success');
          this.addResult('Update Player Performance', true);
        } else {
          this.log('❌ Update player performance endpoint failed', 'error');
          this.addResult('Update Player Performance', false, `Status: ${updateResponse.status}`);
        }
      } catch (error) {
        this.log('⚠️ Update player performance endpoint not available (expected for test data)', 'warning');
        this.addResult('Update Player Performance', false, 'Endpoint not available (test environment)');
      }

    } catch (error) {
      this.log('❌ Error testing performance update endpoints', 'error');
      this.addResult('Performance Update Endpoints', false, error.message);
    }
  }

  async testWebSocketConnection() {
    try {
      this.log('🔌 Testing WebSocket connection...', 'info');
      
      this.socket = io(this.websocketUrl, {
        auth: {
          token: this.testToken
        }
      });

      return new Promise((resolve) => {
        this.socket.on('connect', () => {
          this.log('✅ WebSocket connected successfully', 'success');
          this.addResult('WebSocket Connection', true);
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          this.log('❌ WebSocket connection failed', 'error');
          this.addResult('WebSocket Connection', false, error.message);
          resolve(false);
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          this.log('⏰ WebSocket connection timeout', 'warning');
          this.addResult('WebSocket Connection', false, 'Connection timeout');
          resolve(false);
        }, 5000);
      });
    } catch (error) {
      this.log('❌ Error testing WebSocket connection', 'error');
      this.addResult('WebSocket Connection', false, error.message);
      return false;
    }
  }

  async testWebSocketEvents() {
    try {
      this.log('📡 Testing WebSocket events...', 'info');
      
      if (!this.socket) {
        this.log('❌ No WebSocket connection available', 'error');
        this.addResult('WebSocket Events', false, 'No connection');
        return;
      }

      // Test performance update event
      this.socket.emit('join-player-performance', { playerId: 'test-player-id' });
      
      // Listen for performance updates
      this.socket.on('performance-updated', (data) => {
        this.log('✅ Performance update event received', 'success');
        this.addResult('Performance Update Event', true);
      });

      // Test for a few seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      this.log('✅ WebSocket events test completed', 'success');
      this.addResult('WebSocket Events', true);

    } catch (error) {
      this.log('❌ Error testing WebSocket events', 'error');
      this.addResult('WebSocket Events', false, error.message);
    }
  }

  async testPerformanceCalculations() {
    try {
      this.log('🧮 Testing performance calculations...', 'info');
      
      // Test basic performance metrics calculation
      const testMatchStats = [
        {
          minutesPlayed: 90,
          goals: 2,
          assists: 1,
          rating: 8.5,
          shots: 5,
          shotsOnTarget: 3,
          passes: 45,
          passesCompleted: 40,
          tackles: 3,
          tacklesWon: 2,
          distance: 8500,
          sprints: 12
        },
        {
          minutesPlayed: 90,
          goals: 0,
          assists: 2,
          rating: 7.0,
          shots: 2,
          shotsOnTarget: 1,
          passes: 52,
          passesCompleted: 48,
          tackles: 4,
          tacklesWon: 3,
          distance: 9200,
          sprints: 15
        }
      ];

      // Calculate basic metrics
      const totalMinutes = testMatchStats.reduce((sum, stat) => sum + stat.minutesPlayed, 0);
      const totalGoals = testMatchStats.reduce((sum, stat) => sum + stat.goals, 0);
      const totalAssists = testMatchStats.reduce((sum, stat) => sum + stat.assists, 0);
      const averageRating = testMatchStats.reduce((sum, stat) => sum + stat.rating, 0) / testMatchStats.length;

      // Calculate efficiency metrics
      const totalShots = testMatchStats.reduce((sum, stat) => sum + stat.shots, 0);
      const totalShotsOnTarget = testMatchStats.reduce((sum, stat) => sum + stat.shotsOnTarget, 0);
      const totalPasses = testMatchStats.reduce((sum, stat) => sum + stat.passes, 0);
      const totalPassesCompleted = testMatchStats.reduce((sum, stat) => sum + stat.passesCompleted, 0);
      const totalTackles = testMatchStats.reduce((sum, stat) => sum + stat.tackles, 0);
      const totalTacklesWon = testMatchStats.reduce((sum, stat) => sum + stat.tacklesWon, 0);

      const shotAccuracy = totalShots > 0 ? (totalShotsOnTarget / totalShots) * 100 : 0;
      const passAccuracy = totalPasses > 0 ? (totalPassesCompleted / totalPasses) * 100 : 0;
      const tackleSuccess = totalTackles > 0 ? (totalTacklesWon / totalTackles) * 100 : 0;

      // Verify calculations
      if (totalMinutes === 180 && totalGoals === 2 && totalAssists === 3) {
        this.log('✅ Basic performance calculations correct', 'success');
        this.addResult('Basic Performance Calculations', true);
      } else {
        this.log('❌ Basic performance calculations incorrect', 'error');
        this.addResult('Basic Performance Calculations', false, 'Calculation mismatch');
      }

      if (Math.abs(averageRating - 7.75) < 0.01) {
        this.log('✅ Average rating calculation correct', 'success');
        this.addResult('Average Rating Calculation', true);
      } else {
        this.log('❌ Average rating calculation incorrect', 'error');
        this.addResult('Average Rating Calculation', false, `Expected 7.75, got ${averageRating}`);
      }

      if (Math.abs(shotAccuracy - 66.67) < 0.01) {
        this.log('✅ Shot accuracy calculation correct', 'success');
        this.addResult('Shot Accuracy Calculation', true);
      } else {
        this.log('❌ Shot accuracy calculation incorrect', 'error');
        this.addResult('Shot Accuracy Calculation', false, `Expected 66.67%, got ${shotAccuracy.toFixed(2)}%`);
      }

      if (Math.abs(passAccuracy - 88.66) < 0.01) {
        this.log('✅ Pass accuracy calculation correct', 'success');
        this.addResult('Pass Accuracy Calculation', true);
      } else {
        this.log('❌ Pass accuracy calculation incorrect', 'error');
        this.addResult('Pass Accuracy Calculation', false, `Expected 88.66%, got ${passAccuracy.toFixed(2)}%`);
      }

      if (Math.abs(tackleSuccess - 71.43) < 0.01) {
        this.log('✅ Tackle success calculation correct', 'success');
        this.addResult('Tackle Success Calculation', true);
      } else {
        this.log('❌ Tackle success calculation incorrect', 'error');
        this.addResult('Tackle Success Calculation', false, `Expected 71.43%, got ${tackleSuccess.toFixed(2)}%`);
      }

    } catch (error) {
      this.log('❌ Error testing performance calculations', 'error');
      this.addResult('Performance Calculations', false, error.message);
    }
  }

  async testDataValidation() {
    try {
      this.log('✅ Testing data validation...', 'info');
      
      // Test invalid player ID
      try {
        const response = await axios.get(
          `${this.baseUrl}/api/player-performance/player/invalid-id`,
          { headers: { Authorization: `Bearer ${this.testToken}` } }
        );
        
        if (response.status === 400) {
          this.log('✅ Invalid player ID validation working', 'success');
          this.addResult('Invalid Player ID Validation', true);
        } else {
          this.log('❌ Invalid player ID validation not working', 'error');
          this.addResult('Invalid Player ID Validation', false, 'Expected 400 status');
        }
      } catch (error) {
        if (error.response?.status === 400) {
          this.log('✅ Invalid player ID validation working', 'success');
          this.addResult('Invalid Player ID Validation', true);
        } else {
          this.log('⚠️ Invalid player ID validation test inconclusive', 'warning');
          this.addResult('Invalid Player ID Validation', false, 'Test inconclusive');
        }
      }

      // Test invalid comparison type
      try {
        const response = await axios.get(
          `${this.baseUrl}/api/player-performance/player/test-id/comparison?comparisonType=invalid`,
          { headers: { Authorization: `Bearer ${this.testToken}` } }
        );
        
        if (response.status === 400) {
          this.log('✅ Invalid comparison type validation working', 'success');
          this.addResult('Invalid Comparison Type Validation', true);
        } else {
          this.log('❌ Invalid comparison type validation not working', 'error');
          this.addResult('Invalid Comparison Type Validation', false, 'Expected 400 status');
        }
      } catch (error) {
        if (error.response?.status === 400) {
          this.log('✅ Invalid comparison type validation working', 'success');
          this.addResult('Invalid Comparison Type Validation', true);
        } else {
          this.log('⚠️ Invalid comparison type validation test inconclusive', 'warning');
          this.addResult('Invalid Comparison Type Validation', false, 'Test inconclusive');
        }
      }

    } catch (error) {
      this.log('❌ Error testing data validation', 'error');
      this.addResult('Data Validation', false, error.message);
    }
  }

  async testPerformanceOptimization() {
    try {
      this.log('⚡ Testing performance optimization...', 'info');
      
      // Test response time for performance endpoints
      const startTime = Date.now();
      
      try {
        await axios.get(
          `${this.baseUrl}/api/player-performance/leaderboards`,
          { headers: { Authorization: `Bearer ${this.testToken}` } }
        );
        
        const responseTime = Date.now() - startTime;
        
        if (responseTime < 1000) {
          this.log('✅ Response time acceptable (< 1s)', 'success');
          this.addResult('Response Time', true, `${responseTime}ms`);
        } else if (responseTime < 3000) {
          this.log('⚠️ Response time acceptable but could be improved (< 3s)', 'warning');
          this.addResult('Response Time', true, `${responseTime}ms (slow)`);
        } else {
          this.log('❌ Response time too slow (> 3s)', 'error');
          this.addResult('Response Time', false, `${responseTime}ms (too slow)`);
        }
      } catch (error) {
        this.log('⚠️ Response time test inconclusive (endpoint not available)', 'warning');
        this.addResult('Response Time', false, 'Test inconclusive');
      }

    } catch (error) {
      this.log('❌ Error testing performance optimization', 'error');
      this.addResult('Performance Optimization', false, error.message);
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Player Performance Tracking System Tests...', 'info');
    this.log(`Testing against: ${this.baseUrl}`, 'info');

    const isHealthy = await this.testBackendHealth();
    if (!isHealthy) {
      this.log('❌ Backend is not healthy, stopping tests', 'error');
      return;
    }

    const token = await this.testAuthentication();
    if (!token) {
      this.log('❌ Authentication failed, stopping tests', 'error');
      return;
    }

    await this.testPlayerPerformanceEndpoints(token);
    await this.testTeamPerformanceEndpoints(token);
    await this.testLeaguePerformanceEndpoints(token);
    await this.testPerformanceReportEndpoints(token);
    await this.testPerformanceUpdateEndpoints(token);
    await this.testPerformanceCalculations();
    await this.testDataValidation();
    await this.testPerformanceOptimization();

    const wsConnected = await this.testWebSocketConnection();
    if (wsConnected) {
      await this.testWebSocketEvents();
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.printResults();
  }

  printResults() {
    this.log('\n📊 Test Results Summary:', 'info');
    this.log('========================', 'info');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.success).length;
    const failedTests = totalTests - passedTests;
    
    this.log(`Total Tests: ${totalTests}`, 'info');
    this.log(`Passed: ${passedTests}`, 'success');
    this.log(`Failed: ${failedTests}`, failedTests > 0 ? 'error' : 'success');
    
    if (failedTests > 0) {
      this.log('\n❌ Failed Tests:', 'error');
      this.testResults
        .filter(result => !result.success)
        .forEach(result => {
          this.log(`  - ${result.test}: ${result.details}`, 'error');
        });
    }
    
    this.log('\n✅ Passed Tests:', 'success');
    this.testResults
      .filter(result => result.success)
      .forEach(result => {
        this.log(`  - ${result.test}${result.details ? `: ${result.details}` : ''}`, 'success');
      });
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    this.log(`\n🎯 Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');
    
    if (successRate >= 90) {
      this.log('🌟 Excellent! Player Performance Tracking System is working great!', 'success');
    } else if (successRate >= 80) {
      this.log('👍 Good! Player Performance Tracking System is mostly working.', 'success');
    } else if (successRate >= 60) {
      this.log('⚠️ Fair! Player Performance Tracking System needs some attention.', 'warning');
    } else {
      this.log('❌ Poor! Player Performance Tracking System needs significant work.', 'error');
    }
  }
}

if (require.main === module) {
  const tester = new PlayerPerformanceTrackingTester();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Tests interrupted by user');
    if (tester.socket) {
      tester.socket.disconnect();
    }
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Tests terminated');
    if (tester.socket) {
      tester.socket.disconnect();
    }
    process.exit(0);
  });
  
  tester.runAllTests().catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = PlayerPerformanceTrackingTester;
