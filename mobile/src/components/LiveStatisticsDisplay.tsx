import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRealTimeStatistics } from '@kp5-academy/shared';
import { RealTimeStatisticsService } from '@kp5-academy/shared';

interface LiveStatisticsDisplayProps {
  matchId: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
    color?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
    color?: string;
  };
  statisticsService: RealTimeStatisticsService;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const { width } = Dimensions.get('window');

export default function LiveStatisticsDisplay({
  matchId,
  homeTeam,
  awayTeam,
  statisticsService,
  autoRefresh = true,
  refreshInterval = 5000
}: LiveStatisticsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'teams' | 'timeline'>('overview');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    matchStats,
    playerMatchStats,
    loading,
    errors,
    subscribeToMatch,
    subscribeToTeam,
    fetchMatchStats,
    refreshAll
  } = useRealTimeStatistics(statisticsService, {
    autoRefresh,
    refreshInterval
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (matchId) {
      fetchMatchStats(matchId);
      const unsubscribeMatch = subscribeToMatch(matchId);
      const unsubscribeHomeTeam = subscribeToTeam(homeTeam.id);
      const unsubscribeAwayTeam = subscribeToTeam(awayTeam.id);

      return () => {
        unsubscribeMatch();
        unsubscribeHomeTeam();
        unsubscribeAwayTeam();
      };
    }
  }, [matchId, homeTeam.id, awayTeam.id]);

  // Calculate real-time statistics
  const liveStats = useMemo(() => {
    if (!matchStats) return null;

    const home = matchStats.homeTeamStats;
    const away = matchStats.awayTeamStats;

    return {
      home: {
        ...home,
        possession: home.possession || 50,
        passAccuracy: home.passes > 0 ? Math.round((home.passesCompleted / home.passes) * 100) : 0,
        shotAccuracy: home.shots > 0 ? Math.round((home.shotsOnTarget / home.shots) * 100) : 0
      },
      away: {
        ...away,
        possession: away.possession || 50,
        passAccuracy: away.passes > 0 ? Math.round((away.passesCompleted / away.passes) * 100) : 0,
        shotAccuracy: away.shots > 0 ? Math.round((away.shotsOnTarget / away.shots) * 100) : 0
      }
    };
  }, [matchStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAll();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh statistics');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading.match) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="stats-chart" size={48} color="#6B7280" />
        <Text style={styles.loadingText}>Loading live statistics...</Text>
      </View>
    );
  }

  if (errors.match) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Error loading statistics</Text>
        <Text style={styles.errorDetails}>{errors.match}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!liveStats) {
    return (
      <View style={styles.noDataContainer}>
        <Ionicons name="stats-chart-outline" size={48} color="#6B7280" />
        <Text style={styles.noDataText}>No statistics available</Text>
      </View>
    );
  }

  const renderTabButton = (tab: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab as any)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? '#FFFFFF' : '#6B7280'} 
      />
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Score and Key Stats */}
      <View style={styles.scoreSection}>
        <View style={styles.teamScore}>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{homeTeam.name}</Text>
            <View style={[styles.teamLogo, { backgroundColor: homeTeam.color + '20' }]}>
              {homeTeam.logo ? (
                <Text style={styles.teamLogoText}>{homeTeam.name.charAt(0)}</Text>
              ) : (
                <Ionicons name="people" size={24} color={homeTeam.color || '#3B82F6'} />
              )}
            </View>
          </View>
          <Text style={styles.scoreText}>{liveStats.home.goals}</Text>
        </View>

        <View style={styles.scoreDivider}>
          <Text style={styles.scoreDividerText}>-</Text>
        </View>

        <View style={styles.teamScore}>
          <Text style={styles.scoreText}>{liveStats.away.goals}</Text>
          <View style={styles.teamInfo}>
            <View style={[styles.teamLogo, { backgroundColor: awayTeam.color + '20' }]}>
              {awayTeam.logo ? (
                <Text style={styles.teamLogoText}>{awayTeam.name.charAt(0)}</Text>
              ) : (
                <Ionicons name="people" size={24} color={awayTeam.color || '#EF4444'} />
              )}
            </View>
            <Text style={styles.teamName}>{awayTeam.name}</Text>
          </View>
        </View>
      </View>

      {/* Live Badge */}
      <View style={styles.liveBadge}>
        <Ionicons name="radio" size={16} color="#FFFFFF" />
        <Text style={styles.liveBadgeText}>LIVE</Text>
      </View>

      {/* Key Statistics Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{liveStats.home.shots}</Text>
          <Text style={styles.statLabel}>Shots</Text>
          <Text style={styles.statTeam}>{homeTeam.name}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{liveStats.away.shots}</Text>
          <Text style={styles.statLabel}>Shots</Text>
          <Text style={styles.statTeam}>{awayTeam.name}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{liveStats.home.possession}%</Text>
          <Text style={styles.statLabel}>Possession</Text>
          <Text style={styles.statTeam}>{homeTeam.name}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{liveStats.away.possession}%</Text>
          <Text style={styles.statLabel}>Possession</Text>
          <Text style={styles.statTeam}>{awayTeam.name}</Text>
        </View>
      </View>

      {/* Possession Chart */}
      <View style={styles.possessionSection}>
        <Text style={styles.sectionTitle}>Possession</Text>
        <View style={styles.possessionBar}>
          <View 
            style={[
              styles.possessionHome, 
              { width: `${liveStats.home.possession}%` }
            ]} 
          />
          <View 
            style={[
              styles.possessionAway, 
              { width: `${liveStats.away.possession}%` }
            ]} 
          />
        </View>
        <View style={styles.possessionLabels}>
          <Text style={styles.possessionLabel}>{homeTeam.name} {liveStats.home.possession}%</Text>
          <Text style={styles.possessionLabel}>{awayTeam.name} {liveStats.away.possession}%</Text>
        </View>
      </View>

      {/* Shots Comparison */}
      <View style={styles.shotsSection}>
        <Text style={styles.sectionTitle}>Shots Comparison</Text>
        <View style={styles.shotsComparison}>
          <View style={styles.shotBar}>
            <Text style={styles.shotLabel}>{homeTeam.name}</Text>
            <View style={styles.shotBarContainer}>
              <View 
                style={[
                  styles.shotBarHome, 
                  { width: `${Math.min((liveStats.home.shots / Math.max(liveStats.home.shots, liveStats.away.shots, 1)) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.shotValue}>{liveStats.home.shots}</Text>
          </View>

          <View style={styles.shotBar}>
            <Text style={styles.shotLabel}>{awayTeam.name}</Text>
            <View style={styles.shotBarContainer}>
              <View 
                style={[
                  styles.shotBarAway, 
                  { width: `${Math.min((liveStats.away.shots / Math.max(liveStats.home.shots, liveStats.away.shots, 1)) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.shotValue}>{liveStats.away.shots}</Text>
          </View>
        </View>
      </View>

      {/* Advanced Stats Toggle */}
      <TouchableOpacity 
        style={styles.advancedToggle}
        onPress={() => setShowAdvancedStats(!showAdvancedStats)}
      >
        <Ionicons 
          name={showAdvancedStats ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6B7280" 
        />
        <Text style={styles.advancedToggleText}>
          {showAdvancedStats ? 'Hide' : 'Show'} Advanced Statistics
        </Text>
      </TouchableOpacity>

      {/* Advanced Statistics */}
      {showAdvancedStats && (
        <View style={styles.advancedStats}>
          <View style={styles.advancedStatsGrid}>
            <View style={styles.advancedStatCard}>
              <Text style={styles.advancedStatValue}>{liveStats.home.passAccuracy}%</Text>
              <Text style={styles.advancedStatLabel}>Pass Accuracy</Text>
              <Text style={styles.advancedStatTeam}>{homeTeam.name}</Text>
            </View>

            <View style={styles.advancedStatCard}>
              <Text style={styles.advancedStatValue}>{liveStats.away.passAccuracy}%</Text>
              <Text style={styles.advancedStatLabel}>Pass Accuracy</Text>
              <Text style={styles.advancedStatTeam}>{awayTeam.name}</Text>
            </View>

            <View style={styles.advancedStatCard}>
              <Text style={styles.advancedStatValue}>{liveStats.home.yellowCards}</Text>
              <Text style={styles.advancedStatLabel}>Yellow Cards</Text>
              <Text style={styles.advancedStatTeam}>{homeTeam.name}</Text>
            </View>

            <View style={styles.advancedStatCard}>
              <Text style={styles.advancedStatValue}>{liveStats.away.yellowCards}</Text>
              <Text style={styles.advancedStatLabel}>Yellow Cards</Text>
              <Text style={styles.advancedStatTeam}>{awayTeam.name}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Statistics</Text>
        <Text style={styles.headerSubtitle}>Real-time match data</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {renderTabButton('overview', 'Overview', 'stats-chart')}
        {renderTabButton('players', 'Players', 'people')}
        {renderTabButton('teams', 'Teams', 'shield')}
        {renderTabButton('timeline', 'Timeline', 'time')}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContainer}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'players' && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Player statistics coming soon...</Text>
          </View>
        )}
        {activeTab === 'teams' && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Team statistics coming soon...</Text>
          </View>
        )}
        {activeTab === 'timeline' && (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoonText}>Timeline view coming soon...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTabButton: {
    backgroundColor: '#3B82F6',
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamScore: {
    alignItems: 'center',
    flex: 1,
  },
  teamInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 8,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreDivider: {
    paddingHorizontal: 16,
  },
  scoreDividerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  statTeam: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  possessionSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  possessionBar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  possessionHome: {
    backgroundColor: '#3B82F6',
    height: '100%',
  },
  possessionAway: {
    backgroundColor: '#EF4444',
    height: '100%',
  },
  possessionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  possessionLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  shotsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shotsComparison: {
    spaceY: 16,
  },
  shotBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  shotLabel: {
    width: 80,
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  shotBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  shotBarHome: {
    backgroundColor: '#3B82F6',
    height: '100%',
  },
  shotBarAway: {
    backgroundColor: '#EF4444',
    height: '100%',
  },
  shotValue: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  advancedToggleText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  advancedStats: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  advancedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  advancedStatCard: {
    width: (width - 72) / 2,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  advancedStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  advancedStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  advancedStatTeam: {
    fontSize: 9,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
});
