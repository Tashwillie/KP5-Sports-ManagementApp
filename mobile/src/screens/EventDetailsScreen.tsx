import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import scheduleService from '../services/scheduleService';
import { Event, AttendeeStatus } from '../../shared/src/types';

interface EventDetailsScreenProps {
  navigation: any;
  route: any;
}

const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { eventId } = route.params;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [userRSVP, setUserRSVP] = useState<AttendeeStatus | null>(null);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const eventData = await scheduleService.getEvent(eventId);
      setEvent(eventData);
      
      if (eventData && user) {
        const userAttendee = eventData.attendees.find(a => a.userId === user.uid);
        setUserRSVP(userAttendee?.status || null);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (status: AttendeeStatus) => {
    try {
      if (!user) return;

      await scheduleService.respondToEvent(eventId, user.uid, status);
      setUserRSVP(status);
      setShowRSVPModal(false);
      
      // Reload event to get updated attendee list
      await loadEvent();
      
      Alert.alert('Success', 'RSVP submitted successfully');
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      Alert.alert('Error', 'Failed to submit RSVP');
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3B82F6';
      case 'in_progress':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      case 'postponed':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'game':
        return 'football';
      case 'practice':
        return 'fitness';
      case 'tournament':
        return 'trophy';
      case 'meeting':
        return 'people';
      case 'tryout':
        return 'person-add';
      case 'training':
        return 'school';
      case 'social':
        return 'happy';
      default:
        return 'calendar';
    }
  };

  const getRSVPStatusColor = (status: AttendeeStatus) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'declined':
        return '#EF4444';
      case 'maybe':
        return '#F59E0B';
      case 'pending':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const renderRSVPModal = () => (
    <Modal
      visible={showRSVPModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRSVPModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>RSVP for Event</Text>
            <TouchableOpacity onPress={() => setShowRSVPModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalDescription}>
              Will you be attending this event?
            </Text>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.rsvpButton, styles.confirmButton]}
              onPress={() => handleRSVP('confirmed')}
            >
              <Text style={styles.rsvpButtonText}>I'll be there</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rsvpButton, styles.maybeButton]}
              onPress={() => handleRSVP('maybe')}
            >
              <Text style={styles.rsvpButtonText}>Maybe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rsvpButton, styles.declineButton]}
              onPress={() => handleRSVP('declined')}
            >
              <Text style={styles.rsvpButtonText}>Can't make it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.eventIconContainer}>
            <Ionicons
              name={getEventTypeIcon(event.type) as any}
              size={32}
              color="#3B82F6"
            />
          </View>
          <View style={styles.eventTitleContainer}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventType}>{event.type}</Text>
          </View>
          <View style={styles.eventStatus}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getEventStatusColor(event.status) }
              ]}
            />
            <Text style={styles.statusText}>{event.status}</Text>
          </View>
        </View>

        {/* RSVP Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your RSVP</Text>
            {userRSVP && (
              <View style={styles.rsvpStatus}>
                <View
                  style={[
                    styles.rsvpIndicator,
                    { backgroundColor: getRSVPStatusColor(userRSVP) }
                  ]}
                />
                <Text style={styles.rsvpStatusText}>
                  {userRSVP.charAt(0).toUpperCase() + userRSVP.slice(1)}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.rsvpButton}
            onPress={() => setShowRSVPModal(true)}
          >
            <Text style={styles.rsvpButtonText}>
              {userRSVP ? 'Update RSVP' : 'RSVP Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          {event.description && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{event.description}</Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {new Date(event.startDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.detailValue}>
              {new Date(event.startDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })} - {new Date(event.endDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {event.location.name && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{event.location.name}</Text>
              {event.location.address.street && (
                <Text style={styles.detailValue}>
                  {event.location.address.street}
                </Text>
              )}
              {(event.location.address.city || event.location.address.state) && (
                <Text style={styles.detailValue}>
                  {event.location.address.city}, {event.location.address.state} {event.location.address.zipCode}
                </Text>
              )}
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Priority</Text>
            <Text style={styles.detailValue}>{event.priority}</Text>
          </View>

          {event.maxAttendees && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Max Attendees</Text>
              <Text style={styles.detailValue}>{event.maxAttendees}</Text>
            </View>
          )}
        </View>

        {/* Attendees */}
        {event.attendees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Attendees ({event.attendees.length})
            </Text>
            
            <View style={styles.attendeesList}>
              {event.attendees.map((attendee, index) => (
                <View key={index} style={styles.attendeeItem}>
                  <View style={styles.attendeeInfo}>
                    <Text style={styles.attendeeRole}>{attendee.role}</Text>
                    <Text style={styles.attendeeId}>User ID: {attendee.userId}</Text>
                  </View>
                  <View style={styles.attendeeStatus}>
                    <View
                      style={[
                        styles.attendeeStatusIndicator,
                        { backgroundColor: getRSVPStatusColor(attendee.status) }
                      ]}
                    />
                    <Text style={styles.attendeeStatusText}>
                      {attendee.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reminders */}
        {event.reminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            {event.reminders.map((reminder, index) => (
              <View key={index} style={styles.reminderItem}>
                <Ionicons name="notifications" size={16} color="#666" />
                <Text style={styles.reminderText}>
                  {reminder.timeBeforeEvent} minutes before - {reminder.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {event.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{event.notes}</Text>
          </View>
        )}
      </ScrollView>

      {renderRSVPModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  eventIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  eventStatus: {
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
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  rsvpStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rsvpIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  rsvpStatusText: {
    fontSize: 12,
    color: '#666',
  },
  rsvpButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rsvpButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  attendeesList: {
    marginTop: 8,
  },
  attendeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  attendeeId: {
    fontSize: 12,
    color: '#666',
  },
  attendeeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  attendeeStatusText: {
    fontSize: 12,
    color: '#666',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#10B981',
    flex: 1,
    marginRight: 8,
  },
  maybeButton: {
    backgroundColor: '#F59E0B',
    flex: 1,
    marginHorizontal: 4,
  },
  declineButton: {
    backgroundColor: '#EF4444',
    flex: 1,
    marginLeft: 8,
  },
});

export default EventDetailsScreen; 