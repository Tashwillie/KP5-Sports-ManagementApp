import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MatchSummary {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  homeTeam?: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  awayTeam?: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  location?: string;
  totalEvents: number;
  totalParticipants: number;
  duration?: number;
  tournament?: {
    id: string;
    name: string;
    round?: number;
  };
}

interface MatchHistoryCardProps {
  match: MatchSummary;
  onPress?: () => void;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

export default function MatchHistoryCard({
  match,
  onPress,
  showDetails = false,
  onToggleDetails
}: MatchHistoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981'; // green
      case 'IN_PROGRESS':
        return '#3b82f6'; // blue
      case 'CANCELLED':
        return '#ef4444'; // red
      case 'POSTPONED':
        return '#f59e0b'; // yellow
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'IN_PROGRESS':
        return 'play-circle';
      case 'CANCELLED':
        return 'close-circle';
      case 'POSTPONED':
        return 'time';
      default:
        return 'ellipse';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTeamInfo = (team: any, isHome: boolean) => (
    <View style={styles.teamContainer}>
      {team?.logo ? (
        <Image source={{ uri: team.logo }} style={styles.teamLogo} />
      ) : (
        <View style={[styles.teamLogoPlaceholder, { backgroundColor: isHome ? '#3b82f6' : '#ef4444' }]}>
          <Text style={styles.teamLogoText}>{team?.name?.charAt(0) || '?'}</Text>
        </View>
      )}
      <Text style={styles.teamName} numberOfLines={2}>
        {team?.name || 'TBD'}
      </Text>
      <Text style={styles.teamScore}>
        {team?.score !== undefined ? team.score : '-'}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Ionicons
            name={getStatusIcon(match.status) as any}
            size={16}
            color={getStatusColor(match.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(match.status) }]}>
            {match.status.replace('_', ' ')}
          </Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(match.startTime)}</Text>
          <Text style={styles.timeText}>{formatTime(match.startTime)}</Text>
        </View>
      </View>

      {/* Match Info */}
      <View style={styles.matchInfo}>
        <Text style={styles.matchTitle} numberOfLines={2}>
          {match.title}
        </Text>
        
        {match.tournament && (
          <View style={styles.tournamentContainer}>
            <Ionicons name="trophy" size={14} color="#f59e0b" />
            <Text style={styles.tournamentText}>
              {match.tournament.name}
              {match.tournament.round && ` - Round ${match.tournament.round}`}
            </Text>
          </View>
        )}
      </View>

      {/* Teams */}
      <View style={styles.teamsContainer}>
        {renderTeamInfo(match.homeTeam, true)}
        
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>vs</Text>
        </View>
        
        {renderTeamInfo(match.awayTeam, false)}
      </View>

      {/* Match Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text style={styles.statText}>{match.totalParticipants}</Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="flash" size={16} color="#6b7280" />
          <Text style={styles.statText}>{match.totalEvents}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        
        {match.duration && (
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color="#6b7280" />
            <Text style={styles.statText}>{match.duration}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        )}
      </View>

      {/* Location */}
      {match.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={14} color="#6b7280" />
          <Text style={styles.locationText} numberOfLines={1}>
            {match.location}
          </Text>
        </View>
      )}

      {/* Details Toggle */}
      {onToggleDetails && (
        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={onToggleDetails}
          activeOpacity={0.6}
        >
          <Text style={styles.detailsToggleText}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Text>
          <Ionicons
            name={showDetails ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#3b82f6"
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  matchInfo: {
    marginBottom: 16,
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  tournamentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tournamentText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  teamLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  teamLogoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
    maxWidth: 80,
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  vsContainer: {
    paddingHorizontal: 16,
  },
  vsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  detailsToggleText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
});

