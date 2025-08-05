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
import { useMobileLiveMatch } from '../hooks/useMobileApi';
import { LiveMatch } from '../../../shared/src/types';

export default function MatchListScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed'>('all');

  // For demo purposes, we'll use a mock match ID - in real app, you'd fetch all matches
  const mockMatchId = 'demo-match-1';
  const { 
    data: match, 
    loading, 
    error, 
    refetch 
  } = useMobileLiveMatch({ matchId: mockMatchId });

  // Mock matches data - in real app, you'd have a useMobileMatches hook
  const mockMatches: LiveMatch[] = [
    {
      id: 'match-1',
      homeTeam: 'Home Team',
      awayTeam: 'Away Team',
      homeScore: 2,
      awayScore: 1,
      status: 'completed',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
      location: 'Main Stadium',
      events: [
        { id: '1', type: 'goal', minute: 15, team: 'home', playerId: 'player1', timestamp: new Date() },
        { id: '2', type: 'goal', minute: 45, team: 'away', playerId: 'player2', timestamp: new Date() },
        { id: '3', type: 'goal', minute: 78, team: 'home', playerId: 'player3', timestamp: new Date() }
      ]
    },
    {
      id: 'match-2',
      homeTeam: 'Team Alpha',
      awayTeam: 'Team Beta',
      homeScore: 0,
      awayScore: 0,
      status: 'in_progress',
      startTime: new Date(),
      location: 'Training Ground',
      events: []
    },
    {
      id: 'match-3',
      homeTeam: 'Champions FC',
      awayTeam: 'Rivals United',
      homeScore: 0,
      awayScore: 0,
      status: 'scheduled',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      location: 'City Arena'
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleMatchPress = (match: LiveMatch) => {
    if (match.status === 'in_progress') {
      navigation.navigate('LiveMatch' as never, { matchId: match.id } as never);
    } else {
      navigation.navigate('MatchDetails' as never, { matchId: match.id } as never);
    }
  };

  const handleCreateMatch = () => {
    navigation.navigate('CreateMatch' as never);
  };

  // Filter matches based on status
  const filteredMatches = mockMatches.filter(match => {
    return filter === 'all' || match.status === filter;
  });

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMatchStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'in_progress':
        return 'Live';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatMatchTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMatchDate = (date: Date) => {
    const matchDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (matchDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (matchDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return matchDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const renderMatchItem = ({ item: match }: { item: LiveMatch }) => (
    <TouchableOpacity onPress={() => handleMatchPress(match)}>
      <Card style={tw('mb-4')}>
        {/* Match Header */}
        <View style={tw('flex-row justify-between items-center mb-3')}>
          <Badge 
            variant={getMatchStatusColor(match.status)} 
            size="sm"
          >
            {getMatchStatusText(match.status)}
          </Badge>
          <View style={tw('flex-row items-center')}>
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text style={tw('text-sm text-gray-600 ml-1')}>
              {formatMatchTime(match.startTime)}
            </Text>
          </View>
        </View>

        {/* Teams and Score */}
        <View style={tw('flex-row items-center justify-between mb-3')}>
          <View style={tw('flex-1 items-end')}>
            <Text style={tw('text-lg font-semibold text-gray-900')}>
              {match.homeTeam}
            </Text>
          </View>
          
          <View style={tw('mx-4 items-center')}>
            <View style={tw('flex-row items-center')}>
              <Text style={tw('text-2xl font-bold text-gray-900')}>
                {match.homeScore}
              </Text>
              <Text style={tw('text-lg text-gray-600 mx-2')}>-</Text>
              <Text style={tw('text-2xl font-bold text-gray-900')}>
                {match.awayScore}
              </Text>
            </View>
            <Text style={tw('text-xs text-gray-500 mt-1')}>
              {formatMatchDate(match.startTime)}
            </Text>
          </View>
          
          <View style={tw('flex-1 items-start')}>
            <Text style={tw('text-lg font-semibold text-gray-900')}>
              {match.awayTeam}
            </Text>
          </View>
        </View>

        {/* Match Details */}
        <View style={tw('flex-row justify-between items-center')}>
          <View style={tw('flex-row items-center')}>
            <Ionicons name="location" size={16} color="#6B7280" />
            <Text style={tw('text-sm text-gray-600 ml-1')}>
              {match.location}
            </Text>
          </View>
          
          {match.events && match.events.length > 0 && (
            <View style={tw('flex-row items-center')}>
              <Ionicons name="football" size={16} color="#10B981" />
              <Text style={tw('text-sm text-gray-600 ml-1')}>
                {match.events.filter(e => e.type === 'goal').length} goals
              </Text>
            </View>
          )}
        </View>

        {/* Live Indicator */}
        {match.status === 'in_progress' && (
          <View style={tw('mt-3 pt-3 border-t border-gray-200')}>
            <View style={tw('flex-row items-center justify-center')}>
              <View style={tw('w-2 h-2 bg-red-500 rounded-full mr-2')} />
              <Text style={tw('text-sm font-medium text-red-600')}>
                LIVE NOW
              </Text>
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
          <Text style={tw('text-gray-600')}>Loading matches...</Text>
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
            Error Loading Matches
          </Text>
          <Text style={tw('text-gray-600 text-center mb-4')}>
            {error.message || 'Failed to load matches. Please try again.'}
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
          <Text style={tw('text-2xl font-bold text-gray-900')}>Matches</Text>
          <TouchableOpacity 
            onPress={handleCreateMatch}
            style={tw('bg-blue-600 p-2 rounded-lg')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Filter Buttons */}
        <View style={tw('flex-row')}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('scheduled', 'Scheduled')}
          {renderFilterButton('in_progress', 'Live')}
          {renderFilterButton('completed', 'Completed')}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={filteredMatches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw('p-4')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={tw('flex-1 justify-center items-center py-12')}>
            <Ionicons name="football" size={64} color="#D1D5DB" />
            <Text style={tw('text-lg font-semibold text-gray-900 mt-4 mb-2')}>
              No Matches Found
            </Text>
            <Text style={tw('text-gray-600 text-center mb-6')}>
              {filter === 'all' 
                ? 'Get started by creating your first match.'
                : `No ${filter} matches found.`
              }
            </Text>
            {filter === 'all' && (
              <Button
                title="Create Match"
                onPress={handleCreateMatch}
                variant="primary"
                size="lg"
              />
            )}
          </View>
        }
        ListHeaderComponent={
          filteredMatches.length > 0 ? (
            <View style={tw('mb-4')}>
              <Text style={tw('text-sm text-gray-600')}>
                {filteredMatches.length} match{filteredMatches.length !== 1 ? 'es' : ''} found
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
} 