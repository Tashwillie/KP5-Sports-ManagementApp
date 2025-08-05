import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LiveMatch, LiveMatchEvent, LiveMatchEventType } from '../../../shared/src/types';
import { useMobileLiveMatch } from '../hooks/useMobileApi';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  matchId: string;
}

export default function LiveMatchScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { matchId } = route.params as RouteParams;

  const [currentMinute, setCurrentMinute] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [eventType, setEventType] = useState<LiveMatchEventType>('goal');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState<any>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Use shared API hook with real-time updates
  const { 
    match, 
    loading, 
    error, 
    startMatch, 
    endMatch, 
    addEvent
  } = useMobileLiveMatch({ matchId, enableOffline: true });

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setCurrentMinute(prev => prev + 1);
      }, 60000); // 1 minute intervals
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const handleStartMatch = async () => {
    if (!match) return;
    
    const success = await startMatch();
    if (success) {
      setIsTimerRunning(true);
      startTimeRef.current = new Date();
    }
  };

  const pauseMatch = () => {
    setIsTimerRunning(false);
  };

  const resumeMatch = () => {
    setIsTimerRunning(true);
  };

  const handleEndMatch = async () => {
    if (!match) return;
    
    Alert.alert(
      'End Match',
      'Are you sure you want to end this match?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Match',
          style: 'destructive',
          onPress: async () => {
            const success = await endMatch();
            if (success) {
              setIsTimerRunning(false);
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleAddEvent = async () => {
    if (!selectedPlayer || !eventData) return;

    const eventPayload = {
      type: eventType,
      minute: currentMinute,
      team: selectedTeam,
      playerId: selectedPlayer,
      ...eventData,
      timestamp: new Date(),
    };

    const success = await addEvent(eventPayload);
    if (success) {
      setShowEventForm(false);
      setEventData({});
      setSelectedPlayer('');
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (eventType: LiveMatchEventType) => {
    switch (eventType) {
      case 'goal':
        return 'football';
      case 'yellow_card':
        return 'warning';
      case 'red_card':
        return 'close-circle';
      case 'substitution_in':
        return 'arrow-up';
      case 'substitution_out':
        return 'arrow-down';
      case 'injury':
        return 'medical';
      default:
        return 'help-circle';
    }
  };

  const getEventColor = (eventType: LiveMatchEventType) => {
    switch (eventType) {
      case 'goal':
        return '#10B981';
      case 'yellow_card':
        return '#F59E0B';
      case 'red_card':
        return '#EF4444';
      case 'substitution_in':
        return '#3B82F6';
      case 'substitution_out':
        return '#6B7280';
      case 'injury':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading match data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !match) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error?.message || 'Failed to load match data'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Match</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Match Info */}
        <View style={styles.matchInfo}>
          <Text style={styles.matchTitle}>
            Home Team vs Away Team
          </Text>
          <Text style={styles.matchStatus}>
            {match.status === 'scheduled' ? 'Not Started' : 
             match.status === 'in_progress' ? 'In Progress' : 'Completed'}
          </Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(currentMinute)}</Text>
          <View style={styles.timerControls}>
            {!isTimerRunning ? (
              <TouchableOpacity 
                style={[styles.timerButton, styles.startButton]} 
                onPress={handleStartMatch}
              >
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.timerButtonText}>Start</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.timerButton, styles.pauseButton]} 
                  onPress={pauseMatch}
                >
                  <Ionicons name="pause" size={20} color="#fff" />
                  <Text style={styles.timerButtonText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.timerButton, styles.endButton]} 
                  onPress={handleEndMatch}
                >
                  <Ionicons name="stop" size={20} color="#fff" />
                  <Text style={styles.timerButtonText}>End</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>Home</Text>
            <Text style={styles.scoreText}>{match.homeScore || 0}</Text>
          </View>
          <Text style={styles.vsText}>vs</Text>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>Away</Text>
            <Text style={styles.scoreText}>{match.awayScore || 0}</Text>
          </View>
        </View>

        {/* Event Form */}
        {showEventForm && (
          <View style={styles.eventForm}>
            <Text style={styles.eventFormTitle}>Add Event</Text>
            
            {/* Event Type Selection */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Event Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['goal', 'yellow_card', 'red_card', 'substitution_in', 'injury'] as LiveMatchEventType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.eventTypeButton,
                      eventType === type && styles.eventTypeButtonActive
                    ]}
                    onPress={() => setEventType(type)}
                  >
                    <Ionicons 
                      name={getEventIcon(type) as any} 
                      size={16} 
                      color={eventType === type ? '#fff' : getEventColor(type)} 
                    />
                    <Text style={[
                      styles.eventTypeText,
                      eventType === type && styles.eventTypeTextActive
                    ]}>
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Team Selection */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Team</Text>
              <View style={styles.teamSelection}>
                <TouchableOpacity
                  style={[
                    styles.teamButton,
                    selectedTeam === 'home' && styles.teamButtonActive
                  ]}
                  onPress={() => setSelectedTeam('home')}
                >
                  <Text style={[
                    styles.teamButtonText,
                    selectedTeam === 'home' && styles.teamButtonTextActive
                  ]}>
                    Home
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.teamButton,
                    selectedTeam === 'away' && styles.teamButtonActive
                  ]}
                  onPress={() => setSelectedTeam('away')}
                >
                  <Text style={[
                    styles.teamButtonText,
                    selectedTeam === 'away' && styles.teamButtonTextActive
                  ]}>
                    Away
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Player Selection */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Player</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Player 1', 'Player 2', 'Player 3', 'Player 4'].map((player, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.playerButton,
                      selectedPlayer === `player${index + 1}` && styles.playerButtonActive
                    ]}
                    onPress={() => setSelectedPlayer(`player${index + 1}`)}
                  >
                    <Text style={[
                      styles.playerButtonText,
                      selectedPlayer === `player${index + 1}` && styles.playerButtonTextActive
                    ]}>
                      {player}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowEventForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={handleAddEvent}
                disabled={!selectedPlayer}
              >
                <Text style={styles.addButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Add Event Button */}
        {!showEventForm && (
          <TouchableOpacity 
            style={styles.addEventButton} 
            onPress={() => setShowEventForm(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addEventButtonText}>Add Event</Text>
          </TouchableOpacity>
        )}

        {/* Events Timeline */}
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>Match Events</Text>
          {match.events && match.events.length > 0 ? (
            match.events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={styles.eventIcon}>
                  <Ionicons 
                    name={getEventIcon(event.type)} 
                    size={20} 
                    color={getEventColor(event.type)} 
                  />
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventText}>
                    {event.type.replace('_', ' ')} - Player
                  </Text>
                  <Text style={styles.eventTime}>{event.minute}'</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noEventsText}>No events recorded yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40, // Adjust as needed for spacing
  },
  content: {
    flex: 1,
  },
  matchInfo: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  matchStatus: {
    fontSize: 14,
    color: '#6B7280',
  },
  timerContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 12,
  },
  timerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  timerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: '#3B82F6',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  endButton: {
    backgroundColor: '#EF4444',
  },
  endButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamScore: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
  },
  vsText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
    marginHorizontal: 10,
  },
  eventForm: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  teamSelection: {
    flexDirection: 'row',
    gap: 10,
  },
  teamButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  teamButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  teamButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  teamButtonTextActive: {
    color: '#FFFFFF',
  },
  eventTypeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  eventTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 4,
  },
  eventTypeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  eventTypeTextActive: {
    color: '#FFFFFF',
  },
  playerSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  playerButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  playerButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  playerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  playerButtonTextActive: {
    color: '#FFFFFF',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addEventButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3B82F6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addEventButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  eventsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  noEventsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  eventsList: {
    gap: 8,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  eventTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
}); 