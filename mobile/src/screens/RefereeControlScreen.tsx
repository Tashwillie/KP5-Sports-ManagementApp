import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Switch,
  Platform,
  StatusBar,
  BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRealTimeService } from '@kp5-academy/shared';
import { useLiveStatistics } from '@kp5-academy/shared';
import { RealTimeStatisticsService } from '@kp5-academy/shared';
import EventEntryForm from '../components/EventEntryForm';

const { width, height } = Dimensions.get('window');

interface RefereeControlScreenProps {
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
  lastEvent?: string;
  lastEventTime?: string;
}

export default function RefereeControlScreen({ route }: RefereeControlScreenProps) {
  const navigation = useNavigation();
  const { matchId, homeTeam, awayTeam, userRole, userId } = route.params;
  
  const [matchState, setMatchState] = useState<MatchState>({
    status: 'SCHEDULED',
    currentPeriod: 'FIRST_HALF',
    timeElapsed: 0,
    injuryTime: 0,
    homeScore: 0,
    awayScore: 0
  });
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [quickActions, setQuickActions] = useState<string[]>([]);
  
  const realTimeService = useRealTimeService();
  const statisticsService = new RealTimeStatisticsService(realTimeService);
  const { matchStats, playerMatchStats, loading, errors } = useLiveStatistics(
    statisticsService,
    matchId,
    { autoRefresh: true, refreshInterval: 1000 }
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Date>(new Date());

  // Initialize WebSocket connection and match state
  useEffect(() => {
    if (realTimeService.isConnected) {
      joinMatchRoom();
      fetchMatchState();
      setupEventListeners();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      leaveMatchRoom();
    };
  }, [realTimeService.isConnected]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showEventModal || showSettingsModal || showConfirmModal) {
        setShowEventModal(false);
        setShowSettingsModal(false);
        setShowConfirmModal(false);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [showEventModal, showSettingsModal, showConfirmModal]);

  const joinMatchRoom = useCallback(() => {
    realTimeService.socket?.emit('join-match-room', {
      matchId,
      userId,
      userRole,
      permissions: ['referee', 'admin']
    });
  }, [matchId, userId, userRole, realTimeService.socket]);

  const leaveMatchRoom = useCallback(() => {
    realTimeService.socket?.emit('leave-match-room', { matchId, userId });
  }, [matchId, userId, realTimeService.socket]);

  const fetchMatchState = useCallback(async () => {
    try {
      const response = await realTimeService.socket?.emit('get-match-state', { matchId });
      if (response) {
        setMatchState(response);
      }
    } catch (error) {
      console.error('Error fetching match state:', error);
    }
  }, [matchId, realTimeService.socket]);

  const setupEventListeners = useCallback(() => {
    if (!realTimeService.socket) return;

    realTimeService.socket.on('match-state-updated', (data: any) => {
      if (data.matchId === matchId) {
        setMatchState(data.state);
        updateQuickActions(data.state);
      }
    });

    realTimeService.socket.on('match-event-recorded', (data: any) => {
      if (data.matchId === matchId) {
        // Update local state based on event
        updateMatchStateFromEvent(data.event);
      }
    });

    realTimeService.socket.on('timer-updated', (data: any) => {
      if (data.matchId === matchId) {
        setMatchState(prev => ({
          ...prev,
          timeElapsed: data.timeElapsed,
          injuryTime: data.injuryTime
        }));
      }
    });
  }, [matchId, realTimeService.socket]);

  const updateMatchStateFromEvent = useCallback((event: any) => {
    setMatchState(prev => {
      const newState = { ...prev };
      
      switch (event.type) {
        case 'goal':
          if (event.teamId === homeTeam.id) {
            newState.homeScore = prev.homeScore + 1;
          } else {
            newState.awayScore = prev.awayScore + 1;
          }
          break;
        case 'period_start':
          newState.currentPeriod = event.data.period;
          break;
        case 'period_end':
          if (event.data.period === 'FIRST_HALF') {
            newState.currentPeriod = 'HALFTIME';
          } else if (event.data.period === 'SECOND_HALF') {
            newState.currentPeriod = 'COMPLETED';
            newState.status = 'COMPLETED';
          }
          break;
      }
      
      newState.lastEvent = `${event.type} - ${event.description || 'Event recorded'}`;
      newState.lastEventTime = new Date().toLocaleTimeString();
      
      return newState;
    });
  }, [homeTeam.id]);

  const updateQuickActions = useCallback((state: MatchState) => {
    const actions = [];
    
    if (state.status === 'SCHEDULED') {
      actions.push('start_match', 'delay_match', 'cancel_match');
    } else if (state.status === 'IN_PROGRESS') {
      if (state.currentPeriod === 'FIRST_HALF') {
        actions.push('pause_match', 'end_first_half', 'add_injury_time');
      } else if (state.currentPeriod === 'HALFTIME') {
        actions.push('start_second_half', 'extend_halftime');
      } else if (state.currentPeriod === 'SECOND_HALF') {
        actions.push('pause_match', 'end_match', 'add_injury_time', 'add_extra_time');
      }
    } else if (state.status === 'PAUSED') {
      actions.push('resume_match', 'end_match');
    }
    
    setQuickActions(actions);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    
    timerRef.current = setInterval(() => {
      setMatchState(prev => ({
        ...prev,
        timeElapsed: prev.timeElapsed + 1
      }));
    }, 1000);
    
    setIsTimerRunning(true);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
  }, []);

  const handleMatchAction = useCallback(async (action: string) => {
    try {
      switch (action) {
        case 'start_match':
          await realTimeService.socket?.emit('start-match', { matchId, userId });
          setMatchState(prev => ({ ...prev, status: 'IN_PROGRESS' }));
          startTimer();
          break;
          
        case 'pause_match':
          await realTimeService.socket?.emit('pause-match', { matchId, userId });
          setMatchState(prev => ({ ...prev, status: 'PAUSED' }));
          stopTimer();
          break;
          
        case 'resume_match':
          await realTimeService.socket?.emit('resume-match', { matchId, userId });
          setMatchState(prev => ({ ...prev, status: 'IN_PROGRESS' }));
          startTimer();
          break;
          
        case 'end_first_half':
          await realTimeService.socket?.emit('end-period', { 
            matchId, 
            userId, 
            period: 'FIRST_HALF',
            timeElapsed: matchState.timeElapsed
          });
          setMatchState(prev => ({ 
            ...prev, 
            currentPeriod: 'HALFTIME',
            status: 'PAUSED'
          }));
          stopTimer();
          break;
          
        case 'start_second_half':
          await realTimeService.socket?.emit('start-period', { 
            matchId, 
            userId, 
            period: 'SECOND_HALF'
          });
          setMatchState(prev => ({ 
            ...prev, 
            currentPeriod: 'SECOND_HALF',
            status: 'IN_PROGRESS'
          }));
          startTimer();
          break;
          
        case 'end_match':
          await realTimeService.socket?.emit('end-match', { 
            matchId, 
            userId,
            timeElapsed: matchState.timeElapsed
          });
          setMatchState(prev => ({ 
            ...prev, 
            status: 'COMPLETED',
            currentPeriod: 'COMPLETED'
          }));
          stopTimer();
          break;
          
        case 'add_injury_time':
          setShowEventModal(true);
          setSelectedEventType('injury_time');
          break;
          
        case 'add_extra_time':
          setShowEventModal(true);
          setSelectedEventType('period_start');
          break;
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      Alert.alert('Error', `Failed to ${action.replace('_', ' ')}`);
    }
  }, [matchId, userId, realTimeService.socket, matchState.timeElapsed, startTimer, stopTimer]);

  const handleQuickEvent = useCallback((eventType: string) => {
    setSelectedEventType(eventType);
    setShowEventModal(true);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getPeriodLabel = useCallback((period: string) => {
    switch (period) {
      case 'FIRST_HALF': return '1st Half';
      case 'HALFTIME': return 'Halftime';
      case 'SECOND_HALF': return '2nd Half';
      case 'EXTRA_TIME': return 'Extra Time';
      case 'PENALTIES': return 'Penalties';
      default: return period;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return '#10B981';
      case 'PAUSED': return '#F59E0B';
      case 'COMPLETED': return '#6B7280';
      case 'CANCELLED': return '#EF4444';
      default: return '#6B7280';
    }
  }, []);

  const renderMatchHeader = () => (
    <View style={styles.matchHeader}>
      <View style={styles.teamSection}>
        <Text style={styles.teamName}>{homeTeam.name}</Text>
        <Text style={styles.score}>{matchState.homeScore}</Text>
      </View>
      
      <View style={styles.matchInfo}>
        <Text style={styles.vsText}>VS</Text>
        <Text style={styles.periodText}>{getPeriodLabel(matchState.currentPeriod)}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(matchState.status) }]}>
          <Text style={styles.statusText}>{matchState.status.replace('_', ' ')}</Text>
        </View>
      </View>
      
      <View style={styles.teamSection}>
        <Text style={styles.teamName}>{awayTeam.name}</Text>
        <Text style={styles.score}>{matchState.awayScore}</Text>
      </View>
    </View>
  );

  const renderTimer = () => (
    <View style={styles.timerSection}>
      <View style={styles.timerDisplay}>
        <Text style={styles.timerText}>{formatTime(matchState.timeElapsed)}</Text>
        {matchState.injuryTime > 0 && (
          <Text style={styles.injuryTimeText}>+{matchState.injuryTime}'</Text>
        )}
      </View>
      
      <View style={styles.timerControls}>
        <TouchableOpacity
          style={[styles.timerButton, isTimerRunning && styles.timerButtonActive]}
          onPress={() => isTimerRunning ? stopTimer() : startTimer()}
        >
          <Ionicons 
            name={isTimerRunning ? 'pause' : 'play'} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => handleMatchAction('add_injury_time')}
        >
          <Ionicons name="time" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action}
            style={styles.actionButton}
            onPress={() => handleMatchAction(action)}
          >
            <Text style={styles.actionButtonText}>
              {action.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEventButtons = () => (
    <View style={styles.eventButtonsSection}>
      <Text style={styles.sectionTitle}>Record Events</Text>
      <View style={styles.eventGrid}>
        {[
          { type: 'goal', icon: 'football', color: '#10B981' },
          { type: 'yellow_card', icon: 'warning', color: '#F59E0B' },
          { type: 'red_card', icon: 'close-circle', color: '#EF4444' },
          { type: 'substitution', icon: 'swap-horizontal', color: '#3B82F6' },
          { type: 'injury', icon: 'medical', color: '#8B5CF6' },
          { type: 'corner', icon: 'corner', color: '#06B6D4' },
          { type: 'foul', icon: 'hand-left', color: '#F97316' },
          { type: 'other', icon: 'ellipsis-horizontal', color: '#6B7280' }
        ].map((event) => (
          <TouchableOpacity
            key={event.type}
            style={[styles.eventButton, { backgroundColor: event.color }]}
            onPress={() => handleQuickEvent(event.type)}
          >
            <Ionicons name={event.icon as any} size={24} color="white" />
            <Text style={styles.eventButtonText}>
              {event.type.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMatchStats = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Live Statistics</Text>
      {matchStats ? (
        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Shots</Text>
            <Text style={styles.statValue}>{matchStats.home.shots} - {matchStats.away.shots}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Possession</Text>
            <Text style={styles.statValue}>{matchStats.home.possession}% - {matchStats.away.possession}%</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Corners</Text>
            <Text style={styles.statValue}>{matchStats.home.corners} - {matchStats.away.corners}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Fouls</Text>
            <Text style={styles.statValue}>{matchStats.home.fouls} - {matchStats.away.fouls}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noStatsText}>No statistics available</Text>
      )}
    </View>
  );

  const renderLastEvent = () => (
    matchState.lastEvent && (
      <View style={styles.lastEventSection}>
        <Text style={styles.sectionTitle}>Last Event</Text>
        <View style={styles.lastEventCard}>
          <Text style={styles.lastEventText}>{matchState.lastEvent}</Text>
          <Text style={styles.lastEventTime}>{matchState.lastEventTime}</Text>
        </View>
      </View>
    )
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Referee Control</Text>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowSettingsModal(true)}
        >
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderMatchHeader()}
        {renderTimer()}
        {renderQuickActions()}
        {renderEventButtons()}
        {renderMatchStats()}
        {renderLastEvent()}
      </ScrollView>

      {/* Event Entry Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEventModal(false)}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Record Event</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <EventEntryForm
            matchId={matchId}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            userRole={userRole}
            userId={userId}
            preSelectedEventType={selectedEventType}
            onEventRecorded={() => setShowEventModal(false)}
            onCancel={() => setShowEventModal(false)}
          />
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSettingsModal(false)}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Match Settings</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.settingsContent}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Auto-save Events</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Sound Notifications</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Vibration Feedback</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
            
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={() => {
                setShowSettingsModal(false);
                setConfirmAction('end_match');
                setShowConfirmModal(true);
              }}
            >
              <Text style={styles.dangerButtonText}>End Match</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Confirm Action</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to {confirmAction.replace('_', ' ')}?
            </Text>
            
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmActionButton]}
                onPress={() => {
                  setShowConfirmModal(false);
                  handleMatchAction(confirmAction);
                }}
              >
                <Text style={styles.confirmActionButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#1F2937',
  },
  
  backButton: {
    padding: 8,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  
  settingsButton: {
    padding: 8,
  },
  
  content: {
    flex: 1,
    padding: 16,
  },
  
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  teamSection: {
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  matchInfo: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  
  periodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  
  timerSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  
  injuryTimeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 4,
  },
  
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  
  timerButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  
  timerButtonActive: {
    backgroundColor: '#EF4444',
  },
  
  quickActionsSection: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  eventButtonsSection: {
    marginBottom: 16,
  },
  
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  eventButton: {
    width: (width - 64) / 4,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  eventButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  
  statsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  statsGrid: {
    gap: 12,
  },
  
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  
  noStatsText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  lastEventSection: {
    marginBottom: 16,
  },
  
  lastEventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  lastEventText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  
  lastEventTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  modalCloseButton: {
    padding: 8,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  
  settingsContent: {
    flex: 1,
    padding: 16,
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  settingLabel: {
    fontSize: 16,
    color: '#374151',
  },
  
  dangerButton: {
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  
  dangerButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  
  confirmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  confirmMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  
  confirmActionButton: {
    backgroundColor: '#EF4444',
  },
  
  confirmActionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
