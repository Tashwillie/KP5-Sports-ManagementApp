import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TeamPerformanceMetrics {
  // Basic Match Stats
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  points: number;
  winPercentage: number;
  drawPercentage: number;
  lossPercentage: number;

  // Goal Statistics
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  cleanSheets: number;
  goalsConceded: number;

  // Performance Metrics
  averagePossession: number;
  averageShots: number;
  averageShotsOnTarget: number;
  averageCorners: number;
  averageFouls: number;
  averageYellowCards: number;
  averageRedCards: number;
  averagePasses: number;
  averagePassAccuracy: number;
  averageTackles: number;
  averageInterceptions: number;
  averageOffsides: number;
  averageSaves: number;
  averageClearances: number;
  averageBlocks: number;
  averageDistance: number;
  averageSprints: number;

  // Advanced Metrics
  shotAccuracy: number;
  passAccuracy: number;
  tackleSuccess: number;
  savePercentage: number;
  possessionEfficiency: number;
  defensiveEfficiency: number;

  // Form and Trends
  currentForm: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
  formScore: number;
  unbeatenStreak: number;
  winningStreak: number;
  losingStreak: number;
  goalsScoredStreak: number;
  cleanSheetStreak: number;

  // Home/Away Performance
  homeStats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    winPercentage: number;
  };
  awayStats: {
    matchesPlayed: number;
    matchesWon: number;
    matchesDrawn: number;
    matchesLost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    winPercentage: number;
  };

  // Season Performance
  seasonProgress: {
    currentPosition: number;
    totalTeams: number;
    pointsFromTop: number;
    pointsFromRelegation: number;
    promotionChance: number;
    relegationRisk: number;
  };
}

interface TeamStatisticsCardProps {
  metrics: TeamPerformanceMetrics;
  teamName: string;
  season?: string;
  onPress?: () => void;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

export default function TeamStatisticsCard({
  metrics,
  teamName,
  season = 'Current Season',
  onPress,
  showDetails = false,
  onToggleDetails
}: TeamStatisticsCardProps) {
  const renderMetricRow = (
    label: string,
    value: string | number,
    icon?: string,
    color: string = '#374151'
  ) => (
    <View style={styles.metricRow}>
      <View style={styles.metricLabel}>
        {icon && <Ionicons name={icon as any} size={16} color={color} style={styles.metricIcon} />}
        <Text style={[styles.metricLabelText, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );

  const renderProgressBar = (value: number, maxValue: number = 100, color: string = '#3B82F6') => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.progressText}>{value.toFixed(1)}</Text>
      </View>
    );
  };

