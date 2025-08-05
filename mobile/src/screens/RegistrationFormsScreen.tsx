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
import { registrationService } from '../services/registrationService';
import { RegistrationForm, RegistrationFormStatus, RegistrationFormType } from '@shared/types/registration';

interface RegistrationFormsScreenProps {
  navigation: any;
}

export default function RegistrationFormsScreen({ navigation }: RegistrationFormsScreenProps) {
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'open'>('all');

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      // Replace with actual club ID
      const clubId = 'currentClubId';
      const formsList = await registrationService.getRegistrationForms(clubId);
      setForms(formsList);
    } catch (error) {
      console.error('Error loading registration forms:', error);
      Alert.alert('Error', 'Failed to load registration forms');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadForms();
    setRefreshing(false);
  };

  const handleFormPress = (form: RegistrationForm) => {
    if (form.isActive && form.status === 'active') {
      navigation.navigate('RegistrationForm', { formId: form.id, form });
    } else {
      Alert.alert('Form Unavailable', 'This registration form is not currently active.');
    }
  };

  const handleCreateForm = () => {
    navigation.navigate('CreateRegistrationForm');
  };

  const filteredForms = forms.filter(form => {
    switch (filter) {
      case 'active':
        return form.status === 'active';
      case 'open':
        return form.isActive && form.status === 'active' && 
               (!form.registrationDeadline || new Date() < form.registrationDeadline) &&
               (!form.maxRegistrations || form.currentRegistrations < form.maxRegistrations);
      default:
        return true;
    }
  });

  const getStatusColor = (status: RegistrationFormStatus) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'draft':
        return '#FF9500';
      case 'paused':
        return '#FF3B30';
      case 'closed':
        return '#666';
      case 'archived':
        return '#999';
      default:
        return '#666';
    }
  };

  const getTypeIcon = (type: RegistrationFormType) => {
    switch (type) {
      case 'player_registration':
        return 'person-add';
      case 'team_registration':
        return 'people';
      case 'tournament_registration':
        return 'trophy';
      case 'event_registration':
        return 'calendar';
      case 'tryout_registration':
        return 'star';
      case 'camp_registration':
        return 'school';
      case 'volunteer_registration':
        return 'heart';
      default:
        return 'document-text';
    }
  };

  const formatDeadline = (deadline?: Date) => {
    if (!deadline) return 'No deadline';
    
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Closed';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days left`;
    return deadline.toLocaleDateString();
  };

  const renderForm = ({ item }: { item: RegistrationForm }) => {
    const isOpen = item.isActive && 
                   item.status === 'active' && 
                   (!item.registrationDeadline || new Date() < item.registrationDeadline) &&
                   (!item.maxRegistrations || item.currentRegistrations < item.maxRegistrations);
    
    const isFull = item.maxRegistrations && item.currentRegistrations >= item.maxRegistrations;
    const isExpired = item.registrationDeadline && new Date() > item.registrationDeadline;

    return (
      <TouchableOpacity
        style={[styles.formItem, !isOpen && styles.disabledForm]}
        onPress={() => handleFormPress(item)}
        disabled={!isOpen}
      >
        <View style={styles.formHeader}>
          <View style={styles.typeContainer}>
            <Ionicons name={getTypeIcon(item.type) as any} size={20} color="#007AFF" />
            <Text style={styles.formType}>{item.type.replace('_', ' ')}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            {isFull && (
              <View style={styles.fullBadge}>
                <Text style={styles.fullText}>FULL</Text>
              </View>
            )}
            {isExpired && (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredText}>EXPIRED</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.formName}>{item.name}</Text>
        
        {item.description && (
          <Text style={styles.formDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.formDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.currentRegistrations}
              {item.maxRegistrations && ` / ${item.maxRegistrations}`}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formatDeadline(item.registrationDeadline)}
            </Text>
          </View>

          {item.startDate && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>
                Starts {item.startDate.toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {item.requiresApproval && (
          <View style={styles.approvalNotice}>
            <Ionicons name="checkmark-circle" size={16} color="#FF9500" />
            <Text style={styles.approvalText}>Requires approval</Text>
          </View>
        )}

        {item.pricing.type !== 'free' && (
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingText}>
              ${item.pricing.basePrice}
              {item.pricing.type === 'early_bird' && ' (Early Bird)'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading registration forms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registration Forms</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateForm}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>
            All ({forms.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'active' && styles.activeFilterButton]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterButtonText, filter === 'active' && styles.activeFilterButtonText]}>
            Active ({forms.filter(f => f.status === 'active').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'open' && styles.activeFilterButton]}
          onPress={() => setFilter('open')}
        >
          <Text style={[styles.filterButtonText, filter === 'open' && styles.activeFilterButtonText]}>
            Open ({forms.filter(f => f.isActive && f.status === 'active' && 
              (!f.registrationDeadline || new Date() < f.registrationDeadline) &&
              (!f.maxRegistrations || f.currentRegistrations < f.maxRegistrations)).length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredForms}
        renderItem={renderForm}
        keyExtractor={(item) => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No registration forms</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all'
                ? 'No registration forms have been created yet'
                : `No ${filter} registration forms`}
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreateForm}>
              <Text style={styles.emptyButtonText}>Create Form</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  formItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  disabledForm: {
    opacity: 0.6,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formType: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fullBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  fullText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  expiredBadge: {
    backgroundColor: '#666',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  expiredText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  formName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  formDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  approvalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvalText: {
    fontSize: 12,
    color: '#FF9500',
    marginLeft: 4,
    fontWeight: '500',
  },
  pricingContainer: {
    alignItems: 'flex-end',
  },
  pricingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 