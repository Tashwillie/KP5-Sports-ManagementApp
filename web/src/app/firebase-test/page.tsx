'use client';

import React, { useState, useEffect } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { AuthForm } from '@/components/auth/AuthForm';
import { ClubService, TeamService, MatchService, TournamentService } from '@/services/firebaseService';

export default function FirebaseTestPage() {
  const { user, loading, logout } = useFirebase();
  const [clubs, setClubs] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    if (user) {
      // Load sample data when user is authenticated
      loadSampleData();
    }
  }, [user]);

  const loadSampleData = async () => {
    try {
      // Load clubs
      const clubsData = await ClubService.getAllClubs();
      setClubs(clubsData);

      // Load teams
      const teamsData = await TeamService.getAllTeams();
      setTeams(teamsData);

      // Load matches
      const matchesData = await MatchService.getAllMatches();
      setMatches(matchesData);

      // Load tournaments
      const tournamentsData = await TournamentService.getAllTournaments();
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const createSampleData = async () => {
    try {
      // Create a sample club
      const clubId = await ClubService.createClub({
        name: 'Sample Club',
        description: 'A sample sports club',
        address: '123 Sports St, City',
        phone: '+1234567890',
        email: 'info@sampleclub.com',
        adminId: user?.uid || '',
        isActive: true,
      });

      // Create a sample team
      const teamId = await TeamService.createTeam({
        name: 'Sample Team',
        clubId: clubId,
        sport: 'Football',
        ageGroup: 'U16',
        level: 'intermediate',
        coachId: user?.uid || '',
        players: [],
        isActive: true,
      });

      // Create a sample tournament
      const tournamentId = await TournamentService.createTournament({
        name: 'Sample Tournament',
        description: 'A sample tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        venue: 'Sample Stadium',
        maxTeams: 8,
        currentTeams: 0,
        status: 'registration',
        organizerId: user?.uid || '',
        isActive: true,
      });

      // Create a sample match
      await MatchService.createMatch({
        homeTeamId: teamId,
        awayTeamId: teamId, // Using same team for demo
        tournamentId: tournamentId,
        date: new Date(),
        venue: 'Sample Field',
        status: 'scheduled',
      });

      // Reload data
      await loadSampleData();
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Firebase Integration Test</h1>

        {!user ? (
          <div className="max-w-md mx-auto">
            <div className="mb-6 text-center">
              <button
                onClick={() => setShowSignUp(!showSignUp)}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {showSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
            <AuthForm mode={showSignUp ? 'signup' : 'signin'} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* User Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">User Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>UID:</strong> {user.uid}
                </div>
                <div>
                  <strong>Display Name:</strong> {user.displayName || 'Not set'}
                </div>
                <div>
                  <button
                    onClick={logout}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Sample Data Controls */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Sample Data</h2>
              <button
                onClick={createSampleData}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
              >
                Create Sample Data
              </button>
              <button
                onClick={loadSampleData}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Refresh Data
              </button>
            </div>

            {/* Data Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clubs */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Clubs ({clubs.length})</h3>
                <div className="space-y-2">
                  {clubs.map((club) => (
                    <div key={club.id} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{club.name}</div>
                      <div className="text-sm text-gray-600">{club.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teams */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Teams ({teams.length})</h3>
                <div className="space-y-2">
                  {teams.map((team) => (
                    <div key={team.id} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-gray-600">{team.sport} - {team.ageGroup}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matches */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Matches ({matches.length})</h3>
                <div className="space-y-2">
                  {matches.map((match) => (
                    <div key={match.id} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">Match #{match.id.slice(-6)}</div>
                      <div className="text-sm text-gray-600">Status: {match.status}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tournaments */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Tournaments ({tournaments.length})</h3>
                <div className="space-y-2">
                  {tournaments.map((tournament) => (
                    <div key={tournament.id} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium">{tournament.name}</div>
                      <div className="text-sm text-gray-600">Status: {tournament.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 