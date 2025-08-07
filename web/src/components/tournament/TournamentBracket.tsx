"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Edit, 
  Plus, 
  Trash2,
  ChevronRight,
  ChevronDown,
  Award,
  Target
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  logo?: string;
  seed?: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
}

interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Score?: number;
  team2Score?: number;
  winnerId?: string;
  round: number;
  matchNumber: number;
  scheduledTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  venue?: string;
}

interface TournamentBracketProps {
  tournamentId: string;
  teams: Team[];
  matches: Match[];
  bracketType: 'single_elimination' | 'double_elimination' | 'round_robin';
  onMatchUpdate: (matchId: string, updates: Partial<Match>) => void;
  onTeamAdvance: (matchId: string, winnerId: string) => void;
}

export function TournamentBracket({
  tournamentId,
  teams,
  matches,
  bracketType,
  onMatchUpdate,
  onTeamAdvance
}: TournamentBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isEditingMatch, setIsEditingMatch] = useState(false);
  const [matchScore1, setMatchScore1] = useState('');
  const [matchScore2, setMatchScore2] = useState('');

  const getTeamById = (teamId: string) => {
    return teams.find(team => team.id === teamId);
  };

  const getMatchesByRound = (round: number) => {
    return matches.filter(match => match.round === round);
  };

  const getMaxRounds = () => {
    return Math.max(...matches.map(match => match.round));
  };

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setMatchScore1(match.team1Score?.toString() || '');
    setMatchScore2(match.team2Score?.toString() || '');
  };

  const handleUpdateScore = () => {
    if (!selectedMatch) return;

    const score1 = parseInt(matchScore1) || 0;
    const score2 = parseInt(matchScore2) || 0;
    const winnerId = score1 > score2 ? selectedMatch.team1Id : 
                    score2 > score1 ? selectedMatch.team2Id : undefined;

    onMatchUpdate(selectedMatch.id, {
      team1Score: score1,
      team2Score: score2,
      winnerId,
      status: 'completed'
    });

    if (winnerId) {
      onTeamAdvance(selectedMatch.id, winnerId);
    }

    setIsEditingMatch(false);
  };

  const renderMatch = (match: Match) => {
    const team1 = getTeamById(match.team1Id);
    const team2 = getTeamById(match.team2Id);
    const isCompleted = match.status === 'completed';
    const isInProgress = match.status === 'in_progress';

    return (
      <Card 
        key={match.id}
        className={`mb-4 cursor-pointer transition-all hover:shadow-md ${
          selectedMatch?.id === match.id ? 'ring-2 ring-blue-500' : ''
        } ${isCompleted ? 'bg-green-50' : isInProgress ? 'bg-yellow-50' : ''}`}
        onClick={() => handleMatchClick(match)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant={match.status === 'completed' ? 'default' : 'secondary'}>
              {match.status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-gray-500">Match {match.matchNumber}</span>
          </div>

          <div className="space-y-2">
            {/* Team 1 */}
            <div className={`flex items-center justify-between p-2 rounded ${
              match.winnerId === match.team1Id ? 'bg-green-100' : ''
            }`}>
              <div className="flex items-center space-x-2">
                {team1?.logo && (
                  <img src={team1.logo} alt={team1.name} className="w-6 h-6 rounded-full" />
                )}
                <span className="font-medium">{team1?.name || 'TBD'}</span>
                {team1?.seed && (
                  <Badge variant="outline" className="text-xs">#{team1.seed}</Badge>
                )}
              </div>
              <span className="font-bold text-lg">
                {match.team1Score !== undefined ? match.team1Score : '-'}
              </span>
            </div>

            {/* Team 2 */}
            <div className={`flex items-center justify-between p-2 rounded ${
              match.winnerId === match.team2Id ? 'bg-green-100' : ''
            }`}>
              <div className="flex items-center space-x-2">
                {team2?.logo && (
                  <img src={team2.logo} alt={team2.name} className="w-6 h-6 rounded-full" />
                )}
                <span className="font-medium">{team2?.name || 'TBD'}</span>
                {team2?.seed && (
                  <Badge variant="outline" className="text-xs">#{team2.seed}</Badge>
                )}
              </div>
              <span className="font-bold text-lg">
                {match.team2Score !== undefined ? match.team2Score : '-'}
              </span>
            </div>
          </div>

          {match.scheduledTime && (
            <div className="mt-2 text-sm text-gray-500 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(match.scheduledTime).toLocaleString()}</span>
            </div>
          )}

          {match.venue && (
            <div className="mt-1 text-sm text-gray-500 flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{match.venue}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderRound = (round: number) => {
    const roundMatches = getMatchesByRound(round);
    const isFinal = round === getMaxRounds();

    return (
      <div key={round} className="flex-1">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-lg">
            {isFinal ? 'Final' : `Round ${round}`}
          </h3>
          {isFinal && (
            <div className="flex items-center justify-center mt-2">
              <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-600">Championship</span>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {roundMatches.map(renderMatch)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-2xl font-bold">Tournament Bracket</h2>
            <p className="text-gray-600 capitalize">
              {bracketType.replace('_', ' ')} Tournament
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {teams.length} Teams
        </Badge>
      </div>

      {/* Bracket Display */}
      <div className="flex space-x-8 overflow-x-auto pb-4">
        {Array.from({ length: getMaxRounds() }, (_, i) => i + 1).map(renderRound)}
      </div>

      {/* Match Details Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Match Details</DialogTitle>
          </DialogHeader>
          
          {selectedMatch && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Team 1 Score</Label>
                  <Input
                    type="number"
                    value={matchScore1}
                    onChange={(e) => setMatchScore1(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Team 2 Score</Label>
                  <Input
                    type="number"
                    value={matchScore2}
                    onChange={(e) => setMatchScore2(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleUpdateScore}
                  className="flex-1"
                  disabled={!matchScore1 || !matchScore2}
                >
                  Update Score
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingMatch(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TournamentBracket;