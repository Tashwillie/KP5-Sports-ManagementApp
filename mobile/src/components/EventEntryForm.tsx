import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRealTimeService } from '@kp5-academy/shared';
import { Ionicons } from '@expo/vector-icons';

interface EventEntryFormData {
  matchId: string;
  eventType: string;
  minute: number;
  teamId: string;
  playerId?: string;
  secondaryPlayerId?: string;
  description?: string;
  location?: string;
  severity?: string;
  cardType?: string;
  substitutionType?: string;
  goalType?: string;
  shotType?: string;
  saveType?: string;
  additionalData?: Record<string, any>;
}

interface EventValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

interface EventEntryFormConfig {
  eventTypes: Array<{
    value: string;
    label: string;
    requiresPlayer: boolean;
    requiresSecondary: boolean;
  }>;
  locations: Array<{ value: string; label: string }>;
  severities: Array<{ value: string; label: string }>;
  cardTypes: Array<{ value: string; label: string }>;
  substitutionTypes: Array<{ value: string; label: string }>;
  goalTypes: Array<{ value: string; label: string }>;
  shotTypes: Array<{ value: string; label: string }>;
  saveTypes: Array<{ value: string; label: string }>;
}

interface EventEntryFormProps {
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
  preSelectedEventType?: string;
  onEventRecorded?: (event: any) => void;
  onCancel?: () => void;
}

const { width } = Dimensions.get('window');

