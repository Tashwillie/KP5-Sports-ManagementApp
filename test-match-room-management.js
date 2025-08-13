#!/usr/bin/env node

/**
 * Match Room Management Test Script
 * 
 * This script tests the comprehensive match room management system.
 * Run this after starting the backend server.
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_TOKEN = 'your-test-jwt-token'; // Replace with actual token
const TEST_MATCH_ID = 'test-match-123';

// Test data
const testRoomSettings = {
  allowChat: true,
  allowSpectators: true,
  maxSpectators: 50,
  requireApproval: false,
  autoKickInactive: true,
  inactivityTimeout: 15,
  enableTypingIndicators: true,
  enableReadReceipts: false
};

const testParticipant = {
  userId: 'test-user-123',
  userEmail: 'test@example.com',
  userRole: 'COACH',
  teamId: 'test-team-456'
};

class MatchRoomManagementTester {
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
    console.log('🧪 Starting Match Room Management Tests...\n');
    
    try {
      // Test room creation and basic operations
      await this.testRoomCreation();
      await this.sleep(1000);
      
      await this.testRoomInformation();
      await this.sleep(1000);
      
      await this.testParticipantManagement();
      await this.sleep(1000);
      
      await this.testRoomSettings();
      await this.sleep(1000);
      
      await this.testRoomAnalytics();
      await this.sleep(1000);
      
      await this.testParticipantSearch();
      await this.sleep(1000);
      
      await this.testRoomStatistics();
      await this.sleep(1000);
      
      await this.testRoomMetadata();
      await this.sleep(1000);
      
      await this.testRoomCleanup();
      await this.sleep(1000);
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }

  async testRoomCreation() {
    console.log('🚪 Testing room creation and basic operations...');
    
    try {
      // Test joining a room
      const joinResponse = await axios.post(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/join`,
        {
          role: 'COACH',
          teamId: 'test-team-456',
          permissions: ['SEND_MESSAGES', 'VIEW_ANALYTICS']
        },
        this.axiosConfig
      );
      
      if (joinResponse.data.success) {
        this.testResults.push('Room Join: SUCCESS');
        console.log('✅ Successfully joined match room');
      } else {
        this.testResults.push('Room Join: FAILED');
        console.log('❌ Failed to join match room');
      }
      
      // Test getting room information
      const roomInfoResponse = await axios.get(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}`,
        this.axiosConfig
      );
      
      if (roomInfoResponse.data.success && roomInfoResponse.data.data.exists) {
        this.testResults.push('Room Info: SUCCESS');
        console.log('✅ Successfully retrieved room information');
      } else {
        this.testResults.push('Room Info: FAILED');
        console.log('❌ Failed to retrieve room information');
      }
      
    } catch (error) {
      console.error('❌ Room creation test failed:', error.response?.data || error.message);
      this.testResults.push('Room Creation: FAILED');
    }
  }

  async testRoomInformation() {
    console.log('\n📊 Testing room information retrieval...');
    
    try {
      // Test getting all match rooms
      const allRoomsResponse = await axios.get(
        `${BASE_URL}/match-rooms`,
        this.axiosConfig
      );
      
      if (allRoomsResponse.data.success) {
        this.testResults.push('All Rooms: SUCCESS');
        console.log(`✅ Retrieved ${allRoomsResponse.data.data.totalRooms} match rooms`);
      } else {
        this.testResults.push('All Rooms: FAILED');
        console.log('❌ Failed to retrieve all match rooms');
      }
      
      // Test getting room participants
      const participantsResponse = await axios.get(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/participants`,
        this.axiosConfig
      );
      
      if (participantsResponse.data.success) {
        this.testResults.push('Room Participants: SUCCESS');
        console.log(`✅ Retrieved ${participantsResponse.data.data.participantCount} participants`);
      } else {
        this.testResults.push('Room Participants: FAILED');
        console.log('❌ Failed to retrieve room participants');
      }
      
    } catch (error) {
      console.error('❌ Room information test failed:', error.response?.data || error.message);
      this.testResults.push('Room Information: FAILED');
    }
  }

  async testParticipantManagement() {
    console.log('\n👥 Testing participant management...');
    
    try {
      // Test adding another participant
      const addParticipantResponse = await axios.post(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/join`,
        {
          role: 'SPECTATOR',
          permissions: ['VIEW_MESSAGES']
        },
        this.axiosConfig
      );
      
      if (addParticipantResponse.data.success) {
        this.testResults.push('Add Participant: SUCCESS');
        console.log('✅ Successfully added participant to room');
      } else {
        this.testResults.push('Add Participant: FAILED');
        console.log('❌ Failed to add participant to room');
      }
      
      // Test participant management actions (kick, mute, promote, demote)
      const managementActions = [
        { action: 'mute', targetUserId: 'test-user-123', reason: 'Test mute' },
        { action: 'promote', targetUserId: 'test-user-123', reason: 'Test promotion' },
        { action: 'demote', targetUserId: 'test-user-123', reason: 'Test demotion' }
      ];
      
      for (const action of managementActions) {
        try {
          const response = await axios.post(
            `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/participants/manage`,
            action,
            this.axiosConfig
          );
          
          if (response.data.success) {
            this.testResults.push(`Participant ${action.action}: SUCCESS`);
            console.log(`✅ Successfully performed ${action.action} action`);
          } else {
            this.testResults.push(`Participant ${action.action}: FAILED`);
            console.log(`❌ Failed to perform ${action.action} action`);
          }
        } catch (error) {
          this.testResults.push(`Participant ${action.action}: FAILED`);
          console.log(`❌ ${action.action} action failed:`, error.response?.data?.message || error.message);
        }
        
        await this.sleep(500);
      }
      
    } catch (error) {
      console.error('❌ Participant management test failed:', error.response?.data || error.message);
      this.testResults.push('Participant Management: FAILED');
    }
  }

  async testRoomSettings() {
    console.log('\n⚙️ Testing room settings management...');
    
    try {
      // Test updating room settings
      const updateSettingsResponse = await axios.put(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/settings`,
        testRoomSettings,
        this.axiosConfig
      );
      
      if (updateSettingsResponse.data.success) {
        this.testResults.push('Update Settings: SUCCESS');
        console.log('✅ Successfully updated room settings');
      } else {
        this.testResults.push('Update Settings: FAILED');
        console.log('❌ Failed to update room settings');
      }
      
      // Test getting room settings
      const getSettingsResponse = await axios.get(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/settings`,
        this.axiosConfig
      );
      
      if (getSettingsResponse.data.success) {
        this.testResults.push('Get Settings: SUCCESS');
        console.log('✅ Successfully retrieved room settings');
      } else {
        this.testResults.push('Get Settings: FAILED');
        console.log('❌ Failed to retrieve room settings');
      }
      
    } catch (error) {
      console.error('❌ Room settings test failed:', error.response?.data || error.message);
      this.testResults.push('Room Settings: FAILED');
    }
  }

  async testRoomAnalytics() {
    console.log('\n📈 Testing room analytics...');
    
    try {
      // Test getting room analytics
      const analyticsResponse = await axios.get(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/analytics`,
        this.axiosConfig
      );
      
      if (analyticsResponse.data.success) {
        this.testResults.push('Room Analytics: SUCCESS');
        console.log('✅ Successfully retrieved room analytics');
        
        const analytics = analyticsResponse.data.data.analytics;
        console.log(`   - Total participants: ${analytics.totalParticipants}`);
        console.log(`   - Active participants: ${analytics.activeParticipants}`);
        console.log(`   - Messages sent: ${analytics.messagesSent}`);
        console.log(`   - Events recorded: ${analytics.eventsRecorded}`);
        console.log(`   - Room uptime: ${analytics.roomUptime} minutes`);
      } else {
        this.testResults.push('Room Analytics: FAILED');
        console.log('❌ Failed to retrieve room analytics');
      }
      
    } catch (error) {
      console.error('❌ Room analytics test failed:', error.response?.data || error.message);
      this.testResults.push('Room Analytics: FAILED');
    }
  }

  async testParticipantSearch() {
    console.log('\n🔍 Testing participant search...');
    
    try {
      // Test searching participants
      const searchResponse = await axios.get(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/participants/search?query=test`,
        this.axiosConfig
      );
      
      if (searchResponse.data.success) {
        this.testResults.push('Participant Search: SUCCESS');
        console.log(`✅ Successfully searched participants: ${searchResponse.data.data.totalResults} results`);
      } else {
        this.testResults.push('Participant Search: FAILED');
        console.log('❌ Failed to search participants');
      }
      
      // Test filtered search
      const filteredSearchResponse = await axios.get(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/participants/search?query=test&category=COACH`,
        this.axiosConfig
      );
      
      if (filteredSearchResponse.data.success) {
        this.testResults.push('Filtered Search: SUCCESS');
        console.log(`✅ Successfully performed filtered search: ${filteredSearchResponse.data.data.totalResults} results`);
      } else {
        this.testResults.push('Filtered Search: FAILED');
        console.log('❌ Failed to perform filtered search');
      }
      
    } catch (error) {
      console.error('❌ Participant search test failed:', error.response?.data || error.message);
      this.testResults.push('Participant Search: FAILED');
    }
  }

  async testRoomStatistics() {
    console.log('\n📊 Testing room statistics...');
    
    try {
      // Test getting room statistics
      const statsResponse = await axios.get(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/stats`,
        this.axiosConfig
      );
      
      if (statsResponse.data.success) {
        this.testResults.push('Room Statistics: SUCCESS');
        console.log('✅ Successfully retrieved room statistics');
        
        const stats = statsResponse.data.data.stats;
        console.log(`   - Total participants: ${stats.totalParticipants}`);
        console.log(`   - Active participants: ${stats.activeParticipants}`);
        console.log(`   - Inactive participants: ${stats.inactiveParticipants}`);
      } else {
        this.testResults.push('Room Statistics: FAILED');
        console.log('❌ Failed to retrieve room statistics');
      }
      
    } catch (error) {
      console.error('❌ Room statistics test failed:', error.response?.data || error.message);
      this.testResults.push('Room Statistics: FAILED');
    }
  }

  async testRoomMetadata() {
    console.log('\n📋 Testing room metadata...');
    
    try {
      // Test getting room metadata
      const metadataResponse = await axios.get(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/metadata`,
        this.axiosConfig
      );
      
      if (metadataResponse.data.success) {
        this.testResults.push('Room Metadata: SUCCESS');
        console.log('✅ Successfully retrieved room metadata');
        
        const metadata = metadataResponse.data.data.metadata;
        console.log(`   - Match title: ${metadata.matchTitle}`);
        console.log(`   - Home team: ${metadata.homeTeamName}`);
        console.log(`   - Away team: ${metadata.awayTeamName}`);
        console.log(`   - Tournament: ${metadata.tournamentName || 'N/A'}`);
      } else {
        this.testResults.push('Room Metadata: FAILED');
        console.log('❌ Failed to retrieve room metadata');
      }
      
      // Test updating room metadata
      const updateMetadataResponse = await axios.put(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/metadata`,
        {
          weather: 'Sunny',
          pitchCondition: 'Excellent',
          expectedDuration: 90
        },
        this.axiosConfig
      );
      
      if (updateMetadataResponse.data.success) {
        this.testResults.push('Update Metadata: SUCCESS');
        console.log('✅ Successfully updated room metadata');
      } else {
        this.testResults.push('Update Metadata: FAILED');
        console.log('❌ Failed to update room metadata');
      }
      
    } catch (error) {
      console.error('❌ Room metadata test failed:', error.response?.data || error.message);
      this.testResults.push('Room Metadata: FAILED');
    }
  }

  async testRoomCleanup() {
    console.log('\n🧹 Testing room cleanup...');
    
    try {
      // Test leaving the room
      const leaveResponse = await axios.post(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}/leave`,
        {},
        this.axiosConfig
      );
      
      if (leaveResponse.data.success) {
        this.testResults.push('Leave Room: SUCCESS');
        console.log('✅ Successfully left match room');
      } else {
        this.testResults.push('Leave Room: FAILED');
        console.log('❌ Failed to leave match room');
      }
      
      // Test getting room info after leaving
      const roomInfoResponse = await axios.get(
        `${BASE_URL}/match-rooms/${TEST_MATCH_ID}`,
        this.axiosConfig
      );
      
      if (roomInfoResponse.data.success) {
        const roomInfo = roomInfoResponse.data.data;
        if (roomInfo.exists && roomInfo.userCount === 0) {
          this.testResults.push('Room Cleanup: SUCCESS');
          console.log('✅ Room cleanup working correctly');
        } else {
          this.testResults.push('Room Cleanup: FAILED');
          console.log('❌ Room cleanup not working correctly');
        }
      } else {
        this.testResults.push('Room Cleanup: FAILED');
        console.log('❌ Failed to verify room cleanup');
      }
      
    } catch (error) {
      console.error('❌ Room cleanup test failed:', error.response?.data || error.message);
      this.testResults.push('Room Cleanup: FAILED');
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
      console.log('\n🎉 All tests passed! Match room management system is working correctly.');
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
  const tester = new MatchRoomManagementTester();
  
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

module.exports = MatchRoomManagementTester;
