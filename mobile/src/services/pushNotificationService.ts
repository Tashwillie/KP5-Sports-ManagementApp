import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface NotificationSettings {
  enabled: boolean;
  matchNotifications: boolean;
  eventNotifications: boolean;
  chatNotifications: boolean;
  announcementNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface NotificationData {
  type: 'match' | 'event' | 'chat' | 'announcement' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionUrl?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;
  private fcmToken: string | null = null;
  private settings: NotificationSettings = {
    enabled: true,
    matchNotifications: true,
    eventNotifications: true,
    chatNotifications: true,
    announcementNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  };

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.loadSettings();
    await this.registerForPushNotifications();
    this.setupMessageListener();
  }

  private async loadSettings() {
    try {
      const settingsData = await AsyncStorage.getItem('notificationSettings');
      if (settingsData) {
        this.settings = { ...this.settings, ...JSON.parse(settingsData) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  private async saveSettings() {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  private async registerForPushNotifications() {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications are only available on physical devices');
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Get Expo push token
      const expoToken = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID,
      });
      this.expoPushToken = expoToken.data;

      // Get FCM token
      if (messaging) {
        try {
          const fcmToken = await getToken(messaging, {
            vapidKey: process.env.FIREBASE_VAPID_KEY,
          });
          this.fcmToken = fcmToken;
        } catch (error) {
          console.warn('Failed to get FCM token:', error);
        }
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      console.log('Push notification tokens:', {
        expo: this.expoPushToken,
        fcm: this.fcmToken,
      });
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  private setupMessageListener() {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        this.handleIncomingNotification(payload);
      });
    }
  }

  private handleIncomingNotification(payload: any) {
    if (!this.settings.enabled) return;

    const notificationData = payload.notification || payload.data;
    if (!notificationData) return;

    // Check if notification type is enabled
    const notificationType = payload.data?.type || 'system';
    if (!this.isNotificationTypeEnabled(notificationType)) return;

    // Check quiet hours
    if (this.settings.quietHoursEnabled && this.isInQuietHours()) return;

    // Show local notification
    this.showLocalNotification({
      type: notificationType as any,
      title: notificationData.title || 'New Notification',
      body: notificationData.body || '',
      data: payload.data,
      imageUrl: notificationData.imageUrl,
      actionUrl: payload.data?.actionUrl,
    });
  }

  private isNotificationTypeEnabled(type: string): boolean {
    switch (type) {
      case 'match':
        return this.settings.matchNotifications;
      case 'event':
        return this.settings.eventNotifications;
      case 'chat':
        return this.settings.chatNotifications;
      case 'announcement':
        return this.settings.announcementNotifications;
      default:
        return true;
    }
  }

  private isInQuietHours(): boolean {
    if (!this.settings.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = this.settings.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = this.settings.quietHoursEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Show local notification
  async showLocalNotification(notification: NotificationData): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: this.settings.soundEnabled ? 'default' : undefined,
          vibrate: this.settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
          ...(notification.imageUrl && { image: notification.imageUrl }),
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error showing local notification:', error);
      throw error;
    }
  }

  // Schedule notification
  async scheduleNotification(
    notification: NotificationData,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: this.settings.soundEnabled ? 'default' : undefined,
          vibrate: this.settings.vibrationEnabled ? [0, 250, 250, 250] : undefined,
          ...(notification.imageUrl && { image: notification.imageUrl }),
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Cancel notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
      throw error;
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      throw error;
    }
  }

  // Get notification settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Update notification settings
  async updateSettings(updates: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...updates };
    await this.saveSettings();
  }

  // Get push tokens
  getPushTokens(): { expo: string | null; fcm: string | null } {
    return {
      expo: this.expoPushToken,
      fcm: this.fcmToken,
    };
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  // Get badge count
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  // Set badge count
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
      throw error;
    }
  }

  // Add notification received listener
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Add notification response received listener
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Remove notification listener
  removeNotificationSubscription(subscription: Notifications.Subscription): void {
    subscription.remove();
  }
}

export const pushNotificationService = PushNotificationService.getInstance(); 