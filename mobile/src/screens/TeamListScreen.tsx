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
import { useMobileTeams, useMobileCreateTeam } from '../hooks/useMobileApi';
import { Team } from '../../../shared/src/types';

export default function TeamListScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch teams
  const { 
    data: teams, 
    loading, 
    error, 
    refetch 
  } = useMobileTeams([]);

  // Create team mutation
  const createTeamMutation = useMobileCreateTeam();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateTeam = () => {
    navigation.navigate('CreateTeam' as never);
  };

  const handleTeamPress = (team: Team) => {
    navigation.navigate('TeamDetails' as never, { teamId: team.id } as never);
  };

  const handleEditTeam = (team: Team) => {
    navigation.navigate('EditTeam' as never, { teamId: team.id } as never);
  };

  // Filter teams based on search and status
  const filteredTeams = teams?.filter(team => {
    const matchesSearch = !searchQuery || 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filter === 'all' || 
      (filter === 'active' && team.isActive) ||
      (filter === 'inactive' && !team.isActive);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getTeamStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getTeamLevelColor = (level: string) => {
    switch (level) {
      case 'professional':
        return 'error';
      case 'amateur':
        return 'warning';
      case 'youth':
        return 'success';
      case 'recreational':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const renderTeamItem = ({ item: team }: { item: Team }) => (
    <TouchableOpacity onPress={() => handleTeamPress(team)}>
      <Card style={tw('mb-4')}>
        <View style={tw('flex-row items-start')}>
          {/* Team Logo */}
          <View style={tw('mr-4')}>
            {team.logoURL ? (
              <Image 
                source={{ uri: team.logoURL }} 
                style={tw('w-16 h-16 rounded-lg')}
              />
            ) : (
              <View style={tw('w-16 h-16 rounded-lg bg-gray-300 items-center justify-center')}>
                <Ionicons name="people" size={32} color="#6B7280" />
              </View>
            )}
          </View>

          {/* Team Info */}
          <View style={tw('flex-1')}>
            <View style={tw('flex-row justify-between items-start mb-2')}>
              <Text style={tw('text-lg font-semibold text-gray-900')}>
                {team.name}
              </Text>
              <View style={tw('flex-row gap-2')}>
                <Badge 
                  variant={getTeamStatusColor(team.isActive || false)} 
                  size="sm"
                >
                  {team.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {team.level && (
                  <Badge 
                    variant={getTeamLevelColor(team.level)} 
                    size="sm"
                  >
                    {team.level}
                  </Badge>
                )}
              </View>
            </View>

            <Text style={tw('text-sm text-gray-600 mb-2')} numberOfLines={2}>
              {team.description || 'No description available'}
            </Text>

            <View style={tw('flex-row items-center gap-4 mb-2')}>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="people" size={16} color="#6B7280" />
                <Text style={tw('text-sm text-gray-600 ml-1')}>
                  {team.players?.length || 0} players
                </Text>
              </View>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={tw('text-sm text-gray-600 ml-1')}>
                  {team.location?.city || 'Location TBD'}
                </Text>
              </View>
            </View>

            {/* Team Stats */}
            <View style={tw('flex-row gap-4')}>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="trophy" size={14} color="#F59E0B" />
                <Text style={tw('text-xs text-gray-600 ml-1')}>
                  {team.stats?.wins || 0} wins
                </Text>
              </View>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="football" size={14} color="#10B981" />
                <Text style={tw('text-xs text-gray-600 ml-1')}>
                  {team.stats?.goalsScored || 0} goals
                </Text>
              </View>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="calendar" size={14} color="#3B82F6" />
                <Text style={tw('text-xs text-gray-600 ml-1')}>
                  {team.stats?.matchesPlayed || 0} matches
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            onPress={() => handleEditTeam(team)}
            style={tw('p-2')}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterValue: typeof filter, label: string) => (
    <TouchableOpacity
      onPress={() => setFilter(filterValue)}
      style={[
        tw('px-4 py-2 rounded-lg mr-2'),
        filter === filterValue ? tw('bg-blue-600') : tw('bg-gray-200')
      ]}
    >
      <Text style={[
        tw('text-sm font-medium'),
        filter === filterValue ? tw('text-white') : tw('text-gray-700')
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={tw('flex-1 bg-gray-50')}>
        <View style={tw('flex-1 justify-center items-center')}>
          <Text style={tw('text-gray-600')}>Loading teams...</Text>
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
            Error Loading Teams
          </Text>
          <Text style={tw('text-gray-600 text-center mb-4')}>
            {error.message || 'Failed to load teams. Please try again.'}
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
          <Text style={tw('text-2xl font-bold text-gray-900')}>Teams</Text>
          <TouchableOpacity 
            onPress={handleCreateTeam}
            style={tw('bg-blue-600 p-2 rounded-lg')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={tw('flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3')}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text style={tw('flex-1 ml-2 text-gray-900')}>
            {searchQuery || 'Search teams...'}
          </Text>
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Buttons */}
        <View style={tw('flex-row')}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('active', 'Active')}
          {renderFilterButton('inactive', 'Inactive')}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={filteredTeams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw('p-4')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={tw('flex-1 justify-center items-center py-12')}>
            <Ionicons name="people" size={64} color="#D1D5DB" />
            <Text style={tw('text-lg font-semibold text-gray-900 mt-4 mb-2')}>
              No Teams Found
            </Text>
            <Text style={tw('text-gray-600 text-center mb-6')}>
              {searchQuery || filter !== 'all'
                ? 'No teams match your search criteria.'
                : 'Get started by creating your first team.'
              }
            </Text>
            {!searchQuery && filter === 'all' && (
              <Button
                title="Create Team"
                onPress={handleCreateTeam}
                variant="primary"
                size="lg"
              />
            )}
          </View>
        }
        ListHeaderComponent={
          filteredTeams.length > 0 ? (
            <View style={tw('mb-4')}>
              <Text style={tw('text-sm text-gray-600')}>
                {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
} 