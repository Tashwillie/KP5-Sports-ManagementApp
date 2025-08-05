import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import scheduleService from '../services/scheduleService';
import { Event, EventType, EventStatus, AttendeeStatus } from '../../shared/src/types';

interface CalendarScreenProps {
  navigation: any;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadEvents();
      const unsubscribe = scheduleService.subscribeToEventsByUser(user.uid, (updatedEvents) => {
        setEvents(updatedEvents);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      if (!user) return;
      const userEvents = await scheduleService.getEventsByUser(user.uid);
      setEvents(userEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string, status: AttendeeStatus) => {
    try {
      if (!user) return;
      await scheduleService.respondToEvent(eventId, user.uid, status);
      setShowEventModal(false);
      Alert.alert('Success', 'RSVP submitted successfully');
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      Alert.alert('Error', 'Failed to submit RSVP');
    }
  };

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return (
      <View style={styles.monthView}>
        <View style={styles.weekHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekHeaderText}>{day}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = date.getMonth() === month;
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !isCurrentMonth && styles.otherMonthDay,
                  isToday && styles.todayCell,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dayText,
                  !isCurrentMonth && styles.otherMonthText,
                  isToday && styles.todayText,
                ]}>
                  {date.getDate()}
                </Text>
                {dayEvents.length > 0 && (
                  <View style={styles.eventIndicator}>
                    <Text style={styles.eventIndicatorText}>
                      {dayEvents.length > 3 ? '3+' : dayEvents.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate);

    return (
      <View style={styles.dayView}>
        <Text style={styles.dayViewTitle}>
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <ScrollView style={styles.dayEvents}>
          {dayEvents.length === 0 ? (
            <Text style={styles.noEventsText}>No events scheduled for this day</Text>
          ) : (
            dayEvents.map(event => (
              <TouchableOpacity
                key={event.id}
                style={styles.dayEventItem}
                onPress={() => {
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
              >
                <View style={styles.dayEventHeader}>
                  <Text style={styles.dayEventTitle}>{event.title}</Text>
                  <Text style={styles.dayEventType}>{event.type}</Text>
                </View>
                <Text style={styles.dayEventTime}>
                  {new Date(event.startDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} - {new Date(event.endDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {event.location.name && (
                  <Text style={styles.dayEventLocation}>{event.location.name}</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

  const renderEventModal = () => (
    <Modal
      visible={showEventModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowEventModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {selectedEvent && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                <TouchableOpacity onPress={() => setShowEventModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalDescription}>{selectedEvent.description}</Text>
                
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Type:</Text>
                  <Text style={styles.modalInfoValue}>{selectedEvent.type}</Text>
                </View>
                
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Date:</Text>
                  <Text style={styles.modalInfoValue}>
                    {new Date(selectedEvent.startDate).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Time:</Text>
                  <Text style={styles.modalInfoValue}>
                    {new Date(selectedEvent.startDate).toLocaleTimeString()} - {new Date(selectedEvent.endDate).toLocaleTimeString()}
                  </Text>
                </View>
                
                {selectedEvent.location.name && (
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoLabel}>Location:</Text>
                    <Text style={styles.modalInfoValue}>{selectedEvent.location.name}</Text>
                  </View>
                )}
                
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Status:</Text>
                  <Text style={styles.modalInfoValue}>{selectedEvent.status}</Text>
                </View>
              </ScrollView>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.rsvpButton, styles.confirmButton]}
                  onPress={() => handleRSVP(selectedEvent.id, 'confirmed')}
                >
                  <Text style={styles.rsvpButtonText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rsvpButton, styles.declineButton]}
                  onPress={() => handleRSVP(selectedEvent.id, 'declined')}
                >
                  <Text style={styles.rsvpButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rsvpButton, styles.maybeButton]}
                  onPress={() => handleRSVP(selectedEvent.id, 'maybe')}
                >
                  <Text style={styles.rsvpButtonText}>Maybe</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.viewControls}>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'month' && styles.activeViewButton]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[styles.viewButtonText, viewMode === 'month' && styles.activeViewButtonText]}>
            Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'day' && styles.activeViewButton]}
          onPress={() => setViewMode('day')}
        >
          <Text style={[styles.viewButtonText, viewMode === 'day' && styles.activeViewButtonText]}>
            Day
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationControls}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            const newDate = new Date(selectedDate);
            if (viewMode === 'month') {
              newDate.setMonth(newDate.getMonth() - 1);
            } else {
              newDate.setDate(newDate.getDate() - 1);
            }
            setSelectedDate(newDate);
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        
        <Text style={styles.navigationText}>
          {viewMode === 'month' && selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          {viewMode === 'day' && selectedDate.toLocaleDateString()}
        </Text>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            const newDate = new Date(selectedDate);
            if (viewMode === 'month') {
              newDate.setMonth(newDate.getMonth() + 1);
            } else {
              newDate.setDate(newDate.getDate() + 1);
            }
            setSelectedDate(newDate);
          }}
        >
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'day' && renderDayView()}
      </View>

      {renderEventModal()}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewControls: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeViewButton: {
    backgroundColor: '#3B82F6',
  },
  viewButtonText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '500',
  },
  activeViewButtonText: {
    color: 'white',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
  },
  navigationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calendarContainer: {
    flex: 1,
  },
  monthView: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  daysGrid: {
    flex: 1,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
    padding: 4,
    backgroundColor: 'white',
  },
  otherMonthDay: {
    backgroundColor: '#f8f9fa',
  },
  todayCell: {
    backgroundColor: '#E3F2FD',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  otherMonthText: {
    color: '#ccc',
  },
  todayText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventIndicatorText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  dayView: {
    flex: 1,
  },
  dayViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayEvents: {
    flex: 1,
  },
  noEventsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
    fontSize: 16,
  },
  dayEventItem: {
    margin: 8,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  dayEventType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  dayEventTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dayEventLocation: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
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
    maxHeight: '80%',
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
    marginBottom: 16,
  },
  modalInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 80,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  rsvpButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  declineButton: {
    backgroundColor: '#EF4444',
  },
  maybeButton: {
    backgroundColor: '#F59E0B',
  },
  rsvpButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
  },
});

export default CalendarScreen; 