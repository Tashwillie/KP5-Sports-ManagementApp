import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLiveMatchData } from '../hooks/useLiveMatchData';
import { MatchEvent, MatchStatistics } from '../services/apiService';

interface LiveMatchScreenProps {
  route: {
    params: {
      matchId: string;
      homeTeam: {
        id: string;
        name: string;
        logo?: string;
        color?: string;
      };
      awayTeam: {
        id: string;
        name: string;
        logo?: string;
        color?: string;
      };
      userRole: string;
      userId: string;
    };
  };
}

interface MatchState {
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  currentPeriod: 'FIRST_HALF' | 'HALFTIME' | 'SECOND_HALF' | 'EXTRA_TIME' | 'PENALTIES';
  timeElapsed: number;
  injuryTime: number;
  homeScore: number;
  awayScore: number;
  isTimerRunning: boolean;
  lastEventTime?: string;
}

export default function LiveMatchScreen({ route }: LiveMatchScreenProps) {
  const navigation = useNavigation();
  const { matchId, homeTeam, awayTeam, userRole, userId } = route.params;
  
  // Use the live match data hook
  const {
    match,
    events,
    statistics,
    matchState,
    loading,
    eventsLoading,
    statsLoading,
    stateLoading,
    error,
    eventsError,
    statsError,
    stateError,
    isConnected,
    isConnecting,
    refreshMatch,
    refreshEvents,
    refreshStatistics,
    refreshMatchState,
    connect,
    disconnect,
    startMatch,
    pauseMatch,
    resumeMatch,
    endMatch,
    addEvent,
    isReferee,
    isCoach,
    isPlayer,
    canControlMatch,
  } = useLiveMatchData({
    matchId,
    userId,
    userRole,
    autoConnect: true,
    refreshInterval: 30000, // 30 seconds
  });

  // Local state
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'stats' | 'lineup'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [lastEvent, setLastEvent] = useState<MatchEvent | null>(null);
  
  // Animation refs
  const scoreAnimation = useRef(new Animated.Value(1)).current;
  const eventAnimation = useRef(new Animated.Value(1)).current;
  
  // Update last event when events change
  useEffect(() => {
    if (events.length > 0 && events[0] !== lastEvent) {
      setLastEvent(events[0]);
      animateEvent();
    }
  }, [events, lastEvent]);
  
  // Animate score changes
  const animateScoreChange = () => {
    Animated.sequence([
      Animated.timing(scoreAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scoreAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Animate new events
  const animateEvent = () => {
    Animated.sequence([
      Animated.timing(eventAnimation, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(eventAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshMatch(),
        refreshEvents(),
        refreshStatistics(),
        refreshMatchState(),
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle match control actions
  const handleStartMatch = async () => {
    if (canControlMatch) {
      await startMatch();
    } else {
      Alert.alert('Permission Denied', 'Only referees and coaches can control matches.');
    }
  };
  
  const handlePauseMatch = async () => {
    if (canControlMatch) {
      await pauseMatch();
    } else {
      Alert.alert('Permission Denied', 'Only referees and coaches can control matches.');
    }
  };
  
  const handleResumeMatch = async () => {
    if (canControlMatch) {
      await resumeMatch();
    } else {
      Alert.alert('Permission Denied', 'Only referees and coaches can control matches.');
    }
  };
  
  // Render match header
  const renderMatchHeader = () => (
    <View style={styles.matchHeader}>
      <View style={styles.teamSection}>
        <View style={[styles.teamLogo, { backgroundColor: homeTeam.color || '#4A90E2' }]}>
          <Text style={styles.teamInitial}>{homeTeam.name.charAt(0)}</Text>
        </View>
        <Text style={styles.teamName} numberOfLines={2}>
          {homeTeam.name}
        </Text>
      </View>
      
      <View style={styles.scoreSection}>
        <Animated.View style={[styles.scoreContainer, { transform: [{ scale: scoreAnimation }] }]}>
          <Text style={styles.score}>
            {matchState?.homeScore || match?.homeScore || 0}
          </Text>
        </Animated.View>
        <Text style={styles.vs}>vs</Text>
        <Animated.View style={[styles.scoreContainer, { transform: [{ scale: scoreAnimation }] }]}>
          <Text style={styles.score}>
            {matchState?.awayScore || match?.awayScore || 0}
          </Text>
        </Animated.View>
      </View>
      
      <View style={styles.teamSection}>
        <View style={[styles.teamLogo, { backgroundColor: awayTeam.color || '#E74C3C' }]}>
          <Text style={styles.teamInitial}>{awayTeam.name.charAt(0)}</Text>
        </View>
        <Text style={styles.teamName} numberOfLines={2}>
          {awayTeam.name}
        </Text>
      </View>
    </View>
  );
  
  // Render match status and timer
  const renderMatchStatus = () => (
    <View style={styles.statusContainer}>
      <View style={styles.statusRow}>
        <View style={styles.statusItem}>
          <Ionicons 
            name={matchState?.isTimerRunning ? 'play' : 'pause'} 
            size={16} 
            color={matchState?.isTimerRunning ? '#27AE60' : '#E67E22'} 
          />
          <Text style={styles.statusText}>
            {matchState?.status === 'IN_PROGRESS' ? 'LIVE' : 
             matchState?.status === 'PAUSED' ? 'PAUSED' : 
             matchState?.status === 'COMPLETED' ? 'FULL TIME' : 
             matchState?.status === 'SCHEDULED' ? 'UPCOMING' : matchState?.status}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Ionicons name="time-outline" size={16} color="#7F8C8D" />
          <Text style={styles.statusText}>
            {matchState?.currentPeriod === 'FIRST_HALF' ? '1st Half' :
             matchState?.currentPeriod === 'HALFTIME' ? 'Half Time' :
             matchState?.currentPeriod === 'SECOND_HALF' ? '2nd Half' :
             matchState?.currentPeriod === 'EXTRA_TIME' ? 'Extra Time' :
             matchState?.currentPeriod === 'PENALTIES' ? 'Penalties' : 'Unknown'}
          </Text>
        </View>
      </View>
      
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>
          {Math.floor((matchState?.timeElapsed || 0) / 60)}:{(matchState?.timeElapsed || 0) % 60 < 10 ? '0' : ''}{(matchState?.timeElapsed || 0) % 60}
        </Text>
        {matchState?.injuryTime > 0 && (
          <Text style={styles.injuryTime}>+{matchState.injuryTime}</Text>
        )}
      </View>
      
      <View style={styles.connectionStatus}>
        <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#27AE60' : '#E74C3C' }]} />
        <Text style={[styles.connectionText, { color: isConnected ? '#27AE60' : '#E74C3C' }]}>
          {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
        </Text>
      </View>
    </View>
  );
  
  // Render tab navigation
  const renderTabNavigation = () => (
    <View style={styles.tabContainer}>
      {(['overview', 'events', 'stats', 'lineup'] as const).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  // Render overview tab
  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Possession</Text>
          <View style={styles.possessionBar}>
            <View 
              style={[
                styles.possessionFill, 
                { 
                  width: `${statistics?.possession?.home || 50}%`,
                  backgroundColor: homeTeam.color || '#4A90E2'
                }
              ]} 
            />
            <View 
              style={[
                styles.possessionFill, 
                { 
                  width: `${statistics?.possession?.away || 50}%`,
                  backgroundColor: awayTeam.color || '#E74C3C'
                }
              ]} 
            />
          </View>
          <Text style={styles.possessionText}>
            {statistics?.possession?.home || 50}% - {statistics?.possession?.away || 50}%
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics?.shots?.home || 0}</Text>
            <Text style={styles.statLabel}>Shots</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics?.corners?.home || 0}</Text>
            <Text style={styles.statLabel}>Corners</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics?.fouls?.home || 0}</Text>
            <Text style={styles.statLabel}>Fouls</Text>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics?.shots?.away || 0}</Text>
            <Text style={styles.statLabel}>Shots</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics?.corners?.away || 0}</Text>
            <Text style={styles.statLabel}>Corners</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics?.fouls?.away || 0}</Text>
            <Text style={styles.statLabel}>Fouls</Text>
          </View>
        </View>
      </View>
      
      {/* Last Event */}
      {lastEvent && (
        <Animated.View style={[styles.lastEvent, { transform: [{ scale: eventAnimation }] }]}>
          <Text style={styles.lastEventTitle}>Last Event</Text>
          <View style={styles.eventItem}>
            <View style={styles.eventIcon}>
              <Ionicons 
                name={
                  lastEvent.type === 'goal' ? 'football' :
                  lastEvent.type === 'yellow_card' ? 'warning' :
                  lastEvent.type === 'red_card' ? 'close-circle' :
                  lastEvent.type === 'substitution' ? 'swap-horizontal' :
                  'ellipse'
                } 
                size={20} 
                color={
                  lastEvent.type === 'goal' ? '#27AE60' :
                  lastEvent.type === 'yellow_card' ? '#F1C40F' :
                  lastEvent.type === 'red_card' ? '#E74C3C' :
                  '#3498DB'
                } 
              />
            </View>
            <View style={styles.eventDetails}>
              <Text style={styles.eventDescription}>
                {lastEvent.description || `${lastEvent.type} at ${lastEvent.minute || 0}'`}
              </Text>
              <Text style={styles.eventTime}>
                {lastEvent.minute ? `${lastEvent.minute}'` : 'Unknown time'}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
      
      {/* Match Timeline */}
      <View style={styles.timeline}>
        <Text style={styles.timelineTitle}>Match Timeline</Text>
        {events.slice(0, 5).map((event, index) => (
          <View key={event.id} style={styles.timelineItem}>
            <View style={styles.timelineTime}>
              <Text style={styles.timelineMinute}>{event.minute || 0}'</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineEvent}>{event.description || event.type}</Text>
              <Text style={styles.timelineTeam}>
                {event.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}
              </Text>
            </View>
          </View>
        ))}
        {events.length === 0 && (
          <Text style={styles.noEvents}>No events recorded yet</Text>
        )}
      </View>
    </View>
  );
  
  // Render events tab
  const renderEvents = () => (
    <View style={styles.tabContent}>
      <View style={styles.eventsHeader}>
        <Text style={styles.eventsTitle}>Match Events</Text>
        <TouchableOpacity onPress={refreshEvents} disabled={eventsLoading}>
          <Ionicons name="refresh" size={20} color="#3498DB" />
        </TouchableOpacity>
      </View>
      
      {eventsLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : eventsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{eventsError}</Text>
          <TouchableOpacity onPress={refreshEvents} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.noEvents}>
          <Text style={styles.noEventsText}>No events recorded yet</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventType}>
                  <Ionicons 
                    name={
                      event.type === 'goal' ? 'football' :
                      event.type === 'yellow_card' ? 'warning' :
                      event.type === 'red_card' ? 'close-circle' :
                      event.type === 'substitution' ? 'swap-horizontal' :
                      'ellipse'
                    } 
                    size={16} 
                    color={
                      event.type === 'goal' ? '#27AE60' :
                      event.type === 'yellow_card' ? '#F1C40F' :
                      event.type === 'red_card' ? '#E74C3C' :
                      '#3498DB'
                    } 
                  />
                  <Text style={styles.eventTypeText}>{event.type.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <Text style={styles.eventMinute}>{event.minute || 0}'</Text>
              </View>
              
              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}
              
              <View style={styles.eventFooter}>
                <Text style={styles.eventTeam}>
                  {event.teamId === homeTeam.id ? homeTeam.name : awayTeam.name}
                </Text>
                <Text style={styles.eventTime}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
  
  // Render statistics tab
  const renderStats = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Match Statistics</Text>
        <TouchableOpacity onPress={refreshStatistics} disabled={statsLoading}>
          <Ionicons name="refresh" size={20} color="#3498DB" />
        </TouchableOpacity>
      </View>
      
      {statsLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      ) : statsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{statsError}</Text>
          <TouchableOpacity onPress={refreshStatistics} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !statistics ? (
        <View style={styles.noStats}>
          <Text style={styles.noStatsText}>No statistics available</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Possession */}
          <View style={styles.statCard}>
            <Text style={styles.statCardTitle}>Possession</Text>
            <View style={styles.possessionContainer}>
              <View style={styles.possessionTeam}>
                <Text style={styles.possessionTeamName}>{homeTeam.name}</Text>
                <Text style={styles.possessionPercentage}>{statistics.possession.home}%</Text>
              </View>
              <View style={styles.possessionBar}>
                <View 
                  style={[
                    styles.possessionFill, 
                    { 
                      width: `${statistics.possession.home}%`,
                      backgroundColor: homeTeam.color || '#4A90E2'
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.possessionFill, 
                    { 
                      width: `${statistics.possession.away}%`,
                      backgroundColor: awayTeam.color || '#E74C3C'
                    }
                  ]} 
                />
              </View>
              <View style={styles.possessionTeam}>
                <Text style={styles.possessionTeamName}>{awayTeam.name}</Text>
                <Text style={styles.possessionPercentage}>{statistics.possession.away}%</Text>
              </View>
            </View>
          </View>
          
          {/* Shots */}
          <View style={styles.statCard}>
            <Text style={styles.statCardTitle}>Shots</Text>
            <View style={styles.statComparison}>
              <View style={styles.statComparisonItem}>
                <Text style={styles.statComparisonValue}>{statistics.shots.home}</Text>
                <Text style={styles.statComparisonLabel}>{homeTeam.name}</Text>
              </View>
              <View style={styles.statComparisonBar}>
                <View 
                  style={[
                    styles.statComparisonFill, 
                    { 
                      width: `${(statistics.shots.home / Math.max(statistics.shots.home, statistics.shots.away, 1)) * 100}%`,
                      backgroundColor: homeTeam.color || '#4A90E2'
                    }
                  ]} 
                />
              </View>
              <View style={styles.statComparisonBar}>
                <View 
                  style={[
                    styles.statComparisonFill, 
                    { 
                      width: `${(statistics.shots.away / Math.max(statistics.shots.home, statistics.shots.away, 1)) * 100}%`,
                      backgroundColor: awayTeam.color || '#E74C3C'
                    }
                  ]} 
                />
              </View>
              <View style={styles.statComparisonItem}>
                <Text style={styles.statComparisonValue}>{statistics.shots.away}</Text>
                <Text style={styles.statComparisonLabel}>{awayTeam.name}</Text>
              </View>
            </View>
          </View>
          
          {/* Other Stats */}
          {[
            { label: 'Corners', home: statistics.corners.home, away: statistics.corners.away },
            { label: 'Fouls', home: statistics.fouls.home, away: statistics.fouls.away },
            { label: 'Yellow Cards', home: statistics.yellowCards.home, away: statistics.yellowCards.away },
            { label: 'Red Cards', home: statistics.redCards.home, away: statistics.redCards.away },
          ].map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statCardTitle}>{stat.label}</Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.home}</Text>
                  <Text style={styles.statLabel}>{homeTeam.name}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.away}</Text>
                  <Text style={styles.statLabel}>{awayTeam.name}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
  
  // Render lineup tab
  const renderLineup = () => (
    <View style={styles.tabContent}>
      <Text style={styles.lineupTitle}>Team Lineups</Text>
      
      {/* Home Team Lineup */}
      <View style={styles.lineupSection}>
        <Text style={[styles.lineupTeamName, { color: homeTeam.color || '#4A90E2' }]}>
          {homeTeam.name}
        </Text>
        <View style={styles.lineupPlayers}>
          {Array.from({ length: 11 }, (_, i) => (
            <View key={i} style={styles.lineupPlayer}>
              <View style={styles.playerNumber}>
                <Text style={styles.playerNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.playerName}>Player {i + 1}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Away Team Lineup */}
      <View style={styles.lineupSection}>
        <Text style={[styles.lineupTeamName, { color: awayTeam.color || '#E74C3C' }]}>
          {awayTeam.name}
        </Text>
        <View style={styles.lineupPlayers}>
          {Array.from({ length: 11 }, (_, i) => (
            <View key={i} style={styles.lineupPlayer}>
              <View style={styles.playerNumber}>
                <Text style={styles.playerNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.playerName}>Player {i + 1}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
  
  // Render match controls
  const renderMatchControls = () => {
    if (!canControlMatch) return null;
    
    return (
      <View style={styles.matchControls}>
        <Text style={styles.controlsTitle}>Match Controls</Text>
        <View style={styles.controlButtons}>
          {matchState?.status === 'SCHEDULED' && (
            <TouchableOpacity style={styles.controlButton} onPress={handleStartMatch}>
              <Ionicons name="play" size={20} color="white" />
              <Text style={styles.controlButtonText}>Start Match</Text>
            </TouchableOpacity>
          )}
          
          {matchState?.status === 'IN_PROGRESS' && (
            <>
              <TouchableOpacity style={styles.controlButton} onPress={handlePauseMatch}>
                <Ionicons name="pause" size={20} color="white" />
                <Text style={styles.controlButtonText}>Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.controlButton, styles.endButton]} 
                onPress={() => endMatch()}
              >
                <Ionicons name="stop" size={20} color="white" />
                <Text style={styles.controlButtonText}>End Match</Text>
              </TouchableOpacity>
            </>
          )}
          
          {matchState?.status === 'PAUSED' && (
            <>
              <TouchableOpacity style={styles.controlButton} onPress={handleResumeMatch}>
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.controlButtonText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.controlButton, styles.endButton]} 
                onPress={() => endMatch()}
              >
                <Ionicons name="stop" size={20} color="white" />
                <Text style={styles.controlButtonText}>End Match</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };
  
  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading match...</Text>
      </View>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={refreshMatch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Match Header */}
        {renderMatchHeader()}
        
        {/* Match Status */}
        {renderMatchStatus()}
        
        {/* Tab Navigation */}
        {renderTabNavigation()}
        
        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'lineup' && renderLineup()}
        
        {/* Match Controls */}
        {renderMatchControls()}
      </ScrollView>
      
      {/* Floating Action Button for Referees */}
      {isReferee && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            // @ts-ignore - Navigation type issue
            navigation.navigate('RefereeControl', {
              matchId,
              homeTeam,
              awayTeam,
              userRole,
              userId
            });
          }}
        >
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 80,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  scoreContainer: {
    backgroundColor: '#34495E',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  vs: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 5,
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  injuryTime: {
    fontSize: 16,
    color: '#E67E22',
    fontWeight: '600',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498DB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#3498DB',
  },
  tabContent: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  quickStats: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  possessionBar: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  possessionFill: {
    height: '100%',
  },
  possessionText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 12,
    color: '#7F8C8D',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  lastEvent: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  lastEventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    marginRight: 10,
  },
  eventDetails: {
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  timeline: {
    marginTop: 20,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timelineTime: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 10,
  },
  timelineMinute: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timelineContent: {
    flex: 1,
  },
  timelineEvent: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  timelineTeam: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  noEvents: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginTop: 20,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  eventCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  eventMinute: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  eventTeam: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  eventTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  noStats: {
    alignItems: 'center',
    padding: 40,
  },
  noStatsText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  possessionContainer: {
    alignItems: 'center',
  },
  possessionTeam: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 5,
  },
  possessionTeamName: {
    fontSize: 12,
    color: '#7F8C8D',
    flex: 1,
  },
  possessionPercentage: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  statComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statComparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  statComparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  statComparisonLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  statComparisonBar: {
    height: 8,
    backgroundColor: '#ECF0F1',
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  statComparisonFill: {
    height: '100%',
  },
  lineupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
  },
  lineupSection: {
    marginBottom: 30,
  },
  lineupTeamName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  lineupPlayers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lineupPlayer: {
    width: (width - 60) / 3,
    alignItems: 'center',
    marginBottom: 15,
  },
  playerNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECF0F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  playerNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  playerName: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  matchControls: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#E74C3C',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 