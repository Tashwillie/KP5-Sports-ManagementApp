import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { communicationService } from '../services/communicationService';
import { Announcement, AnnouncementType, AnnouncementPriority } from '@shared/types/communication';

interface AnnouncementsScreenProps {
  navigation: any;
}

export default function AnnouncementsScreen({ navigation }: AnnouncementsScreenProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      // Replace with actual user's club/team IDs
      const recipientIds = ['currentUserId'];
      const announcementList = await communicationService.getAnnouncements(recipientIds);
      setAnnouncements(announcementList);
    } catch (error) {
      console.error('Error loading announcements:', error);
      Alert.alert('Error', 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const handleAnnouncementPress = (announcement: Announcement) => {
    navigation.navigate('AnnouncementDetails', { announcement });
  };

  const handleMarkAsRead = async (announcementId: string) => {
    try {
      await communicationService.markAnnouncementAsRead(announcementId);
      // Update local state
      setAnnouncements(prev =>
        prev.map(announcement =>
          announcement.id === announcementId
            ? { ...announcement, readBy: [...announcement.readBy, 'currentUserId'] }
            : announcement
        )
      );
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const handleAcknowledge = async (announcementId: string) => {
    try {
      await communicationService.acknowledgeAnnouncement(announcementId);
      // Update local state
      setAnnouncements(prev =>
        prev.map(announcement =>
          announcement.id === announcementId
            ? { ...announcement, acknowledgedBy: [...announcement.acknowledgedBy, 'currentUserId'] }
            : announcement
        )
      );
    } catch (error) {
      console.error('Error acknowledging announcement:', error);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const isRead = announcement.readBy.includes('currentUserId');
    const isUrgent = announcement.priority === 'urgent' || announcement.isUrgent;

    switch (filter) {
      case 'unread':
        return !isRead;
      case 'urgent':
        return isUrgent;
      default:
        return true;
    }
  });

  const getPriorityColor = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'urgent':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'normal':
        return '#007AFF';
      case 'low':
        return '#34C759';
      default:
        return '#007AFF';
    }
  };

  const getTypeIcon = (type: AnnouncementType) => {
    switch (type) {
      case 'urgent':
        return 'warning';
      case 'event':
        return 'calendar';
      case 'schedule':
        return 'time';
      case 'weather':
        return 'partly-sunny';
      case 'safety':
        return 'shield-checkmark';
      case 'policy':
        return 'document-text';
      case 'achievement':
        return 'trophy';
      default:
        return 'megaphone';
    }
  };

  const renderAnnouncement = ({ item }: { item: Announcement }) => {
    const isRead = item.readBy.includes('currentUserId');
    const isAcknowledged = item.acknowledgedBy.includes('currentUserId');
    const priorityColor = getPriorityColor(item.priority);
    const typeIcon = getTypeIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.announcementItem, !isRead && styles.unreadItem]}
        onPress={() => handleAnnouncementPress(item)}
      >
        <View style={styles.announcementHeader}>
          <View style={styles.typeContainer}>
            <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
            <Ionicons name={typeIcon as any} size={20} color="#666" />
            <Text style={styles.announcementType}>{item.type}</Text>
          </View>

          <View style={styles.headerActions}>
            {item.isPinned && (
              <Ionicons name="pin" size={16} color="#FF9500" />
            )}
            {item.isUrgent && (
              <Ionicons name="flash" size={16} color="#FF3B30" />
            )}
            <Text style={styles.timestamp}>
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
        </View>

        <Text style={[styles.announcementTitle, !isRead && styles.unreadTitle]}>
          {item.title}
        </Text>

        <Text style={styles.announcementContent} numberOfLines={2}>
          {item.content}
        </Text>

        {item.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            <Ionicons name="attach" size={16} color="#666" />
            <Text style={styles.attachmentCount}>
              {item.attachments.length} attachment{item.attachments.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <View style={styles.announcementFooter}>
          <Text style={styles.senderName}>By {item.senderName}</Text>

          <View style={styles.footerActions}>
            {!isRead && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleMarkAsRead(item.id)}
              >
                <Text style={styles.actionButtonText}>Mark as Read</Text>
              </TouchableOpacity>
            )}

            {item.requiresAcknowledgment && !isAcknowledged && (
              <TouchableOpacity
                style={styles.acknowledgeButton}
                onPress={() => handleAcknowledge(item.id)}
              >
                <Text style={styles.acknowledgeButtonText}>Acknowledge</Text>
              </TouchableOpacity>
            )}

            {item.expiresAt && (
              <Text style={styles.expiryText}>
                Expires {formatTimestamp(item.expiresAt)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return timestamp.toLocaleDateString([], { weekday: 'short' });
    } else {
      return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Announcements</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateAnnouncement')}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.activeFilterButton]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterButtonText, filter === 'unread' && styles.activeFilterButtonText]}>
            Unread
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'urgent' && styles.activeFilterButton]}
          onPress={() => setFilter('urgent')}
        >
          <Text style={[styles.filterButtonText, filter === 'urgent' && styles.activeFilterButtonText]}>
            Urgent
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAnnouncements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No announcements</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all'
                ? 'No announcements have been posted yet'
                : `No ${filter} announcements`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  createButton: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  announcementItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    backgroundColor: '#f8f9ff',
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  announcementType: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attachmentCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  announcementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 12,
    color: '#999',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  acknowledgeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#34C759',
    borderRadius: 16,
    marginLeft: 8,
  },
  acknowledgeButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  expiryText: {
    fontSize: 12,
    color: '#FF9500',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 