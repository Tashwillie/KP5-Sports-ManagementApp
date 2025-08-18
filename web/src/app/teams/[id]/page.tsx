'use client';

import React, { useState, useEffect } from 'react';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  clubId: string;
  sport: string;
  ageGroup: string;
  level: string;
  coachId: string;
  description?: string;
  players: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Club {
  id: string;
  name: string;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading  } = useEnhancedAuthContext();
  const [team, setTeam] = useState<Team | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const teamId = params.id as string;

  useEffect(() => {
    if (user && teamId) {
      loadTeamData();
    }
  }, [user, teamId]);

  const loadTeamData = async () => {
    try {
      setIsLoading(true);
      const teamData = await TeamService.getTeam(teamId);
      setTeam(teamData);
      
      if (teamData?.clubId) {
        const clubData = await ClubService.getClub(teamData.clubId);
        setClub(clubData);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      setError('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;

    if (!window.confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await TeamService.deleteTeam(teamId);
      router.push('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to view team details.</p>
          <Link href="/firebase-test" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Team Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The team you are looking for does not exist.'}</p>
            <Link href="/teams" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Back to Teams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/teams"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
                {getStatusBadge(team.isActive)}
              </div>
              <p className="text-gray-600 mt-1">
                {team.sport} • {team.ageGroup} • {team.level}
                {club && ` • ${club.name}`}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/teams/${teamId}/edit`}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Team
              </Link>
              <button
                onClick={handleDeleteTeam}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Team
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Team Information</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {team.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-sm text-gray-900">{team.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Sport</h3>
                      <p className="mt-1 text-sm text-gray-900">{team.sport}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Age Group</h3>
                      <p className="mt-1 text-sm text-gray-900">{team.ageGroup}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Level</h3>
                      <p className="mt-1 text-sm text-gray-900">{team.level}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Coach</h3>
                      <p className="mt-1 text-sm text-gray-900">{team.coachId}</p>
                    </div>
                    {club && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Club</h3>
                        <Link 
                          href={`/clubs/${club.id}`}
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {club.name}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Players */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Players ({team.players.length})</h2>
                  <Link
                    href={`/teams/${teamId}/players/add`}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Player
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {team.players.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.players.map((playerId, index) => (
                      <div key={playerId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Player {index + 1}</h3>
                            <p className="text-sm text-gray-500">ID: {playerId}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/players/${playerId}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Profile
                            </Link>
                            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p>No players added yet</p>
                    <Link
                      href={`/teams/${teamId}/players/add`}
                      className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add First Player
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Players</span>
                    <span className="text-sm font-medium text-gray-900">{team.players.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sport</span>
                    <span className="text-sm font-medium text-gray-900">{team.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Age Group</span>
                    <span className="text-sm font-medium text-gray-900">{team.ageGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Level</span>
                    <span className="text-sm font-medium text-gray-900">{team.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Team Details</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(team.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(team.updatedAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-1">{getStatusBadge(team.isActive)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <Link
                    href={`/teams/${teamId}/players/add`}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Player
                  </Link>
                  <Link
                    href={`/teams/${teamId}/edit`}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Team
                  </Link>
                  <Link
                    href={`/matches/create?teamId=${teamId}`}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Schedule Match
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 