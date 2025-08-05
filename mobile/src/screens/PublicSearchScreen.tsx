import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { publicService } from '../services/publicService';
import { PublicSearchFilters, PublicSearchResult } from '@shared/types/public';

const { width } = Dimensions.get('window');

export default function PublicSearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PublicSearchFilters>({});
  const [results, setResults] = useState<PublicSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'club' | 'team' | 'player' | 'event'>('all');

  useEffect(() => {
    if (searchQuery.trim() || Object.keys(filters).length > 0) {
      performSearch();
    }
  }, [searchQuery, filters]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const searchFilters: PublicSearchFilters = {
        query: searchQuery.trim() || undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        ...filters,
      };
      
      const searchResults = await publicService.searchPublicProfiles(searchFilters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: 'all' | 'club' | 'team' | 'player' | 'event') => {
    setSelectedCategory(category);
    setFilters(prev => ({ ...prev, category }));
  };

  const handleFilterChange = (key: keyof PublicSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSelectedCategory('all');
  };

  const handleResultPress = (result: PublicSearchResult) => {
    switch (result.type) {
      case 'club':
        navigation.navigate('PublicClubProfile', { slug: result.id });
        break;
      case 'team':
        navigation.navigate('PublicTeamProfile', { slug: result.id });
        break;
      case 'player':
        navigation.navigate('PlayerDetails', { playerId: result.id });
        break;
      case 'event':
        navigation.navigate('EventDetails', { eventId: result.id });
        break;
    }
  };

  const renderSearchResult = ({ item }: { item: PublicSearchResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => handleResultPress(item)}
    >
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.resultImage} />
      )}
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <View style={styles.resultType}>
            <Ionicons
              name={
                item.type === 'club' ? 'business' :
                item.type === 'team' ? 'people' :
                item.type === 'player' ? 'person' :
                'calendar'
              }
              size={16}
              color="#007AFF"
            />
            <Text style={styles.resultTypeText}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.resultDescription}>{item.description}</Text>
        {item.location && (
          <View style={styles.resultLocation}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.locationText}>
              {item.location.address.city}, {item.location.address.state}
            </Text>
          </View>
        )}
        {item.stats && (
          <View style={styles.resultStats}>
            {item.stats.wins !== undefined && (
              <Text style={styles.statText}>Wins: {item.stats.wins}</Text>
            )}
            {item.stats.totalTeams !== undefined && (
              <Text style={styles.statText}>Teams: {item.stats.totalTeams}</Text>
            )}
            {item.stats.totalPlayers !== undefined && (
              <Text style={styles.statText}>Players: {item.stats.totalPlayers}</Text>
            )}
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All', icon: 'search' },
            { key: 'club', label: 'Clubs', icon: 'business' },
            { key: 'team', label: 'Teams', icon: 'people' },
            { key: 'player', label: 'Players', icon: 'person' },
            { key: 'event', label: 'Events', icon: 'calendar' },
          ].map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.categoryButtonActive
              ]}
              onPress={() => handleCategoryChange(category.key as any)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.key ? 'white' : '#666'}
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.key && styles.categoryButtonTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Location</Text>
        <TextInput
          style={styles.filterInput}
          placeholder="City"
          value={filters.location?.city || ''}
          onChangeText={(text) => handleFilterChange('location', { ...filters.location, city: text })}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="State"
          value={filters.location?.state || ''}
          onChangeText={(text) => handleFilterChange('location', { ...filters.location, state: text })}
        />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Sport & Level</Text>
        <TextInput
          style={styles.filterInput}
          placeholder="Sport"
          value={filters.sport || ''}
          onChangeText={(text) => handleFilterChange('sport', text)}
        />
        <View style={styles.levelButtons}>
          {['recreational', 'competitive', 'elite'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                filters.level === level && styles.levelButtonActive
              ]}
              onPress={() => handleFilterChange('level', filters.level === level ? undefined : level)}
            >
              <Text style={[
                styles.levelButtonText,
                filters.level === level && styles.levelButtonTextActive
              ]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Age Group</Text>
        <TextInput
          style={styles.filterInput}
          placeholder="Age Group (e.g., U12, U16, Adult)"
          value={filters.ageGroup || ''}
          onChangeText={(text) => handleFilterChange('ageGroup', text)}
        />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Gender</Text>
        <View style={styles.genderButtons}>
          {['male', 'female', 'coed'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.genderButton,
                filters.gender === gender && styles.genderButtonActive
              ]}
              onPress={() => handleFilterChange('gender', filters.gender === gender ? undefined : gender)}
            >
              <Text style={[
                styles.genderButtonText,
                filters.gender === gender && styles.genderButtonTextActive
              ]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.filterActions}>
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clubs, teams, players, events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={showFilters ? '#007AFF' : '#666'} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && renderFilters()}

      {/* Results */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : results.length > 0 ? (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            <FlatList
              data={results}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsList}
            />
          </>
        ) : searchQuery.trim() || Object.keys(filters).length > 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        ) : (
          <View style={styles.initialContainer}>
            <Ionicons name="search" size={64} color="#ccc" />
            <Text style={styles.initialTitle}>Search Sports</Text>
            <Text style={styles.initialSubtitle}>
              Find clubs, teams, players, and events in your area
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  filterInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#007AFF',
  },
  levelButtonText: {
    fontSize: 14,
    color: '#666',
  },
  levelButtonTextActive: {
    color: 'white',
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#666',
  },
  genderButtonTextActive: {
    color: 'white',
  },
  filterActions: {
    alignItems: 'center',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    flexDirection: 'row',
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
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  resultType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultTypeText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  resultStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  initialSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 