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
import { Notification } from '../../../shared/src/types';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Mock notifications data - in real app, you'd have a useMobileNotifications hook
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'Match Reminder',
      message: 'Your match against Team Alpha starts in 30 minutes',
      type: 'match_reminder',
      isRead: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      data: { matchId: 'match-1' }
    },
    {
      id: '2',
      title: 'New Team Member',
      message: 'John Doe has joined your team',
      type: 'team_update',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      data: { teamId: 'team-1', playerId: 'player-1' }
    },
    {
      id: '3',
      title: 'Tournament Registration',
      message: 'Registration for Spring Tournament is now open',
      type: 'tournament',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      data: { tournamentId: 'tournament-1' }
    },
    {
      id: '4',
      title: 'Practice Cancelled',
      message: 'Today\'s practice has been cancelled due to weather',
      type: 'event_update',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      data: { eventId: 'event-1' }
    },
    {
      id: '5',
      title: 'Match Result',
      message: 'Your team won 3-1 against Team Beta',
      type: 'match_result',
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      data: { matchId: 'match-2' }
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // In real app, you'd refetch notifications here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read and navigate based on type
    if (!notification.isRead) {
      // In real app, you'd mark as read here
      console.log('Marking notification as read:', notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'match_reminder':
      case 'match_result':
        navigation.navigate('MatchDetails' as never, { matchId: notification.data?.matchId } as never);
        break;
      case 'team_update':
        navigation.navigate('TeamDetails' as never, { teamId: notification.data?.teamId } as never);
        break;
      case 'tournament':
        navigation.navigate('TournamentDetails' as never, { tournamentId: notification.data?.tournamentId } as never);
        break;
      case 'event_update':
        navigation.navigate('EventDetails' as never, { eventId: notification.data?.eventId } as never);
        break;
      default:
        // Stay on notifications screen
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    // In real app, you'd mark all notifications as read
    console.log('Marking all notifications as read');
  };

  const handleClearAll = () => {
    // In real app, you'd clear all notifications
    console.log('Clearing all notifications');
  };

  // Filter notifications based on read status
  const filteredNotifications = mockNotifications.filter(notification => {
    return filter === 'all' || 
           (filter === 'unread' && !notification.isRead) ||
           (filter === 'read' && notification.isRead);
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match_reminder':
      case 'match_result':
        return 'football';
      case 'team_update':
        return 'people';
      case 'tournament':
        return 'trophy';
      case 'event_update':
        return 'calendar';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'match_reminder':
        return '#F59E0B';
      case 'match_result':
        return '#10B981';
      case 'team_update':
        return '#3B82F6';
      case 'tournament':
        return '#8B5CF6';
      case 'event_update':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const renderNotificationItem = ({ item: notification }: { item: Notification }) => (
    <TouchableOpacity 
      onPress={() => handleNotificationPress(notification)}
      style={[
        tw('mb-3'),
        !notification.isRead && tw('bg-blue-50')
      ]}
    >
      <Card style={[
        tw('border-l-4'),
        { borderLeftColor: getNotificationColor(notification.type) }
      ]}>
        <View style={tw('flex-row items-start')}>
          {/* Notification Icon */}
          <View style={[
            tw('w-10 h-10 rounded-full items-center justify-center mr-3'),
            { backgroundColor: `${getNotificationColor(notification.type)}20` }
          ]}>
            <Ionicons 
              name={getNotificationIcon(notification.type) as any} 
              size={20} 
              color={getNotificationColor(notification.type)} 
            />
          </View>

          {/* Notification Content */}
          <View style={tw('flex-1')}>
            <View style={tw('flex-row justify-between items-start mb-1')}>
              <Text style={[
                tw('text-base font-semibold'),
                !notification.isRead ? tw('text-gray-900') : tw('text-gray-700')
              ]}>
                {notification.title}
              </Text>
              <Text style={tw('text-xs text-gray-500')}>
                {formatNotificationTime(notification.createdAt)}
              </Text>
            </View>
            
            <Text style={tw('text-sm text-gray-600 mb-2')} numberOfLines={2}>
              {notification.message}
            </Text>

            {/* Unread Indicator */}
            {!notification.isRead && (
              <View style={tw('flex-row items-center')}>
                <View style={tw('w-2 h-2 bg-blue-600 rounded-full mr-2')} />
                <Text style={tw('text-xs text-blue-600 font-medium')}>
                  New
                </Text>
              </View>
            )}
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

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-50')}>
      {/* Header */}
      <View style={tw('bg-white border-b border-gray-200 px-4 py-3')}>
        <View style={tw('flex-row justify-between items-center mb-3')}>
          <View style={tw('flex-row items-center')}>
            <Text style={tw('text-2xl font-bold text-gray-900')}>Notifications</Text>
            {unreadCount > 0 && (
              <Badge variant="error" size="sm" style={tw('ml-2')}>
                {unreadCount}
              </Badge>
            )}
          </View>
          <View style={tw('flex-row gap-2')}>
            <TouchableOpacity 
              onPress={handleMarkAllAsRead}
              style={tw('bg-green-600 p-2 rounded-lg')}
            >
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleClearAll}
              style={tw('bg-red-600 p-2 rounded-lg')}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Filter Buttons */}
        <View style={tw('flex-row')}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('unread', 'Unread')}
          {renderFilterButton('read', 'Read')}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw('p-4')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={tw('flex-1 justify-center items-center py-12')}>
            <Ionicons name="notifications-off" size={64} color="#D1D5DB" />
            <Text style={tw('text-lg font-semibold text-gray-900 mt-4 mb-2')}>
              No Notifications
            </Text>
            <Text style={tw('text-gray-600 text-center mb-6')}>
              {filter === 'all' 
                ? 'You\'re all caught up! No new notifications.'
                : `No ${filter} notifications found.`
              }
            </Text>
          </View>
        }
        ListHeaderComponent={
          filteredNotifications.length > 0 ? (
            <View style={tw('mb-4')}>
              <Text style={tw('text-sm text-gray-600')}>
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
} 