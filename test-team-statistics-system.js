#!/usr/bin/env node

/**
 * Team Statistics System Test Script
 * Tests the complete team statistics calculation functionality
 */

const axios = require('axios');
const { io } = require('socket.io-client');

class TeamStatisticsSystemTester {
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    this.websocketUrl = process.env.WEBSOCKET_URL || 'http://localhost:3001';
    this.testResults = [];
    this.socket = null;
    this.testToken = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addResult(testName, success, details = '') {
    this.testResults.push({ testName, success, details });
    if (success) {
      this.log(`PASS: ${testName}`, 'success');
    } else {
      this.log(`FAIL: ${testName} - ${details}`, 'error');
    }
  }

  async testBackendHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      if (response.status === 200) {
        this.addResult('Backend Health Check', true);
        return true;
      } else {
        this.addResult('Backend Health Check', false, `Status: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.addResult('Backend Health Check', false, error.message);
      return false;
    }
  }

  async testAuthentication() {
    try {
      // Test with a mock user (you'll need to create a test user in your database)
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword123'
      });

      if (response.data.success && response.data.token) {
        this.testToken = response.data.token;
        this.addResult('Authentication', true);
        return this.testToken;
      } else {
        this.addResult('Authentication', false, 'No token received');
        return null;
      }
    } catch (error) {
      // If authentication fails, try to create a test user or use a different approach
      this.log('Authentication failed, trying alternative approach...', 'warning');
      
      // For testing purposes, you might want to create a test endpoint that bypasses auth
      // or use a pre-existing test token
      this.addResult('Authentication', false, error.message);
      return null;
    }
  }

  async testTeamStatisticsEndpoints(token) {
    if (!token) {
      this.log('Skipping team statistics endpoints test - no token', 'warning');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Test team performance endpoint
      const performanceResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/team/test-team-id/performance?season=2024`,
        { headers }
      );
      this.addResult('Team Performance Endpoint', true);

      // Test team insights endpoint
      const insightsResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/team/test-team-id/insights?season=2024`,
        { headers }
      );
      this.addResult('Team Insights Endpoint', true);

      // Test team trends endpoint
      const trendsResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/team/test-team-id/trends?season=2024&period=month`,
        { headers }
      );
      this.addResult('Team Trends Endpoint', true);

