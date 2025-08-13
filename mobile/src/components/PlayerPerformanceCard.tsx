import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlayerPerformanceMetrics {
  matchesPlayed: number;
  goals: number;
  assists: number;
  averageRating: number;
  minutesPlayed: number;
  yellowCards: number;
  redCards: number;
  shotAccuracy: number;
  passAccuracy: number;
  tackleSuccess: number;
  totalDistance: number;
  averageDistance: number;
}

interface PlayerPerformanceCardProps {
  metrics: PlayerPerformanceMetrics;
  playerName: string;
  teamName?: string;
  onPress?: () => void;
  showDetails?: boolean;
}

export default function PlayerPerformanceCard({
  metrics,
  playerName,
  teamName,
  onPress,
  showDetails = false
}: PlayerPerformanceCardProps) {
  const renderMetricRow = (
    label: string,
    value: string | number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string = '#374151'
  ) => (
    <View style={styles.metricRow}>
      <View style={styles.metricLabel}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[styles.metricText, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );

  const renderProgressBar = (label: string, value: number, maxValue: number = 100) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressLabel}>
          <Text style={styles.progressText}>{label}</Text>
          <Text style={styles.progressValue}>{value.toFixed(1)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return '#10B981'; // Green
    if (rating >= 6.5) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getCardColor = (rating: number) => {
    if (rating >= 7.5) return '#ECFDF5'; // Light green
    if (rating >= 6.5) return '#FFFBEB'; // Light yellow
    return '#FEF2F2'; // Light red
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getCardColor(metrics.averageRating) }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{playerName}</Text>
          {teamName && (
            <Text style={styles.teamName}>{teamName}</Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Text style={[styles.rating, { color: getRatingColor(metrics.averageRating) }]}>
            {metrics.averageRating.toFixed(1)}
          </Text>
          <Text style={styles.ratingLabel}>Rating</Text>
        </View>
      </View>

      {/* Key Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{metrics.matchesPlayed}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{metrics.goals}</Text>
          <Text style={styles.statLabel}>Goals</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{metrics.assists}</Text>
          <Text style={styles.statLabel}>Assists</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(metrics.minutesPlayed / 90)}</Text>
          <Text style={styles.statLabel}>Full Games</Text>
        </View>
      </View>

      {/* Detailed Metrics */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
            {renderMetricRow('Minutes Played', `${metrics.minutesPlayed} min`, 'time-outline')}
            {renderMetricRow('Yellow Cards', metrics.yellowCards, 'warning-outline', '#F59E0B')}
            {renderMetricRow('Red Cards', metrics.redCards, 'close-circle-outline', '#EF4444')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Efficiency</Text>
            {renderProgressBar('Shot Accuracy', metrics.shotAccuracy)}
            {renderProgressBar('Pass Accuracy', metrics.passAccuracy)}
            {renderProgressBar('Tackle Success', metrics.tackleSuccess)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Physical Stats</Text>
            {renderMetricRow('Total Distance', `${(metrics.totalDistance / 1000).toFixed(1)} km`, 'location-outline')}
            {renderMetricRow('Avg Distance', `${(metrics.averageDistance / 1000).toFixed(1)} km`, 'speedometer-outline')}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {showDetails ? 'Tap to collapse' : 'Tap for details'}
        </Text>
        <Ionicons
          name={showDetails ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#6B7280"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  rating: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#374151',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
