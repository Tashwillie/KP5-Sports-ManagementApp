import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLiveMatch } from '@kp5-academy/shared';

const { width, height } = Dimensions.get('window');

interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  teamId: string;
}

interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'corner' | 'foul' | 'shot' | 'save' | 'offside';
  team: 'home' | 'away';
  playerId?: string;
  playerName?: string;
  minute: number;
  second: number;
  description?: string;
  timestamp: Date;
}

interface EnhancedRefereeControlProps {
  matchId: string;
  homeTeam: {
    id: string;
    name: string;
    players: Player[];
    score: number;
  };
  awayTeam: {
    id: string;
    name: string;
    players: Player[];
    score: number;
  };
  onEventAdd: (event: Omit<MatchEvent, 'id' | 'timestamp'>) => Promise<boolean>;
  onScoreUpdate: (team: 'home' | 'away', score: number) => void;
  onMatchStateChange: (state: 'scheduled' | 'in_progress' | 'paused' | 'completed') => void;
}

export default function EnhancedRefereeControl({
  matchId,
  homeTeam,
  awayTeam,
  onEventAdd,
  onScoreUpdate,
  onMatchStateChange,
}: EnhancedRefereeControlProps) {
  const [matchTime, setMatchTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [matchStatus, setMatchStatus] = useState<'scheduled' | 'in_progress' | 'paused' | 'completed'>('scheduled');
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<MatchEvent['type']>('goal');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [eventMinute, setEventMinute] = useState('');
  const [eventSecond, setEventSecond] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning && matchStatus === 'in_progress') {
      timerRef.current = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, matchStatus]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartMatch = () => {
    setMatchStatus('in_progress');
    setIsTimerRunning(true);
    setMatchTime(0);
    onMatchStateChange('in_progress');
    
    const startEvent: Omit<MatchEvent, 'id' | 'timestamp'> = {
      type: 'other',
      team: 'home',
      minute: 0,
      second: 0,
      description: 'Match Started',
    };
    
    onEventAdd(startEvent);
    addEvent({
      id: Date.now().toString(),
      ...startEvent,
      timestamp: new Date(),
    });
  };

  const handlePauseMatch = () => {
    setMatchStatus('paused');
    setIsTimerRunning(false);
    onMatchStateChange('paused');
    
    const pauseEvent: Omit<MatchEvent, 'id' | 'timestamp'> = {
      type: 'other',
      team: 'home',
      minute: Math.floor(matchTime / 60),
      second: matchTime % 60,
      description: 'Match Paused',
    };
    
    onEventAdd(pauseEvent);
    addEvent({
      id: Date.now().toString(),
      ...pauseEvent,
      timestamp: new Date(),
    });
  };

  const handleResumeMatch = () => {
    setMatchStatus('in_progress');
    setIsTimerRunning(true);
    onMatchStateChange('in_progress');
    
    const resumeEvent: Omit<MatchEvent, 'id' | 'timestamp'> = {
      type: 'other',
      team: 'home',
      minute: Math.floor(matchTime / 60),
      second: matchTime % 60,
      description: 'Match Resumed',
    };
    
    onEventAdd(resumeEvent);
    addEvent({
      id: Date.now().toString(),
      ...resumeEvent,
      timestamp: new Date(),
    });
  };

  const handleEndMatch = () => {
    setMatchStatus('completed');
    setIsTimerRunning(false);
    onMatchStateChange('completed');
    
    const endEvent: Omit<MatchEvent, 'id' | 'timestamp'> = {
      type: 'other',
      team: 'home',
      minute: Math.floor(matchTime / 60),
      second: matchTime % 60,
      description: 'Match Ended',
    };
    
    onEventAdd(endEvent);
    addEvent({
      id: Date.now().toString(),
      ...endEvent,
      timestamp: new Date(),
    });
  };

  const addEvent = (event: MatchEvent) => {
    setEvents(prev => [event, ...prev]);
  };

  const handleAddGoal = async (team: 'home' | 'away') => {
    if (!selectedPlayer) {
      Alert.alert('Select Player', 'Please select a player for this goal');
      return;
    }

    const player = (team === 'home' ? homeTeam : awayTeam).players.find(p => p.id === selectedPlayer);
    if (!player) return;

    const goalEvent: Omit<MatchEvent, 'id' | 'timestamp'> = {
      type: 'goal',
      team,
      playerId: selectedPlayer,
      playerName: player.name,
      minute: Math.floor(matchTime / 60),
      second: matchTime % 60,
      description: `Goal scored by ${player.name}`,
    };

    const success = await onEventAdd(goalEvent);
    if (success) {
      addEvent({
        id: Date.now().toString(),
        ...goalEvent,
        timestamp: new Date(),
      });
      
      // Update score
      const newScore = (team === 'home' ? homeTeam.score : awayTeam.score) + 1;
      onScoreUpdate(team, newScore);
      
      // Reset form
      setSelectedPlayer('');
      setEventDescription('');
    }
  };

  const handleAddCard = async (team: 'home' | 'away', cardType: 'yellow_card' | 'red_card') => {
    if (!selectedPlayer) {
      Alert.alert('Select Player', 'Please select a player for this card');
      return;
    }

    const player = (team === 'home' ? homeTeam : awayTeam).players.find(p => p.id === selectedPlayer);
    if (!player) return;

    const cardEvent: Omit<MatchEvent, 'id' | 'timestamp'> = {
      type: cardType,
      team,
      playerId: selectedPlayer,
      playerName: player.name,
      minute: Math.floor(matchTime / 60),
      second: matchTime % 60,
      description: `${cardType.replace('_', ' ')} for ${player.name}`,
    };

    const success = await onEventAdd(cardEvent);
    if (success) {
      addEvent({
        id: Date.now().toString(),
        ...cardEvent,
        timestamp: new Date(),
      });
      
      // Reset form
      setSelectedPlayer('');
      setEventDescription('');
    }
  };

  const handleAddCustomEvent = async () => {
    if (!selectedPlayer || !eventDescription) {
      Alert.alert('Missing Information', 'Please select a player and add a description');
      return;
    }

    const player = (selectedTeam === 'home' ? homeTeam : awayTeam).players.find(p => p.id === selectedPlayer);
    if (!player) return;

    const customEvent: Omit<MatchEvent, 'id' | 'timestamp'> = {
      type: selectedEventType,
      team: selectedTeam,
      playerId: selectedPlayer,
      playerName: player.name,
      minute: parseInt(eventMinute) || Math.floor(matchTime / 60),
      second: parseInt(eventSecond) || matchTime % 60,
      description: eventDescription,
    };

    const success = await onEventAdd(customEvent);
    if (success) {
      addEvent({
        id: Date.now().toString(),
        ...customEvent,
        timestamp: new Date(),
      });
      
      // Reset form
      setSelectedPlayer('');
      setEventDescription('');
      setEventMinute('');
      setEventSecond('');
      setShowEventModal(false);
    }
  };

  const getStatusColor = () => {
    switch (matchStatus) {
      case 'in_progress': return '#10B981';
      case 'paused': return '#F59E0B';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (matchStatus) {
      case 'scheduled': return 'SCHEDULED';
      case 'in_progress': return 'LIVE';
      case 'paused': return 'PAUSED';
      case 'completed': return 'COMPLETED';
      default: return 'UNKNOWN';
    }
  };

  const getEventIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'goal': return <Ionicons name="football" size={16} color="#10B981" />;
      case 'yellow_card': return <Ionicons name="warning" size={16} color="#F59E0B" />;
      case 'red_card': return <Ionicons name="close-circle" size={16} color="#EF4444" />;
      case 'corner': return <Ionicons name="ellipse" size={16} color="#8B5CF6" />;
      case 'foul': return <Ionicons name="shield" size={16} color="#6B7280" />;
      case 'shot': return <Ionicons name="flash" size={16} color="#F97316" />;
      default: return <Ionicons name="information-circle" size={16} color="#6B7280" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={getStatusColor()} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.matchInfo}>
            <Text style={styles.matchTitle}>Match Control</Text>
            <Text style={styles.matchId}>ID: {matchId}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{homeTeam.name}</Text>
            <Text style={styles.score}>{homeTeam.score}</Text>
          </View>
          <View style={styles.vsContainer}>
            <Text style={styles.vsText}>VS</Text>
            <Text style={styles.timer}>{formatTime(matchTime)}</Text>
          </View>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{awayTeam.name}</Text>
            <Text style={styles.score}>{awayTeam.score}</Text>
          </View>
        </View>

        {/* Match Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            {matchStatus === 'scheduled' && (
              <TouchableOpacity style={[styles.controlButton, styles.startButton]} onPress={handleStartMatch}>
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.controlButtonText}>Start</Text>
              </TouchableOpacity>
            )}
            
            {matchStatus === 'in_progress' && (
              <>
                <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={handlePauseMatch}>
                  <Ionicons name="pause" size={24} color="white" />
                  <Text style={styles.controlButtonText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlButton, styles.endButton]} onPress={handleEndMatch}>
                  <Ionicons name="stop" size={24} color="white" />
                  <Text style={styles.controlButtonText}>End</Text>
                </TouchableOpacity>
              </>
            )}
            
            {matchStatus === 'paused' && (
              <>
                <TouchableOpacity style={[styles.controlButton, styles.resumeButton]} onPress={handleResumeMatch}>
                  <Ionicons name="play" size={24} color="white" />
                  <Text style={styles.controlButtonText}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlButton, styles.endButton]} onPress={handleEndMatch}>
                  <Ionicons name="stop" size={24} color="white" />
                  <Text style={styles.controlButtonText}>End</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#10B981' }]} 
              onPress={() => handleAddGoal(selectedTeam)}
            >
              <Ionicons name="football" size={24} color="white" />
              <Text style={styles.quickActionText}>Goal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#F59E0B' }]} 
              onPress={() => handleAddCard(selectedTeam, 'yellow_card')}
            >
              <Ionicons name="warning" size={24} color="white" />
              <Text style={styles.quickActionText}>Yellow</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#EF4444' }]} 
              onPress={() => handleAddCard(selectedTeam, 'red_card')}
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.quickActionText}>Red</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#8B5CF6' }]} 
              onPress={() => setShowEventModal(true)}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.quickActionText}>Custom</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Team Selection */}
        <View style={styles.teamSelectionContainer}>
          <Text style={styles.sectionTitle}>Team Selection</Text>
          <View style={styles.teamButtons}>
            <TouchableOpacity 
              style={[styles.teamButton, selectedTeam === 'home' && styles.selectedTeamButton]} 
              onPress={() => setSelectedTeam('home')}
            >
              <Text style={[styles.teamButtonText, selectedTeam === 'home' && styles.selectedTeamButtonText]}>
                {homeTeam.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.teamButton, selectedTeam === 'away' && styles.selectedTeamButton]} 
              onPress={() => setSelectedTeam('away')}
            >
              <Text style={[styles.teamButtonText, selectedTeam === 'away' && styles.selectedTeamButtonText]}>
                {awayTeam.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Player Selection */}
        <View style={styles.playerSelectionContainer}>
          <Text style={styles.sectionTitle}>Player Selection</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerScroll}>
            {(selectedTeam === 'home' ? homeTeam.players : awayTeam.players).map((player) => (
              <TouchableOpacity
                key={player.id}
                style={[styles.playerButton, selectedPlayer === player.id && styles.selectedPlayerButton]}
                onPress={() => setSelectedPlayer(player.id)}
              >
                <Text style={styles.playerNumber}>{player.number}</Text>
                <Text style={[styles.playerName, selectedPlayer === player.id && styles.selectedPlayerName]}>
                  {player.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Events */}
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>Recent Events</Text>
          <ScrollView style={styles.eventsScroll} showsVerticalScrollIndicator={false}>
            {events.slice(0, 10).map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <View style={styles.eventIcon}>
                  {getEventIcon(event.type)}
                </View>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                  <Text style={styles.eventTime}>
                    {event.minute}'{event.second.toString().padStart(2, '0')}"
                  </Text>
                </View>
                <View style={styles.eventTeam}>
                  <Text style={styles.eventTeamText}>
                    {event.team === 'home' ? homeTeam.name : awayTeam.name}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  matchInfo: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  matchId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
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
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  controlsContainer: {
    marginBottom: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  resumeButton: {
    backgroundColor: '#10B981',
  },
  endButton: {
    backgroundColor: '#EF4444',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
    minHeight: 80,
  },
  quickActionText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 12,
  },
  teamSelectionContainer: {
    marginBottom: 20,
  },
  teamButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  teamButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedTeamButton: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  teamButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedTeamButtonText: {
    color: '#3B82F6',
  },
  playerSelectionContainer: {
    marginBottom: 20,
  },
  playerScroll: {
    flexGrow: 0,
  },
  playerButton: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 80,
  },
  selectedPlayerButton: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  playerNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  playerName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedPlayerName: {
    color: '#10B981',
  },
  eventsContainer: {
    flex: 1,
  },
  eventsScroll: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventIcon: {
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventTeam: {
    alignItems: 'flex-end',
  },
  eventTeamText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
