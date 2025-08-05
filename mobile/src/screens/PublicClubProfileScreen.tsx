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
import { PublicClubProfile, PublicTeamSummary } from '@shared/types/public';

const { width } = Dimensions.get('window');

interface RouteParams {
  slug: string;
}

export default function PublicClubProfileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { slug } = route.params as RouteParams;
  
  const [profile, setProfile] = useState<PublicClubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    trackPageView();
  }, [slug]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const clubProfile = await publicService.getPublicClubProfile(slug);
      setProfile(clubProfile);
    } catch (error) {
      console.error('Error loading club profile:', error);
      Alert.alert('Error', 'Failed to load club profile');
    } finally {
      setLoading(false);
    }
  };

  const trackPageView = async () => {
    if (profile) {
      await publicService.trackPageView(profile.id, 'club', 'profile');
    }
  };

  const handleShare = async () => {
    if (!profile) return;

    try {
      await Share.share({
        message: `Check out ${profile.name} on KP5 Academy!`,
        url: `https://kp5-academy.com/club/${profile.slug}`,
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

  const handleSocialLink = (platform: string, url?: string) => {
    if (!url) {
      Alert.alert('Not Available', `${platform} link is not available`);
      return;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', `Unable to open ${platform}`);
    });
  };

  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About {profile?.name}</Text>
      <Text style={styles.description}>{profile?.description}</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.stats.totalTeams}</Text>
          <Text style={styles.statLabel}>Teams</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.stats.totalPlayers}</Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.stats.championships}</Text>
          <Text style={styles.statLabel}>Championships</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.stats.seasonsActive}</Text>
          <Text style={styles.statLabel}>Seasons</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Founded</Text>
        <Text style={styles.infoValue}>{profile?.founded}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Location</Text>
        <Text style={styles.infoValue}>
          {profile?.location.address.venue}
        </Text>
        <Text style={styles.infoSubValue}>
          {profile?.location.address.street}, {profile?.location.address.city}, {profile?.location.address.state} {profile?.location.address.zipCode}
        </Text>
      </View>

      {profile?.location.facilities && profile.location.facilities.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Facilities</Text>
          {profile.location.facilities.map((facility, index) => (
            <Text key={index} style={styles.infoValue}>• {facility}</Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderTeams = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Our Teams</Text>
      {profile?.teams.map((team) => (
        <TouchableOpacity
          key={team.id}
          style={styles.teamCard}
          onPress={() => navigation.navigate('PublicTeamProfile', { slug: team.slug })}
        >
          <Image source={{ uri: team.logo.url }} style={styles.teamLogo} />
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamDetails}>
              {team.season} • {team.ageGroup} • {team.gender}
            </Text>
            <Text style={styles.teamLevel}>{team.level}</Text>
          </View>
          <View style={styles.teamStats}>
            <Text style={styles.teamRecord}>
              {team.stats.wins}-{team.stats.losses}-{team.stats.ties}
            </Text>
            <Text style={styles.teamWinPercentage}>
              {team.stats.winPercentage.toFixed(1)}%
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Achievements</Text>
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
          </View>
        </View>
      ))}
    </View>
  );

  const renderNews = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Latest News</Text>
      {profile?.news.slice(0, 5).map((newsItem) => (
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

  const renderEvents = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Upcoming Events</Text>
      {profile?.events
        .filter(event => new Date(event.startDate) > new Date())
        .slice(0, 5)
        .map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventDate}>
              <Text style={styles.eventDay}>
                {new Date(event.startDate).getDate()}
              </Text>
              <Text style={styles.eventMonth}>
                {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
              </Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventLocation}>{event.location.venue}</Text>
              <Text style={styles.eventTime}>
                {new Date(event.startDate).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
            {event.tickets?.available && (
              <TouchableOpacity style={styles.ticketButton}>
                <Text style={styles.ticketButtonText}>Tickets</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
    </View>
  );

  const renderGallery = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gallery</Text>
      <View style={styles.galleryGrid}>
        {profile?.gallery.slice(0, 6).map((media) => (
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

      <View style={styles.socialSection}>
        <Text style={styles.socialTitle}>Follow Us</Text>
        <View style={styles.socialButtons}>
          {profile?.social.facebook && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLink('Facebook', profile.social.facebook)}
            >
              <FontAwesome5 name="facebook" size={20} color="#1877F2" />
            </TouchableOpacity>
          )}
          {profile?.social.twitter && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLink('Twitter', profile.social.twitter)}
            >
              <FontAwesome5 name="twitter" size={20} color="#1DA1F2" />
            </TouchableOpacity>
          )}
          {profile?.social.instagram && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLink('Instagram', profile.social.instagram)}
            >
              <FontAwesome5 name="instagram" size={20} color="#E4405F" />
            </TouchableOpacity>
          )}
          {profile?.social.youtube && (
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLink('YouTube', profile.social.youtube)}
            >
              <FontAwesome5 name="youtube" size={20} color="#FF0000" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'teams':
        return renderTeams();
      case 'achievements':
        return renderAchievements();
      case 'news':
        return renderNews();
      case 'events':
        return renderEvents();
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
        <Text style={styles.loadingText}>Loading club profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Club profile not found</Text>
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
        <View style={styles.clubInfo}>
          <Image source={{ uri: profile.logo.url }} style={styles.clubLogo} />
          <View style={styles.clubDetails}>
            <Text style={styles.clubName}>{profile.name}</Text>
            <Text style={styles.clubLocation}>
              {profile.location.address.city}, {profile.location.address.state}
            </Text>
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
          { key: 'teams', label: 'Teams', icon: 'people' },
          { key: 'achievements', label: 'Achievements', icon: 'trophy' },
          { key: 'news', label: 'News', icon: 'newspaper' },
          { key: 'events', label: 'Events', icon: 'calendar' },
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
  clubInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  clubDetails: {
    marginLeft: 15,
    flex: 1,
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  clubLocation: {
    fontSize: 16,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 64) / 2 - 8,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  infoSubValue: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teamInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  teamDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  teamLevel: {
    fontSize: 10,
    color: '#007AFF',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  teamStats: {
    alignItems: 'flex-end',
  },
  teamRecord: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  teamWinPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  eventCard: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  eventMonth: {
    fontSize: 12,
    color: '#666',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  ticketButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ticketButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
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
  socialSection: {
    marginTop: 20,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 