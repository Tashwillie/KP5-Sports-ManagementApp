import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LiveMatchEventType, LiveMatchEventData } from '../../../shared/src/types';

const { width, height } = Dimensions.get('window');

interface MatchTimerState {
  currentMinute: number;
  currentPeriod: 'first_half' | 'halftime' | 'second_half' | 'extra_time' | 'penalties';
  isTimerRunning: boolean;
  totalPlayTime: number;
  pausedTime: number;
  injuryTime: number;
  periodDuration: number;
}

interface LiveMatchControlProps {
  matchId: string;
  currentMinute: number;
  isTimerRunning: boolean;
  onStartMatch: () => Promise<boolean>;
  onPauseMatch: () => void;
  onResumeMatch: () => void;
  onEndMatch: () => Promise<boolean>;
  onAddEvent: (event: {
    type: LiveMatchEventType;
    minute: number;
    playerId: string;
    teamId: string;
    data: LiveMatchEventData;
  }) => Promise<boolean>;
  onTimerControl: (action: string, additionalData?: any) => Promise<boolean>;
  homeTeam: {
    id: string;
    name: string;
    players: Array<{ id: string; name: string; number: number }>;
  };
  awayTeam: {
    id: string;
    name: string;
    players: Array<{ id: string; name: string; number: number }>;
  };
  matchStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  timerState?: MatchTimerState;
}

