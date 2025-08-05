import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../services/paymentService';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '@shared/types/payment';

export default function SubscriptionsScreen() {
  const navigation = useNavigation();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus | 'all'>('all');

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userSubscriptions, plans] = await Promise.all([
        paymentService.getUserSubscriptions(),
        paymentService.getSubscriptionPlans(),
      ]);
      
      let filteredSubscriptions = userSubscriptions;
      if (selectedStatus !== 'all') {
        filteredSubscriptions = userSubscriptions.filter(sub => sub.status === selectedStatus);
      }
      
      setSubscriptions(filteredSubscriptions);
      setAvailablePlans(plans);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'trialing':
        return '#007AFF';
      case 'past_due':
        return '#FF9500';
      case 'canceled':
        return '#8E8E93';
      case 'incomplete':
        return '#FF3B30';
      case 'incomplete_expired':
        return '#8E8E93';
      case 'unpaid':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'incomplete':
        return 'Incomplete';
      case 'incomplete_expired':
        return 'Expired';
      case 'unpaid':
        return 'Unpaid';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getIntervalText = (interval: string, intervalCount: number) => {
    if (intervalCount === 1) {
      return interval;
    }
    return `${intervalCount} ${interval}s`;
  };

  const handleSubscriptionPress = (subscription: Subscription) => {
    // Navigate to subscription details screen
    navigation.navigate('SubscriptionDetails' as any, { subscriptionId: subscription.id });
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription? You will continue to have access until the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            try {
              await paymentService.cancelSubscription(subscription.id);
              Alert.alert('Success', 'Your subscription has been canceled.');
              loadData();
            } catch (error) {
              console.error('Error canceling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSubscribeToPlan = (plan: SubscriptionPlan) => {
    navigation.navigate('Payment' as any, {
      amount: plan.price,
      currency: plan.currency,
      description: `Subscribe to ${plan.name}`,
      type: 'subscription',
      metadata: {
        planId: plan.id,
        planName: plan.name,
        interval: plan.interval,
        intervalCount: plan.intervalCount,
      },
      returnUrl: 'Subscriptions',
    });
  };

  const renderSubscriptionItem = ({ item }: { item: Subscription }) => (
    <TouchableOpacity
      style={styles.subscriptionCard}
      onPress={() => handleSubscriptionPress(item)}
    >
      <View style={styles.subscriptionHeader}>
        <View style={styles.subscriptionInfo}>
          <Text style={styles.planName}>{item.planName}</Text>
          <Text style={styles.subscriptionDate}>
            Started {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={styles.subscriptionAmount}>
          <Text style={styles.amountText}>
            {formatCurrency(item.amount, item.currency)}
          </Text>
          <Text style={styles.intervalText}>
            /{getIntervalText(item.interval, item.intervalCount)}
          </Text>
        </View>
      </View>

      <View style={styles.subscriptionDetails}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        
        {item.trialEnd && new Date() < item.trialEnd && (
          <Text style={styles.trialText}>
            Trial ends {formatDate(item.trialEnd)}
          </Text>
        )}
        
        {item.currentPeriodEnd && (
          <Text style={styles.periodText}>
            Next billing: {formatDate(item.currentPeriodEnd)}
          </Text>
        )}
      </View>

      {item.status === 'active' && !item.cancelAtPeriodEnd && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelSubscription(item)}
        >
          <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
        </TouchableOpacity>
      )}

      {item.cancelAtPeriodEnd && (
        <View style={styles.canceledNotice}>
          <Ionicons name="information-circle" size={16} color="#FF9500" />
          <Text style={styles.canceledText}>
            Subscription will end on {formatDate(item.currentPeriodEnd)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderPlanItem = ({ item }: { item: SubscriptionPlan }) => (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <Text style={styles.planTitle}>{item.name}</Text>
        <Text style={styles.planPrice}>
          {formatCurrency(item.price, item.currency)}
          <Text style={styles.planInterval}>
            /{getIntervalText(item.interval, item.intervalCount)}
          </Text>
        </Text>
      </View>

      {item.description && (
        <Text style={styles.planDescription}>{item.description}</Text>
      )}

      <View style={styles.planFeatures}>
        {item.features.map((feature) => (
          <View key={feature.id} style={styles.featureItem}>
            <Ionicons name="checkmark" size={16} color="#34C759" />
            <Text style={styles.featureText}>
              {feature.name}: {feature.value}
            </Text>
          </View>
        ))}
      </View>

      {item.trialPeriodDays && item.trialPeriodDays > 0 && (
        <View style={styles.trialBadge}>
          <Text style={styles.trialBadgeText}>
            {item.trialPeriodDays}-day free trial
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={() => handleSubscribeToPlan(item)}
      >
        <Text style={styles.subscribeButtonText}>Subscribe</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'active', 'trialing', 'past_due', 'canceled'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedStatus === status && styles.filterButtonTextActive,
              ]}
            >
              {status === 'all' ? 'All' : getStatusText(status)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyStateTitle}>No Subscriptions</Text>
      <Text style={styles.emptyStateText}>
        {selectedStatus === 'all'
          ? "You don't have any active subscriptions."
          : `No ${selectedStatus} subscriptions found.`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {renderStatusFilter()}

      <FlatList
        data={subscriptions}
        renderItem={renderSubscriptionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          availablePlans.length > 0 ? (
            <View style={styles.plansSection}>
              <Text style={styles.sectionTitle}>Available Plans</Text>
              <FlatList
                data={availablePlans}
                renderItem={renderPlanItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.plansContainer}
              />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  refreshButton: {
    padding: 4,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  plansSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  plansContainer: {
    paddingRight: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  planInterval: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
  },
  planDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  planFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  trialBadge: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  trialBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  subscriptionDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  subscriptionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  intervalText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  subscriptionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trialText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  periodText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  canceledNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
  },
  canceledText: {
    fontSize: 14,
    color: '#FF9500',
    marginLeft: 8,
    flex: 1,
  },
}); 