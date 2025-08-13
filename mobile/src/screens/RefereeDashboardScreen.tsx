import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/navigation';
import { useRealTimeService } from '@kp5-academy/shared';
import type { RefereeStackParamList } from '../navigation/RefereeStack';
import type { StackNavigationProp } from '@react-navigation/stack';

type RefereeDashboardNavigationProp = StackNavigationProp<RefereeStackParamList, 'RefereeDashboard'>;

interface Match {
  id: string;
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
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  scheduledTime: string;
  location?: string;
  tournament?: string;
  currentPeriod?: string;
  homeScore?: number;
  awayScore?: number;
  timeElapsed?: number;
}

export default function RefereeDashboardScreen() {
  const navigation = useNavigation<RefereeDashboardNavigationProp>();
  const realTimeService = useRealTimeService();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [completedMatches, setCompletedMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchRefereeMatches();
  }, []);

  useEffect(() => {
    if (realTimeService.isConnected) {
      setupMatchUpdates();
    }
  }, [realTimeService.isConnected]);

  const fetchRefereeMatches = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from your API
      // For now, we'll use mock data
      const mockMatches: Match[] = [
        {
          id: '1',
          homeTeam: { id: '1', name: 'Team Alpha', color: '#3B82F6' },
          awayTeam: { id: '2', name: 'Team Beta', color: '#EF4444' },
          status: 'IN_PROGRESS',
          scheduledTime: '2024-01-15T14:00:00Z',
          location: 'Main Stadium',
          tournament: 'League Championship',
          currentPeriod: 'FIRST_HALF',
          homeScore: 2,
          awayScore: 1,
          timeElapsed: 2340
        },
        {
          id: '2',
          homeTeam: { id: '3', name: 'Team Gamma', color: '#10B981' },
          awayTeam: { id: '4', name: 'Team Delta', color: '#F59E0B' },
          status: 'SCHEDULED',
          scheduledTime: '2024-01-15T16:00:00Z',
          location: 'Training Ground',
          tournament: 'League Championship'
        },
        {
          id: '3',
          homeTeam: { id: '5', name: 'Team Epsilon', color: '#8B5CF6' },
          awayTeam: { id: '6', name: 'Team Zeta', color: '#06B6D4' },
          status: 'COMPLETED',
          scheduledTime: '2024-01-14T10:00:00Z',
          location: 'Community Field',
          tournament: 'League Championship',
          homeScore: 3,
          awayScore: 2
        }
      ];
      
      setMatches(mockMatches);
      categorizeMatches(mockMatches);
    } catch (error) {
      console.error('Error fetching referee matches:', error);
      Alert.alert('Error', 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const categorizeMatches = (matchList: Match[]) => {
    const active = matchList.filter(match => match.status === 'IN_PROGRESS' || match.status === 'PAUSED');
    const upcoming = matchList.filter(match => match.status === 'SCHEDULED');
    const completed = matchList.filter(match => match.status === 'COMPLETED');
    
    setActiveMatches(active);
    setUpcomingMatches(upcoming);
    setCompletedMatches(completed);
  };

  const setupMatchUpdates = () => {
    if (!realTimeService.socket) return;

    realTimeService.socket.on('match-status-updated', (data: any) => {
      setMatches(prev => {
        const updated = prev.map(match => 
          match.id === data.matchId 
            ? { ...match, ...data.updates }
            : match
        );
        categorizeMatches(updated);
        return updated;
      });
    });

    realTimeService.socket.on('match-score-updated', (data: any) => {
      setMatches(prev => {
        const updated = prev.map(match => 
          match.id === data.matchId 
            ? { ...match, homeScore: data.homeScore, awayScore: data.awayScore }
            : match
        );
        categorizeMatches(updated);
        return updated;
      });
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRefereeMatches();
    setRefreshing(false);
  };

  const navigateToRefereeControl = (match: Match) => {
    navigation.navigate('RefereeControl', {
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      userRole: 'referee',
      userId: 'current-user-id' // This would come from auth context
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return '#10B981';
      case 'PAUSED': return '#F59E0B';
      case 'COMPLETED': return '#6B7280';
      case 'CANCELLED': return '#EF4444';
      case 'POSTPONED': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatScheduledTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMatchCard = (match: Match, showScore = true) => (
    <TouchableOpacity
      key={match.id}
      style={styles.matchCard}
      onPress={() => navigateToRefereeControl(match)}
    >
      <View style={styles.matchHeader}>
        <View style={styles.matchInfo}>
          <Text style={styles.tournamentText}>{match.tournament}</Text>
          <Text style={styles.locationText}>{match.location}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(match.status)}</Text>
        </View>
      </View>
      
      <View style={styles.teamsSection}>
        <View style={styles.teamRow}>
          <View style={[styles.teamColor, { backgroundColor: match.homeTeam.color }]} />
          <Text style={styles.teamName}>{match.homeTeam.name}</Text>
          {showScore && (
            <Text style={styles.score}>{match.homeScore || 0}</Text>
          )}
        </View>
        
        <Text style={styles.vsText}>VS</Text>
        
        <View style={styles.teamRow}>
          <Text style={styles.score}>{match.awayScore || 0}</Text>
          <Text style={styles.teamName}>{match.awayTeam.name}</Text>
          <View style={[styles.teamColor, { backgroundColor: match.awayTeam.color }]} />
        </View>
      </View>
      
      <View style={styles.matchFooter}>
        <Text style={styles.timeText}>
          {match.status === 'SCHEDULED' 
            ? `Scheduled: ${formatScheduledTime(match.scheduledTime)}`
            : match.status === 'IN_PROGRESS' || match.status === 'PAUSED'
            ? `${match.currentPeriod} - ${formatTime(match.timeElapsed || 0)}`
            : 'Match completed'
          }
        </Text>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigateToRefereeControl(match)}
        >
          <Ionicons name="settings" size={20} color="#3B82F6" />
          <Text style={styles.controlButtonText}>Control</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, matches: Match[], showScore = true) => (
    matches.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {matches.map(match => renderMatchCard(match, showScore))}
      </View>
    )
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Referee Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderSection('Active Matches', activeMatches, true)}
        {renderSection('Upcoming Matches', upcomingMatches, false)}
        {renderSection('Recent Matches', completedMatches, true)}
        
        {matches.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No Matches Assigned</Text>
            <Text style={styles.emptyStateText}>
              You don't have any matches assigned at the moment.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#1F2937',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  
  refreshButton: {
    padding: 8,
  },
  
  content: {
    flex: 1,
    padding: 16,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  matchInfo: {
    flex: 1,
  },
  
  tournamentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 4,
  },
  
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  
  teamsSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 4,
  },
  
  teamColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 30,
    textAlign: 'center',
  },
  
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginVertical: 8,
  },
  
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 6,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
