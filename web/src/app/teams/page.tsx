'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TeamCard } from '@/components/team/TeamCard';
import { CreateTeamForm } from '@/components/team/CreateTeamForm';
import { TeamService } from '../../lib/services/teamService';
import { ClubService } from '../../lib/services/clubService';
import { Team, Club } from '../../../../shared/src/types';
import { useLocalAuth } from '@/hooks/useLocalApi';

export default function TeamsPage() {
  const { user } = useLocalAuth();
  const searchParams = useSearchParams();
  const clubId = searchParams.get('clubId');
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my' | 'public'>('all');
  const [selectedClubId, setSelectedClubId] = useState<string>(clubId || '');

  useEffect(() => {
    loadData();
  }, [filter, selectedClubId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load clubs if user can create teams
      if (user && ['super_admin', 'club_admin'].includes(user.role)) {
        const clubsData = await ClubService.getClubs({ createdBy: user.id });
        setClubs(clubsData);
      }

      // Load teams
      let teamsData: Team[] = [];
      
      if (selectedClubId) {
        teamsData = await TeamService.getTeamsByClub(selectedClubId);
      } else {
        // Load all teams user has access to
        if (user) {
          // For now, load teams from user's clubs
          const userClubs = await ClubService.getClubs({ createdBy: user.id });
          for (const club of userClubs) {
            const clubTeams = await TeamService.getTeamsByClub(club.id);
            teamsData.push(...clubTeams);
          }
        }
      }

      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (teamId: string) => {
    setShowCreateForm(false);
    await loadData(); // Reload teams to show the new one
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await TeamService.deleteTeam(teamId);
      await loadData(); // Reload teams after deletion
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.division.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreateTeam = user && ['super_admin', 'club_admin'].includes(user.role) && selectedClubId;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-2">
              Manage your sports teams and rosters
            </p>
          </div>
          
          {canCreateTeam && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto"
            >
              Create New Team
            </Button>
          )}
        </div>
      </div>

      {/* Create Team Form Modal */}
      {showCreateForm && selectedClubId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CreateTeamForm
              clubId={selectedClubId}
              onSuccess={handleCreateTeam}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Club Selection */}
      {clubs.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Club
          </label>
          <select
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Clubs</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
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
            All Teams
          </Button>
          {user && (
            <Button
              variant={filter === 'my' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('my')}
            >
              My Teams
            </Button>
          )}
          <Button
            variant={filter === 'public' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('public')}
          >
            Public Teams
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search teams by name, description, or division..."
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
          <span className="ml-2 text-gray-600">Loading teams...</span>
        </div>
      )}

      {/* Teams Grid */}
      {!loading && (
        <>
          {filteredTeams.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? `No teams match "${searchTerm}"`
                  : selectedClubId
                  ? "This club doesn't have any teams yet."
                  : "No teams available."}
              </p>
              {canCreateTeam && !showCreateForm && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Your First Team
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  showActions={user?.id === team.createdBy || user?.role === 'super_admin'}
                  onDelete={handleDeleteTeam}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Stats */}
      {!loading && filteredTeams.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredTeams.length}
              </div>
              <div className="text-sm text-gray-500">Total Teams</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredTeams.reduce((acc, team) => acc + team.roster.players.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Players</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {filteredTeams.reduce((acc, team) => acc + team.roster.coaches.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Coaches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredTeams.reduce((acc, team) => acc + team.stats.matchesPlayed, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Matches</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 