  const getFormColor = (form: string) => {
    switch (form) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'average': return '#F59E0B';
      case 'poor': return '#F97316';
      case 'terrible': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getFormIcon = (form: string) => {
    switch (form) {
      case 'excellent':
      case 'good':
        return 'trending-up';
      case 'average':
        return 'remove';
      case 'poor':
      case 'terrible':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getCardColor = (form: string) => {
    const formColor = getFormColor(form);
    return `${formColor}15`; // 15% opacity
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getCardColor(metrics.currentForm) }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.teamName}>{teamName}</Text>
          <Text style={styles.season}>{season}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.formBadge}>
            <Ionicons 
              name={getFormIcon(metrics.currentForm) as any} 
              size={16} 
              color={getFormColor(metrics.currentForm)} 
            />
            <Text style={[styles.formText, { color: getFormColor(metrics.currentForm) }]}>
              {metrics.currentForm.charAt(0).toUpperCase() + metrics.currentForm.slice(1)}
            </Text>
          </View>
          {onToggleDetails && (
            <TouchableOpacity onPress={onToggleDetails} style={styles.toggleButton}>
              <Ionicons 
                name={showDetails ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Key Stats Grid */}
      <View style={styles.keyStatsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{metrics.points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{metrics.matchesPlayed}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{metrics.goalsFor}</Text>
          <Text style={styles.statLabel}>Goals For</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{metrics.goalsAgainst}</Text>
          <Text style={styles.statLabel}>Goals Against</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{metrics.cleanSheets}</Text>
          <Text style={styles.statLabel}>Clean Sheets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{metrics.winPercentage.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
      </View>

      {/* Form and Streaks */}
      <View style={styles.formSection}>
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Form Score:</Text>
          <Text style={styles.formScore}>{metrics.formScore.toFixed(1)}/10</Text>
        </View>
        <View style={styles.streaksContainer}>
          <View style={styles.streakItem}>
            <Text style={styles.streakLabel}>Unbeaten</Text>
            <Text style={styles.streakValue}>{metrics.unbeatenStreak}</Text>
          </View>
          <View style={styles.streakItem}>
            <Text style={styles.streakLabel}>Winning</Text>
            <Text style={styles.streakValue}>{metrics.winningStreak}</Text>
          </View>
          <View style={styles.streakItem}>
            <Text style={styles.streakLabel}>Goals</Text>
            <Text style={styles.streakValue}>{metrics.goalsScoredStreak}</Text>
          </View>
        </View>
      </View>

      {/* Detailed Metrics (conditional) */}
      {showDetails && (
        <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
          {/* Performance Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            {renderMetricRow('Possession', `${metrics.averagePossession.toFixed(1)}%`, 'pie-chart')}
            {renderMetricRow('Shots', metrics.averageShots.toFixed(1), 'locate')}
            {renderMetricRow('Pass Accuracy', `${metrics.averagePassAccuracy.toFixed(1)}%`, 'arrow-forward')}
            {renderMetricRow('Tackles', metrics.averageTackles.toFixed(1), 'shield')}
            {renderMetricRow('Distance', `${(metrics.averageDistance / 1000).toFixed(1)}km`, 'walk')}
          </View>

          {/* Efficiency Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Efficiency</Text>
            <View style={styles.efficiencyItem}>
              <Text style={styles.efficiencyLabel}>Shot Accuracy</Text>
              {renderProgressBar(metrics.shotAccuracy, 100, '#10B981')}
            </View>
            <View style={styles.efficiencyItem}>
              <Text style={styles.efficiencyLabel}>Pass Accuracy</Text>
              {renderProgressBar(metrics.averagePassAccuracy, 100, '#3B82F6')}
            </View>
            <View style={styles.efficiencyItem}>
              <Text style={styles.efficiencyLabel}>Defensive Efficiency</Text>
              {renderProgressBar(metrics.defensiveEfficiency, 10, '#F59E0B')}
            </View>
          </View>

          {/* Home/Away Performance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Home vs Away</Text>
            <View style={styles.homeAwayContainer}>
              <View style={styles.homeAwayItem}>
                <Text style={styles.homeAwayLabel}>Home</Text>
                <Text style={styles.homeAwayValue}>{metrics.homeStats.winPercentage.toFixed(1)}%</Text>
                <Text style={styles.homeAwaySubtext}>{metrics.homeStats.points} pts</Text>
              </View>
              <View style={styles.homeAwayItem}>
                <Text style={styles.homeAwayLabel}>Away</Text>
                <Text style={styles.homeAwayValue}>{metrics.awayStats.winPercentage.toFixed(1)}%</Text>
                <Text style={styles.homeAwaySubtext}>{metrics.awayStats.points} pts</Text>
              </View>
            </View>
          </View>

          {/* Season Progress */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Season Progress</Text>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Position</Text>
              <Text style={styles.progressValue}>
                {metrics.seasonProgress.currentPosition} of {metrics.seasonProgress.totalTeams}
              </Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Points from Top</Text>
              <Text style={styles.progressValue}>{metrics.seasonProgress.pointsFromTop}</Text>
            </View>
            <View style={styles.progressItem}>
              <Text style={styles.progressLabel}>Promotion Chance</Text>
              <Text style={styles.progressValue}>{metrics.seasonProgress.promotionChance}%</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.lastUpdated}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  season: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  formBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  formText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  toggleButton: {
    padding: 4,
  },
  keyStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 12,
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
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    color: '#374151',
  },
  formScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailsContainer: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    marginRight: 8,
  },
  metricLabelText: {
    fontSize: 14,
    color: '#374151',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  efficiencyItem: {
    marginBottom: 16,
  },
  efficiencyLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    minWidth: 40,
    textAlign: 'right',
  },
  homeAwayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  homeAwayItem: {
    alignItems: 'center',
    flex: 1,
  },
  homeAwayLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  homeAwayValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  homeAwaySubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressLabel: {
    fontSize: 14,
    color: '#374151',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
