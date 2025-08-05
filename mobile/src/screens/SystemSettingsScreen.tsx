import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';
import { AdminSettingsConfig } from '@shared/types/admin';

interface SystemSettingsScreenProps {
  navigation: any;
}

export default function SystemSettingsScreen({ navigation }: SystemSettingsScreenProps) {
  const [settings, setSettings] = useState<AdminSettingsConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsData = await adminService.getSettingsConfig();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSettings();
    setRefreshing(false);
  };

  const handleSettingUpdate = async (settingId: string, value: any) => {
    try {
      await adminService.updateSetting(settingId, value, 'admin-user-id');
      await loadSettings();
      Alert.alert('Success', 'Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleEditStart = (setting: AdminSettingsConfig) => {
    setEditingSetting(setting.id);
    setEditValue(String(setting.value));
  };

  const handleEditSave = async (settingId: string) => {
    const setting = settings.find(s => s.id === settingId);
    if (!setting) return;

    let parsedValue: any = editValue;
    
    // Parse value based on type
    switch (setting.type) {
      case 'number':
        parsedValue = parseFloat(editValue);
        if (isNaN(parsedValue)) {
          Alert.alert('Error', 'Please enter a valid number');
          return;
        }
        break;
      case 'boolean':
        parsedValue = editValue.toLowerCase() === 'true';
        break;
      case 'json':
        try {
          parsedValue = JSON.parse(editValue);
        } catch {
          Alert.alert('Error', 'Please enter valid JSON');
          return;
        }
        break;
    }

    await handleSettingUpdate(settingId, parsedValue);
    setEditingSetting(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingSetting(null);
    setEditValue('');
  };

  const renderSettingValue = (setting: AdminSettingsConfig) => {
    if (editingSetting === setting.id) {
      return (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editValue}
            onChangeText={setEditValue}
            placeholder={`Enter ${setting.type}`}
            multiline={setting.type === 'json'}
            numberOfLines={setting.type === 'json' ? 4 : 1}
          />
          <View style={styles.editButtons}>
            <TouchableOpacity
              style={[styles.editButton, styles.saveButton]}
              onPress={() => handleEditSave(setting.id)}
            >
              <Ionicons name="checkmark" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={handleEditCancel}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            value={setting.value as boolean}
            onValueChange={(value) => handleSettingUpdate(setting.id, value)}
            trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
            thumbColor={setting.value ? '#FFFFFF' : '#FFFFFF'}
          />
        );
      case 'string':
      case 'number':
        return (
          <View style={styles.valueContainer}>
            <Text style={styles.settingValue}>{String(setting.value)}</Text>
            {setting.editable && (
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => handleEditStart(setting)}
              >
                <Ionicons name="create" size={16} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>
        );
      case 'json':
        return (
          <View style={styles.valueContainer}>
            <Text style={styles.settingValue} numberOfLines={2}>
              {JSON.stringify(setting.value, null, 2)}
            </Text>
            {setting.editable && (
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => handleEditStart(setting)}
              >
                <Ionicons name="create" size={16} color="#3B82F6" />
              </TouchableOpacity>
            )}
          </View>
        );
      default:
        return <Text style={styles.settingValue}>{String(setting.value)}</Text>;
    }
  };

  const renderSettingItem = (setting: AdminSettingsConfig) => (
    <View key={setting.id} style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <Text style={styles.settingKey}>{setting.key}</Text>
        {setting.required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>Required</Text>
          </View>
        )}
      </View>
      <Text style={styles.settingDescription}>{setting.description}</Text>
      <View style={styles.settingValueContainer}>
        {renderSettingValue(setting)}
      </View>
      <Text style={styles.settingType}>Type: {setting.type}</Text>
    </View>
  );

  const groupedSettings = settings.reduce((groups, setting) => {
    const category = setting.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(setting);
    return groups;
  }, {} as Record<string, AdminSettingsConfig[]>);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>System Settings</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons
                name={
                  category === 'general' ? 'settings' :
                  category === 'security' ? 'shield' :
                  category === 'email' ? 'mail' :
                  category === 'notifications' ? 'notifications' :
                  category === 'billing' ? 'card' :
                  'cog'
                }
                size={20}
                color="#374151"
              />
              <Text style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)} Settings
              </Text>
            </View>
            {categorySettings.map(renderSettingItem)}
          </View>
        ))}

        {settings.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="settings" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No settings found</Text>
            <Text style={styles.emptySubtext}>
              System settings will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  settingItem: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  settingKey: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  requiredBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  settingValueContainer: {
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    fontFamily: 'monospace',
  },
  editIcon: {
    padding: 4,
  },
  settingType: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
}); 