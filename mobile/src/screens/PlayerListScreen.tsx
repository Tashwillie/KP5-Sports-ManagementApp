import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { tw } from '../utils/tailwind';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useMobileTeams } from '../hooks/useMobileApi';
import { Team, Player } from '../../../shared/src/types';

export default function PlayerListScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Fetch all teams to get players
  const { 
    data: teams, 
    loading, 
    error, 
    refetch 
  } = useMobileTeams([]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePlayerPress = (player: Player) => {
    navigation.navigate('PlayerDetails' as never, { playerId: player.id } as never);
  };

  const handleAddPlayer = () => {
    navigation.navigate('AddPlayer' as never);
  };

  // Extract all players from teams
  const allPlayers = teams?.flatMap(team => 
    team.players?.map(player => ({
      ...player,
      teamName: team.name,
      teamId: team.id
    })) || []
  ) || [];

  // Filter players based on search and team selection
  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = !searchQuery || 
      player.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeam = !selectedTeam || player.teamId === selectedTeam;
    
    return matchesSearch && matchesTeam;
  });

  const getPlayerRoleColor = (role: string) => {
    switch (role) {
      case 'captain':
        return 'error';
      case 'vice_captain':
        return 'warning';
      case 'starter':
        return 'success';
      case 'substitute':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPlayerStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const renderPlayerItem = ({ item: player }: { item: Player & { teamName?: string; teamId?: string } }) => (
    <TouchableOpacity onPress={() => handlePlayerPress(player)}>
      <Card style={tw('mb-4')}>
        <View style={tw('flex-row items-center')}>
          {/* Player Avatar */}
          <View style={tw('mr-4')}>
            {player.photoURL ? (
              <Image 
                source={{ uri: player.photoURL }} 
                style={tw('w-16 h-16 rounded-full')}
              />
            ) : (
              <View style={tw('w-16 h-16 rounded-full bg-gray-300 items-center justify-center')}>
                <Ionicons name="person" size={32} color="#6B7280" />
              </View>
            )}
          </View>

          {/* Player Info */}
          <View style={tw('flex-1')}>
            <View style={tw('flex-row justify-between items-start mb-2')}>
              <Text style={tw('text-lg font-semibold text-gray-900')}>
                {player.displayName || 'Unknown Player'}
              </Text>
              <View style={tw('flex-row gap-2')}>
                <Badge 
                  variant={getPlayerStatusColor(player.isActive || false)} 
                  size="sm"
                >
                  {player.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {player.role && (
                  <Badge 
                    variant={getPlayerRoleColor(player.role)} 
                    size="sm"
                  >
                    {player.role.replace('_', ' ')}
                  </Badge>
                )}
              </View>
            </View>

            <Text style={tw('text-sm text-gray-600 mb-2')}>
              {player.email}
            </Text>

            <View style={tw('flex-row items-center gap-4')}>
              {player.teamName && (
                <View style={tw('flex-row items-center')}>
                  <Ionicons name="people" size={16} color="#6B7280" />
                  <Text style={tw('text-sm text-gray-600 ml-1')}>
                    {player.teamName}
                  </Text>
                </View>
              )}
              
              {player.position && (
                <View style={tw('flex-row items-center')}>
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text style={tw('text-sm text-gray-600 ml-1')}>
                    {player.position}
                  </Text>
                </View>
              )}
            </View>

            {/* Player Stats */}
            {player.stats && (
              <View style={tw('flex-row gap-4 mt-2')}>
                <View style={tw('flex-row items-center')}>
                  <Ionicons name="football" size={14} color="#10B981" />
                  <Text style={tw('text-xs text-gray-600 ml-1')}>
                    {player.stats.goals || 0} goals
                  </Text>
                </View>
                <View style={tw('flex-row items-center')}>
                  <Ionicons name="hand-right" size={14} color="#3B82F6" />
                  <Text style={tw('text-xs text-gray-600 ml-1')}>
                    {player.stats.assists || 0} assists
                  </Text>
                </View>
                <View style={tw('flex-row items-center')}>
                  <Ionicons name="calendar" size={14} color="#F59E0B" />
                  <Text style={tw('text-xs text-gray-600 ml-1')}>
                    {player.stats.matchesPlayed || 0} matches
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            onPress={() => handlePlayerPress(player)}
            style={tw('p-2')}
          >
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderTeamFilterButton = (team: Team) => (
    <TouchableOpacity
      onPress={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
      style={[
        tw('px-4 py-2 rounded-lg mr-2'),
        selectedTeam === team.id ? tw('bg-blue-600') : tw('bg-gray-200')
      ]}
    >
      <Text style={[
        tw('text-sm font-medium'),
        selectedTeam === team.id ? tw('text-white') : tw('text-gray-700')
      ]}>
        {team.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={tw('flex-1 bg-gray-50')}>
        <View style={tw('flex-1 justify-center items-center')}>
          <Text style={tw('text-gray-600')}>Loading players...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={tw('flex-1 bg-gray-50')}>
        <View style={tw('flex-1 justify-center items-center p-4')}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={tw('text-lg font-semibold text-gray-900 mt-4 mb-2')}>
            Error Loading Players
          </Text>
          <Text style={tw('text-gray-600 text-center mb-4')}>
            {error.message || 'Failed to load players. Please try again.'}
          </Text>
          <Button
            title="Retry"
            onPress={handleRefresh}
            variant="primary"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-50')}>
      {/* Header */}
      <View style={tw('bg-white border-b border-gray-200 px-4 py-3')}>
        <View style={tw('flex-row justify-between items-center mb-3')}>
          <Text style={tw('text-2xl font-bold text-gray-900')}>Players</Text>
          <TouchableOpacity 
            onPress={handleAddPlayer}
            style={tw('bg-blue-600 p-2 rounded-lg')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={tw('flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3')}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text style={tw('flex-1 ml-2 text-gray-900')}>
            {searchQuery || 'Search players...'}
          </Text>
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Team Filter */}
        {teams && teams.length > 0 && (
          <View style={tw('flex-row')}>
            <TouchableOpacity
              onPress={() => setSelectedTeam(null)}
              style={[
                tw('px-4 py-2 rounded-lg mr-2'),
                !selectedTeam ? tw('bg-blue-600') : tw('bg-gray-200')
              ]}
            >
              <Text style={[
                tw('text-sm font-medium'),
                !selectedTeam ? tw('text-white') : tw('text-gray-700')
              ]}>
                All Teams
              </Text>
            </TouchableOpacity>
            {teams.map(team => renderTeamFilterButton(team))}
          </View>
        )}
      </View>

      {/* Content */}
      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw('p-4')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={tw('flex-1 justify-center items-center py-12')}>
            <Ionicons name="people" size={64} color="#D1D5DB" />
            <Text style={tw('text-lg font-semibold text-gray-900 mt-4 mb-2')}>
              No Players Found
            </Text>
            <Text style={tw('text-gray-600 text-center mb-6')}>
              {searchQuery || selectedTeam
                ? 'No players match your search criteria.'
                : 'Get started by adding your first player.'
              }
            </Text>
            {!searchQuery && !selectedTeam && (
              <Button
                title="Add Player"
                onPress={handleAddPlayer}
                variant="primary"
                size="lg"
              />
            )}
          </View>
        }
        ListHeaderComponent={
          filteredPlayers.length > 0 ? (
            <View style={tw('mb-4')}>
              <Text style={tw('text-sm text-gray-600')}>
                {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
} 