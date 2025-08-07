import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';
import { useApi } from '../providers/ApiProvider';
import { LiveMatch, LiveMatchEvent, LiveMatchEventType } from '../../../shared/src/types';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  matchId: string;
}

export default function LiveMatchScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { api } = useApi();
  
  const { matchId } = route.params as RouteParams;

  // State
  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReferee, setIsReferee] = useState(false);
  const [matchTime, setMatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventType, setEventType] = useState<LiveMatchEventType | null>(null);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load match data
  useEffect(() => {
    loadMatch();
  }, [matchId]);

  // Check if user is referee
  useEffect(() => {
    if (match && user) {
      setIsReferee(match.refereeId === user.id || user.role === 'referee');
    }
  }, [match, user]);

  // Timer effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // Pulse animation for live indicator
  useEffect(() => {
    if (match?.status === 'in_progress') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [match?.status]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      const matchData = await api.getLiveMatch(matchId);
      setMatch(matchData);
      
      if (matchData.status === 'in_progress') {
        setIsRunning(true);
        // Calculate elapsed time
        const startTime = new Date(matchData.startTime).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setMatchTime(elapsed);
      }
    } catch (error) {
      console.error('Error loading match:', error);
      Alert.alert('Error', 'Failed to load match data');
    } finally {
      setLoading(false);
    }
  };

  const startMatch = async () => {
    try {
      await api.startLiveMatch(matchId);
      setIsRunning(true);
      setMatchTime(0);
      Alert.alert('Success', 'Match started!');
    } catch (error) {
      console.error('Error starting match:', error);
      Alert.alert('Error', 'Failed to start match');
    }
  };

  const pauseMatch = async () => {
    try {
      await api.pauseLiveMatch(matchId);
      setIsRunning(false);
      Alert.alert('Success', 'Match paused');
    } catch (error) {
      console.error('Error pausing match:', error);
      Alert.alert('Error', 'Failed to pause match');
    }
  };

  const resumeMatch = async () => {
    try {
      await api.resumeLiveMatch(matchId);
      setIsRunning(true);
      Alert.alert('Success', 'Match resumed');
    } catch (error) {
      console.error('Error resuming match:', error);
      Alert.alert('Error', 'Failed to resume match');
    }
  };

  const endMatch = async () => {
    Alert.alert(
      'End Match',
      'Are you sure you want to end this match?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Match',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.endLiveMatch(matchId);
              setIsRunning(false);
              Alert.alert('Success', 'Match ended');
            } catch (error) {
              console.error('Error ending match:', error);
              Alert.alert('Error', 'Failed to end match');
            }
          },
        },
      ]
    );
  };

  const addEvent = async (eventData: Partial<LiveMatchEvent>) => {
    try {
      await api.addMatchEvent(matchId, eventData);
      setShowEventModal(false);
      setEventType(null);
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', 'Failed to add event');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#FFA500';
      case 'in_progress':
        return '#00FF00';
      case 'paused':
        return '#FFFF00';
      case 'completed':
        return '#FF0000';
      default:
        return '#808080';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading match...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Match not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.matchTitle}>
            {match.homeTeamId} vs {match.awayTeamId}
          </Text>
          <View style={styles.statusContainer}>
            <Animated.View
              style={[
                styles.liveIndicator,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: getStatusColor(match.status),
                },
              ]}
            />
            <Text style={styles.statusText}>
              {match.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{match.homeTeamId}</Text>
          <Text style={styles.score}>{match.homeScore}</Text>
        </View>
        
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.matchTime}>{formatTime(matchTime)}</Text>
        </View>
        
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{match.awayTeamId}</Text>
          <Text style={styles.score}>{match.awayScore}</Text>
        </View>
      </View>

      {/* Match Controls (Referee Only) */}
      {isReferee && (
        <View style={styles.controlsContainer}>
          <Text style={styles.controlsTitle}>Match Controls</Text>
          <View style={styles.controlsRow}>
            {match.status === 'scheduled' && (
              <TouchableOpacity style={styles.controlButton} onPress={startMatch}>
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.controlText}>Start</Text>
              </TouchableOpacity>
            )}
            
            {match.status === 'in_progress' && (
              <>
                <TouchableOpacity style={styles.controlButton} onPress={pauseMatch}>
                  <Ionicons name="pause" size={24} color="white" />
                  <Text style={styles.controlText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={endMatch}>
                  <Ionicons name="stop" size={24} color="white" />
                  <Text style={styles.controlText}>End</Text>
                </TouchableOpacity>
              </>
            )}
            
            {match.status === 'paused' && (
              <TouchableOpacity style={styles.controlButton} onPress={resumeMatch}>
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.controlText}>Resume</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      {isReferee && match.status === 'in_progress' && (
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                setEventType('goal');
                setShowEventModal(true);
              }}
            >
              <Ionicons name="football" size={24} color="#FF6B6B" />
              <Text style={styles.quickActionText}>Goal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                setEventType('yellow_card');
                setShowEventModal(true);
              }}
            >
              <Ionicons name="warning" size={24} color="#FFD93D" />
              <Text style={styles.quickActionText}>Yellow Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                setEventType('red_card');
                setShowEventModal(true);
              }}
            >
              <Ionicons name="close-circle" size={24} color="#FF0000" />
              <Text style={styles.quickActionText}>Red Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                setEventType('substitution');
                setShowEventModal(true);
              }}
            >
              <Ionicons name="swap-horizontal" size={24} color="#4ECDC4" />
              <Text style={styles.quickActionText}>Substitution</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Match Statistics */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Match Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Possession</Text>
            <Text style={styles.statValue}>
              {match.stats.possession.home}% - {match.stats.possession.away}%
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Shots</Text>
            <Text style={styles.statValue}>
              {match.stats.shots.home} - {match.stats.shots.away}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Corners</Text>
            <Text style={styles.statValue}>
              {match.stats.corners.home} - {match.stats.corners.away}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Fouls</Text>
            <Text style={styles.statValue}>
              {match.stats.fouls.home} - {match.stats.fouls.away}
            </Text>
          </View>
        </View>
      </View>

      {/* Match Events */}
      <View style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>Match Events</Text>
        {match.events.length === 0 ? (
          <Text style={styles.noEventsText}>No events yet</Text>
        ) : (
          <View style={styles.eventsList}>
            {match.events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={styles.eventTime}>
                  <Text style={styles.eventTimeText}>{formatTime(event.timestamp)}</Text>
                </View>
                <View style={styles.eventContent}>
                  <Text style={styles.eventText}>
                    {event.type.replace('_', ' ').toUpperCase()}
                  </Text>
                  {event.playerId && (
                    <Text style={styles.eventPlayer}>Player: {event.playerId}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Match Notes */}
      {match.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{match.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamScore: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  matchTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  controlsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  quickActionsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: (width - 80) / 2,
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  eventsContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  eventsList: {
    maxHeight: 200,
  },
  eventItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  eventTime: {
    width: 60,
    marginRight: 12,
  },
  eventTimeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  eventContent: {
    flex: 1,
  },
  eventText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  eventPlayer: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  notesContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
}); 