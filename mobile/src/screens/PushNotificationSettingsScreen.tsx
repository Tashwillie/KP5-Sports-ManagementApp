import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Card, Button } from '../components/ui';

interface NotificationCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  subCategories?: {
    id: string;
    title: string;
    enabled: boolean;
  }[];
}

export default function PushNotificationSettingsScreen() {
  const navigation = useNavigation();
  
  const [notificationCategories, setNotificationCategories] = useState<NotificationCategory[]>([
    {
      id: 'matches',
      title: 'Match Notifications',
      description: 'Get notified about match updates, scores, and schedules',
      icon: 'football-outline',
      enabled: true,
      subCategories: [
        { id: 'match_reminders', title: 'Match Reminders', enabled: true },
        { id: 'live_updates', title: 'Live Match Updates', enabled: true },
        { id: 'final_scores', title: 'Final Scores', enabled: true },
        { id: 'schedule_changes', title: 'Schedule Changes', enabled: false },
      ],
    },
    {
      id: 'teams',
      title: 'Team Notifications',
      description: 'Stay updated with your team activities and announcements',
      icon: 'people-outline',
      enabled: true,
      subCategories: [
        { id: 'team_announcements', title: 'Team Announcements', enabled: true },
        { id: 'practice_reminders', title: 'Practice Reminders', enabled: true },
        { id: 'roster_updates', title: 'Roster Updates', enabled: false },
        { id: 'team_events', title: 'Team Events', enabled: true },
      ],
    },
    {
      id: 'tournaments',
      title: 'Tournament Notifications',
      description: 'Receive updates about tournaments and competitions',
      icon: 'trophy-outline',
      enabled: true,
      subCategories: [
        { id: 'tournament_start', title: 'Tournament Start', enabled: true },
        { id: 'bracket_updates', title: 'Bracket Updates', enabled: true },
        { id: 'final_results', title: 'Final Results', enabled: true },
        { id: 'registration_deadlines', title: 'Registration Deadlines', enabled: false },
      ],
    },
    {
      id: 'social',
      title: 'Social Notifications',
      description: 'Connect with friends and teammates',
      icon: 'chatbubbles-outline',
      enabled: true,
      subCategories: [
        { id: 'friend_requests', title: 'Friend Requests', enabled: true },
        { id: 'messages', title: 'New Messages', enabled: true },
        { id: 'mentions', title: 'Mentions & Tags', enabled: false },
        { id: 'achievements', title: 'Achievements & Milestones', enabled: true },
      ],
    },
    {
      id: 'general',
      title: 'General Notifications',
      description: 'App updates and general announcements',
      icon: 'notifications-outline',
      enabled: true,
      subCategories: [
        { id: 'app_updates', title: 'App Updates', enabled: false },
        { id: 'maintenance', title: 'Maintenance Alerts', enabled: true },
        { id: 'news', title: 'News & Updates', enabled: false },
        { id: 'promotions', title: 'Promotions & Offers', enabled: false },
      ],
    },
  ]);

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const toggleCategory = (categoryId: string) => {
    setNotificationCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? { ...category, enabled: !category.enabled }
          : category
      )
    );
  };

  const toggleSubCategory = (categoryId: string, subCategoryId: string) => {
    setNotificationCategories(prev =>
      prev.map(category =>
        category.id === categoryId
          ? {
              ...category,
              subCategories: category.subCategories?.map(sub =>
                sub.id === subCategoryId
                  ? { ...sub, enabled: !sub.enabled }
                  : sub
              ),
            }
          : category
      )
    );
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Push notifications are disabled. Please enable them in your device settings to receive important updates.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // TODO: Open device settings
              Alert.alert('Info', 'Please go to Settings > Notifications > KP5 Academy to enable notifications.');
            }},
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to request notification permissions.');
      return false;
    }
  };

  const saveSettings = async () => {
    if (!(await requestNotificationPermissions())) return;

    try {
      // TODO: Save notification settings to API
      Alert.alert(
        'Settings Saved',
        'Your notification preferences have been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings. Please try again.');
    }
  };

  const testNotification = async () => {
    if (!(await requestNotificationPermissions())) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'This is a test notification to verify your settings.',
          sound: soundEnabled ? 'default' : undefined,
        },
        trigger: { seconds: 2 },
      });
      
      Alert.alert('Test Sent', 'A test notification will arrive in 2 seconds.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  const getEnabledSubCategoriesCount = (category: NotificationCategory) => {
    return category.subCategories?.filter(sub => sub.enabled).length || 0;
  };

  const getTotalSubCategoriesCount = (category: NotificationCategory) => {
    return category.subCategories?.length || 0;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Push Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.description}>
        Customize which notifications you want to receive and how you want to receive them.
      </Text>

      {/* Notification Categories */}
      {notificationCategories.map((category) => (
        <Card key={category.id} style={styles.card}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <View style={styles.categoryIcon}>
                <Ionicons name={category.icon as any} size={24} color="#007AFF" />
              </View>
              <View style={styles.categoryText}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
                <Text style={styles.categoryCount}>
                  {getEnabledSubCategoriesCount(category)} of {getTotalSubCategoriesCount(category)} enabled
                </Text>
              </View>
            </View>
            <Switch
              value={category.enabled}
              onValueChange={() => toggleCategory(category.id)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          {category.enabled && category.subCategories && (
            <View style={styles.subCategories}>
              {category.subCategories.map((subCategory) => (
                <View key={subCategory.id} style={styles.subCategoryItem}>
                  <Text style={styles.subCategoryTitle}>{subCategory.title}</Text>
                  <Switch
                    value={subCategory.enabled}
                    onValueChange={() => toggleSubCategory(category.id, subCategory.id)}
                    trackColor={{ false: '#ddd', true: '#007AFF' }}
                    thumbColor="#fff"
                  />
                </View>
              ))}
            </View>
          )}
        </Card>
      ))}

      {/* Notification Preferences */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceTitle}>Sound</Text>
            <Text style={styles.preferenceDescription}>
              Play sound for notifications
            </Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceTitle}>Vibration</Text>
            <Text style={styles.preferenceDescription}>
              Vibrate device for notifications
            </Text>
          </View>
          <Switch
            value={vibrationEnabled}
            onValueChange={setVibrationEnabled}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceTitle}>Quiet Hours</Text>
            <Text style={styles.preferenceDescription}>
              Pause notifications during specified hours
            </Text>
          </View>
          <Switch
            value={quietHoursEnabled}
            onValueChange={setQuietHoursEnabled}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>

        {quietHoursEnabled && (
          <View style={styles.quietHoursInfo}>
            <Text style={styles.quietHoursText}>
              Quiet hours: {quietHoursStart} - {quietHoursEnd}
            </Text>
            <TouchableOpacity style={styles.editQuietHours}>
              <Text style={styles.editQuietHoursText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      {/* Test Notification */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Test Notifications</Text>
        <Text style={styles.testDescription}>
          Send a test notification to verify your settings are working correctly.
        </Text>
        <Button
          title="Send Test Notification"
          onPress={testNotification}
          variant="outline"
          style={styles.testButton}
        />
      </Card>

      {/* Notification Tips */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Tips</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              Enable match notifications to never miss important game updates
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              Use quiet hours to avoid notifications during sleep time
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              You can customize each notification type individually
            </Text>
          </View>
        </View>
      </Card>

      {/* Save Button */}
      <Button
        title="Save Settings"
        onPress={saveSettings}
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
  },
  subCategories: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  subCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  subCategoryTitle: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
  quietHoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 12,
  },
  quietHoursText: {
    fontSize: 14,
    color: '#666',
  },
  editQuietHours: {
    padding: 8,
  },
  editQuietHoursText: {
    fontSize: 14,
    color: '#007AFF',
  },
  testDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  testButton: {
    alignSelf: 'flex-start',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 20,
  },
}); 