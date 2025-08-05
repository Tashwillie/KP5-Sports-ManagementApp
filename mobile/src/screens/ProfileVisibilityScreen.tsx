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
import { Card, Button } from '../components/ui';

type VisibilityLevel = 'public' | 'friends' | 'teams' | 'private';

interface VisibilitySetting {
  id: string;
  title: string;
  description: string;
  icon: string;
  currentLevel: VisibilityLevel;
  options: {
    value: VisibilityLevel;
    label: string;
    description: string;
  }[];
}

export default function ProfileVisibilityScreen() {
  const navigation = useNavigation();
  
  const [settings, setSettings] = useState<VisibilitySetting[]>([
    {
      id: 'profile',
      title: 'Profile Information',
      description: 'Control who can see your basic profile details',
      icon: 'person-outline',
      currentLevel: 'public',
      options: [
        {
          value: 'public',
          label: 'Public',
          description: 'Anyone can see your profile',
        },
        {
          value: 'friends',
          label: 'Friends Only',
          description: 'Only your friends can see your profile',
        },
        {
          value: 'teams',
          label: 'Team Members',
          description: 'Only your team members can see your profile',
        },
        {
          value: 'private',
          label: 'Private',
          description: 'Only you can see your profile',
        },
      ],
    },
    {
      id: 'stats',
      title: 'Statistics & Achievements',
      description: 'Control who can see your match statistics and achievements',
      icon: 'stats-chart-outline',
      currentLevel: 'friends',
      options: [
        {
          value: 'public',
          label: 'Public',
          description: 'Anyone can see your stats',
        },
        {
          value: 'friends',
          label: 'Friends Only',
          description: 'Only your friends can see your stats',
        },
        {
          value: 'teams',
          label: 'Team Members',
          description: 'Only your team members can see your stats',
        },
        {
          value: 'private',
          label: 'Private',
          description: 'Only you can see your stats',
        },
      ],
    },
    {
      id: 'location',
      title: 'Location & Activity',
      description: 'Control who can see your location and activity status',
      icon: 'location-outline',
      currentLevel: 'teams',
      options: [
        {
          value: 'public',
          label: 'Public',
          description: 'Anyone can see your location',
        },
        {
          value: 'friends',
          label: 'Friends Only',
          description: 'Only your friends can see your location',
        },
        {
          value: 'teams',
          label: 'Team Members',
          description: 'Only your team members can see your location',
        },
        {
          value: 'private',
          label: 'Private',
          description: 'Only you can see your location',
        },
      ],
    },
    {
      id: 'photos',
      title: 'Photos & Media',
      description: 'Control who can see your uploaded photos and videos',
      icon: 'images-outline',
      currentLevel: 'friends',
      options: [
        {
          value: 'public',
          label: 'Public',
          description: 'Anyone can see your media',
        },
        {
          value: 'friends',
          label: 'Friends Only',
          description: 'Only your friends can see your media',
        },
        {
          value: 'teams',
          label: 'Team Members',
          description: 'Only your team members can see your media',
        },
        {
          value: 'private',
          label: 'Private',
          description: 'Only you can see your media',
        },
      ],
    },
  ]);

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [allowSearch, setAllowSearch] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [allowTeamInvites, setAllowTeamInvites] = useState(true);

  const handleVisibilityChange = (settingId: string, newLevel: VisibilityLevel) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === settingId
          ? { ...setting, currentLevel: newLevel }
          : setting
      )
    );
  };

  const handleSaveSettings = () => {
    // TODO: Implement API call to save visibility settings
    Alert.alert(
      'Settings Saved',
      'Your privacy settings have been updated successfully.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const getVisibilityIcon = (level: VisibilityLevel) => {
    switch (level) {
      case 'public':
        return 'globe-outline';
      case 'friends':
        return 'people-outline';
      case 'teams':
        return 'people-circle-outline';
      case 'private':
        return 'lock-closed-outline';
      default:
        return 'eye-outline';
    }
  };

  const getVisibilityColor = (level: VisibilityLevel) => {
    switch (level) {
      case 'public':
        return '#4CAF50';
      case 'friends':
        return '#2196F3';
      case 'teams':
        return '#FF9800';
      case 'private':
        return '#F44336';
      default:
        return '#666';
    }
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
        <Text style={styles.title}>Profile Visibility</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.description}>
        Control who can see your profile information, statistics, and activity.
      </Text>

      {/* Visibility Settings */}
      {settings.map((setting) => (
        <Card key={setting.id} style={styles.card}>
          <View style={styles.settingHeader}>
            <View style={styles.settingIcon}>
              <Ionicons name={setting.icon as any} size={24} color="#007AFF" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <View style={styles.currentLevel}>
              <Ionicons
                name={getVisibilityIcon(setting.currentLevel)}
                size={20}
                color={getVisibilityColor(setting.currentLevel)}
              />
              <Text style={[styles.levelText, { color: getVisibilityColor(setting.currentLevel) }]}>
                {setting.currentLevel.charAt(0).toUpperCase() + setting.currentLevel.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            {setting.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  setting.currentLevel === option.value && styles.optionItemSelected,
                ]}
                onPress={() => handleVisibilityChange(setting.id, option.value)}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name={getVisibilityIcon(option.value)}
                    size={20}
                    color={setting.currentLevel === option.value ? '#007AFF' : '#666'}
                  />
                  <View style={styles.optionText}>
                    <Text
                      style={[
                        styles.optionLabel,
                        setting.currentLevel === option.value && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </View>
                {setting.currentLevel === option.value && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      ))}

      {/* Advanced Settings */}
      <Card style={styles.card}>
        <TouchableOpacity
          style={styles.advancedHeader}
          onPress={() => setShowAdvancedSettings(!showAdvancedSettings)}
        >
          <Text style={styles.advancedTitle}>Advanced Settings</Text>
          <Ionicons
            name={showAdvancedSettings ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {showAdvancedSettings && (
          <View style={styles.advancedSettings}>
            <View style={styles.switchItem}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Allow Search</Text>
                <Text style={styles.switchDescription}>
                  Let others find your profile through search
                </Text>
              </View>
              <Switch
                value={allowSearch}
                onValueChange={setAllowSearch}
                trackColor={{ false: '#ddd', true: '#007AFF' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.switchItem}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Show Online Status</Text>
                <Text style={styles.switchDescription}>
                  Display when you're active in the app
                </Text>
              </View>
              <Switch
                value={showOnlineStatus}
                onValueChange={setShowOnlineStatus}
                trackColor={{ false: '#ddd', true: '#007AFF' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.switchItem}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Allow Friend Requests</Text>
                <Text style={styles.switchDescription}>
                  Let others send you friend requests
                </Text>
              </View>
              <Switch
                value={allowFriendRequests}
                onValueChange={setAllowFriendRequests}
                trackColor={{ false: '#ddd', true: '#007AFF' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.switchItem}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Allow Team Invites</Text>
                <Text style={styles.switchDescription}>
                  Let team admins send you team invitations
                </Text>
              </View>
              <Switch
                value={allowTeamInvites}
                onValueChange={setAllowTeamInvites}
                trackColor={{ false: '#ddd', true: '#007AFF' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        )}
      </Card>

      {/* Privacy Tips */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Privacy Tips</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Use "Friends Only" for personal information to maintain privacy while staying connected
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="eye-off-outline" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Set sensitive data to "Private" if you don't want anyone else to see it
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="people-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              "Team Members" is perfect for sharing sports-related information with your team
            </Text>
          </View>
        </View>
      </Card>

      {/* Save Button */}
      <Button
        title="Save Settings"
        onPress={handleSaveSettings}
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
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  currentLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  optionItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  advancedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  advancedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  advancedSettings: {
    marginTop: 16,
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
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