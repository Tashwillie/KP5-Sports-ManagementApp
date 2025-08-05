'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tournament, TournamentBracket, TournamentMatch } from '../../../../../shared/src/types';
import { tournamentService } from '@/lib/services/tournamentService';

interface BracketMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledTime?: Date;
  winner?: string;
}

interface BracketRound {
  id: string;
  name: string;
  matches: BracketMatch[];
}

export default function TournamentBracketsPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [brackets, setBrackets] = useState<TournamentBracket[]>([]);
  const [selectedBracket, setSelectedBracket] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentData, bracketsData] = await Promise.all([
        tournamentService.getTournament(tournamentId),
        tournamentService.getTournamentBrackets(tournamentId),
      ]);
      
      setTournament(tournamentData);
      setBrackets(bracketsData);
      
      if (bracketsData.length > 0) {
        setSelectedBracket(bracketsData[0].id);
      }
    } catch (err) {
      setError('Failed to load tournament data');
      console.error('Error loading tournament:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBracketRounds = (bracket: TournamentBracket): BracketRound[] => {
    return bracket.rounds.map(round => ({
      id: round.id,
      name: round.name,
      matches: round.matches.map(match => ({
        id: match.id,
        homeTeam: match.homeTeamId,
        awayTeam: match.awayTeamId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status,
        scheduledTime: match.scheduledDate,
        winner: match.winner,
      })),
    }));
  };

  const getTeamName = (teamId: string) => {
    // This would typically come from a teams service
    return `Team ${teamId}`;
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tournament brackets...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Tournament not found'}</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentBracket = brackets.find(b => b.id === selectedBracket);
  const rounds = currentBracket ? getBracketRounds(currentBracket) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
              <p className="text-gray-600 mt-1">Tournament Brackets</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                {tournament.status.replace('_', ' ')}
              </Badge>
              <Button variant="outline" onClick={() => window.history.back()}>
                Back to Tournament
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bracket Selector */}
      {brackets.length > 1 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex space-x-2">
              {brackets.map(bracket => (
                <Button
                  key={bracket.id}
                  variant={selectedBracket === bracket.id ? 'default' : 'outline'}
                  onClick={() => setSelectedBracket(bracket.id)}
                >
                  {bracket.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bracket Visualization */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentBracket ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">{currentBracket.name}</h2>
              <p className="text-gray-600 mt-1">{currentBracket.type.replace('_', ' ')} Tournament</p>
            </div>
            
            <div className="p-6">
              <div className="flex space-x-8 overflow-x-auto">
                {rounds.map((round, roundIndex) => (
                  <div key={round.id} className="flex-shrink-0">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                      {round.name}
                    </h3>
                    <div className="space-y-4">
                      {round.matches.map((match, matchIndex) => (
                        <Card key={match.id} className="p-4 min-w-[280px]">
                          <div className="space-y-2">
                            {/* Home Team */}
                            <div className={`flex items-center justify-between p-2 rounded ${
                              match.winner === match.homeTeam ? 'bg-green-50 border border-green-200' : ''
                            }`}>
                              <span className="font-medium">{getTeamName(match.homeTeam)}</span>
                              <span className="text-lg font-bold">{match.homeScore || 0}</span>
                            </div>
                            
                            {/* Away Team */}
                            <div className={`flex items-center justify-between p-2 rounded ${
                              match.winner === match.awayTeam ? 'bg-green-50 border border-green-200' : ''
                            }`}>
                              <span className="font-medium">{getTeamName(match.awayTeam)}</span>
                              <span className="text-lg font-bold">{match.awayScore || 0}</span>
                            </div>
                            
                            {/* Match Info */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <Badge className={getMatchStatusColor(match.status)}>
                                {match.status.replace('_', ' ')}
                              </Badge>
                              {match.scheduledTime && (
                                <span className="text-sm text-gray-500">
                                  {new Date(match.scheduledTime).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Brackets Available</h3>
            <p className="text-gray-600">Brackets will be generated once registration closes.</p>
          </div>
        )}
      </div>
    </div>
  );
} 