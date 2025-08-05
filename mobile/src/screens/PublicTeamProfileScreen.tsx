import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { publicService } from '../services/publicService';
import { PublicTeamProfile, PublicPlayer, PublicEvent } from '@shared/types/public';

const { width } = Dimensions.get('window');

interface RouteParams {
  slug: string;
}

export default function PublicTeamProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { slug } = route.params as RouteParams;
  
  const [profile, setProfile] = useState<PublicTeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlayer, setSelectedPlayer] = useState<PublicPlayer | null>(null);

  useEffect(() => {
    loadProfile();
    trackPageView();
  }, [slug]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const teamProfile = await publicService.getPublicTeamProfile(slug);
      setProfile(teamProfile);
    } catch (error) {
      console.error('Error loading team profile:', error);
      Alert.alert('Error', 'Failed to load team profile');
    } finally {
      setLoading(false);
    }
  };

  const trackPageView = async () => {
    if (profile) {
      await publicService.trackPageView(profile.id, 'team', 'profile');
    }
  };

  const handleShare = async () => {
    if (!profile) return;

    try {
      await Share.share({
        message: `Check out ${profile.name} on KP5 Academy!`,
        url: `https://kp5-academy.com/team/${profile.slug}`,
        title: profile.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContact = () => {
    if (!profile) return;

    const contactOptions = [
      { title: 'Email', action: () => Linking.openURL(`mailto:${profile.contact.email}`) },
      { title: 'Phone', action: () => Linking.openURL(`tel:${profile.contact.phone}`) },
      { title: 'Website', action: () => profile.contact.website && Linking.openURL(profile.contact.website) },
      { title: 'Cancel', style: 'cancel' },
    ].filter(option => option.title !== 'Cancel' || true);

    Alert.alert('Contact Options', 'How would you like to contact us?', contactOptions);
  };

  const handlePlayerPress = (player: PublicPlayer) => {
    setSelectedPlayer(player);
    // Navigate to player details or show modal
    navigation.navigate('PlayerDetails', { playerId: player.id });
  };

  const handleEventPress = (event: PublicEvent) => {
    if (event.type === 'game' && event.result) {
      navigation.navigate('LiveMatch', { eventId: event.id });
    } else {
      navigation.navigate('EventDetails', { eventId: event.id });
    }
  };

  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Team Overview</Text>
      <Text style={styles.description}>{profile?.description}</Text>
      
      <View style={styles.teamInfoGrid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Season</Text>
          <Text style={styles.infoValue}>{profile?.season}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Age Group</Text>
          <Text style={styles.infoValue}>{profile?.ageGroup}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Gender</Text>
          <Text style={styles.infoValue}>{profile?.gender}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Level</Text>
          <Text style={styles.infoValue}>{profile?.level}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Division</Text>
          <Text style={styles.infoValue}>{profile?.division}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>League</Text>
          <Text style={styles.infoValue}>{profile?.league}</Text>
        </View>
      </View>

      <View style={styles.locationSection}>
        <Text style={styles.locationTitle}>Home Venue</Text>
        <Text style={styles.locationName}>{profile?.location.venue}</Text>
        <Text style={styles.locationAddress}>
          {profile?.location.address.street}, {profile?.location.address.city}, {profile?.location.address.state} {profile?.location.address.zipCode}
        </Text>
        {profile?.location.directions && (
          <Text style={styles.locationDirections}>{profile.location.directions}</Text>
        )}
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Season Statistics</Text>
      
      <View style={styles.statsOverview}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.stats.gamesPlayed}</Text>
          <Text style={styles.statLabel}>Games Played</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.stats.wins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.stats.losses}</Text>
          <Text style={styles.statLabel}>Losses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.stats.ties}</Text>
          <Text style={styles.statLabel}>Ties</Text>
        </View>
      </View>

      <View style={styles.recordSection}>
        <Text style={styles.recordTitle}>Record</Text>
        <Text style={styles.recordText}>
          {profile?.stats.wins}-{profile?.stats.losses}-{profile?.stats.ties}
        </Text>
        <Text style={styles.winPercentage}>
          Win Percentage: {profile?.stats.winPercentage.toFixed(1)}%
        </Text>
      </View>

      <View style={styles.goalsSection}>
        <Text style={styles.goalsTitle}>Goals</Text>
        <View style={styles.goalsGrid}>
          <View style={styles.goalStat}>
            <Text style={styles.goalNumber}>{profile?.stats.goalsFor}</Text>
            <Text style={styles.goalLabel}>Goals For</Text>
          </View>
          <View style={styles.goalStat}>
            <Text style={styles.goalNumber}>{profile?.stats.goalsAgainst}</Text>
            <Text style={styles.goalLabel}>Goals Against</Text>
          </View>
          <View style={styles.goalStat}>
            <Text style={styles.goalNumber}>{profile?.stats.goalDifference}</Text>
            <Text style={styles.goalLabel}>Goal Difference</Text>
          </View>
        </View>
      </View>

      <View style={styles.streakSection}>
        <Text style={styles.streakTitle}>Current Streak</Text>
        <Text style={styles.streakText}>{profile?.stats.streak}</Text>
      </View>

      {profile?.stats.lastGame && (
        <View style={styles.lastGameSection}>
          <Text style={styles.lastGameTitle}>Last Game</Text>
          <View style={styles.gameResult}>
            <Text style={styles.gameTeams}>
              {profile.stats.lastGame.homeTeam} vs {profile.stats.lastGame.awayTeam}
            </Text>
            <Text style={styles.gameScore}>
              {profile.stats.lastGame.homeScore} - {profile.stats.lastGame.awayScore}
            </Text>
            <Text style={styles.gameDate}>
              {new Date(profile.stats.lastGame.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

      {profile?.stats.nextGame && (
        <View style={styles.nextGameSection}>
          <Text style={styles.nextGameTitle}>Next Game</Text>
          <TouchableOpacity
            style={styles.nextGameCard}
            onPress={() => handleEventPress(profile.stats.nextGame)}
          >
            <Text style={styles.nextGameTeams}>
              {profile.stats.nextGame.opponent}
            </Text>
            <Text style={styles.nextGameDate}>
              {new Date(profile.stats.nextGame.startDate).toLocaleDateString()}
            </Text>
            <Text style={styles.nextGameTime}>
              {new Date(profile.stats.nextGame.startDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderRoster = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Team Roster</Text>
      <Text style={styles.rosterCount}>
        {profile?.roster.length} Players
      </Text>
      
      {profile?.roster.map((player) => (
        <TouchableOpacity
          key={player.id}
          style={styles.playerCard}
          onPress={() => handlePlayerPress(player)}
        >
          <Image source={{ uri: player.photo.url }} style={styles.playerPhoto} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.playerNumber}>#{player.number}</Text>
            <Text style={styles.playerPosition}>{player.position}</Text>
            <Text style={styles.playerAge}>{player.age} years old</Text>
          </View>
          <View style={styles.playerStats}>
            <Text style={styles.playerGoals}>{player.stats.goals} Goals</Text>
            <Text style={styles.playerAssists}>{player.stats.assists} Assists</Text>
            <Text style={styles.playerGames}>{player.stats.gamesPlayed} Games</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSchedule = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Schedule</Text>
      
      {profile?.schedule.map((event) => (
        <TouchableOpacity
          key={event.id}
          style={styles.scheduleCard}
          onPress={() => handleEventPress(event)}
        >
          <View style={styles.eventDate}>
            <Text style={styles.eventDay}>
              {new Date(event.startDate).getDate()}
            </Text>
            <Text style={styles.eventMonth}>
              {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
            </Text>
          </View>
          
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventType}>{event.type}</Text>
            <Text style={styles.eventLocation}>{event.location.venue}</Text>
            <Text style={styles.eventTime}>
              {new Date(event.startDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.eventStatus}>
            {event.status === 'completed' && event.result && (
              <View style={styles.gameResult}>
                <Text style={styles.resultText}>
                  {event.result.homeScore} - {event.result.awayScore}
                </Text>
              </View>
            )}
            {event.status === 'scheduled' && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Upcoming</Text>
              </View>
            )}
            {event.status === 'in_progress' && (
              <View style={[styles.statusBadge, styles.liveBadge]}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Team Achievements</Text>
      
      {profile?.achievements.map((achievement) => (
        <View key={achievement.id} style={styles.achievementCard}>
          {achievement.trophy && (
            <Image source={{ uri: achievement.trophy.url }} style={styles.achievementIcon} />
          )}
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.achievementDescription}>{achievement.description}</Text>
            <Text style={styles.achievementDate}>
              {new Date(achievement.date).toLocaleDateString()}
            </Text>
            {achievement.tournament && (
              <Text style={styles.achievementTournament}>{achievement.tournament}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderNews = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Team News</Text>
      
      {profile?.news.map((newsItem) => (
        <View key={newsItem.id} style={styles.newsCard}>
          {newsItem.featuredImage && (
            <Image source={{ uri: newsItem.featuredImage.url }} style={styles.newsImage} />
          )}
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>{newsItem.title}</Text>
            <Text style={styles.newsExcerpt}>{newsItem.excerpt}</Text>
            <Text style={styles.newsDate}>
              {new Date(newsItem.publishedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderGallery = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Team Gallery</Text>
      
      <View style={styles.galleryGrid}>
        {profile?.gallery.map((media) => (
          <TouchableOpacity
            key={media.id}
            style={styles.galleryItem}
            onPress={() => navigation.navigate('MediaViewer', { media: [media] })}
          >
            <Image source={{ uri: media.url }} style={styles.galleryImage} />
            {media.type === 'video' && (
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContact = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      
      <TouchableOpacity style={styles.contactItem} onPress={handleContact}>
        <Ionicons name="mail" size={20} color="#007AFF" />
        <Text style={styles.contactText}>{profile?.contact.email}</Text>
      </TouchableOpacity>

      {profile?.contact.phone && (
        <TouchableOpacity style={styles.contactItem} onPress={handleContact}>
          <Ionicons name="call" size={20} color="#007AFF" />
          <Text style={styles.contactText}>{profile.contact.phone}</Text>
        </TouchableOpacity>
      )}

      {profile?.contact.website && (
        <TouchableOpacity style={styles.contactItem} onPress={handleContact}>
          <Ionicons name="globe" size={20} color="#007AFF" />
          <Text style={styles.contactText}>{profile.contact.website}</Text>
        </TouchableOpacity>
      )}

      {profile?.contact.emergencyContact && (
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>Emergency Contact</Text>
          <Text style={styles.emergencyName}>{profile.contact.emergencyContact.name}</Text>
          <Text style={styles.emergencyPhone}>{profile.contact.emergencyContact.phone}</Text>
          {profile.contact.emergencyContact.email && (
            <Text style={styles.emergencyEmail}>{profile.contact.emergencyContact.email}</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'stats':
        return renderStats();
      case 'roster':
        return renderRoster();
      case 'schedule':
        return renderSchedule();
      case 'achievements':
        return renderAchievements();
      case 'news':
        return renderNews();
      case 'gallery':
        return renderGallery();
      case 'contact':
        return renderContact();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading team profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Team profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: profile.banner.url }} style={styles.bannerImage} />
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.teamInfo}>
          <Image source={{ uri: profile.logo.url }} style={styles.teamLogo} />
          <View style={styles.teamDetails}>
            <Text style={styles.teamName}>{profile.name}</Text>
            <Text style={styles.teamSeason}>{profile.season}</Text>
            <Text style={styles.teamLevel}>{profile.level} • {profile.ageGroup}</Text>
            {profile.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#007AFF" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'home' },
          { key: 'stats', label: 'Stats', icon: 'stats-chart' },
          { key: 'roster', label: 'Roster', icon: 'people' },
          { key: 'schedule', label: 'Schedule', icon: 'calendar' },
          { key: 'achievements', label: 'Achievements', icon: 'trophy' },
          { key: 'news', label: 'News', icon: 'newspaper' },
          { key: 'gallery', label: 'Gallery', icon: 'images' },
          { key: 'contact', label: 'Contact', icon: 'call' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? '#007AFF' : '#666'}
            />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    position: 'relative',
    height: 300,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  teamDetails: {
    marginLeft: 15,
    flex: 1,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  teamSeason: {
    fontSize: 16,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  teamLevel: {
    fontSize: 14,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  verifiedText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 5,
    fontWeight: '600',
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 20,
  },
  teamInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    width: (width - 64) / 2 - 8,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  locationSection: {
    marginTop: 16,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationDirections: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recordSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  winPercentage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  goalsSection: {
    marginBottom: 20,
  },
  goalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  goalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalStat: {
    flex: 1,
    alignItems: 'center',
  },
  goalNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  goalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  streakSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  lastGameSection: {
    marginBottom: 20,
  },
  lastGameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  gameResult: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  gameTeams: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  gameScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  gameDate: {
    fontSize: 12,
    color: '#666',
  },
  nextGameSection: {
    marginBottom: 20,
  },
  nextGameTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  nextGameCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextGameTeams: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nextGameDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  nextGameTime: {
    fontSize: 14,
    color: '#666',
  },
  rosterCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  playerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  playerNumber: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  playerPosition: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  playerAge: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  playerGoals: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  playerAssists: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  playerGames: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  eventDate: {
    alignItems: 'center',
    marginRight: 12,
  },
  eventDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  eventMonth: {
    fontSize: 12,
    color: '#666',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  eventType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  eventStatus: {
    alignItems: 'center',
  },
  gameResult: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  liveBadge: {
    backgroundColor: '#FF3B30',
  },
  liveText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  achievementTournament: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  newsCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  newsImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  newsContent: {
    flex: 1,
    marginLeft: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  newsExcerpt: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  newsDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  galleryItem: {
    width: (width - 64) / 3 - 4,
    height: (width - 64) / 3 - 4,
    marginBottom: 8,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  emergencySection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  emergencyName: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  emergencyPhone: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  emergencyEmail: {
    fontSize: 14,
    color: '#856404',
  },
}); 