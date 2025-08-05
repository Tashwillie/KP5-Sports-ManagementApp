import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { tw } from '../utils/tailwind';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useMobileAuth } from '../hooks/useMobileApi';
import { User } from '../../../shared/src/types';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, signOut, updateProfile } = useMobileAuth();
  
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    matchReminders: true,
    teamUpdates: true,
    tournamentUpdates: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showLocation: true,
    showStats: true
  });

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigation will be handled by auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In real app, you'd implement account deletion
            Alert.alert('Not Implemented', 'Account deletion is not implemented in this demo.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    // In real app, you'd implement data export
    Alert.alert('Export Data', 'Data export feature is not implemented in this demo.');
  };

  const notificationSettings: SettingItem[] = [
    {
      id: 'pushSettings',
      title: 'Push Notifications',
      subtitle: 'Customize notification preferences',
      icon: 'notifications',
      type: 'navigate',
      onPress: () => navigation.navigate('PushNotificationSettings' as never)
    },
    {
      id: 'push',
      title: 'Enable Notifications',
      subtitle: 'Receive notifications on your device',
      icon: 'notifications',
      type: 'toggle',
      value: notifications.push,
      onToggle: (value) => setNotifications(prev => ({ ...prev, push: value }))
    },
    {
      id: 'email',
      title: 'Email Notifications',
      subtitle: 'Receive notifications via email',
      icon: 'mail',
      type: 'toggle',
      value: notifications.email,
      onToggle: (value) => setNotifications(prev => ({ ...prev, email: value }))
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      subtitle: 'Receive notifications via SMS',
      icon: 'chatbubble',
      type: 'toggle',
      value: notifications.sms,
      onToggle: (value) => setNotifications(prev => ({ ...prev, sms: value }))
    },
    {
      id: 'matchReminders',
      title: 'Match Reminders',
      subtitle: 'Get reminded about upcoming matches',
      icon: 'football',
      type: 'toggle',
      value: notifications.matchReminders,
      onToggle: (value) => setNotifications(prev => ({ ...prev, matchReminders: value }))
    },
    {
      id: 'teamUpdates',
      title: 'Team Updates',
      subtitle: 'Notifications about team changes',
      icon: 'people',
      type: 'toggle',
      value: notifications.teamUpdates,
      onToggle: (value) => setNotifications(prev => ({ ...prev, teamUpdates: value }))
    },
    {
      id: 'tournamentUpdates',
      title: 'Tournament Updates',
      subtitle: 'Notifications about tournaments',
      icon: 'trophy',
      type: 'toggle',
      value: notifications.tournamentUpdates,
      onToggle: (value) => setNotifications(prev => ({ ...prev, tournamentUpdates: value }))
    }
  ];

  const privacySettings: SettingItem[] = [
    {
      id: 'profileVisibility',
      title: 'Profile Visibility',
      subtitle: 'Control who can see your profile',
      icon: 'eye',
      type: 'navigate',
      onPress: () => navigation.navigate('ProfileVisibility' as never)
    },
    {
      id: 'showLocation',
      title: 'Show Location',
      subtitle: 'Display your location to other users',
      icon: 'location',
      type: 'toggle',
      value: privacy.showLocation,
      onToggle: (value) => setPrivacy(prev => ({ ...prev, showLocation: value }))
    },
    {
      id: 'showStats',
      title: 'Show Statistics',
      subtitle: 'Display your match statistics publicly',
      icon: 'stats-chart',
      type: 'toggle',
      value: privacy.showStats,
      onToggle: (value) => setPrivacy(prev => ({ ...prev, showStats: value }))
    }
  ];

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: 'person',
      type: 'navigate',
      onPress: () => navigation.navigate('EditProfile' as never)
    },
    {
      id: 'changePassword',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: 'lock-closed',
      type: 'navigate',
      onPress: () => navigation.navigate('ChangePassword' as never)
    },
    {
      id: 'linkedAccounts',
      title: 'Linked Accounts',
      subtitle: 'Manage connected social accounts',
      icon: 'link',
      type: 'navigate',
      onPress: () => navigation.navigate('LinkedAccounts' as never)
    }
  ];

  const dataSettings: SettingItem[] = [
    {
      id: 'photoUpload',
      title: 'Photo Upload',
      subtitle: 'Upload and manage photos',
      icon: 'camera',
      type: 'navigate',
      onPress: () => navigation.navigate('PhotoUpload' as never)
    },
    {
      id: 'exportData',
      title: 'Export Data',
      subtitle: 'Download a copy of your data',
      icon: 'download',
      type: 'action',
      onPress: handleExportData
    },
    {
      id: 'clearCache',
      title: 'Clear Cache',
      subtitle: 'Free up storage space',
      icon: 'trash',
      type: 'action',
      onPress: () => Alert.alert('Cache Cleared', 'App cache has been cleared.')
    }
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle',
      type: 'navigate',
      onPress: () => navigation.navigate('HelpSupport' as never)
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      subtitle: 'Share your thoughts with us',
      icon: 'chatbox',
      type: 'navigate',
      onPress: () => navigation.navigate('Feedback' as never)
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle',
      type: 'navigate',
      onPress: () => navigation.navigate('About' as never)
    }
  ];

  const renderSettingItem = ({ item }: { item: SettingItem }) => (
    <TouchableOpacity 
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <Card style={tw('mb-2')}>
        <View style={tw('flex-row items-center justify-between')}>
          <View style={tw('flex-row items-center flex-1')}>
            <View style={tw('w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3')}>
              <Ionicons name={item.icon as any} size={20} color="#3B82F6" />
            </View>
            <View style={tw('flex-1')}>
              <Text style={tw('text-base font-semibold text-gray-900')}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text style={tw('text-sm text-gray-600')}>
                  {item.subtitle}
                </Text>
              )}
            </View>
          </View>
          
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor="#FFFFFF"
            />
          )}
          
          {item.type === 'navigate' && (
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderSection = (title: string, data: SettingItem[]) => (
    <View style={tw('mb-6')}>
      <Text style={tw('text-lg font-semibold text-gray-900 mb-3 px-4')}>
        {title}
      </Text>
      <View style={tw('px-4')}>
        {data.map(item => (
          <View key={item.id}>
            {renderSettingItem({ item })}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-50')}>
      {/* Header */}
      <View style={tw('bg-white border-b border-gray-200 px-4 py-3')}>
        <Text style={tw('text-2xl font-bold text-gray-900')}>Settings</Text>
      </View>

      {/* User Profile Summary */}
      <View style={tw('bg-white border-b border-gray-200 px-4 py-4')}>
        <View style={tw('flex-row items-center')}>
          <View style={tw('w-16 h-16 bg-gray-300 rounded-full items-center justify-center mr-4')}>
            <Ionicons name="person" size={32} color="#6B7280" />
          </View>
          <View style={tw('flex-1')}>
            <Text style={tw('text-lg font-semibold text-gray-900')}>
              {user?.displayName || 'User Name'}
            </Text>
            <Text style={tw('text-sm text-gray-600')}>
              {user?.email || 'user@example.com'}
            </Text>
            <Text style={tw('text-xs text-gray-500 mt-1')}>
              {user?.role || 'Player'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditProfile' as never)}
            style={tw('bg-blue-600 px-3 py-1 rounded-lg')}
          >
            <Text style={tw('text-white text-sm font-medium')}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Content */}
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View style={tw('py-4')}>
            {renderSection('Notifications', notificationSettings)}
            {renderSection('Privacy', privacySettings)}
            {renderSection('Account', accountSettings)}
            {renderSection('Data', dataSettings)}
            {renderSection('Support', supportSettings)}
            
            {/* Sign Out and Delete Account */}
            <View style={tw('px-4 mb-6')}>
              <Text style={tw('text-lg font-semibold text-gray-900 mb-3')}>
                Account Actions
              </Text>
              
              <TouchableOpacity onPress={handleSignOut}>
                <Card style={tw('mb-2 border-red-200')}>
                  <View style={tw('flex-row items-center')}>
                    <View style={tw('w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3')}>
                      <Ionicons name="log-out" size={20} color="#EF4444" />
                    </View>
                    <Text style={tw('text-base font-semibold text-red-600')}>
                      Sign Out
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleDeleteAccount}>
                <Card style={tw('border-red-200')}>
                  <View style={tw('flex-row items-center')}>
                    <View style={tw('w-10 h-10 bg-red-100 rounded-lg items-center justify-center mr-3')}>
                      <Ionicons name="trash" size={20} color="#EF4444" />
                    </View>
                    <Text style={tw('text-base font-semibold text-red-600')}>
                      Delete Account
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
} 