export default function EventEntryForm({
  matchId,
  homeTeam,
  awayTeam,
  userRole,
  userId,
  preSelectedEventType,
  onEventRecorded,
  onCancel
}: EventEntryFormProps) {
  const realTimeService = useRealTimeService();
  
  const [formData, setFormData] = useState<EventEntryFormData>({
    matchId,
    eventType: preSelectedEventType || '',
    minute: 0,
    teamId: homeTeam.id
  });
  
  const [validation, setValidation] = useState<EventValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({ eventsEntered: 0, startTime: null as Date | null });
  const [formConfig, setFormConfig] = useState<EventEntryFormConfig | null>(null);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);

  // Fetch form configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // For now, use mock config - in production this would come from API
        const mockConfig: EventEntryFormConfig = {
          eventTypes: [
            { value: 'goal', label: 'Goal', requiresPlayer: true, requiresSecondary: false },
            { value: 'assist', label: 'Assist', requiresPlayer: true, requiresSecondary: false },
            { value: 'yellow_card', label: 'Yellow Card', requiresPlayer: true, requiresSecondary: false },
            { value: 'red_card', label: 'Red Card', requiresPlayer: true, requiresSecondary: false },
            { value: 'substitution', label: 'Substitution', requiresPlayer: true, requiresSecondary: true },
            { value: 'injury', label: 'Injury', requiresPlayer: true, requiresSecondary: false },
            { value: 'corner', label: 'Corner', requiresPlayer: false, requiresSecondary: false },
            { value: 'foul', label: 'Foul', requiresPlayer: true, requiresSecondary: false },
            { value: 'other', label: 'Other', requiresPlayer: false, requiresSecondary: false }
          ],
          locations: [
            { value: 'left_wing', label: 'Left Wing' },
            { value: 'center', label: 'Center' },
            { value: 'right_wing', label: 'Right Wing' },
            { value: 'penalty_area', label: 'Penalty Area' },
            { value: 'outside_box', label: 'Outside Box' }
          ],
          severities: [
            { value: 'minor', label: 'Minor' },
            { value: 'major', label: 'Major' },
            { value: 'serious', label: 'Serious' }
          ],
          cardTypes: [
            { value: 'warning', label: 'Warning' },
            { value: 'caution', label: 'Caution' },
            { value: 'dismissal', label: 'Dismissal' }
          ],
          substitutionTypes: [
            { value: 'in', label: 'Sub In' },
            { value: 'out', label: 'Sub Out' },
            { value: 'tactical', label: 'Tactical' },
            { value: 'injury', label: 'Injury' },
            { value: 'red_card', label: 'Red Card' }
          ],
          goalTypes: [
            { value: 'open_play', label: 'Open Play' },
            { value: 'penalty', label: 'Penalty' },
            { value: 'free_kick', label: 'Free Kick' },
            { value: 'corner', label: 'Corner' },
            { value: 'own_goal', label: 'Own Goal' },
            { value: 'counter_attack', label: 'Counter Attack' }
          ],
          shotTypes: [
            { value: 'header', label: 'Header' },
            { value: 'volley', label: 'Volley' },
            { value: 'long_range', label: 'Long Range' },
            { value: 'close_range', label: 'Close Range' },
            { value: 'one_on_one', label: 'One on One' }
          ],
          saveTypes: [
            { value: 'catch', label: 'Catch' },
            { value: 'punch', label: 'Punch' },
            { value: 'deflection', label: 'Deflection' },
            { value: 'dive', label: 'Dive' },
            { value: 'reflex', label: 'Reflex' }
          ]
        };
        setFormConfig(mockConfig);
      } catch (error) {
        console.error('Failed to fetch form config:', error);
      }
    };

    fetchConfig();
  }, []);

  // Start event entry session
  useEffect(() => {
    if (realTimeService.isConnected && realTimeService.socket && !sessionId) {
      realTimeService.socket.emit('start-event-entry', { matchId, userId, userRole });
      
      realTimeService.socket.on('event-entry-started', (data: { sessionId: string; matchId: string }) => {
        setSessionId(data.sessionId);
        setSessionStats(prev => ({ ...prev, startTime: new Date() }));
      });

      realTimeService.socket.on('event-entry-submitted', (data: { success: boolean; eventId?: string; message: string }) => {
        if (data.success) {
          setSessionStats(prev => ({ ...prev, eventsEntered: prev.eventsEntered + 1 }));
          onEventRecorded?.(data);
          resetForm();
          Alert.alert('Success', 'Event recorded successfully!');
        } else {
          Alert.alert('Error', data.message || 'Failed to record event');
        }
        setIsSubmitting(false);
      });

      realTimeService.socket.on('event-entry-validation', (data: EventValidationResult) => {
        setValidation(data);
      });

      // Listen for timer updates to get current match minute
      realTimeService.socket.on('timer-updated', (data: any) => {
        if (data.matchId === matchId) {
          setCurrentMinute(Math.floor(data.timeElapsed / 60));
          setFormData(prev => ({ ...prev, minute: Math.floor(data.timeElapsed / 60) }));
        }
      });

      return () => {
        realTimeService.socket?.off('event-entry-started');
        realTimeService.socket?.off('event-entry-submitted');
        realTimeService.socket?.off('event-entry-validation');
        realTimeService.socket?.off('timer-updated');
      };
    }
  }, [realTimeService.isConnected, realTimeService.socket, matchId, sessionId, onEventRecorded, userId, userRole]);

  // Cleanup session on unmount
  useEffect(() => {
    return () => {
      if (sessionId && realTimeService.socket) {
        realTimeService.socket.emit('end-event-entry', { sessionId });
      }
    };
  }, [sessionId, realTimeService.socket]);

  const resetForm = useCallback(() => {
    setFormData({
      matchId,
      eventType: preSelectedEventType || '',
      minute: currentMinute,
      teamId: homeTeam.id
    });
    setValidation(null);
    setShowAdvancedFields(false);
  }, [matchId, preSelectedEventType, currentMinute, homeTeam.id]);

  const handleInputChange = useCallback((field: keyof EventEntryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-validate on change
    if (field === 'eventType' || field === 'minute' || field === 'teamId') {
      const updatedData = { ...formData, [field]: value };
      if (updatedData.eventType && updatedData.minute >= 0 && updatedData.teamId) {
        realTimeService.socket?.emit('validate-event-entry', updatedData);
      }
    }
  }, [formData, realTimeService.socket]);

  const handleSubmit = useCallback(async () => {
    if (!realTimeService.isConnected || !realTimeService.socket) {
      Alert.alert('Error', 'WebSocket not connected');
      return;
    }

    if (!formData.eventType) {
      Alert.alert('Error', 'Please select an event type');
      return;
    }

    if (formData.minute < 0) {
      Alert.alert('Error', 'Please enter a valid minute');
      return;
    }

    setIsSubmitting(true);
    
    // Submit event via WebSocket
    realTimeService.socket.emit('submit-event-entry', formData);
  }, [formData, realTimeService.isConnected, realTimeService.socket]);

  const getEventTypeConfig = useCallback(() => {
    if (!formConfig) return null;
    return formConfig.eventTypes.find(type => type.value === formData.eventType);
  }, [formConfig, formData.eventType]);

  const eventTypeConfig = getEventTypeConfig();

  if (!formConfig) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading form configuration...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="target" size={24} color="#007AFF" />
            <Text style={styles.title}>Record Event</Text>
          </View>
          {sessionId && (
            <View style={styles.sessionBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.sessionBadgeText}>Active</Text>
            </View>
          )}
        </View>

        <Text style={styles.subtitle}>Record match events in real-time</Text>
        
        {/* Session Stats */}
        {sessionStats.startTime && (
          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color="#8E8E93" />
              <Text style={styles.statText}>
                Started: {sessionStats.startTime.toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color="#8E8E93" />
              <Text style={styles.statText}>
                Events: {sessionStats.eventsEntered}
              </Text>
            </View>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Basic Event Information */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Type *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.eventType}
                  onValueChange={(value) => handleInputChange('eventType', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select event type" value="" />
                  {formConfig.eventTypes.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Minute *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.minute.toString()}
                  onChangeText={(text) => handleInputChange('minute', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                  textAlign="center"
                />
              </View>

              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Team *</Text>
                <View style={styles.teamSelector}>
                  <TouchableOpacity
                    style={[
                      styles.teamOption,
                      formData.teamId === homeTeam.id && styles.teamOptionSelected,
                      { borderColor: homeTeam.color || '#3B82F6' }
                    ]}
                    onPress={() => handleInputChange('teamId', homeTeam.id)}
                  >
                    <Text style={[
                      styles.teamOptionText,
                      formData.teamId === homeTeam.id && styles.teamOptionTextSelected
                    ]}>
                      {homeTeam.name}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.teamOption,
                      formData.teamId === awayTeam.id && styles.teamOptionSelected,
                      { borderColor: awayTeam.color || '#EF4444' }
                    ]}
                    onPress={() => handleInputChange('teamId', awayTeam.id)}
                  >
                    <Text style={[
                      styles.teamOptionText,
                      formData.teamId === awayTeam.id && styles.teamOptionTextSelected
                    ]}>
                      {awayTeam.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Player Information */}
          {eventTypeConfig?.requiresPlayer && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Player Information</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Player *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.playerId || ''}
                  onChangeText={(text) => handleInputChange('playerId', text)}
                  placeholder="Enter player ID or name"
                />
              </View>
            </View>
          )}

          {/* Secondary Player Information */}
          {eventTypeConfig?.requiresSecondary && (
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Secondary Player</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Secondary Player *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.secondaryPlayerId || ''}
                  onChangeText={(text) => handleInputChange('secondaryPlayerId', text)}
                  placeholder="Enter secondary player ID or name"
                />
              </View>
            </View>
          )}

          {/* Advanced Fields Toggle */}
          <TouchableOpacity
            style={styles.advancedToggle}
            onPress={() => setShowAdvancedFields(!showAdvancedFields)}
          >
            <Text style={styles.advancedToggleText}>
              {showAdvancedFields ? 'Hide' : 'Show'} Advanced Fields
            </Text>
            <Ionicons
              name={showAdvancedFields ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>

          {/* Advanced Fields */}
          {showAdvancedFields && (
            <View style={styles.advancedSection}>
              {/* Event-specific fields */}
              {formData.eventType === 'goal' && (
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Goal Details</Text>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, styles.flex1]}>
                      <Text style={styles.label}>Goal Type</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={formData.goalType || ''}
                          onValueChange={(value) => handleInputChange('goalType', value)}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select goal type" value="" />
                          {formConfig.goalTypes.map((type) => (
                            <Picker.Item key={type.value} label={type.label} value={type.value} />
                          ))}
                        </Picker>
                      </View>
                    </View>

                    <View style={[styles.inputGroup, styles.flex1]}>
                      <Text style={styles.label}>Location</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={formData.location || ''}
                          onValueChange={(value) => handleInputChange('location', value)}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select location" value="" />
                          {formConfig.locations.map((location) => (
                            <Picker.Item key={location.value} label={location.label} value={location.value} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {['yellow_card', 'red_card'].includes(formData.eventType) && (
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Card Details</Text>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, styles.flex1]}>
                      <Text style={styles.label}>Card Type</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={formData.cardType || ''}
                          onValueChange={(value) => handleInputChange('cardType', value)}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select card type" value="" />
                          {formConfig.cardTypes.map((type) => (
                            <Picker.Item key={type.value} label={type.label} value={type.value} />
                          ))}
                        </Picker>
                      </View>
                    </View>

                    <View style={[styles.inputGroup, styles.flex1]}>
                      <Text style={styles.label}>Severity</Text>
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={formData.severity || ''}
                          onValueChange={(value) => handleInputChange('severity', value)}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select severity" value="" />
                          {formConfig.severities.map((severity) => (
                            <Picker.Item key={severity.value} label={severity.label} value={severity.value} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {formData.eventType === 'substitution' && (
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Substitution Details</Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Substitution Type</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={formData.substitutionType || ''}
                        onValueChange={(value) => handleInputChange('substitutionType', value)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select type" value="" />
                        {formConfig.substitutionTypes.map((type) => (
                          <Picker.Item key={type.value} label={type.label} value={type.value} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
              )}

              {/* Description field */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Additional Details</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.description || ''}
                    onChangeText={(text) => handleInputChange('description', text)}
                    placeholder="Additional details about the event..."
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Validation Messages */}
          {validation && (
            <View style={styles.validationSection}>
              {validation.errors.length > 0 && (
                <View style={[styles.alert, styles.errorAlert]}>
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Errors</Text>
                    {validation.errors.map((error, index) => (
                      <Text key={index} style={styles.alertText}>• {error}</Text>
                    ))}
                  </View>
                </View>
              )}

              {validation.warnings.length > 0 && (
                <View style={[styles.alert, styles.warningAlert]}>
                  <Ionicons name="warning" size={20} color="#FF9500" />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Warnings</Text>
                    {validation.warnings.map((warning, index) => (
                      <Text key={index} style={styles.alertText}>• {warning}</Text>
                    ))}
                  </View>
                </View>
              )}

              {validation.suggestions && validation.suggestions.length > 0 && (
                <View style={[styles.alert, styles.infoAlert]}>
                  <Ionicons name="information-circle" size={20} color="#007AFF" />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Suggestions</Text>
                    {validation.suggestions.map((suggestion, index) => (
                      <Text key={index} style={styles.alertText}>• {suggestion}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Submit Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={resetForm}
              disabled={isSubmitting}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (!realTimeService.isConnected || !formData.eventType) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!realTimeService.isConnected || isSubmitting || !formData.eventType}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Record Event</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7'
  },
  scrollView: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000000'
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    paddingHorizontal: 16,
    marginBottom: 8
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#34C759',
    marginLeft: 4
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4
  },
  form: {
    padding: 16
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF'
  },
  disabledInput: {
    backgroundColor: '#F2F2F7',
    color: '#8E8E93'
  },
  textArea: {
    height: 80
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF'
  },
  picker: {
    height: 50
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  flex1: {
    flex: 1
  },
  teamSelector: {
    flexDirection: 'row',
    gap: 8
  },
  teamOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  teamOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2
  },
  teamOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280'
  },
  teamOptionTextSelected: {
    color: '#000000',
    fontWeight: '600'
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF'
  },
  advancedSection: {
    marginBottom: 16
  },
  validationSection: {
    marginBottom: 16
  },
  alert: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  errorAlert: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FFCCCC'
  },
  warningAlert: {
    backgroundColor: '#FFF4E5',
    borderColor: '#FFE5CC'
  },
  infoAlert: {
    backgroundColor: '#E5F2FF',
    borderColor: '#CCE5FF'
  },
  alertContent: {
    marginLeft: 8,
    flex: 1
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93'
  },
  resetButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA'
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93'
  },
  submitButton: {
    backgroundColor: '#007AFF'
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  disabledButton: {
    backgroundColor: '#C7C7CC'
  }
});