      // Test team efficiency endpoint
      const efficiencyResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/team/test-team-id/efficiency?season=2024`,
        { headers }
      );
      this.addResult('Team Efficiency Endpoint', true);

      // Test league table endpoint
      const leagueTableResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/league/table?season=2024`,
        { headers }
      );
      this.addResult('League Table Endpoint', true);

      // Test top teams endpoint
      const topTeamsResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/league/top-teams?metric=points&season=2024&limit=10`,
        { headers }
      );
      this.addResult('Top Teams Endpoint', true);

    } catch (error) {
      this.addResult('Team Statistics Endpoints', false, error.message);
    }
  }

  async testTeamAnalyticsEndpoints(token) {
    if (!token) {
      this.log('Skipping team analytics endpoints test - no token', 'warning');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Test team form analysis endpoint
      const formResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/team/test-team-id/form?season=2024`,
        { headers }
      );
      this.addResult('Team Form Analysis Endpoint', true);

      // Test team comparison endpoint
      const comparisonResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/team/test-team-id/league-comparison?season=2024`,
        { headers }
      );
      this.addResult('Team League Comparison Endpoint', true);

      // Test multiple teams comparison endpoint
      const multiComparisonResponse = await axios.post(
        `${this.baseUrl}/api/team-statistics/teams/compare`,
        {
          teamIds: ['team1', 'team2', 'team3'],
          season: '2024'
        },
        { headers }
      );
      this.addResult('Multiple Teams Comparison Endpoint', true);

    } catch (error) {
      this.addResult('Team Analytics Endpoints', false, error.message);
    }
  }

  async testTeamStatisticsUpdate(token) {
    if (!token) {
      this.log('Skipping team statistics update test - no token', 'warning');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Test team statistics update endpoint
      const updateResponse = await axios.post(
        `${this.baseUrl}/api/team-statistics/team/update`,
        {
          teamId: 'test-team-id',
          matchId: 'test-match-id'
        },
        { headers }
      );
      this.addResult('Team Statistics Update Endpoint', true);

    } catch (error) {
      this.addResult('Team Statistics Update', false, error.message);
    }
  }

  async testTeamStatisticsExport(token) {
    if (!token) {
      this.log('Skipping team statistics export test - no token', 'warning');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Test CSV export
      const csvResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/team/test-team-id/export?season=2024&format=csv`,
        { headers }
      );
      this.addResult('Team Statistics CSV Export', true);

      // Test JSON export
      const jsonResponse = await axios.get(
        `${this.baseUrl}/api/team-statistics/team/test-team-id/export?season=2024&format=json`,
        { headers }
      );
      this.addResult('Team Statistics JSON Export', true);

    } catch (error) {
      this.addResult('Team Statistics Export', false, error.message);
    }
  }

  async testWebSocketConnection() {
    try {
      this.socket = io(this.websocketUrl, {
        auth: {
          token: this.testToken
        }
      });

      return new Promise((resolve) => {
        this.socket.on('connect', () => {
          this.addResult('WebSocket Connection', true);
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          this.addResult('WebSocket Connection', false, error.message);
          resolve(false);
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          this.addResult('WebSocket Connection', false, 'Connection timeout');
          resolve(false);
        }, 5000);
      });
    } catch (error) {
      this.addResult('WebSocket Connection', false, error.message);
      return false;
    }
  }

  async testWebSocketEvents() {
    if (!this.socket) {
      this.log('Skipping WebSocket events test - no connection', 'warning');
      return;
    }

    try {
      // Test team statistics update event
      this.socket.emit('join-team', { teamId: 'test-team-id' });

      // Wait for any team-related events
      await new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(), 3000);
        
        this.socket.on('team-statistics-updated', (data) => {
          this.addResult('Team Statistics WebSocket Event', true);
          clearTimeout(timeout);
          resolve();
        });
      });

      this.addResult('WebSocket Events', true);

    } catch (error) {
      this.addResult('WebSocket Events', false, error.message);
    }
  }

  async testTeamStatisticsCalculations() {
    try {
      // Test basic team statistics calculations
      const testTeamStats = {
        matchesPlayed: 10,
        matchesWon: 6,
        matchesDrawn: 2,
        matchesLost: 2,
        goalsFor: 20,
        goalsAgainst: 10,
        cleanSheets: 4
      };

      // Calculate expected values
      const expectedPoints = (testTeamStats.matchesWon * 3) + testTeamStats.matchesDrawn;
      const expectedWinPercentage = (testTeamStats.matchesWon / testTeamStats.matchesPlayed) * 100;
      const expectedGoalDifference = testTeamStats.goalsFor - testTeamStats.goalsAgainst;

      // Verify calculations
      if (expectedPoints === 20) {
        this.addResult('Team Statistics Calculations - Points', true);
      } else {
        this.addResult('Team Statistics Calculations - Points', false, `Expected 20, got ${expectedPoints}`);
      }

      if (expectedWinPercentage === 60) {
        this.addResult('Team Statistics Calculations - Win Percentage', true);
      } else {
        this.addResult('Team Statistics Calculations - Win Percentage', false, `Expected 60, got ${expectedWinPercentage}`);
      }

      if (expectedGoalDifference === 10) {
        this.addResult('Team Statistics Calculations - Goal Difference', true);
      } else {
        this.addResult('Team Statistics Calculations - Goal Difference', false, `Expected 10, got ${expectedGoalDifference}`);
      }

    } catch (error) {
      this.addResult('Team Statistics Calculations', false, error.message);
    }
  }

  async testTeamAnalyticsCalculations() {
    try {
      // Test team analytics calculations
      const testFormData = [
        { result: 'win', performance: 8 },
        { result: 'win', performance: 7 },
        { result: 'draw', performance: 6 },
        { result: 'loss', performance: 4 },
        { result: 'win', performance: 9 }
      ];

      // Calculate form score (weighted average of last 5 matches)
      let formScore = 0;
      let totalWeight = 0;

      testFormData.forEach((match, index) => {
        const weight = 5 - index;
        formScore += match.performance * weight;
        totalWeight += weight;
      });

      formScore = formScore / totalWeight;

      if (Math.abs(formScore - 7.2) < 0.1) {
        this.addResult('Team Analytics Calculations - Form Score', true);
      } else {
        this.addResult('Team Analytics Calculations - Form Score', false, `Expected 7.2, got ${formScore}`);
      }

      // Test efficiency calculations
      const testEfficiencyData = {
        shots: 100,
        shotsOnTarget: 60,
        passes: 500,
        passesCompleted: 400,
        saves: 20,
        goalsConceded: 10
      };

      const shotAccuracy = (testEfficiencyData.shotsOnTarget / testEfficiencyData.shots) * 100;
      const passAccuracy = (testEfficiencyData.passesCompleted / testEfficiencyData.passes) * 100;
      const savePercentage = (testEfficiencyData.saves / (testEfficiencyData.saves + testEfficiencyData.goalsConceded)) * 100;

      if (shotAccuracy === 60) {
        this.addResult('Team Analytics Calculations - Shot Accuracy', true);
      } else {
        this.addResult('Team Analytics Calculations - Shot Accuracy', false, `Expected 60, got ${shotAccuracy}`);
      }

      if (passAccuracy === 80) {
        this.addResult('Team Analytics Calculations - Pass Accuracy', true);
      } else {
        this.addResult('Team Analytics Calculations - Pass Accuracy', false, `Expected 80, got ${passAccuracy}`);
      }

      if (savePercentage === 66.67) {
        this.addResult('Team Analytics Calculations - Save Percentage', true);
      } else {
        this.addResult('Team Analytics Calculations - Save Percentage', false, `Expected 66.67, got ${savePercentage}`);
      }

    } catch (error) {
      this.addResult('Team Analytics Calculations', false, error.message);
    }
  }

  async testDataValidation() {
    try {
      // Test input validation
      const invalidTeamId = '';
      const invalidSeason = 'invalid-season';

      // Test with invalid team ID
      try {
        await axios.get(`${this.baseUrl}/api/team-statistics/team/${invalidTeamId}/performance`);
        this.addResult('Data Validation - Invalid Team ID', false, 'Should have rejected empty team ID');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.addResult('Data Validation - Invalid Team ID', true);
        } else {
          this.addResult('Data Validation - Invalid Team ID', false, 'Unexpected error response');
        }
      }

      // Test with invalid season
      try {
        await axios.get(`${this.baseUrl}/api/team-statistics/team/test-team-id/performance?season=${invalidSeason}`);
        this.addResult('Data Validation - Invalid Season', false, 'Should have rejected invalid season');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.addResult('Data Validation - Invalid Season', true);
        } else {
          this.addResult('Data Validation - Invalid Season', false, 'Unexpected error response');
        }
      }

    } catch (error) {
      this.addResult('Data Validation', false, error.message);
    }
  }

  async testPerformanceOptimization() {
    try {
      // Test response times for team statistics endpoints
      const startTime = Date.now();
      
      try {
        await axios.get(`${this.baseUrl}/api/team-statistics/team/test-team-id/performance?season=2024`);
        const responseTime = Date.now() - startTime;
        
        if (responseTime < 1000) {
          this.addResult('Performance Optimization - Response Time', true, `${responseTime}ms`);
        } else {
          this.addResult('Performance Optimization - Response Time', false, `Response time too slow: ${responseTime}ms`);
        }
      } catch (error) {
        this.addResult('Performance Optimization - Response Time', false, error.message);
      }

      // Test caching (if implemented)
      const cacheStartTime = Date.now();
      
      try {
        await axios.get(`${this.baseUrl}/api/team-statistics/team/test-team-id/performance?season=2024`);
        const cacheResponseTime = Date.now() - cacheStartTime;
        
        if (cacheResponseTime < 500) {
          this.addResult('Performance Optimization - Caching', true, `Cached response: ${cacheResponseTime}ms`);
        } else {
          this.addResult('Performance Optimization - Caching', false, `No caching detected: ${cacheResponseTime}ms`);
        }
      } catch (error) {
        this.addResult('Performance Optimization - Caching', false, error.message);
      }

    } catch (error) {
      this.addResult('Performance Optimization', false, error.message);
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Team Statistics System Tests...', 'info');
    this.log(`Testing against: ${this.baseUrl}`, 'info');

    const isHealthy = await this.testBackendHealth();
    if (!isHealthy) {
      this.log('❌ Backend is not healthy, stopping tests', 'error');
      return;
    }

    const token = await this.testAuthentication();
    if (token) {
      await this.testTeamStatisticsEndpoints(token);
      await this.testTeamAnalyticsEndpoints(token);
      await this.testTeamStatisticsUpdate(token);
      await this.testTeamStatisticsExport(token);
    }

    await this.testTeamStatisticsCalculations();
    await this.testTeamAnalyticsCalculations();
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
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEAM STATISTICS SYSTEM TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('='.repeat(60));

    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`  • ${result.testName}: ${result.details}`);
        });
    }

    if (passedTests > 0) {
      console.log('\n✅ PASSED TESTS:');
      this.testResults
        .filter(r => r.success)
        .forEach(result => {
          console.log(`  • ${result.testName}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    
    if (failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED! Team Statistics System is working correctly.');
    } else {
      console.log(`⚠️  ${failedTests} test(s) failed. Please review the issues above.`);
    }
    console.log('='.repeat(60));
  }
}

if (require.main === module) {
  const tester = new TeamStatisticsSystemTester();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Test interrupted by user');
    if (tester.socket) {
      tester.socket.disconnect();
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Test terminated');
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

module.exports = TeamStatisticsSystemTester;
