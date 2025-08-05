import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../providers/AuthProvider';
import tournamentService from '../services/tournamentService';
import { Tournament, TournamentMatch, TournamentStanding } from '../../shared/src/types';

interface TournamentDetailsScreenProps {
  navigation: any;
  route: any;
}

const TournamentDetailsScreen: React.FC<TournamentDetailsScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const { tournamentId } = route.params;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [standings, setStandings] = useState<TournamentStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'brackets' | 'matches' | 'standings' | 'participants'>('overview');

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  const loadTournamentData = async () => {
    try {
      const [tournamentData, matchesData, standingsData] = await Promise.all([
        tournamentService.getTournament(tournamentId),
        tournamentService.getMatchesByTournament(tournamentId),
        tournamentService.getTournamentStandings(tournamentId),
      ]);

      setTournament(tournamentData);
      setMatches(matchesData);
      setStandings(standingsData);
    } catch (error) {
      console.error('Error loading tournament data:', error);
      Alert.alert('Error', 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const getTournamentStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open':
        return '#10B981';
      case 'registration_closed':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#6B7280';
      case 'cancelled':
        return '#EF4444';
      case 'postponed':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getTournamentTypeIcon = (type: string) => {
    switch (type) {
      case 'single_elimination':
        return 'trophy';
      case 'double_elimination':
        return 'trophy-outline';
      case 'round_robin':
        return 'list';
      case 'swiss_system':
        return 'grid';
      case 'group_stage':
        return 'people';
      case 'knockout':
        return 'flash';
      case 'league':
        return 'calendar';
      case 'friendly':
        return 'heart';
      default:
        return 'trophy';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Tournament Information</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Type:</Text>
          <Text style={styles.infoValue}>{tournament?.type.replace('_', ' ')}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Format:</Text>
          <Text style={styles.infoValue}>{tournament?.format}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getTournamentStatusColor(tournament?.status || '') }
              ]}
            />
            <Text style={styles.infoValue}>{tournament?.status.replace('_', ' ')}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Dates:</Text>
          <Text style={styles.infoValue}>
            {tournament && formatDate(tournament.startDate)} - {tournament && formatDate(tournament.endDate)}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Registration Deadline:</Text>
          <Text style={styles.infoValue}>
            {tournament && formatDate(tournament.registrationDeadline)}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Teams:</Text>
          <Text style={styles.infoValue}>
            {tournament?.currentTeams}/{tournament?.maxTeams}
          </Text>
        </View>

        {tournament?.entryFee && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Entry Fee:</Text>
            <Text style={styles.infoValue}>${tournament.entryFee}</Text>
          </View>
        )}

        {tournament?.prizePool && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Prize Pool:</Text>
            <Text style={styles.infoValue}>${tournament.prizePool}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.locationName}>{tournament?.location.name}</Text>
        <Text style={styles.locationAddress}>
          {tournament?.location.address.street}
        </Text>
        <Text style={styles.locationAddress}>
          {tournament?.location.address.city}, {tournament?.location.address.state} {tournament?.location.address.zipCode}
        </Text>
        <Text style={styles.locationAddress}>
          {tournament?.location.address.country}
        </Text>
      </View>

      {tournament?.description && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{tournament.description}</Text>
        </View>
      )}

      {tournament?.rules.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Rules</Text>
          {tournament.rules.map((rule, index) => (
            <View key={rule.id} style={styles.ruleItem}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <Text style={styles.ruleDescription}>{rule.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderBrackets = () => (
    <View style={styles.tabContent}>
      {tournament?.brackets.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No brackets yet</Text>
          <Text style={styles.emptySubtitle}>
            Brackets will be generated once registration closes
          </Text>
        </View>
      ) : (
        tournament?.brackets.map(bracket => (
          <View key={bracket.id} style={styles.bracketItem}>
            <View style={styles.bracketHeader}>
              <Text style={styles.bracketName}>{bracket.name}</Text>
              <Text style={styles.bracketType}>{bracket.type.replace('_', ' ')}</Text>
            </View>
            <View style={styles.bracketStats}>
              <Text style={styles.bracketStat}>
                {bracket.matches.length} matches
              </Text>
              <Text style={styles.bracketStat}>
                {bracket.rounds.length} rounds
              </Text>
            </View>
            {bracket.winner && (
              <View style={styles.bracketWinner}>
                <Text style={styles.winnerLabel}>Winner:</Text>
                <Text style={styles.winnerName}>Team {bracket.winner}</Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderMatches = () => (
    <View style={styles.tabContent}>
      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No matches scheduled</Text>
          <Text style={styles.emptySubtitle}>
            Matches will appear here once the tournament begins
          </Text>
        </View>
      ) : (
        matches.map(match => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchItem}
            onPress={() => navigation.navigate('MatchDetails', { matchId: match.id })}
          >
            <View style={styles.matchHeader}>
              <Text style={styles.matchNumber}>Match #{match.matchNumber}</Text>
              <View style={styles.matchStatus}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getTournamentStatusColor(match.status) }
                  ]}
                />
                <Text style={styles.matchStatusText}>{match.status.replace('_', ' ')}</Text>
              </View>
            </View>

            <View style={styles.matchTeams}>
              <View style={styles.teamContainer}>
                <Text style={styles.teamName}>Team {match.homeTeamId}</Text>
                <Text style={styles.teamScore}>{match.homeScore}</Text>
              </View>
              <Text style={styles.vsText}>vs</Text>
              <View style={styles.teamContainer}>
                <Text style={styles.teamName}>Team {match.awayTeamId}</Text>
                <Text style={styles.teamScore}>{match.awayScore}</Text>
              </View>
            </View>

            <View style={styles.matchDetails}>
              <Text style={styles.matchTime}>
                {formatDate(match.scheduledDate)} at {formatTime(match.scheduledDate)}
              </Text>
              {match.venue.name && (
                <Text style={styles.matchVenue}>{match.venue.name}</Text>
              )}
            </View>

            {match.isLive && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderStandings = () => (
    <View style={styles.tabContent}>
      {standings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No standings available</Text>
          <Text style={styles.emptySubtitle}>
            Standings will appear once matches are played
          </Text>
        </View>
      ) : (
        <View style={styles.standingsTable}>
          <View style={styles.standingsHeader}>
            <Text style={styles.standingsHeaderText}>Pos</Text>
            <Text style={[styles.standingsHeaderText, styles.teamHeader]}>Team</Text>
            <Text style={styles.standingsHeaderText}>P</Text>
            <Text style={styles.standingsHeaderText}>W</Text>
            <Text style={styles.standingsHeaderText}>D</Text>
            <Text style={styles.standingsHeaderText}>L</Text>
            <Text style={styles.standingsHeaderText}>GF</Text>
            <Text style={styles.standingsHeaderText}>GA</Text>
            <Text style={styles.standingsHeaderText}>GD</Text>
            <Text style={styles.standingsHeaderText}>Pts</Text>
          </View>
          
          {standings.map((standing, index) => (
            <View key={standing.id} style={styles.standingsRow}>
              <Text style={styles.standingsCell}>{standing.position}</Text>
              <Text style={[styles.standingsCell, styles.teamCell]}>
                Team {standing.teamId || standing.playerId}
              </Text>
              <Text style={styles.standingsCell}>{standing.stats.matchesPlayed}</Text>
              <Text style={styles.standingsCell}>{standing.stats.matchesWon}</Text>
              <Text style={styles.standingsCell}>{standing.stats.matchesDrawn}</Text>
              <Text style={styles.standingsCell}>{standing.stats.matchesLost}</Text>
              <Text style={styles.standingsCell}>{standing.stats.goalsFor}</Text>
              <Text style={styles.standingsCell}>{standing.stats.goalsAgainst}</Text>
              <Text style={styles.standingsCell}>{standing.stats.goalDifference}</Text>
              <Text style={styles.standingsCell}>{standing.stats.points}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderParticipants = () => (
    <View style={styles.tabContent}>
      {tournament?.participants.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No participants yet</Text>
          <Text style={styles.emptySubtitle}>
            Participants will appear here once they register
          </Text>
        </View>
      ) : (
        tournament?.participants.map(participant => (
          <View key={participant.id} style={styles.participantItem}>
            <View style={styles.participantInfo}>
              <Text style={styles.participantName}>
                {participant.teamId ? `Team ${participant.teamId}` : `Player ${participant.playerId}`}
              </Text>
              <Text style={styles.participantDivision}>
                Division: {participant.divisionId}
              </Text>
            </View>
            <View style={styles.participantStatus}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getTournamentStatusColor(participant.status) }
                ]}
              />
              <Text style={styles.participantStatusText}>{participant.status}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading tournament details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tournament) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Tournament not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tournament Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.tournamentHeader}>
        <View style={styles.tournamentIconContainer}>
          <Ionicons
            name={getTournamentTypeIcon(tournament.type) as any}
            size={32}
            color="#3B82F6"
          />
        </View>
        <View style={styles.tournamentTitleContainer}>
          <Text style={styles.tournamentTitle}>{tournament.name}</Text>
          <Text style={styles.tournamentType}>{tournament.type.replace('_', ' ')}</Text>
        </View>
        <View style={styles.tournamentStatus}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getTournamentStatusColor(tournament.status) }
            ]}
          />
          <Text style={styles.statusText}>{tournament.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {['overview', 'brackets', 'matches', 'standings', 'participants'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'brackets' && renderBrackets()}
        {activeTab === 'matches' && renderMatches()}
        {activeTab === 'standings' && renderStandings()}
        {activeTab === 'participants' && renderParticipants()}
      </ScrollView>

      {tournament.status === 'registration_open' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('TournamentRegistration', { tournamentId: tournament.id })}
          >
            <Text style={styles.registerButtonText}>Register for Tournament</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tournamentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tournamentIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tournamentTitleContainer: {
    flex: 1,
  },
  tournamentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tournamentType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  tournamentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ruleItem: {
    marginBottom: 12,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#666',
  },
  bracketItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  bracketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bracketName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bracketType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  bracketStats: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bracketStat: {
    fontSize: 12,
    color: '#666',
    marginRight: 16,
  },
  bracketWinner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  winnerName: {
    fontSize: 12,
    color: '#666',
  },
  matchItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  matchStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchStatusText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  vsText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
  },
  matchDetails: {
    alignItems: 'center',
  },
  matchTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  matchVenue: {
    fontSize: 12,
    color: '#999',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  standingsTable: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  standingsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  standingsHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  teamHeader: {
    flex: 2,
    textAlign: 'left',
  },
  standingsRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  standingsCell: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  teamCell: {
    flex: 2,
    textAlign: 'left',
    fontWeight: '500',
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  participantDivision: {
    fontSize: 12,
    color: '#666',
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantStatusText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TournamentDetailsScreen; 