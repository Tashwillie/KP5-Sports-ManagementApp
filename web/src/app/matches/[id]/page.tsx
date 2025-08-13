'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import Link from 'next/link';

interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: Date;
  venue: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  refereeId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Team {
  id: string;
  name: string;
  clubId: string;
  sport: string;
}

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading  } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const matchId = params.id as string;

  useEffect(() => {
    if (user && matchId) {
      loadMatchData();
    }
  }, [user, matchId]);

  const loadMatchData = async () => {
    try {
      setIsLoading(true);
      const matchData = await MatchService.getMatch(matchId);
      setMatch(matchData);
      
      if (matchData) {
        const [homeTeamData, awayTeamData] = await Promise.all([
          TeamService.getTeam(matchData.homeTeamId),
          TeamService.getTeam(matchData.awayTeamId),
        ]);
        setHomeTeam(homeTeamData);
        setAwayTeam(awayTeamData);
      }
    } catch (error) {
      console.error('Error loading match data:', error);
      setError('Failed to load match data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMatch = async () => {
    if (!match) return;

    if (!window.confirm(`Are you sure you want to delete this match? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await MatchService.deleteMatch(matchId);
      router.push('/matches');
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Failed to delete match');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartMatch = async () => {
    if (!match) return;

    try {
      await MatchService.updateMatch(matchId, { status: 'in_progress' });
      await loadMatchData(); // Reload to get updated status
    } catch (error) {
      console.error('Error starting match:', error);
      alert('Failed to start match');
    }
  };

  const handleEndMatch = async () => {
    if (!match) return;

    try {
      await MatchService.updateMatch(matchId, { status: 'completed' });
      await loadMatchData(); // Reload to get updated status
    } catch (error) {
      console.error('Error ending match:', error);
      alert('Failed to end match');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;

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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMatchResult = () => {
    if (match?.status !== 'completed' || match.homeScore === undefined || match.awayScore === undefined) {
      return null;
    }

    if (match.homeScore > match.awayScore) {
      return { winner: 'home', score: `${match.homeScore} - ${match.awayScore}` };
    } else if (match.awayScore > match.homeScore) {
      return { winner: 'away', score: `${match.homeScore} - ${match.awayScore}` };
    } else {
      return { winner: 'draw', score: `${match.homeScore} - ${match.awayScore}` };
    }
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
          <p className="text-gray-600 mb-4">Please sign in to view match details.</p>
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
            <p className="text-gray-600">Loading match details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !match || !homeTeam || !awayTeam) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Match Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The match you are looking for does not exist.'}</p>
            <Link href="/matches" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Back to Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const matchResult = getMatchResult();

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
                  href="/matches"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  {homeTeam.name} vs {awayTeam.name}
                </h1>
                {getStatusBadge(match.status)}
              </div>
              <p className="text-gray-600 mt-1">
                {formatDate(match.date)} at {formatTime(match.date)} • {match.venue}
              </p>
            </div>
            <div className="flex space-x-3">
              {match.status === 'scheduled' && (
                <button
                  onClick={handleStartMatch}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Match
                </button>
              )}
              {match.status === 'in_progress' && (
                <>
                  <Link
                    href={`/matches/${matchId}/live`}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Live Match
                  </Link>
                  <button
                    onClick={handleEndMatch}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    End Match
                  </button>
                </>
              )}
              <Link
                href={`/matches/${matchId}/edit`}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Match
              </Link>
              <button
                onClick={handleDeleteMatch}
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
                    Delete Match
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
            {/* Score Display */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-8">
                <div className="grid grid-cols-3 gap-8 items-center">
                  {/* Home Team */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {match.homeScore !== undefined ? match.homeScore : '-'}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{homeTeam.name}</div>
                    <div className="text-sm text-gray-500">{homeTeam.sport}</div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-400 mb-2">VS</div>
                    {matchResult && (
                      <div className="text-sm text-gray-600">
                        {matchResult.winner === 'home' && 'Home Team Wins'}
                        {matchResult.winner === 'away' && 'Away Team Wins'}
                        {matchResult.winner === 'draw' && 'Draw'}
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {match.awayScore !== undefined ? match.awayScore : '-'}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{awayTeam.name}</div>
                    <div className="text-sm text-gray-500">{awayTeam.sport}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Match Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(match.date)} at {formatTime(match.date)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Venue</h3>
                    <p className="mt-1 text-sm text-gray-900">{match.venue}</p>
                  </div>
                  {match.refereeId && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Referee</h3>
                      <p className="mt-1 text-sm text-gray-900">{match.refereeId}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-1">{getStatusBadge(match.status)}</div>
                  </div>
                </div>
                {match.notes && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <p className="mt-1 text-sm text-gray-900">{match.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Match Events (Future Enhancement) */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Match Events</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Match events will be displayed here when available</p>
                  {match.status === 'in_progress' && (
                    <Link
                      href={`/matches/${matchId}/live`}
                      className="mt-2 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Enter Live Events
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
                    <span className="text-sm text-gray-600">Match Status</span>
                    <div>{getStatusBadge(match.status)}</div>
                  </div>
                  {matchResult && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Final Score</span>
                      <span className="text-sm font-medium text-gray-900">{matchResult.score}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sport</span>
                    <span className="text-sm font-medium text-gray-900">{homeTeam.sport}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Match Details</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(match.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(match.updatedAt)}</p>
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
                  {match.status === 'scheduled' && (
                    <button
                      onClick={handleStartMatch}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Match
                    </button>
                  )}
                  {match.status === 'in_progress' && (
                    <>
                      <Link
                        href={`/matches/${matchId}/live`}
                        className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Live Match Control
                      </Link>
                      <button
                        onClick={handleEndMatch}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        End Match
                      </button>
                    </>
                  )}
                  <Link
                    href={`/matches/${matchId}/edit`}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Match
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