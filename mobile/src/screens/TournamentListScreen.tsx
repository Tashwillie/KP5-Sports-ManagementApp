import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { tw } from '../utils/tailwind';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useMobileTournaments, useMobileCreateTournament } from '../hooks/useMobileApi';
import { Tournament } from '../../../shared/src/types';

export default function TournamentListScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

  // Fetch tournaments based on filter
  const constraints = filter === 'all' ? [] : [{ field: 'status', operator: '==', value: filter }];
  const { 
    data: tournaments, 
    loading, 
    error, 
    refetch 
  } = useMobileTournaments(constraints);

  // Create tournament mutation
  const createTournamentMutation = useMobileCreateTournament();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateTournament = () => {
    navigation.navigate('CreateTournament' as never);
  };

  const handleTournamentPress = (tournament: Tournament) => {
    navigation.navigate('TournamentDetails' as never, { tournamentId: tournament.id } as never);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'upcoming':
        return 'warning';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'In Progress';
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderTournamentItem = ({ item: tournament }: { item: Tournament }) => (
    <TouchableOpacity onPress={() => handleTournamentPress(tournament)}>
      <Card style={tw('mb-4')}>
        <View style={tw('flex-row justify-between items-start mb-3')}>
          <View style={tw('flex-1')}>
            <Text style={tw('text-lg font-semibold text-gray-900 mb-1')}>
              {tournament.name}
            </Text>
            <Text style={tw('text-sm text-gray-600 mb-2')} numberOfLines={2}>
              {tournament.description || 'No description available'}
            </Text>
            <View style={tw('flex-row items-center gap-4')}>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="calendar" size={16} color="#6B7280" />
                <Text style={tw('text-sm text-gray-600 ml-1')}>
                  {new Date(tournament.startDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="people" size={16} color="#6B7280" />
                <Text style={tw('text-sm text-gray-600 ml-1')}>
                  {tournament.teams?.length || 0} teams
                </Text>
              </View>
            </View>
          </View>
          <Badge 
            variant={getStatusColor(tournament.status)} 
            size="sm"
          >
            {getStatusText(tournament.status)}
          </Badge>
        </View>
        
        <View style={tw('flex-row justify-between items-center')}>
          <View style={tw('flex-row gap-2')}>
            {tournament.sport && (
              <Badge variant="secondary" size="sm">
                {tournament.sport}
              </Badge>
            )}
            {tournament.type && (
              <Badge variant="default" size="sm">
                {tournament.type}
              </Badge>
            )}
          </View>
          <View style={tw('flex-row items-center')}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={tw('text-xs text-gray-500 ml-1')}>
              {tournament.location?.city || 'Location TBD'}
            </Text>
          </View>
        </View>

        {/* Tournament Progress */}
        {tournament.status === 'active' && tournament.matches && (
          <View style={tw('mt-3 pt-3 border-t border-gray-200')}>
            <View style={tw('flex-row justify-between items-center mb-2')}>
              <Text style={tw('text-sm font-medium text-gray-700')}>Progress</Text>
              <Text style={tw('text-sm text-gray-600')}>
                {tournament.matches.filter(m => m.status === 'completed').length} / {tournament.matches.length}
              </Text>
            </View>
            <View style={tw('w-full bg-gray-200 rounded-full h-2')}>
              <View 
                style={[
                  tw('bg-blue-600 h-2 rounded-full'),
                  { 
                    width: `${(tournament.matches.filter(m => m.status === 'completed').length / tournament.matches.length) * 100}%` 
                  }
                ]} 
              />
            </View>
          </View>
        )}
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
          <Text style={tw('text-gray-600')}>Loading tournaments...</Text>
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
            Error Loading Tournaments
          </Text>
          <Text style={tw('text-gray-600 text-center mb-4')}>
            {error.message || 'Failed to load tournaments. Please try again.'}
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
          <Text style={tw('text-2xl font-bold text-gray-900')}>Tournaments</Text>
          <TouchableOpacity 
            onPress={handleCreateTournament}
            style={tw('bg-blue-600 p-2 rounded-lg')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Filter Buttons */}
        <View style={tw('flex-row')}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('upcoming', 'Upcoming')}
          {renderFilterButton('active', 'Active')}
          {renderFilterButton('completed', 'Completed')}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={tournaments || []}
        renderItem={renderTournamentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw('p-4')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={tw('flex-1 justify-center items-center py-12')}>
            <Ionicons name="trophy" size={64} color="#D1D5DB" />
            <Text style={tw('text-lg font-semibold text-gray-900 mt-4 mb-2')}>
              No Tournaments Found
            </Text>
            <Text style={tw('text-gray-600 text-center mb-6')}>
              {filter === 'all' 
                ? 'Get started by creating your first tournament.'
                : `No ${filter} tournaments found.`
              }
            </Text>
            {filter === 'all' && (
              <Button
                title="Create Tournament"
                onPress={handleCreateTournament}
                variant="primary"
                size="lg"
              />
            )}
          </View>
        }
        ListHeaderComponent={
          tournaments && tournaments.length > 0 ? (
            <View style={tw('mb-4')}>
              <Text style={tw('text-sm text-gray-600')}>
                {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} found
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
} 