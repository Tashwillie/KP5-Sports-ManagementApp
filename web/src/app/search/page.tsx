'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  UsersIcon,
  TrophyIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { PublicSearchFilters, PublicSearchResult } from '@kp5-academy/shared';

export default function PublicSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<PublicSearchFilters>({
    category: searchParams.get('category') as any || undefined,
    location: {
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
    },
    sport: searchParams.get('sport') || undefined,
    ageGroup: searchParams.get('ageGroup') || undefined,
    gender: searchParams.get('gender') as any || undefined,
    level: searchParams.get('level') as any || undefined,
  });
  const [results, setResults] = useState<PublicSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'club' | 'team' | 'player' | 'event'>(
    (searchParams.get('category') as any) || 'all'
  );

  useEffect(() => {
    if (searchQuery.trim() || Object.keys(filters).length > 0) {
      performSearch();
    }
  }, [searchQuery, filters]);

  const performSearch = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual API call
      const mockResults: PublicSearchResult[] = [
        {
          type: 'club',
          id: 'club1',
          title: 'Elite Soccer Academy',
          description: 'Premier soccer academy for youth development',
          url: '/club/elite-soccer-academy',
          image: '/api/placeholder/100/100',
          location: {
            address: {
              street: '123 Soccer Way',
              city: 'Springfield',
              state: 'IL',
              zipCode: '62701',
              country: 'USA',
            },
            venue: 'Elite Soccer Complex',
            venueType: 'complex',
            facilities: [],
          },
          stats: { totalTeams: 12, totalPlayers: 180 },
          relevance: 1.0,
          highlights: ['premier', 'academy', 'youth'],
        },
        {
          type: 'team',
          id: 'team1',
          title: 'U16 Boys Elite',
          description: 'Elite U16 boys soccer team',
          url: '/team/u16-boys-elite',
          image: '/api/placeholder/100/100',
          location: {
            address: {
              street: '123 Soccer Way',
              city: 'Springfield',
              state: 'IL',
              zipCode: '62701',
              country: 'USA',
            },
            venue: 'Elite Soccer Complex',
            venueType: 'field',
            facilities: [],
          },
          stats: { wins: 15, losses: 2, ties: 1 },
          relevance: 0.9,
          highlights: ['elite', 'boys', 'soccer'],
        },
      ];
      
      setResults(mockResults);
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
    setSearchQuery('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleResultClick = (result: PublicSearchResult) => {
    router.push(result.url);
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'club':
        return <UsersIcon className="w-5 h-5" />;
      case 'team':
        return <TrophyIcon className="w-5 h-5" />;
      case 'player':
        return <StarIcon className="w-5 h-5" />;
      case 'event':
        return <CalendarIcon className="w-5 h-5" />;
      default:
        return <MagnifyingGlassIcon className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'club':
        return 'bg-blue-100 text-blue-800';
      case 'team':
        return 'bg-green-100 text-green-800';
      case 'player':
        return 'bg-purple-100 text-purple-800';
      case 'event':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clubs, teams, players, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg flex items-center space-x-2 ${
                showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'club', label: 'Clubs' },
                    { key: 'team', label: 'Teams' },
                    { key: 'player', label: 'Players' },
                    { key: 'event', label: 'Events' },
                  ].map((category) => (
                    <button
                      key={category.key}
                      onClick={() => handleCategoryChange(category.key as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCategory === category.key
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={filters.location?.city || ''}
                    onChange={(e) => handleFilterChange('location', { ...filters.location, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={filters.location?.state || ''}
                    onChange={(e) => handleFilterChange('location', { ...filters.location, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sport & Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sport & Level</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Sport"
                    value={filters.sport || ''}
                    onChange={(e) => handleFilterChange('sport', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={filters.level || ''}
                    onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="recreational">Recreational</option>
                    <option value="competitive">Competitive</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>
              </div>

              {/* Age Group & Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Group & Gender</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Age Group (e.g., U12, U16, Adult)"
                    value={filters.ageGroup || ''}
                    onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={filters.gender || ''}
                    onChange={(e) => handleFilterChange('gender', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="coed">Coed</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </h2>
            </div>
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    {result.image && (
                      <div className="flex-shrink-0">
                        <Image
                          src={result.image}
                          alt={result.title}
                          width={80}
                          height={80}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{result.title}</h3>
                          <p className="text-gray-600 mb-2">{result.description}</p>
                          {result.location && (
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              <span>
                                {result.location.address.city}, {result.location.address.state}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(result.type)}`}>
                          {getCategoryIcon(result.type)}
                          <span>{result.type.charAt(0).toUpperCase() + result.type.slice(1)}</span>
                        </div>
                      </div>
                      {result.stats && (
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {result.stats.wins !== undefined && (
                            <span>Wins: {result.stats.wins}</span>
                          )}
                          {result.stats.totalTeams !== undefined && (
                            <span>Teams: {result.stats.totalTeams}</span>
                          )}
                          {result.stats.totalPlayers !== undefined && (
                            <span>Players: {result.stats.totalPlayers}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : searchQuery.trim() || Object.keys(filters).length > 0 ? (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search Sports</h3>
            <p className="text-gray-600">Find clubs, teams, players, and events in your area</p>
          </div>
        )}
      </div>
    </div>
  );
} 