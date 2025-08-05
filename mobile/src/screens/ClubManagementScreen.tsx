import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../services/adminService';
import { clubService } from '../services/clubService';
import { Club } from '@shared/types/club';

interface ClubManagementScreenProps {
  navigation: any;
}

export default function ClubManagementScreen({ navigation }: ClubManagementScreenProps) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showClubModal, setShowClubModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchQuery, statusFilter, levelFilter]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      const clubsData = await clubService.getClubs();
      setClubs(clubsData);
    } catch (error) {
      console.error('Error loading clubs:', error);
      Alert.alert('Error', 'Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    let filtered = clubs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        club =>
          club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.contact.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(club => club.status === statusFilter);
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(club => club.level === levelFilter);
    }

    setFilteredClubs(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClubs();
    setRefreshing(false);
  };

  const handleClubPress = (club: Club) => {
    setSelectedClub(club);
    setShowClubModal(true);
  };

  const handleStatusChange = async (clubId: string, newStatus: Club['status']) => {
    try {
      await clubService.updateClub(clubId, { status: newStatus });
      await loadClubs();
      Alert.alert('Success', 'Club status updated successfully');
    } catch (error) {
      console.error('Error updating club status:', error);
      Alert.alert('Error', 'Failed to update club status');
    }
  };

  const handleVerificationChange = async (clubId: string, verified: boolean) => {
    try {
      await clubService.updateClub(clubId, { verified });
      await loadClubs();
      Alert.alert('Success', `Club ${verified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating club verification:', error);
      Alert.alert('Error', 'Failed to update club verification');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#6B7280';
      case 'suspended':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'recreational':
        return '#3B82F6';
      case 'competitive':
        return '#F59E0B';
      case 'elite':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const renderClubItem = ({ item }: { item: Club }) => (
    <TouchableOpacity
      style={styles.clubItem}
      onPress={() => handleClubPress(item)}
    >
      <View style={styles.clubInfo}>
        <View style={styles.clubHeader}>
          <Text style={styles.clubName}>{item.name}</Text>
          <View style={styles.clubBadges}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: getLevelColor(item.level) },
              ]}
            >
              <Text style={styles.badgeText}>{item.level}</Text>
            </View>
            {item.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              </View>
            )}
          </View>
        </View>
        <Text style={styles.clubLocation}>{item.location}</Text>
        <View style={styles.clubStats}>
          <Text style={styles.clubStat}>
            {item.teams?.length || 0} teams
          </Text>
          <Text style={styles.clubStat}>
            {item.members?.length || 0} members
          </Text>
          <Text style={styles.clubStat}>
            Founded: {new Date(item.founded).getFullYear()}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
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

  const ClubDetailModal = () => (
    <Modal
      visible={showClubModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Club Details</Text>
          <TouchableOpacity
            onPress={() => setShowClubModal(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {selectedClub && (
          <View style={styles.modalContent}>
            <View style={styles.clubDetailSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedClub.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{selectedClub.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Level:</Text>
                <Text style={styles.detailValue}>{selectedClub.level}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{selectedClub.status}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Verified:</Text>
                <Text style={styles.detailValue}>
                  {selectedClub.verified ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>

            <View style={styles.clubDetailSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{selectedClub.contact.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{selectedClub.contact.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Website:</Text>
                <Text style={styles.detailValue}>
                  {selectedClub.contact.website || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.clubDetailSection}>
              <Text style={styles.sectionTitle}>Statistics</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Teams:</Text>
                <Text style={styles.detailValue}>
                  {selectedClub.teams?.length || 0}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Members:</Text>
                <Text style={styles.detailValue}>
                  {selectedClub.members?.length || 0}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Founded:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedClub.founded).getFullYear()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedClub.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  setShowClubModal(false);
                  navigation.navigate('EditClub', { clubId: selectedClub.id });
                }}
              >
                <Ionicons name="create" size={16} color="white" />
                <Text style={styles.actionButtonText}>Edit Club</Text>
              </TouchableOpacity>

              {selectedClub.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => {
                    handleStatusChange(selectedClub.id, 'active');
                    setShowClubModal(false);
                  }}
                >
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
              )}

              {!selectedClub.verified && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.verifyButton]}
                  onPress={() => {
                    handleVerificationChange(selectedClub.id, true);
                    setShowClubModal(false);
                  }}
                >
                  <Ionicons name="shield-checkmark" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Verify</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    'Delete Club',
                    'Are you sure you want to delete this club? This action cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await clubService.deleteClub(selectedClub.id);
                            setShowClubModal(false);
                            await loadClubs();
                            Alert.alert('Success', 'Club deleted successfully');
                          } catch (error) {
                            Alert.alert('Error', 'Failed to delete club');
                          }
                        },
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Club Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateClub')}
        >
          <Ionicons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clubs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {renderFilterButton('All', 'all', statusFilter, setStatusFilter)}
            {renderFilterButton('Active', 'active', statusFilter, setStatusFilter)}
            {renderFilterButton('Pending', 'pending', statusFilter, setStatusFilter)}
            {renderFilterButton('Suspended', 'suspended', statusFilter, setStatusFilter)}
            {renderFilterButton('Inactive', 'inactive', statusFilter, setStatusFilter)}
          </View>
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            {renderFilterButton('All Levels', 'all', levelFilter, setLevelFilter)}
            {renderFilterButton('Recreational', 'recreational', levelFilter, setLevelFilter)}
            {renderFilterButton('Competitive', 'competitive', levelFilter, setLevelFilter)}
            {renderFilterButton('Elite', 'elite', levelFilter, setLevelFilter)}
          </View>
        </ScrollView>
      </View>

      <FlatList
        data={filteredClubs}
        renderItem={renderClubItem}
        keyExtractor={(item) => item.id}
        style={styles.clubList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No clubs found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      <ClubDetailModal />
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
  searchContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
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
  clubList: {
    flex: 1,
  },
  clubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  clubInfo: {
    flex: 1,
  },
  clubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  clubBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedBadge: {
    padding: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: 'white',
  },
  clubLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  clubStats: {
    flexDirection: 'row',
    gap: 16,
  },
  clubStat: {
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
  clubDetailSection: {
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
  editButton: {
    backgroundColor: '#3B82F6',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  verifyButton: {
    backgroundColor: '#8B5CF6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
}); 