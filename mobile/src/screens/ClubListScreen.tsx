import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { tw } from '../utils/tailwind';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useMobileClubs, useMobileCreateClub } from '../hooks/useMobileApi';
import { Club } from '../../../shared/src/types';

export default function ClubListScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all clubs
  const { 
    data: clubs, 
    loading, 
    error, 
    refetch 
  } = useMobileClubs([]);

  // Create club mutation
  const createClubMutation = useMobileCreateClub();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateClub = () => {
    navigation.navigate('CreateClub' as never);
  };

  const handleClubPress = (club: Club) => {
    navigation.navigate('ClubDetails' as never, { clubId: club.id } as never);
  };

  const handleEditClub = (club: Club) => {
    navigation.navigate('EditClub' as never, { clubId: club.id } as never);
  };

  const filteredClubs = clubs?.filter(club => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderClubItem = ({ item: club }: { item: Club }) => (
    <TouchableOpacity onPress={() => handleClubPress(club)}>
      <Card style={tw('mb-4')}>
        <View style={tw('flex-row justify-between items-start mb-3')}>
          <View style={tw('flex-1')}>
            <Text style={tw('text-lg font-semibold text-gray-900 mb-1')}>
              {club.name}
            </Text>
            <Text style={tw('text-sm text-gray-600 mb-2')} numberOfLines={2}>
              {club.description || 'No description available'}
            </Text>
            <View style={tw('flex-row items-center gap-4')}>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={tw('text-sm text-gray-600 ml-1')}>
                  {club.location?.city || 'Location not set'}
                </Text>
              </View>
              <View style={tw('flex-row items-center')}>
                <Ionicons name="people" size={16} color="#6B7280" />
                <Text style={tw('text-sm text-gray-600 ml-1')}>
                  {club.memberCount || 0} members
                </Text>
              </View>
            </View>
          </View>
          <View style={tw('flex-row items-center gap-2')}>
            <Badge 
              variant={club.isActive ? 'success' : 'error'} 
              size="sm"
            >
              {club.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <TouchableOpacity 
              onPress={() => handleEditClub(club)}
              style={tw('p-2')}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={tw('flex-row justify-between items-center')}>
          <View style={tw('flex-row gap-2')}>
            {club.sports && club.sports.length > 0 && (
              <Badge variant="secondary" size="sm">
                {club.sports[0]}
              </Badge>
            )}
            {club.teams && club.teams.length > 0 && (
              <Badge variant="default" size="sm">
                {club.teams.length} teams
              </Badge>
            )}
          </View>
          <Text style={tw('text-xs text-gray-500')}>
            Created {new Date(club.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={tw('flex-1 bg-gray-50')}>
        <View style={tw('flex-1 justify-center items-center')}>
          <Text style={tw('text-gray-600')}>Loading clubs...</Text>
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
            Error Loading Clubs
          </Text>
          <Text style={tw('text-gray-600 text-center mb-4')}>
            {error.message || 'Failed to load clubs. Please try again.'}
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
          <Text style={tw('text-2xl font-bold text-gray-900')}>Clubs</Text>
          <TouchableOpacity 
            onPress={handleCreateClub}
            style={tw('bg-blue-600 p-2 rounded-lg')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={tw('flex-row items-center bg-gray-100 rounded-lg px-3 py-2')}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text style={tw('flex-1 ml-2 text-gray-900')}>
            {searchQuery || 'Search clubs...'}
          </Text>
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={filteredClubs}
        renderItem={renderClubItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw('p-4')}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={tw('flex-1 justify-center items-center py-12')}>
            <Ionicons name="business" size={64} color="#D1D5DB" />
            <Text style={tw('text-lg font-semibold text-gray-900 mt-4 mb-2')}>
              No Clubs Found
            </Text>
            <Text style={tw('text-gray-600 text-center mb-6')}>
              {searchQuery 
                ? 'No clubs match your search criteria.'
                : 'Get started by creating your first club.'
              }
            </Text>
            {!searchQuery && (
              <Button
                title="Create Club"
                onPress={handleCreateClub}
                variant="primary"
                size="lg"
              />
            )}
          </View>
        }
        ListHeaderComponent={
          clubs && clubs.length > 0 ? (
            <View style={tw('mb-4')}>
              <Text style={tw('text-sm text-gray-600')}>
                {filteredClubs.length} of {clubs.length} clubs
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
} 