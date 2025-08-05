'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClubCard } from '@/components/club/ClubCard';
import { CreateClubForm } from '@/components/club/CreateClubForm';
import { ClubService } from '../../lib/services/clubService';
import { Club } from '../../../../shared/src/types';
import { useLocalAuth } from '@/hooks/useLocalApi';

export default function ClubsPage() {
  const { user } = useLocalAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my' | 'public'>('all');

  useEffect(() => {
    loadClubs();
  }, [filter]);

  const loadClubs = async () => {
    try {
      setLoading(true);
      let clubsData: Club[] = [];

      switch (filter) {
        case 'my':
          if (user) {
            clubsData = await ClubService.getClubs({ createdBy: user.id });
          }
          break;
        case 'public':
          clubsData = await ClubService.getClubs({ isPublic: true });
          break;
        default:
          clubsData = await ClubService.getClubs();
      }

      setClubs(clubsData);
    } catch (error) {
      console.error('Error loading clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async (clubId: string) => {
    setShowCreateForm(false);
    await loadClubs(); // Reload clubs to show the new one
  };

  const handleDeleteClub = async (clubId: string) => {
    try {
      await ClubService.deleteClub(clubId);
      await loadClubs(); // Reload clubs after deletion
    } catch (error) {
      console.error('Error deleting club:', error);
      alert('Failed to delete club. Please try again.');
    }
  };

  const filteredClubs = clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateClub = user && ['super_admin', 'club_admin'].includes(user.role);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clubs</h1>
            <p className="text-gray-600 mt-2">
              Discover and manage sports clubs in your area
            </p>
          </div>
          
          {canCreateClub && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto"
            >
              Create New Club
            </Button>
          )}
        </div>
      </div>

      {/* Create Club Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreateClubForm
              onSuccess={handleCreateClub}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Clubs
          </Button>
          {user && (
            <Button
              variant={filter === 'my' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('my')}
            >
              My Clubs
            </Button>
          )}
          <Button
            variant={filter === 'public' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('public')}
          >
            Public Clubs
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search clubs by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading clubs...</span>
        </div>
      )}

      {/* Clubs Grid */}
      {!loading && (
        <>
          {filteredClubs.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No clubs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? `No clubs match "${searchTerm}"`
                  : filter === 'my'
                  ? "You haven't created any clubs yet."
                  : "No clubs available."}
              </p>
              {canCreateClub && !showCreateForm && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Your First Club
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  showActions={user?.id === club.createdBy || user?.role === 'super_admin'}
                  onDelete={handleDeleteClub}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Stats */}
      {!loading && filteredClubs.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredClubs.length}
              </div>
              <div className="text-sm text-gray-500">Total Clubs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredClubs.reduce((acc, club) => acc + club.stats.totalTeams, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Teams</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {filteredClubs.reduce((acc, club) => acc + club.stats.totalPlayers, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Players</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 