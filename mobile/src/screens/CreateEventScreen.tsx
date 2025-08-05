import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import scheduleService from '../services/scheduleService';
import { EventType, EventCategory, EventPriority } from '../../shared/src/types';

interface CreateEventScreenProps {
  navigation: any;
}

const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'practice' as EventType,
    category: 'team_event' as EventCategory,
    startDate: new Date(),
    endDate: new Date(),
    allDay: false,
    location: {
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      venueType: 'field' as const,
    },
    priority: 'medium' as EventPriority,
    maxAttendees: '',
    minAttendees: '',
    notes: '',
  });

  const eventTypes: { value: EventType; label: string; icon: string }[] = [
    { value: 'game', label: 'Game', icon: 'football' },
    { value: 'practice', label: 'Practice', icon: 'fitness' },
    { value: 'tournament', label: 'Tournament', icon: 'trophy' },
    { value: 'meeting', label: 'Meeting', icon: 'people' },
    { value: 'tryout', label: 'Tryout', icon: 'person-add' },
    { value: 'training', label: 'Training', icon: 'school' },
    { value: 'social', label: 'Social', icon: 'happy' },
    { value: 'other', label: 'Other', icon: 'calendar' },
  ];

  const eventCategories: { value: EventCategory; label: string }[] = [
    { value: 'team_event', label: 'Team Event' },
    { value: 'club_event', label: 'Club Event' },
    { value: 'league_event', label: 'League Event' },
    { value: 'tournament_event', label: 'Tournament Event' },
    { value: 'personal', label: 'Personal' },
    { value: 'administrative', label: 'Administrative' },
  ];

  const priorities: { value: EventPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
    { value: 'urgent', label: 'Urgent', color: '#DC2626' },
  ];

  const venueTypes: { value: string; label: string }[] = [
    { value: 'field', label: 'Field' },
    { value: 'gym', label: 'Gym' },
    { value: 'office', label: 'Office' },
    { value: 'home', label: 'Home' },
    { value: 'other', label: 'Other' },
  ];

  const handleCreateEvent = async () => {
    try {
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create an event');
        return;
      }

      if (!formData.title.trim()) {
        Alert.alert('Error', 'Please enter an event title');
        return;
      }

      if (formData.startDate >= formData.endDate) {
        Alert.alert('Error', 'End date must be after start date');
        return;
      }

      setLoading(true);

      const eventData = {
        ...formData,
        organizerId: user.uid,
        clubId: '', // This should be set based on user's club
        teamIds: [],
        playerIds: [],
        status: 'scheduled' as const,
        color: '#3B82F6',
        recurring: {
          isRecurring: false,
          pattern: 'weekly' as const,
          exceptions: [],
        },
        attendees: [],
        reminders: [],
        attachments: [],
        isActive: true,
        createdBy: user.uid,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        minAttendees: formData.minAttendees ? parseInt(formData.minAttendees) : undefined,
      };

      await scheduleService.createEvent(eventData);
      Alert.alert('Success', 'Event created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLocation = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: {
          ...prev.location.address,
          [field]: value,
        },
      },
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Event</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleCreateEvent}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Event Title *"
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Event Type *</Text>
          <View style={styles.optionsGrid}>
            {eventTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.optionItem,
                  formData.type === type.value && styles.selectedOption
                ]}
                onPress={() => updateFormData('type', type.value)}
              >
                <Ionicons
                  name={type.icon as any}
                  size={20}
                  color={formData.type === type.value ? 'white' : '#666'}
                />
                <Text style={[
                  styles.optionText,
                  formData.type === type.value && styles.selectedOptionText
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsGrid}>
            {eventCategories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  styles.optionItem,
                  formData.category === category.value && styles.selectedOption
                ]}
                onPress={() => updateFormData('category', category.value)}
              >
                <Text style={[
                  styles.optionText,
                  formData.category === category.value && styles.selectedOptionText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.label}>Start Date & Time</Text>
              <Text style={styles.dateTimeText}>
                {formData.startDate.toLocaleDateString()} at{' '}
                {formData.startDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.label}>End Date & Time</Text>
              <Text style={styles.dateTimeText}>
                {formData.endDate.toLocaleDateString()} at{' '}
                {formData.endDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>All Day Event</Text>
            <Switch
              value={formData.allDay}
              onValueChange={(value) => updateFormData('allDay', value)}
              trackColor={{ false: '#e0e0e0', true: '#3B82F6' }}
              thumbColor={formData.allDay ? 'white' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Location Name"
            value={formData.location.name}
            onChangeText={(text) => updateLocation('name', text)}
          />

          <Text style={styles.label}>Venue Type</Text>
          <View style={styles.optionsGrid}>
            {venueTypes.map((venue) => (
              <TouchableOpacity
                key={venue.value}
                style={[
                  styles.optionItem,
                  formData.location.venueType === venue.value && styles.selectedOption
                ]}
                onPress={() => updateLocation('venueType', venue.value)}
              >
                <Text style={[
                  styles.optionText,
                  formData.location.venueType === venue.value && styles.selectedOptionText
                ]}>
                  {venue.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={formData.location.address.street}
            onChangeText={(text) => updateAddress('street', text)}
          />

          <View style={styles.addressRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="City"
              value={formData.location.address.city}
              onChangeText={(text) => updateAddress('city', text)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="State"
              value={formData.location.address.state}
              onChangeText={(text) => updateAddress('state', text)}
            />
          </View>

          <View style={styles.addressRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="ZIP Code"
              value={formData.location.address.zipCode}
              onChangeText={(text) => updateAddress('zipCode', text)}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Country"
              value={formData.location.address.country}
              onChangeText={(text) => updateAddress('country', text)}
            />
          </View>
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          
          <Text style={styles.label}>Priority</Text>
          <View style={styles.optionsGrid}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.optionItem,
                  formData.priority === priority.value && styles.selectedOption,
                  { borderColor: priority.color }
                ]}
                onPress={() => updateFormData('priority', priority.value)}
              >
                <Text style={[
                  styles.optionText,
                  formData.priority === priority.value && styles.selectedOptionText
                ]}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.attendeesRow}>
            <View style={styles.attendeesItem}>
              <Text style={styles.label}>Max Attendees</Text>
              <TextInput
                style={styles.input}
                placeholder="No limit"
                value={formData.maxAttendees}
                onChangeText={(text) => updateFormData('maxAttendees', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.attendeesItem}>
              <Text style={styles.label}>Min Attendees</Text>
              <TextInput
                style={styles.input}
                placeholder="No minimum"
                value={formData.minAttendees}
                onChangeText={(text) => updateFormData('minAttendees', text)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional Notes"
            value={formData.notes}
            onChangeText={(text) => updateFormData('notes', text)}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  selectedOptionText: {
    color: 'white',
  },
  dateTimeRow: {
    marginBottom: 16,
  },
  dateTimeItem: {
    marginBottom: 12,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#666',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginRight: 8,
  },
  attendeesRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  attendeesItem: {
    flex: 1,
    marginRight: 8,
  },
});

export default CreateEventScreen; 