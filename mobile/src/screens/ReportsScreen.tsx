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
import { AdminReport } from '@shared/types/admin';

interface ReportsScreenProps {
  navigation: any;
}

export default function ReportsScreen({ navigation }: ReportsScreenProps) {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    type: 'users' as AdminReport['type'],
    format: 'pdf' as AdminReport['format'],
    schedule: 'once' as AdminReport['schedule'],
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportsData = await adminService.getReports();
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleReportPress = (report: AdminReport) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleCreateReport = async () => {
    if (!newReport.name || !newReport.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await adminService.createReport({
        ...newReport,
        scheduleConfig: {
          recipients: ['admin@example.com'],
        },
        filters: {},
        columns: [],
        sortBy: 'createdAt',
        sortOrder: 'desc',
        status: 'active',
        createdBy: 'admin-user-id',
      });
      
      setShowCreateModal(false);
      setNewReport({
        name: '',
        description: '',
        type: 'users',
        format: 'pdf',
        schedule: 'once',
      });
      await loadReports();
      Alert.alert('Success', 'Report created successfully');
    } catch (error) {
      console.error('Error creating report:', error);
      Alert.alert('Error', 'Failed to create report');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await adminService.deleteReport(reportId);
      setShowReportModal(false);
      await loadReports();
      Alert.alert('Success', 'Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      Alert.alert('Error', 'Failed to delete report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#6B7280';
      case 'error':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'users':
        return 'people';
      case 'clubs':
        return 'business';
      case 'teams':
        return 'people-circle';
      case 'events':
        return 'calendar';
      case 'payments':
        return 'card';
      case 'analytics':
        return 'analytics';
      case 'system':
        return 'server';
      default:
        return 'document-text';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'document-text';
      case 'csv':
        return 'grid';
      case 'excel':
        return 'tablet-portrait';
      case 'json':
        return 'code';
      default:
        return 'document';
    }
  };

  const renderReportItem = ({ item }: { item: AdminReport }) => (
    <TouchableOpacity
      style={styles.reportItem}
      onPress={() => handleReportPress(item)}
    >
      <View style={styles.reportInfo}>
        <View style={styles.reportHeader}>
          <View style={styles.reportTitleContainer}>
            <Ionicons
              name={getTypeIcon(item.type)}
              size={20}
              color="#3B82F6"
            />
            <Text style={styles.reportName}>{item.name}</Text>
          </View>
          <View style={styles.reportBadges}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
            <View style={styles.formatBadge}>
              <Ionicons
                name={getFormatIcon(item.format)}
                size={12}
                color="#6B7280"
              />
              <Text style={styles.formatText}>{item.format.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.reportDescription}>{item.description}</Text>
        <View style={styles.reportStats}>
          <Text style={styles.reportStat}>
            Type: {item.type}
          </Text>
          <Text style={styles.reportStat}>
            Schedule: {item.schedule}
          </Text>
          {item.lastGenerated && (
            <Text style={styles.reportStat}>
              Last: {new Date(item.lastGenerated).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  const ReportDetailModal = () => (
    <Modal
      visible={showReportModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Report Details</Text>
          <TouchableOpacity
            onPress={() => setShowReportModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {selectedReport && (
          <View style={styles.modalContent}>
            <View style={styles.reportDetailSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedReport.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description:</Text>
                <Text style={styles.detailValue}>{selectedReport.description}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{selectedReport.type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Format:</Text>
                <Text style={styles.detailValue}>{selectedReport.format}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{selectedReport.status}</Text>
              </View>
            </View>

            <View style={styles.reportDetailSection}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Frequency:</Text>
                <Text style={styles.detailValue}>{selectedReport.schedule}</Text>
              </View>
              {selectedReport.scheduleConfig.time && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>{selectedReport.scheduleConfig.time}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recipients:</Text>
                <Text style={styles.detailValue}>
                  {selectedReport.scheduleConfig.recipients.join(', ')}
                </Text>
              </View>
            </View>

            <View style={styles.reportDetailSection}>
              <Text style={styles.sectionTitle}>Generation</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Generated:</Text>
                <Text style={styles.detailValue}>
                  {selectedReport.lastGenerated
                    ? new Date(selectedReport.lastGenerated).toLocaleString()
                    : 'Never'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Generation:</Text>
                <Text style={styles.detailValue}>
                  {selectedReport.nextGeneration
                    ? new Date(selectedReport.nextGeneration).toLocaleString()
                    : 'Not scheduled'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedReport.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.generateButton]}
                onPress={() => {
                  Alert.alert('Generate Report', 'This will generate the report now');
                  setShowReportModal(false);
                }}
              >
                <Ionicons name="download" size={16} color="white" />
                <Text style={styles.actionButtonText}>Generate Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  setShowReportModal(false);
                  navigation.navigate('EditReport', { reportId: selectedReport.id });
                }}
              >
                <Ionicons name="create" size={16} color="white" />
                <Text style={styles.actionButtonText}>Edit Report</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    'Delete Report',
                    'Are you sure you want to delete this report?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => handleDeleteReport(selectedReport.id),
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

  const CreateReportModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create New Report</Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Name *</Text>
            <TextInput
              style={styles.textInput}
              value={newReport.name}
              onChangeText={(text) => setNewReport({ ...newReport, name: text })}
              placeholder="Enter report name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={newReport.description}
              onChangeText={(text) => setNewReport({ ...newReport, description: text })}
              placeholder="Enter report description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Report Type</Text>
            <View style={styles.pickerContainer}>
              {['users', 'clubs', 'teams', 'events', 'payments', 'analytics', 'system'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pickerOption,
                    newReport.type === type && styles.pickerOptionActive,
                  ]}
                  onPress={() => setNewReport({ ...newReport, type: type as AdminReport['type'] })}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      newReport.type === type && styles.pickerOptionTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Format</Text>
            <View style={styles.pickerContainer}>
              {['pdf', 'csv', 'excel', 'json'].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.pickerOption,
                    newReport.format === format && styles.pickerOptionActive,
                  ]}
                  onPress={() => setNewReport({ ...newReport, format: format as AdminReport['format'] })}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      newReport.format === format && styles.pickerOptionTextActive,
                    ]}
                  >
                    {format.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Schedule</Text>
            <View style={styles.pickerContainer}>
              {['once', 'daily', 'weekly', 'monthly'].map((schedule) => (
                <TouchableOpacity
                  key={schedule}
                  style={[
                    styles.pickerOption,
                    newReport.schedule === schedule && styles.pickerOptionActive,
                  ]}
                  onPress={() => setNewReport({ ...newReport, schedule: schedule as AdminReport['schedule'] })}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      newReport.schedule === schedule && styles.pickerOptionTextActive,
                    ]}
                  >
                    {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
              onPress={handleCreateReport}
            >
              <Ionicons name="add" size={16} color="white" />
              <Text style={styles.actionButtonText}>Create Report</Text>
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
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        style={styles.reportList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No reports found</Text>
            <Text style={styles.emptySubtext}>
              Create your first report to get started
            </Text>
          </View>
        }
      />

      <ReportDetailModal />
      <CreateReportModal />
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
  reportList: {
    flex: 1,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reportInfo: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reportTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  reportBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
  formatText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
  },
  reportDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  reportStats: {
    flexDirection: 'row',
    gap: 16,
  },
  reportStat: {
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
  reportDetailSection: {
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
  generateButton: {
    backgroundColor: '#10B981',
  },
  editButton: {
    backgroundColor: '#3B82F6',
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
}); 