#!/usr/bin/env node

/**
 * Scaling System Test Script
 * 
 * This script tests the comprehensive scaling system for multiple concurrent matches.
 * Run this after starting the backend server with Redis.
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_TOKEN = 'your-test-jwt-token'; // Replace with actual token
const TEST_MATCH_ID = 'test-match-123';

// Test data
const testLoadBalancerConfig = {
  maxConnectionsPerServer: 1500,
  maxMatchesPerServer: 150,
  healthCheckInterval: 20000,
  loadBalancingStrategy: 'least_connections'
};

const testPerformanceThresholds = {
  cpuUsage: 75,
  memoryUsage: 80,
  responseTime: 800,
  errorRate: 3,
  connectionUtilization: 85,
  matchUtilization: 85
};

class ScalingSystemTester {
  constructor() {
    this.testResults = [];
    this.axiosConfig = {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
  }

  async runAllTests() {
    console.log('🧪 Starting Scaling System Tests...\n');
    
    try {
      // Test system health
      await this.testSystemHealth();
      await this.sleep(1000);
      
      // Test distributed match state management
      await this.testDistributedMatchStateManagement();
      await this.sleep(1000);
      
      // Test load balancer
      await this.testLoadBalancer();
      await this.sleep(1000);
      
      // Test performance monitoring
      await this.testPerformanceMonitoring();
      await this.sleep(1000);
      
      // Test Redis service
      await this.testRedisService();
      await this.sleep(1000);
      
      // Test system overview
      await this.testSystemOverview();
      await this.sleep(1000);
      
      // Test match scaling
      await this.testMatchScaling();
      await this.sleep(1000);
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }

  async testSystemHealth() {
    console.log('🏥 Testing system health...');
    
    try {
      const response = await axios.get(`${BASE_URL}/scaling/health`, this.axiosConfig);
      
      if (response.data.healthy) {
        this.testResults.push('System Health: SUCCESS');
        console.log('✅ System is healthy');
      } else {
        this.testResults.push('System Health: WARNING');
        console.log('⚠️ System has health issues');
      }
      
      console.log('📊 Health status:', response.data);
      
    } catch (error) {
      console.error('❌ System health test failed:', error.response?.data || error.message);
      this.testResults.push('System Health: FAILED');
    }
  }

  async testDistributedMatchStateManagement() {
    console.log('\n🌐 Testing distributed match state management...');
    
    try {
      // Test distributed status
      const statusResponse = await axios.get(`${BASE_URL}/scaling/distributed/status`, this.axiosConfig);
      this.testResults.push('Distributed Status: SUCCESS');
      console.log('✅ Distributed status retrieved');
      
      // Test server registry
      const serversResponse = await axios.get(`${BASE_URL}/scaling/distributed/servers`, this.axiosConfig);
      this.testResults.push('Server Registry: SUCCESS');
      console.log('✅ Server registry retrieved');
      
      // Test match state
      const matchResponse = await axios.get(`${BASE_URL}/scaling/distributed/matches/${TEST_MATCH_ID}`, this.axiosConfig);
      this.testResults.push('Match State: SUCCESS');
      console.log('✅ Match state retrieved');
      
      console.log('📊 Distributed system info:', {
        status: statusResponse.data,
        servers: serversResponse.data,
        match: matchResponse.data
      });
      
    } catch (error) {
      console.error('❌ Distributed match state test failed:', error.response?.data || error.message);
      this.testResults.push('Distributed Match State: FAILED');
    }
  }

  async testLoadBalancer() {
    console.log('\n⚖️ Testing load balancer...');
    
    try {
      // Test load balancer status
      const statusResponse = await axios.get(`${BASE_URL}/scaling/loadbalancer/status`, this.axiosConfig);
      this.testResults.push('Load Balancer Status: SUCCESS');
      console.log('✅ Load balancer status retrieved');
      
      // Test load balancer stats
      const statsResponse = await axios.get(`${BASE_URL}/scaling/loadbalancer/stats`, this.axiosConfig);
      this.testResults.push('Load Balancer Stats: SUCCESS');
      console.log('✅ Load balancer stats retrieved');
      
      // Test server recommendations
      const recommendationsResponse = await axios.get(`${BASE_URL}/scaling/loadbalancer/recommendations`, this.axiosConfig);
      this.testResults.push('Server Recommendations: SUCCESS');
      console.log('✅ Server recommendations retrieved');
      
      // Test load balancer metrics
      const metricsResponse = await axios.get(`${BASE_URL}/scaling/loadbalancer/metrics`, this.axiosConfig);
      this.testResults.push('Load Balancer Metrics: SUCCESS');
      console.log('✅ Load balancer metrics retrieved');
      
      // Test configuration update
      const configResponse = await axios.put(`${BASE_URL}/scaling/loadbalancer/config`, testLoadBalancerConfig, this.axiosConfig);
      this.testResults.push('Load Balancer Config Update: SUCCESS');
      console.log('✅ Load balancer configuration updated');
      
      console.log('📊 Load balancer info:', {
        status: statusResponse.data,
        stats: statsResponse.data,
        recommendations: recommendationsResponse.data,
        metrics: metricsResponse.data,
        config: configResponse.data
      });
      
    } catch (error) {
      console.error('❌ Load balancer test failed:', error.response?.data || error.message);
      this.testResults.push('Load Balancer: FAILED');
    }
  }

  async testPerformanceMonitoring() {
    console.log('\n📊 Testing performance monitoring...');
    
    try {
      // Test performance status
      const statusResponse = await axios.get(`${BASE_URL}/scaling/performance/status`, this.axiosConfig);
      this.testResults.push('Performance Status: SUCCESS');
      console.log('✅ Performance status retrieved');
      
      // Test performance metrics
      const metricsResponse = await axios.get(`${BASE_URL}/scaling/performance/metrics?hours=1`, this.axiosConfig);
      this.testResults.push('Performance Metrics: SUCCESS');
      console.log('✅ Performance metrics retrieved');
      
      // Test match performance metrics
      const matchMetricsResponse = await axios.get(`${BASE_URL}/scaling/performance/matches/${TEST_MATCH_ID}?hours=1`, this.axiosConfig);
      this.testResults.push('Match Performance Metrics: SUCCESS');
      console.log('✅ Match performance metrics retrieved');
      
      // Test performance alerts
      const alertsResponse = await axios.get(`${BASE_URL}/scaling/performance/alerts?resolved=false`, this.axiosConfig);
      this.testResults.push('Performance Alerts: SUCCESS');
      console.log('✅ Performance alerts retrieved');
      
      // Test performance thresholds
      const thresholdsResponse = await axios.get(`${BASE_URL}/scaling/performance/thresholds`, this.axiosConfig);
      this.testResults.push('Performance Thresholds: SUCCESS');
      console.log('✅ Performance thresholds retrieved');
      
      // Test threshold update
      const updateThresholdsResponse = await axios.put(`${BASE_URL}/scaling/performance/thresholds`, testPerformanceThresholds, this.axiosConfig);
      this.testResults.push('Performance Thresholds Update: SUCCESS');
      console.log('✅ Performance thresholds updated');
      
      console.log('📊 Performance monitoring info:', {
        status: statusResponse.data,
        metrics: metricsResponse.data,
        matchMetrics: matchMetricsResponse.data,
        alerts: alertsResponse.data,
        thresholds: thresholdsResponse.data,
        updatedThresholds: updateThresholdsResponse.data
      });
      
    } catch (error) {
      console.error('❌ Performance monitoring test failed:', error.response?.data || error.message);
      this.testResults.push('Performance Monitoring: FAILED');
    }
  }

  async testRedisService() {
    console.log('\n🔴 Testing Redis service...');
    
    try {
      // Test Redis status
      const statusResponse = await axios.get(`${BASE_URL}/scaling/redis/status`, this.axiosConfig);
      this.testResults.push('Redis Status: SUCCESS');
      console.log('✅ Redis status retrieved');
      
      // Test Redis info
      const infoResponse = await axios.get(`${BASE_URL}/scaling/redis/info`, this.axiosConfig);
      this.testResults.push('Redis Info: SUCCESS');
      console.log('✅ Redis info retrieved');
      
      console.log('📊 Redis service info:', {
        status: statusResponse.data,
        info: infoResponse.data
      });
      
    } catch (error) {
      console.error('❌ Redis service test failed:', error.response?.data || error.message);
      this.testResults.push('Redis Service: FAILED');
    }
  }

  async testSystemOverview() {
    console.log('\n📋 Testing system overview...');
    
    try {
      const response = await axios.get(`${BASE_URL}/scaling/overview`, this.axiosConfig);
      
      this.testResults.push('System Overview: SUCCESS');
      console.log('✅ System overview retrieved');
      
      console.log('📊 System overview:', response.data);
      
    } catch (error) {
      console.error('❌ System overview test failed:', error.response?.data || error.message);
      this.testResults.push('System Overview: FAILED');
    }
  }

  async testMatchScaling() {
    console.log('\n⚽ Testing match scaling...');
    
    try {
      const response = await axios.get(`${BASE_URL}/scaling/matches/${TEST_MATCH_ID}/scaling`, this.axiosConfig);
      
      this.testResults.push('Match Scaling: SUCCESS');
      console.log('✅ Match scaling info retrieved');
      
      console.log('📊 Match scaling info:', response.data);
      
    } catch (error) {
      if (error.response?.status === 404) {
        this.testResults.push('Match Scaling: NOT_FOUND (expected for test match)');
        console.log('⚠️ Test match not found (expected)');
      } else {
        console.error('❌ Match scaling test failed:', error.response?.data || error.message);
        this.testResults.push('Match Scaling: FAILED');
      }
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const successCount = this.testResults.filter(r => r.includes('SUCCESS')).length;
    const totalCount = this.testResults.length;
    
    this.testResults.forEach((result, index) => {
      const status = result.includes('SUCCESS') ? '✅' : result.includes('FAILED') ? '❌' : '⚠️';
      console.log(`${index + 1}. ${status} ${result}`);
    });
    
    console.log('\n📈 Summary:');
    console.log(`Total Tests: ${totalCount}`);
    console.log(`Passed: ${successCount}`);
    console.log(`Failed: ${totalCount - successCount}`);
    console.log(`Success Rate: ${((successCount / totalCount) * 100).toFixed(1)}%`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 All tests passed! Scaling system is working correctly.');
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
  const tester = new ScalingSystemTester();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Test interrupted by user');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Test terminated');
    process.exit(0);
  });
  
  // Start tests
  tester.runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = ScalingSystemTester;
