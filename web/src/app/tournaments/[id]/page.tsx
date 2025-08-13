'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import Link from 'next/link';

interface Tournament {
  id: string;
  name: string;
  clubId: string;
  sport: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  format: 'round_robin' | 'knockout' | 'group_stage' | 'league';
  maxTeams: number;
  currentTeams: number;
  description?: string;
  prizePool?: string;
  registrationDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Club {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  clubId: string;
  sport: string;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading  } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const tournamentId = params.id as string;

  useEffect(() => {
    if (user && tournamentId) {
      loadTournamentData();
    }
  }, [user, tournamentId]);

  const loadTournamentData = async () => {
    try {
      setIsLoading(true);
      const tournamentData = await TournamentService.getTournament(tournamentId);
      setTournament(tournamentData);
      
      if (tournamentData) {
        const clubData = await ClubService.getClub(tournamentData.clubId);
        setClub(clubData);
        
        // Load teams for this tournament (this would need to be implemented in the service)
        // For now, we'll load all teams and filter by sport
        const allTeams = await TeamService.getAllTeams();
        const tournamentTeams = allTeams.filter(team => team.sport === tournamentData.sport);
        setTeams(tournamentTeams);
      }
    } catch (error) {
      console.error('Error loading tournament data:', error);
      setError('Failed to load tournament data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTournament = async () => {
    if (!tournament) return;

    if (!window.confirm(`Are you sure you want to delete "${tournament.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await TournamentService.deleteTournament(tournamentId);
      router.push('/tournaments');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Failed to delete tournament');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartTournament = async () => {
    if (!tournament) return;

    try {
      await TournamentService.updateTournament(tournamentId, { status: 'active' });
      await loadTournamentData(); // Reload to get updated status
    } catch (error) {
      console.error('Error starting tournament:', error);
      alert('Failed to start tournament');
    }
  };

  const handleEndTournament = async () => {
    if (!tournament) return;

    try {
      await TournamentService.updateTournament(tournamentId, { status: 'completed' });
      await loadTournamentData(); // Reload to get updated status
    } catch (error) {
      console.error('Error ending tournament:', error);
      alert('Failed to end tournament');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getFormatBadge = (format: string) => {
    const formatConfig = {
      round_robin: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Round Robin' },
      knockout: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Knockout' },
      group_stage: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Group Stage' },
      league: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'League' },
    };

    const config = formatConfig[format as keyof typeof formatConfig] || formatConfig.round_robin;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isRegistrationOpen = () => {
    if (!tournament) return false;
    const now = new Date();
    const deadline = new Date(tournament.registrationDeadline);
    return now < deadline && tournament.currentTeams < tournament.maxTeams;
  };

  const getDaysUntilStart = () => {
    if (!tournament) return 0;
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
          <p className="text-gray-600 mb-4">Please sign in to view tournament details.</p>
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
            <p className="text-gray-600">Loading tournament details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tournament || !club) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tournament Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The tournament you are looking for does not exist.'}</p>
            <Link href="/tournaments" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Back to Tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const daysUntilStart = getDaysUntilStart();
  const registrationOpen = isRegistrationOpen();

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
                  href="/tournaments"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
                {getStatusBadge(tournament.status)}
                {getFormatBadge(tournament.format)}
              </div>
              <p className="text-gray-600 mt-1">
                {tournament.sport} • {club.name} • {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
              </p>
            </div>
            <div className="flex space-x-3">
              {tournament.status === 'upcoming' && (
                <button
                  onClick={handleStartTournament}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Tournament
                </button>
              )}
              {tournament.status === 'active' && (
                <button
                  onClick={handleEndTournament}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  End Tournament
                </button>
              )}
              <Link
                href={`/tournaments/${tournamentId}/edit`}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Tournament
              </Link>
              <button
                onClick={handleDeleteTournament}
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
                    Delete Tournament
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
            {/* Tournament Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tournament Overview</h2>
                
                {tournament.description && (
                  <div className="mb-6">
                    <p className="text-gray-700">{tournament.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Sport</h3>
                      <p className="mt-1 text-sm text-gray-900">{tournament.sport}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Format</h3>
                      <div className="mt-1">{getFormatBadge(tournament.format)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Club</h3>
                      <Link 
                        href={`/clubs/${club.id}`}
                        className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {club.name}
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(tournament.startDate)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(tournament.endDate)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Registration Deadline</h3>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(tournament.registrationDeadline)}</p>
                    </div>
                  </div>
                </div>

                {tournament.prizePool && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-sm font-medium text-yellow-800">Prize Pool: {tournament.prizePool}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Teams */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Teams ({teams.length}/{tournament.maxTeams})</h2>
                  {registrationOpen && (
                    <Link
                      href={`/tournaments/${tournamentId}/register`}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Register Team
                    </Link>
                  )}
                </div>
              </div>
              <div className="p-6">
                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{team.name}</h3>
                            <p className="text-sm text-gray-500">{team.sport}</p>
                          </div>
                          <Link
                            href={`/teams/${team.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Team
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p>No teams registered yet</p>
                    {registrationOpen && (
                      <Link
                        href={`/tournaments/${tournamentId}/register`}
                        className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Register First Team
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Matches (Future Enhancement) */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tournament Matches</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>Tournament matches will be displayed here when available</p>
                  {tournament.status === 'active' && (
                    <Link
                      href={`/tournaments/${tournamentId}/matches`}
                      className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      View Matches
                    </Link>
                  )}
                </div>
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
                    <span className="text-sm text-gray-600">Status</span>
                    <div>{getStatusBadge(tournament.status)}</div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Teams</span>
                    <span className="text-sm font-medium text-gray-900">{tournament.currentTeams}/{tournament.maxTeams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sport</span>
                    <span className="text-sm font-medium text-gray-900">{tournament.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Format</span>
                    <div>{getFormatBadge(tournament.format)}</div>
                  </div>
                  {daysUntilStart > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days Until Start</span>
                      <span className="text-sm font-medium text-gray-900">{daysUntilStart}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Registration Status */}
            {registrationOpen && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Registration</h2>
                </div>
                <div className="p-6">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">Registration Open</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Deadline: {formatDate(tournament.registrationDeadline)}
                    </p>
                    <Link
                      href={`/tournaments/${tournamentId}/register`}
                      className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm"
                    >
                      Register Team
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Tournament Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Tournament Details</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(tournament.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(tournament.updatedAt)}</p>
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
                  {tournament.status === 'upcoming' && (
                    <button
                      onClick={handleStartTournament}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Tournament
                    </button>
                  )}
                  {tournament.status === 'active' && (
                    <button
                      onClick={handleEndTournament}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      End Tournament
                    </button>
                  )}
                  {registrationOpen && (
                    <Link
                      href={`/tournaments/${tournamentId}/register`}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Register Team
                    </Link>
                  )}
                  <Link
                    href={`/tournaments/${tournamentId}/edit`}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Tournament
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