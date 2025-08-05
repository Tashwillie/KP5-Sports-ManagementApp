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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';
import { AdminAuditLog } from '@shared/types/admin';

interface AuditLogsScreenProps {
  navigation: any;
}

export default function AuditLogsScreen({ navigation }: AuditLogsScreenProps) {
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [filters, setFilters] = useState({
    action: 'all',
    resource: 'all',
    success: 'all',
  });

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const logsData = await adminService.getAuditLogs();
      setAuditLogs(logsData);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      Alert.alert('Error', 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuditLogs();
    setRefreshing(false);
  };

  const handleLogPress = (log: AdminAuditLog) => {
    setSelectedLog(log);
    setShowLogModal(true);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'add-circle';
      case 'update':
        return 'create';
      case 'delete':
        return 'trash';
      case 'login':
        return 'log-in';
      case 'logout':
        return 'log-out';
      case 'download':
        return 'download';
      case 'upload':
        return 'cloud-upload';
      default:
        return 'document-text';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return '#10B981';
      case 'update':
        return '#3B82F6';
      case 'delete':
        return '#EF4444';
      case 'login':
        return '#8B5CF6';
      case 'logout':
        return '#6B7280';
      case 'download':
        return '#F59E0B';
      case 'upload':
        return '#EC4899';
      default:
        return '#6B7280';
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource.toLowerCase()) {
      case 'user':
        return 'person';
      case 'club':
        return 'business';
      case 'team':
        return 'people';
      case 'event':
        return 'calendar';
      case 'payment':
        return 'card';
      case 'report':
        return 'document-text';
      case 'settings':
        return 'settings';
      default:
        return 'cube';
    }
  };

  const renderLogItem = ({ item }: { item: AdminAuditLog }) => (
    <TouchableOpacity
      style={styles.logItem}
      onPress={() => handleLogPress(item)}
    >
      <View style={styles.logIcon}>
        <Ionicons
          name={getActionIcon(item.action)}
          size={20}
          color={getActionColor(item.action)}
        />
      </View>
      <View style={styles.logInfo}>
        <View style={styles.logHeader}>
          <Text style={styles.logAction}>{item.action}</Text>
          <View style={styles.logBadges}>
            <View style={styles.resourceBadge}>
              <Ionicons
                name={getResourceIcon(item.resource)}
                size={12}
                color="#6B7280"
              />
              <Text style={styles.resourceText}>{item.resource}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.success ? '#10B981' : '#EF4444' },
              ]}
            >
              <Text style={styles.statusText}>
                {item.success ? 'Success' : 'Failed'}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.logUser}>{item.userEmail}</Text>
        <Text style={styles.logTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#6B7280" />
    </TouchableOpacity>
  );

  const renderFilterButton = (
    title: string,
    value: string,
    currentValue: string,
    onPress: (value: string) => void
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentValue === value && styles.filterButtonActive,
      ]}
      onPress={() => onPress(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          currentValue === value && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const filteredLogs = auditLogs.filter((log) => {
    if (filters.action !== 'all' && log.action !== filters.action) return false;
    if (filters.resource !== 'all' && log.resource !== filters.resource) return false;
    if (filters.success !== 'all') {
      const successFilter = filters.success === 'success';
      if (log.success !== successFilter) return false;
    }
    return true;
  });

  const LogDetailModal = () => (
    <Modal
      visible={showLogModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Audit Log Details</Text>
          <TouchableOpacity
            onPress={() => setShowLogModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {selectedLog && (
          <View style={styles.modalContent}>
            <View style={styles.logDetailSection}>
              <Text style={styles.sectionTitle}>Action Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Action:</Text>
                <Text style={styles.detailValue}>{selectedLog.action}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Resource:</Text>
                <Text style={styles.detailValue}>{selectedLog.resource}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Resource ID:</Text>
                <Text style={styles.detailValue}>{selectedLog.resourceId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: selectedLog.success ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {selectedLog.success ? 'Success' : 'Failed'}
                </Text>
              </View>
            </View>

            <View style={styles.logDetailSection}>
              <Text style={styles.sectionTitle}>User Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>User ID:</Text>
                <Text style={styles.detailValue}>{selectedLog.userId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedLog.userEmail}</Text>
              </View>
            </View>

            <View style={styles.logDetailSection}>
              <Text style={styles.sectionTitle}>Technical Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>IP Address:</Text>
                <Text style={styles.detailValue}>{selectedLog.ipAddress}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>User Agent:</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {selectedLog.userAgent}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Timestamp:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>

            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
              <View style={styles.logDetailSection}>
                <Text style={styles.sectionTitle}>Additional Details</Text>
                {Object.entries(selectedLog.details).map(([key, value]) => (
                  <View key={key} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{key}:</Text>
                    <Text style={styles.detailValue}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {selectedLog.errorMessage && (
              <View style={styles.logDetailSection}>
                <Text style={styles.sectionTitle}>Error Message</Text>
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{selectedLog.errorMessage}</Text>
                </View>
              </View>
            )}
          </View>
        )}
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
        <Text style={styles.title}>Audit Logs</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => Alert.alert('Export', 'Export functionality coming soon')}
        >
          <Ionicons name="download" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {renderFilterButton('All Actions', 'all', filters.action, (value) =>
              setFilters({ ...filters, action: value })
            )}
            {renderFilterButton('Create', 'create', filters.action, (value) =>
              setFilters({ ...filters, action: value })
            )}
            {renderFilterButton('Update', 'update', filters.action, (value) =>
              setFilters({ ...filters, action: value })
            )}
            {renderFilterButton('Delete', 'delete', filters.action, (value) =>
              setFilters({ ...filters, action: value })
            )}
            {renderFilterButton('Login', 'login', filters.action, (value) =>
              setFilters({ ...filters, action: value })
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {renderFilterButton('All Resources', 'all', filters.resource, (value) =>
              setFilters({ ...filters, resource: value })
            )}
            {renderFilterButton('Users', 'user', filters.resource, (value) =>
              setFilters({ ...filters, resource: value })
            )}
            {renderFilterButton('Clubs', 'club', filters.resource, (value) =>
              setFilters({ ...filters, resource: value })
            )}
            {renderFilterButton('Teams', 'team', filters.resource, (value) =>
              setFilters({ ...filters, resource: value })
            )}
            {renderFilterButton('Events', 'event', filters.resource, (value) =>
              setFilters({ ...filters, resource: value })
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {renderFilterButton('All Status', 'all', filters.success, (value) =>
              setFilters({ ...filters, success: value })
            )}
            {renderFilterButton('Success', 'success', filters.success, (value) =>
              setFilters({ ...filters, success: value })
            )}
            {renderFilterButton('Failed', 'failed', filters.success, (value) =>
              setFilters({ ...filters, success: value })
            )}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        style={styles.logList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No audit logs found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or check back later
            </Text>
          </View>
        }
      />

      <LogDetailModal />
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
  exportButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  logList: {
    flex: 1,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  logBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  resourceText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
  logUser: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  logTime: {
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
  logDetailSection: {
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
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 2,
    textAlign: 'right',
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