export default function LiveMatchControl({
  matchId,
  currentMinute,
  isTimerRunning,
  onStartMatch,
  onPauseMatch,
  onResumeMatch,
  onEndMatch,
  onAddEvent,
  onTimerControl,
  homeTeam,
  awayTeam,
  matchStatus,
  timerState
}: LiveMatchControlProps) {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [eventType, setEventType] = useState<LiveMatchEventType>('goal');
  const [fieldPosition, setFieldPosition] = useState({ x: 50, y: 50 });
  const [eventDescription, setEventDescription] = useState('');
  
  // Timer control states
  const [injuryTimeMinutes, setInjuryTimeMinutes] = useState(1);
  const [customPeriodDuration, setCustomPeriodDuration] = useState(45);
  const [selectedPeriod, setSelectedPeriod] = useState<'first_half' | 'halftime' | 'second_half' | 'extra_time' | 'penalties'>('first_half');
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Initialize local timer state
  const [localTimerState, setLocalTimerState] = useState<MatchTimerState>({
    currentMinute: currentMinute,
    currentPeriod: 'first_half',
    isTimerRunning: isTimerRunning,
    totalPlayTime: 0,
    pausedTime: 0,
    injuryTime: 0,
    periodDuration: 45
  });

  // Update local timer state when props change
  useEffect(() => {
    if (timerState) {
      setLocalTimerState(timerState);
    } else {
      setLocalTimerState(prev => ({
        ...prev,
        currentMinute,
        isTimerRunning
      }));
    }
  }, [timerState, currentMinute, isTimerRunning]);

  // Pulse animation for live indicator
  useEffect(() => {
    if (matchStatus === 'in_progress' && isTimerRunning) {
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [matchStatus, isTimerRunning]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatPeriodName = (period: string) => {
    switch (period) {
      case 'first_half': return '1st Half';
      case 'halftime': return 'Halftime';
      case 'second_half': return '2nd Half';
      case 'extra_time': return 'Extra Time';
      case 'penalties': return 'Penalties';
      default: return period;
    }
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'first_half': return '#3B82F6';
      case 'halftime': return '#F59E0B';
      case 'second_half': return '#10B981';
      case 'extra_time': return '#8B5CF6';
      case 'penalties': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleTimerControl = async (action: string, additionalData?: any) => {
    try {
      const success = await onTimerControl(action, additionalData);
      if (success) {
        console.log(`Timer control ${action} successful`);
      }
    } catch (error) {
      console.error(`Timer control ${action} failed:`, error);
    }
  };

  const handleQuickEvent = async (type: LiveMatchEventType) => {
    if (!selectedPlayer) {
      Alert.alert('Select Player', 'Please select a player first');
      return;
    }

    const teamId = selectedTeam === 'home' ? homeTeam.id : awayTeam.id;
    
    const success = await onAddEvent({
      type,
      minute: currentMinute,
      playerId: selectedPlayer,
      teamId,
      data: {
        description: eventDescription,
        position: fieldPosition,
      },
    });

    if (success) {
      setEventDescription('');
      setFieldPosition({ x: 50, y: 50 });
    }
  };

  const handleStartMatch = async () => {
    const success = await onStartMatch();
    if (!success) {
      Alert.alert('Error', 'Failed to start match');
    }
  };

  const handleEndMatch = async () => {
    Alert.alert(
      'End Match',
      'Are you sure you want to end this match? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Match',
          style: 'destructive',
          onPress: async () => {
            const success = await onEndMatch();
            if (!success) {
              Alert.alert('Error', 'Failed to end match');
            }
          },
        },
      ]
    );
  };

  const getEventIcon = (type: LiveMatchEventType) => {
    switch (type) {
      case 'goal':
        return 'football';
      case 'yellow_card':
        return 'warning';
      case 'red_card':
        return 'close-circle';
      case 'substitution_in':
        return 'arrow-forward';
      case 'substitution_out':
        return 'arrow-back';
      case 'injury':
        return 'medical';
      default:
        return 'add';
    }
  };

  const getEventColor = (type: LiveMatchEventType) => {
    switch (type) {
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

  const quickEvents: Array<{ type: LiveMatchEventType; label: string; icon: string }> = [
    { type: 'goal', label: 'Goal', icon: 'football' },
    { type: 'yellow_card', label: 'Yellow Card', icon: 'warning' },
    { type: 'red_card', label: 'Red Card', icon: 'close-circle' },
    { type: 'substitution_in', label: 'Sub In', icon: 'arrow-forward' },
    { type: 'substitution_out', label: 'Sub Out', icon: 'arrow-back' },
    { type: 'injury', label: 'Injury', icon: 'medical' },
  ];

  const currentTeam = selectedTeam === 'home' ? homeTeam : awayTeam;

  return (
    <View style={styles.container}>
      {/* Enhanced Timer Display */}
      <View style={styles.timerContainer}>
        <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.liveDot, { backgroundColor: matchStatus === 'in_progress' ? '#EF4444' : '#6B7280' }]} />
          <Text style={styles.liveText}>
            {matchStatus === 'in_progress' ? 'LIVE' : matchStatus.toUpperCase()}
          </Text>
        </Animated.View>
        
        {/* Period Badge */}
        <View style={[styles.periodBadge, { backgroundColor: getPeriodColor(localTimerState.currentPeriod) }]}>
          <Text style={styles.periodText}>
            {formatPeriodName(localTimerState.currentPeriod)}
          </Text>
        </View>
        
        <Text style={styles.timerText}>
          {localTimerState.currentMinute}'{localTimerState.injuryTime > 0 ? `+${localTimerState.injuryTime}` : ''}
        </Text>
        <Text style={styles.timerLabel}>Match Time</Text>
      </View>

      {/* Enhanced Match Controls */}
      <View style={styles.controlsContainer}>
        {matchStatus === 'scheduled' && (
          <TouchableOpacity style={styles.startButton} onPress={handleStartMatch}>
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.buttonText}>Start Match</Text>
          </TouchableOpacity>
        )}

        {matchStatus === 'in_progress' && (
          <View style={styles.matchControls}>
            {isTimerRunning ? (
              <TouchableOpacity style={styles.pauseButton} onPress={onPauseMatch}>
                <Ionicons name="pause" size={24} color="white" />
                <Text style={styles.buttonText}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.resumeButton} onPress={onResumeMatch}>
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.buttonText}>Resume</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.endButton} onPress={handleEndMatch}>
              <Ionicons name="stop" size={24} color="white" />
              <Text style={styles.buttonText}>End Match</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Timer Control Button */}
      <TouchableOpacity
        style={styles.timerControlButton}
        onPress={() => setShowTimerModal(true)}
      >
        <Ionicons name="timer" size={24} color="#3B82F6" />
        <Text style={styles.timerControlText}>Timer Controls</Text>
      </TouchableOpacity>

      {/* Team Selection */}
      <View style={styles.teamSelection}>
        <TouchableOpacity
          style={[styles.teamButton, selectedTeam === 'home' && styles.selectedTeam]}
          onPress={() => setSelectedTeam('home')}
        >
          <Text style={[styles.teamText, selectedTeam === 'home' && styles.selectedTeamText]}>
            {homeTeam.name}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.teamButton, selectedTeam === 'away' && styles.selectedTeam]}
          onPress={() => setSelectedTeam('away')}
        >
          <Text style={[styles.teamText, selectedTeam === 'away' && styles.selectedTeamText]}>
            {awayTeam.name}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Player Selection */}
      <View style={styles.playerSelection}>
        <Text style={styles.sectionTitle}>Select Player</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerList}>
          {currentTeam.players.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[styles.playerButton, selectedPlayer === player.id && styles.selectedPlayer]}
              onPress={() => setSelectedPlayer(player.id)}
            >
              <Text style={styles.playerNumber}>{player.number}</Text>
              <Text style={[styles.playerName, selectedPlayer === player.id && styles.selectedPlayerText]}>
                {player.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quick Event Buttons */}
      <View style={styles.quickEventsContainer}>
        <Text style={styles.sectionTitle}>Quick Events</Text>
        <View style={styles.quickEventsGrid}>
          {quickEvents.map((event) => (
            <TouchableOpacity
              key={event.type}
              style={[styles.quickEventButton, { backgroundColor: getEventColor(event.type) }]}
              onPress={() => handleQuickEvent(event.type)}
            >
              <Ionicons name={event.icon as any} size={20} color="white" />
              <Text style={styles.quickEventText}>{event.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Advanced Event Modal */}
      <TouchableOpacity
        style={styles.advancedButton}
        onPress={() => setShowEventModal(true)}
      >
        <Ionicons name="add-circle" size={24} color="#3B82F6" />
        <Text style={styles.advancedButtonText}>Advanced Event Entry</Text>
      </TouchableOpacity>

      {/* Timer Control Modal */}
      <Modal
        visible={showTimerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Timer Controls</Text>
            <TouchableOpacity onPress={() => setShowTimerModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Timer Status */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Current Status</Text>
              <View style={styles.timerStatusGrid}>
                <View style={styles.timerStatusItem}>
                  <Text style={styles.timerStatusValue}>{localTimerState.currentMinute}</Text>
                  <Text style={styles.timerStatusLabel}>Minute</Text>
                </View>
                <View style={styles.timerStatusItem}>
                  <Text style={styles.timerStatusValue}>{localTimerState.injuryTime}</Text>
                  <Text style={styles.timerStatusLabel}>Injury Time</Text>
                </View>
                <View style={styles.timerStatusItem}>
                  <Text style={styles.timerStatusValue}>{formatPeriodName(localTimerState.currentPeriod)}</Text>
                  <Text style={styles.timerStatusLabel}>Period</Text>
                </View>
              </View>
            </View>

            {/* Timer Actions */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Timer Actions</Text>
              <View style={styles.timerActionsGrid}>
                <TouchableOpacity
                  style={[styles.timerActionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => handleTimerControl('start')}
                  disabled={localTimerState.isTimerRunning}
                >
                  <Ionicons name="play" size={20} color="white" />
                  <Text style={styles.timerActionText}>Start</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.timerActionButton, { backgroundColor: '#F59E0B' }]}
                  onPress={() => handleTimerControl('pause')}
                  disabled={!localTimerState.isTimerRunning}
                >
                  <Ionicons name="pause" size={20} color="white" />
                  <Text style={styles.timerActionText}>Pause</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.timerActionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => handleTimerControl('resume')}
                  disabled={localTimerState.isTimerRunning}
                >
                  <Ionicons name="play" size={20} color="white" />
                  <Text style={styles.timerActionText}>Resume</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.timerActionButton, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleTimerControl('stop')}
                  disabled={!localTimerState.isTimerRunning}
                >
                  <Ionicons name="stop" size={20} color="white" />
                  <Text style={styles.timerActionText}>Stop</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Period Navigation */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Period Navigation</Text>
              <View style={styles.periodNavigationGrid}>
                {(['first_half', 'halftime', 'second_half', 'extra_time', 'penalties'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      { backgroundColor: localTimerState.currentPeriod === period ? getPeriodColor(period) : '#E5E7EB' }
                    ]}
                    onPress={() => handleTimerControl('skip_to_period', { period })}
                    disabled={localTimerState.isTimerRunning}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      { color: localTimerState.currentPeriod === period ? 'white' : '#6B7280' }
                    ]}>
                      {formatPeriodName(period)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Injury Time Management */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Injury Time</Text>
              <View style={styles.injuryTimeContainer}>
                <TextInput
                  style={styles.injuryTimeInput}
                  value={injuryTimeMinutes.toString()}
                  onChangeText={(text) => setInjuryTimeMinutes(parseInt(text) || 1)}
                  keyboardType="numeric"
                  placeholder="1"
                />
                <TouchableOpacity
                  style={[styles.injuryTimeButton, { backgroundColor: '#10B981' }]}
                  onPress={() => handleTimerControl('add_injury_time', { minutes: injuryTimeMinutes })}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.injuryTimeButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.injuryTimeButton, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleTimerControl('end_injury_time')}
                >
                  <Ionicons name="remove" size={20} color="white" />
                  <Text style={styles.injuryTimeButtonText}>End</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Custom Period Duration */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Custom Period Duration</Text>
              <View style={styles.periodDurationContainer}>
                <TextInput
                  style={styles.periodDurationInput}
                  value={customPeriodDuration.toString()}
                  onChangeText={(text) => setCustomPeriodDuration(parseInt(text) || 45)}
                  keyboardType="numeric"
                  placeholder="45"
                />
                <TouchableOpacity
                  style={[styles.periodDurationButton, { backgroundColor: '#3B82F6' }]}
                  onPress={() => handleTimerControl('set_period_duration', { duration: customPeriodDuration })}
                >
                  <Ionicons name="settings" size={20} color="white" />
                  <Text style={styles.periodDurationButtonText}>Set</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Event Modal */}
      <Modal
        visible={showEventModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Event Entry</Text>
            <TouchableOpacity onPress={() => setShowEventModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Event Type Selection */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Event Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {quickEvents.map((event) => (
                  <TouchableOpacity
                    key={event.type}
                    style={[
                      styles.modalEventButton,
                      eventType === event.type && { backgroundColor: getEventColor(event.type) }
                    ]}
                    onPress={() => setEventType(event.type)}
                  >
                    <Ionicons 
                      name={event.icon as any} 
                      size={16} 
                      color={eventType === event.type ? 'white' : '#6B7280'} 
                    />
                    <Text style={[
                      styles.modalEventText,
                      eventType === event.type && styles.modalEventTextSelected
                    ]}>
                      {event.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Field Position */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Field Position</Text>
              <TouchableOpacity
                style={styles.fieldButton}
                onPress={() => setShowFieldModal(true)}
              >
                <Ionicons name="location" size={20} color="#3B82F6" />
                <Text style={styles.fieldButtonText}>Select Position on Field</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Description (Optional)</Text>
              <View style={styles.descriptionInput}>
                <Text style={styles.descriptionPlaceholder}>
                  Add additional details about this event...
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowEventModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={() => {
                handleQuickEvent(eventType);
                setShowEventModal(false);
              }}
            >
              <Text style={styles.modalSaveText}>Save Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Field Position Modal */}
      <Modal
        visible={showFieldModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Field Position</Text>
            <TouchableOpacity onPress={() => setShowFieldModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.fieldContainer}>
            <View style={styles.soccerField}>
              {/* Field markings would go here */}
              <View style={styles.fieldCenter} />
              <View style={styles.fieldPenaltyAreas} />
              
              {/* Position indicator */}
              <View
                style={[
                  styles.positionIndicator,
                  {
                    left: `${fieldPosition.x}%`,
                    top: `${fieldPosition.y}%`,
                  }
                ]}
              />
            </View>
            
            <Text style={styles.fieldInstructions}>
              Tap on the field to set the event position
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  controlsContainer: {
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  matchControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  resumeButton: {
    backgroundColor: '#10B981',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  endButton: {
    backgroundColor: '#EF4444',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  timerControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  timerControlText: {
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
  teamSelection: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  teamButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedTeam: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  teamText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedTeamText: {
    color: '#3B82F6',
  },
  playerSelection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  playerList: {
    flexDirection: 'row',
  },
  playerButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  selectedPlayer: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  playerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  playerName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  selectedPlayerText: {
    color: '#3B82F6',
  },
  quickEventsContainer: {
    marginBottom: 24,
  },
  quickEventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  quickEventText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  advancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  advancedButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  timerStatusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timerStatusItem: {
    alignItems: 'center',
  },
  timerStatusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  timerStatusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  timerActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
  },
  timerActionText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  periodNavigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  injuryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  injuryTimeInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    width: 80,
    textAlign: 'center',
  },
  injuryTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 60,
    justifyContent: 'center',
  },
  injuryTimeButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  periodDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  periodDurationInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    width: 80,
    textAlign: 'center',
  },
  periodDurationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 60,
    justifyContent: 'center',
  },
  periodDurationButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 12,
  },
  modalEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  modalEventText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  modalEventTextSelected: {
    color: 'white',
  },
  fieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fieldButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
    marginLeft: 8,
  },
  descriptionInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 80,
  },
  descriptionPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  modalSaveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  modalSaveText: {
    color: 'white',
    fontWeight: '500',
  },
  fieldContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  soccerField: {
    width: width - 32,
    height: (width - 32) * 0.7,
    backgroundColor: '#10B981',
    borderRadius: 8,
    position: 'relative',
  },
  fieldCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 2,
    height: 40,
    backgroundColor: 'white',
    transform: [{ translateX: -1 }, { translateY: -20 }],
  },
  fieldPenaltyAreas: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 4,
  },
  positionIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  fieldInstructions: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 