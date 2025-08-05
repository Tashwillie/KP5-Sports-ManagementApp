import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';
import { AdminBackup } from '@shared/types/admin';

interface BackupsScreenProps {
  navigation: any;
}

export default function BackupsScreen({ navigation }: BackupsScreenProps) {
  const [backups, setBackups] = useState<AdminBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<AdminBackup | null>(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBackup, setNewBackup] = useState({
    name: '',
    description: '',
    type: 'full' as AdminBackup['type'],
    retentionDays: 30,
  });

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const backupsData = await adminService.getBackups();
      setBackups(backupsData);
    } catch (error) {
      console.error('Error loading backups:', error);
      Alert.alert('Error', 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBackups();
    setRefreshing(false);
  };

  const handleBackupPress = (backup: AdminBackup) => {
    setSelectedBackup(backup);
    setShowBackupModal(true);
  };

  const handleCreateBackup = async () => {
    if (!newBackup.name || !newBackup.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await adminService.createBackup({
        ...newBackup,
        status: 'pending',
        size: 0,
        location: 'cloud-storage',
        checksum: '',
        createdBy: 'admin-user-id',
      });
      
      setShowCreateModal(false);
      setNewBackup({
        name: '',
        description: '',
        type: 'full',
        retentionDays: 30,
      });
      await loadBackups();
      Alert.alert('Success', 'Backup created successfully');
    } catch (error) {
      console.error('Error creating backup:', error);
      Alert.alert('Error', 'Failed to create backup');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      // Note: This would need to be implemented in the admin service
      // await adminService.deleteBackup(backupId);
      setShowBackupModal(false);
      await loadBackups();
      Alert.alert('Success', 'Backup deleted successfully');
    } catch (error) {
      console.error('Error deleting backup:', error);
      Alert.alert('Error', 'Failed to delete backup');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      case 'pending':
        return '#6B7280';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return 'archive';
      case 'incremental':
        return 'git-branch';
      case 'differential':
        return 'git-compare';
      default:
        return 'cloud-upload';
    }
  };

  const renderBackupItem = ({ item }: { item: AdminBackup }) => (
    <TouchableOpacity
      style={styles.backupItem}
      onPress={() => handleBackupPress(item)}
    >
      <View style={styles.backupInfo}>
        <View style={styles.backupHeader}>
          <View style={styles.backupTitleContainer}>
            <Ionicons
              name={getTypeIcon(item.type)}
              size={20}
              color="#3B82F6"
            />
            <Text style={styles.backupName}>{item.name}</Text>
          </View>
          <View style={styles.backupBadges}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.backupDescription}>{item.description}</Text>
        <View style={styles.backupStats}>
          <Text style={styles.backupStat}>
            Size: {formatFileSize(item.size)}
          </Text>
          <Text style={styles.backupStat}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          {item.completedAt && (
            <Text style={styles.backupStat}>
              Completed: {new Date(item.completedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  const BackupDetailModal = () => (
    <Modal
      visible={showBackupModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Backup Details</Text>
          <TouchableOpacity
            onPress={() => setShowBackupModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {selectedBackup && (
          <View style={styles.modalContent}>
            <View style={styles.backupDetailSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedBackup.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{selectedBackup.description}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{selectedBackup.type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{selectedBackup.status}</Text>
              </View>
            </View>

            <View style={styles.backupDetailSection}>
              <Text style={styles.sectionTitle}>Storage Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Size:</Text>
                <Text style={styles.detailValue}>
                  {formatFileSize(selectedBackup.size)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{selectedBackup.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Checksum:</Text>
                <Text style={styles.detailValue}>
                  {selectedBackup.checksum || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.backupDetailSection}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedBackup.createdAt).toLocaleString()}
                </Text>
              </View>
              {selectedBackup.completedAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Completed:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedBackup.completedAt).toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expires:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedBackup.expiresAt).toLocaleString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Retention:</Text>
                <Text style={styles.detailValue}>
                  {selectedBackup.retentionDays} days
                </Text>
              </View>
            </View>

            {selectedBackup.errorMessage && (
              <View style={styles.backupDetailSection}>
                <Text style={styles.sectionTitle}>Error Information</Text>
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{selectedBackup.errorMessage}</Text>
                </View>
              </View>
            )}

            <View style={styles.actionButtons}>
              {selectedBackup.status === 'completed' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.downloadButton]}
                  onPress={() => {
                    Alert.alert('Download', 'Download functionality coming soon');
                    setShowBackupModal(false);
                  }}
                >
                  <Ionicons name="download" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>
              )}

              {selectedBackup.status === 'completed' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.restoreButton]}
                  onPress={() => {
                    Alert.alert(
                      'Restore Backup',
                      'Are you sure you want to restore this backup? This will overwrite current data.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Restore',
                          style: 'destructive',
                          onPress: () => {
                            Alert.alert('Restore', 'Restore functionality coming soon');
                            setShowBackupModal(false);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Restore</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    'Delete Backup',
                    'Are you sure you want to delete this backup?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => handleDeleteBackup(selectedBackup.id),
                      },
                    ]
                  );
                }}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  const CreateBackupModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create New Backup</Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Backup Name *</Text>
            <TextInput
              style={styles.textInput}
              value={newBackup.name}
              onChangeText={(text) => setNewBackup({ ...newBackup, name: text })}
              placeholder="Enter backup name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newBackup.description}
              onChangeText={(text) => setNewBackup({ ...newBackup, description: text })}
              placeholder="Enter backup description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Backup Type</Text>
            <View style={styles.pickerContainer}>
              {['full', 'incremental', 'differential'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pickerOption,
                    newBackup.type === type && styles.pickerOptionActive,
                  ]}
                  onPress={() => setNewBackup({ ...newBackup, type: type as AdminBackup['type'] })}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      newBackup.type === type && styles.pickerOptionTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Retention Days</Text>
            <TextInput
              style={styles.textInput}
              value={String(newBackup.retentionDays)}
              onChangeText={(text) => setNewBackup({ ...newBackup, retentionDays: parseInt(text) || 30 })}
              placeholder="30"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.createButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.createButton]}
              onPress={handleCreateBackup}
            >
              <Ionicons name="cloud-upload" size={16} color="white" />
              <Text style={styles.actionButtonText}>Create Backup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Backups</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={backups}
        renderItem={renderBackupItem}
        keyExtractor={(item) => item.id}
        style={styles.backupList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-upload" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No backups found</Text>
            <Text style={styles.emptySubtext}>
              Create your first backup to get started
            </Text>
          </View>
        }
      />

      <BackupDetailModal />
      <CreateBackupModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  addButton: {
    padding: 8,
  },
  backupList: {
    flex: 1,
  },
  backupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backupInfo: {
    flex: 1,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  backupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  backupBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  backupDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  backupStats: {
    flexDirection: 'row',
    gap: 16,
  },
  backupStat: {
    fontSize: 12,
    color: '#9CA3AF',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  backupDetailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    minWidth: 100,
  },
  downloadButton: {
    backgroundColor: '#10B981',
  },
  restoreButton: {
    backgroundColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  createButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  pickerOptionActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  pickerOptionTextActive: {
    color: 'white',
  },
  createButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    fontFamily: 'monospace',
  },
}); 