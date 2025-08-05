import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { Player, PlayerStats, PlayerPerformance } from '@kp5-academy/shared';
import { PlayerService } from '../services/playerService';
import { Card, Button, Avatar, Chip, Divider, DataTable } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type PlayerDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerDetails'>;

interface RouteParams {
  playerId: string;
}

const PlayerDetailsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<PlayerDetailsScreenNavigationProp>();
  const route = useRoute();
  const { playerId } = route.params as RouteParams;
  
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayer();
  }, [playerId]);

  const loadPlayer = async () => {
    try {
      setLoading(true);
      const playerData = await PlayerService.getPlayer(playerId);
      setPlayer(playerData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load player details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlayer = () => {
    navigation.navigate('EditPlayer', { playerId });
  };

  const handleViewStats = () => {
    navigation.navigate('PlayerStats', { playerId });
  };

  const handleViewPerformance = () => {
    navigation.navigate('PlayerPerformance', { playerId });
  };

  const handleAddNote = () => {
    navigation.navigate('AddPlayerNote', { playerId });
  };

  const handleViewNotes = () => {
    navigation.navigate('PlayerNotes', { playerId });
  };

  const getPositionDisplayName = (position: string) => {
    const positionNames: Record<string, string> = {
      'goalkeeper': 'Goalkeeper',
      'defender': 'Defender',
      'midfielder': 'Midfielder',
      'forward': 'Forward',
      'utility': 'Utility',
    };
    return positionNames[position] || position;
  };

  const getAvailabilityColor = (status: string) => {
    const colors: Record<string, string> = {
      'available': '#4CAF50',
      'unavailable': '#FF9800',
      'injured': '#F44336',
      'suspended': '#9C27B0',
      'on_leave': '#607D8B',
    };
    return colors[status] || '#666';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading player details...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.errorContainer}>
        <Text>Player not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Player Header */}
      <View style={styles.header}>
        <Avatar.Image
          size={80}
          source={
            player.userId // This should be the user's photo URL
              ? { uri: player.userId }
              : require('../../assets/default-avatar.png')
          }
        />
        <View style={styles.headerInfo}>
          <Text style={styles.playerName}>
            {player.userId} {/* This should be the user's display name */}
          </Text>
          <Text style={styles.jerseyNumber}>#{player.jerseyNumber}</Text>
          <Chip
            style={[
              styles.positionChip,
              { backgroundColor: '#3b82f6' }
            ]}
            textStyle={styles.positionText}
          >
            {getPositionDisplayName(player.position)}
          </Chip>
        </View>
      </View>

      {/* Quick Stats */}
      <Card style={styles.card}>
        <Card.Title title="Season Statistics" />
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.goals}</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.assists}</Text>
              <Text style={styles.statLabel}>Assists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.minutesPlayed}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Player Information */}
      <Card style={styles.card}>
        <Card.Title title="Player Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color="#666" />
            <Text style={styles.infoLabel}>Age:</Text>
            <Text style={styles.infoValue}>{calculateAge(player.dateOfBirth)} years</Text>
          </View>
          <Divider style={styles.divider} />
          
          {player.height && (
            <>
              <View style={styles.infoRow}>
                <MaterialIcons name="height" size={20} color="#666" />
                <Text style={styles.infoLabel}>Height:</Text>
                <Text style={styles.infoValue}>{player.height} cm</Text>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
          
          {player.weight && (
            <>
              <View style={styles.infoRow}>
                <MaterialIcons name="fitness-center" size={20} color="#666" />
                <Text style={styles.infoLabel}>Weight:</Text>
                <Text style={styles.infoValue}>{player.weight} kg</Text>
              </View>
              <Divider style={styles.divider} />
            </>
          )}
          
          <View style={styles.infoRow}>
            <MaterialIcons name="directions-run" size={20} color="#666" />
            <Text style={styles.infoLabel}>Dominant Foot:</Text>
            <Text style={styles.infoValue}>{player.dominantFoot}</Text>
          </View>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color="#666" />
            <Text style={styles.infoLabel}>Date of Birth:</Text>
            <Text style={styles.infoValue}>{formatDate(player.dateOfBirth)}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Availability Status */}
      <Card style={styles.card}>
        <Card.Title title="Availability" />
        <Card.Content>
          <View style={styles.availabilityRow}>
            <Chip
              style={[
                styles.availabilityChip,
                { backgroundColor: getAvailabilityColor(player.availability?.status || 'available') }
              ]}
              textStyle={styles.availabilityText}
            >
              {player.availability?.status || 'available'}
            </Chip>
            {player.availability?.reason && (
              <Text style={styles.availabilityReason}>{player.availability.reason}</Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Emergency Contact */}
      <Card style={styles.card}>
        <Card.Title title="Emergency Contact" />
        <Card.Content>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color="#666" />
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{player.emergencyContact.name}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <MaterialIcons name="family-restroom" size={20} color="#666" />
            <Text style={styles.infoLabel}>Relationship:</Text>
            <Text style={styles.infoValue}>{player.emergencyContact.relationship}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color="#666" />
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{player.emergencyContact.phone}</Text>
          </View>
          {player.emergencyContact.email && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={20} color="#666" />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{player.emergencyContact.email}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Medical Information */}
      <Card style={styles.card}>
        <Card.Title title="Medical Information" />
        <Card.Content>
          <View style={styles.infoRow}>
            <MaterialIcons name="medical-services" size={20} color="#666" />
            <Text style={styles.infoLabel}>Medical Clearance:</Text>
            <Chip
              style={[
                styles.medicalChip,
                { backgroundColor: player.medicalInfo.medicalClearance ? '#4CAF50' : '#F44336' }
              ]}
              textStyle={styles.medicalText}
            >
              {player.medicalInfo.medicalClearance ? 'Cleared' : 'Not Cleared'}
            </Chip>
          </View>
          
          {player.medicalInfo.allergies.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <MaterialIcons name="warning" size={20} color="#666" />
                <Text style={styles.infoLabel}>Allergies:</Text>
                <Text style={styles.infoValue}>{player.medicalInfo.allergies.join(', ')}</Text>
              </View>
            </>
          )}
          
          {player.medicalInfo.conditions.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <MaterialIcons name="healing" size={20} color="#666" />
                <Text style={styles.infoLabel}>Conditions:</Text>
                <Text style={styles.infoValue}>{player.medicalInfo.conditions.join(', ')}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={handleEditPlayer}
          style={styles.actionButton}
          icon="edit"
        >
          Edit Player
        </Button>
        
        <Button
          mode="outlined"
          onPress={handleViewStats}
          style={styles.actionButton}
          icon="bar-chart"
        >
          View Stats
        </Button>
        
        <Button
          mode="outlined"
          onPress={handleViewPerformance}
          style={styles.actionButton}
          icon="trending-up"
        >
          Performance
        </Button>
        
        <Button
          mode="outlined"
          onPress={handleAddNote}
          style={styles.actionButton}
          icon="note-add"
        >
          Add Note
        </Button>
        
        <Button
          mode="outlined"
          onPress={handleViewNotes}
          style={styles.actionButton}
          icon="notes"
        >
          View Notes
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  jerseyNumber: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginTop: 4,
  },
  positionChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  positionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  divider: {
    marginVertical: 4,
  },
  availabilityRow: {
    alignItems: 'center',
  },
  availabilityChip: {
    marginBottom: 8,
  },
  availabilityText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  availabilityReason: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  medicalChip: {
    alignSelf: 'flex-start',
  },
  medicalText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default PlayerDetailsScreen; 