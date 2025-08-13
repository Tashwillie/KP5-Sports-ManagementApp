import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLiveMatch } from '@kp5-academy/shared';

const { width, height } = Dimensions.get('window');

interface LiveMatchRefereeScreenProps {
  route: {
    params: {
      matchId: string;
      homeTeam: string;
      awayTeam: string;
    };
  };
}

interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'other';
  team: 'home' | 'away';
  playerId?: string;
  playerName?: string;
  minute: number;
  description?: string;
  timestamp: Date;
}

export default function LiveMatchRefereeScreen({ route }: LiveMatchRefereeScreenProps) {
  const navigation = useNavigation();
  const { matchId, homeTeam, awayTeam } = route.params;
  
  const [matchTime, setMatchTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [matchStatus, setMatchStatus] = useState<'scheduled' | 'in_progress' | 'paused' | 'completed'>('scheduled');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<MatchEvent['type']>('goal');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    addEvent({
      id: Date.now().toString(),
      type: 'other',
      team: 'home',
      minute: 0,
      description: 'Match Started',
      timestamp: new Date()
    });
  };

  const handlePauseMatch = () => {
    setMatchStatus('paused');
    setIsTimerRunning(false);
    addEvent({
      id: Date.now().toString(),
      type: 'other',
      team: 'home',
      minute: matchTime,
      description: 'Match Paused',
      timestamp: new Date()
    });
  };

  const handleResumeMatch = () => {
    setMatchStatus('in_progress');
    setIsTimerRunning(true);
    addEvent({
      id: Date.now().toString(),
      type: 'other',
      team: 'home',
      minute: matchTime,
      description: 'Match Resumed',
      timestamp: new Date()
    });
  };

  const handleEndMatch = () => {
    setMatchStatus('completed');
    setIsTimerRunning(false);
    addEvent({
      id: Date.now().toString(),
      type: 'other',
      team: 'home',
      minute: matchTime,
      description: 'Match Ended',
      timestamp: new Date()
    });
    
    Alert.alert(
      'Match Complete',
      `Final Score: ${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const addEvent = (event: MatchEvent) => {
    setEvents(prev => [event, ...prev]);
    
    // Update scores for goals
    if (event.type === 'goal') {
      if (event.team === 'home') {
        setHomeScore(prev => prev + 1);
      } else {
        setAwayScore(prev => prev + 1);
      }
    }
  };

  const handleAddGoal = (team: 'home' | 'away') => {
    addEvent({
      id: Date.now().toString(),
      type: 'goal',
      team,
      minute: Math.floor(matchTime / 60),
      description: `Goal scored by ${team === 'home' ? homeTeam : awayTeam}`,
      timestamp: new Date()
    });
  };

  const handleAddCard = (team: 'home' | 'away', cardType: 'yellow_card' | 'red_card') => {
    addEvent({
      id: Date.now().toString(),
      type: cardType,
      team,
      minute: Math.floor(matchTime / 60),
      description: `${cardType === 'yellow_card' ? 'Yellow' : 'Red'} card for ${team === 'home' ? homeTeam : awayTeam}`,
      timestamp: new Date()
    });
  };

  const getStatusColor = () => {
    switch (matchStatus) {
      case 'in_progress':
        return '#10B981';
      case 'paused':
        return '#F59E0B';
      case 'completed':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (matchStatus) {
      case 'in_progress':
        return 'LIVE';
      case 'paused':
        return 'PAUSED';
      case 'completed':
        return 'FULL TIME';
      default:
        return 'SCHEDULED';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Match Control</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Match Score Display */}
        <View style={styles.scoreContainer}>
          <View style={styles.teamContainer}>
            <Text style={styles.teamName}>{homeTeam}</Text>
            <Text style={styles.teamScore}>{homeScore}</Text>
          </View>
          
          <View style={styles.scoreDivider}>
            <Text style={styles.vsText}>VS</Text>
            <Text style={styles.matchTime}>{formatTime(matchTime)}</Text>
          </View>
          
          <View style={styles.teamContainer}>
            <Text style={styles.teamName}>{awayTeam}</Text>
            <Text style={styles.teamScore}>{awayScore}</Text>
          </View>
        </View>

        {/* Match Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            {matchStatus === 'scheduled' && (
              <TouchableOpacity style={[styles.controlButton, styles.startButton]} onPress={handleStartMatch}>
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.controlButtonText}>Start Match</Text>
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
                  <Text style={styles.controlButtonText}>End Match</Text>
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
                  <Text style={styles.controlButtonText}>End Match</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Quick Event Buttons */}
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>Quick Events</Text>
          
          {/* Team Selection */}
          <View style={styles.teamSelection}>
            <TouchableOpacity
              style={[styles.teamButton, selectedTeam === 'home' && styles.teamButtonActive]}
              onPress={() => setSelectedTeam('home')}
            >
              <Text style={[styles.teamButtonText, selectedTeam === 'home' && styles.teamButtonTextActive]}>
                {homeTeam}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.teamButton, selectedTeam === 'away' && styles.teamButtonActive]}
              onPress={() => setSelectedTeam('away')}
            >
              <Text style={[styles.teamButtonText, selectedTeam === 'away' && styles.teamButtonTextActive]}>
                {awayTeam}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Event Buttons */}
          <View style={styles.eventButtons}>
            <TouchableOpacity
              style={[styles.eventButton, styles.goalButton]}
              onPress={() => handleAddGoal(selectedTeam)}
            >
              <Ionicons name="football" size={24} color="white" />
              <Text style={styles.eventButtonText}>Goal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.eventButton, styles.yellowCardButton]}
              onPress={() => handleAddCard(selectedTeam, 'yellow_card')}
            >
              <Ionicons name="warning" size={24} color="white" />
              <Text style={styles.eventButtonText}>Yellow Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.eventButton, styles.redCardButton]}
              onPress={() => handleAddCard(selectedTeam, 'red_card')}
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.eventButtonText}>Red Card</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Match Events Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Match Events</Text>
          <View style={styles.timeline}>
            {events.map((event, index) => (
              <View key={event.id} style={styles.timelineEvent}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                  <Text style={styles.eventTime}>{event.minute}'</Text>
                </View>
              </View>
            ))}
            {events.length === 0 && (
              <Text style={styles.noEventsText}>No events recorded yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 40,
  },
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  teamContainer: {
    alignItems: 'center',
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  teamScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scoreDivider: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  matchTime: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  controlsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  eventsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  teamSelection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  teamButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  teamButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  teamButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  teamButtonTextActive: {
    color: '#3B82F6',
  },
  eventButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  goalButton: {
    backgroundColor: '#10B981',
  },
  yellowCardButton: {
    backgroundColor: '#F59E0B',
  },
  redCardButton: {
    backgroundColor: '#EF4444',
  },
  eventButtonText: {
    color: 'white',
    fontWeight: '600',
    marginTop: 4,
    fontSize: 12,
  },
  timelineContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeline: {
    marginTop: 16,
  },
  timelineEvent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventDescription: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  eventTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 8,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});
