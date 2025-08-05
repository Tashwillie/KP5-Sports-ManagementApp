import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { tw } from '../utils/tailwind';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useMobileEvents, useMobileCreateEvent } from '../hooks/useMobileApi';
import { Event } from '../../../shared/src/types';

export default function EventListScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');

  // Fetch events based on filter
  const getEventConstraints = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        return [
          { field: 'startDate', operator: '>=', value: today },
          { field: 'startDate', operator: '<', value: tomorrow }
        ];
      case 'upcoming':
        return [{ field: 'startDate', operator: '>=', value: now }];
      case 'past':
        return [{ field: 'startDate', operator: '<', value: now }];
      default:
        return [];
    }
  };

  const { 
    data: events, 
    loading, 
    error, 
    refetch 
  } = useMobileEvents(getEventConstraints());

  // Create event mutation
  const createEventMutation = useMobileCreateEvent();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent' as never);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails' as never, { eventId: event.id } as never);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'game':
        return 'football';
      case 'practice':
        return 'fitness';
      case 'meeting':
        return 'people';
      case 'tournament':
        return 'trophy';
      case 'training':
        return 'school';
      default:
        return 'calendar';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'game':
        return '#EF4444';
      case 'practice':
        return '#3B82F6';
      case 'meeting':
        return '#8B5CF6';
      case 'tournament':
        return '#F59E0B';
      case 'training':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatEventTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatEventDate = (date: Date) => {
    const eventDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (eventDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const renderEventItem = ({ item: event }: { item: Event }) => (
    <TouchableOpacity onPress={() => handleEventPress(event)}>
      <Card style={tw('mb-4')}>
        <View style={tw('flex-row items-start')}>
          {/* Event Type Icon */}
          <View style={[
            tw('w-12 h-12 rounded-lg items-center justify-center mr-3'),
            { backgroundColor: `${getEventTypeColor(event.type)}20` }
          ]}>
            <Ionicons 
              name={getEventTypeIcon(event.type) as any} 
              size={24} 
              color={getEventTypeColor(event.type)} 
            />
          </View>

          {/* Event Details */}
          <View style={tw('flex-1')}>
            <View style={tw('flex-row justify-between items-start mb-2')}>
              <Text style={tw('text-lg font-semibold text-gray-900')}>
                {event.title}
              </Text>
              <Badge 
                variant={getStatusColor(event.status)} 
                size="sm"
              >
                {event.status.replace('_', ' ')}
              </Badge>
            </View>

            <Text style={tw('text-sm text-gray-600 mb-2')} numberOfLines={2}>
              {event.description || 'No description available'}
            </Text>

            <View style={tw('flex-row items-center gap-4 mb-2')}>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="time" size={16} color="#6B7280" />
                <Text style={tw('text-sm text-gray-600 ml-1')}>
                  {formatEventTime(event.startDate)}
                </Text>
              </View>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={tw('text-sm text-gray-600 ml-1')}>
                  {formatEventDate(event.startDate)}
                </Text>
              </View>
            </View>

            {event.location && (
              <View style={tw('flex-row items-center mb-2')}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={tw('text-sm text-gray-600 ml-1')}>
                  {event.location.name || event.location.address}
                </Text>
              </View>
            )}

            {/* Event Metadata */}
            <View style={tw('flex-row justify-between items-center')}>
              <View style={tw('flex-row gap-2')}>
                {event.type && (
                  <Badge variant="secondary" size="sm">
                    {event.type}
                  </Badge>
                )}
                {event.teamIds && event.teamIds.length > 0 && (
                  <Badge variant="default" size="sm">
                    {event.teamIds.length} team{event.teamIds.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </View>
              
              {event.attendees && event.attendees.length > 0 && (
                <View style={tw('flex-row items-center')}>
                  <Ionicons name="people" size={14} color="#6B7280" />
                  <Text style={tw('text-xs text-gray-500 ml-1')}>
                    {event.attendees.length} attending
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterValue: typeof filter, label: string) => (
    <TouchableOpacity
      onPress={() => setFilter(filterValue)}
      style={[
        tw('px-4 py-2 rounded-lg mr-2'),
        filter === filterValue ? tw('bg-blue-600') : tw('bg-gray-200')
      ]}
    >
      <Text style={[
        tw('text-sm font-medium'),
        filter === filterValue ? tw('text-white') : tw('text-gray-700')
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={tw('flex-1 bg-gray-50')}>
        <View style={tw('flex-1 justify-center items-center')}>
          <Text style={tw('text-gray-600')}>Loading events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={tw('flex-1 bg-gray-50')}>
        <View style={tw('flex-1 justify-center items-center p-4')}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={tw('text-lg font-semibold text-gray-900 mt-4 mb-2')}>
            Error Loading Events
          </Text>
          <Text style={tw('text-gray-600 text-center mb-4')}>
            {error.message || 'Failed to load events. Please try again.'}
          </Text>
          <Button
            title="Retry"
            onPress={handleRefresh}
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-50')}>
      {/* Header */}
      <View style={tw('bg-white border-b border-gray-200 px-4 py-3')}>
        <View style={tw('flex-row justify-between items-center mb-3')}>
          <Text style={tw('text-2xl font-bold text-gray-900')}>Events</Text>
          <TouchableOpacity 
            onPress={handleCreateEvent}
            style={tw('bg-blue-600 p-2 rounded-lg')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Filter Buttons */}
        <View style={tw('flex-row')}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('today', 'Today')}
          {renderFilterButton('upcoming', 'Upcoming')}
          {renderFilterButton('past', 'Past')}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={events || []}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw('p-4')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={tw('flex-1 justify-center items-center py-12')}>
            <Ionicons name="calendar" size={64} color="#D1D5DB" />
            <Text style={tw('text-lg font-semibold text-gray-900 mt-4 mb-2')}>
              No Events Found
            </Text>
            <Text style={tw('text-gray-600 text-center mb-6')}>
              {filter === 'all' 
                ? 'Get started by creating your first event.'
                : `No ${filter} events found.`
              }
            </Text>
            {filter === 'all' && (
              <Button
                title="Create Event"
                onPress={handleCreateEvent}
                variant="primary"
                size="lg"
              />
            )}
          </View>
        }
        ListHeaderComponent={
          events && events.length > 0 ? (
            <View style={tw('mb-4')}>
              <Text style={tw('text-sm text-gray-600')}>
                {events.length} event{events.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
} 