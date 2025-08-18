'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { League, LeagueStanding, LeagueTeamStats } from '@shared/types';
import { leagueService } from '@/lib/services/leagueService';

interface StandingsRow {
  position: number;
  teamId: string;
  teamName: string;
  stats: LeagueTeamStats;
  form: string[];
  lastMatch?: Date;
}

export default function LeagueStandingsPage() {
  const params = useParams();
  const leagueId = params.id as string;
  
  const [league, setLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadLeagueData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadStandings();
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [leagueId, selectedDivision]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      const [leagueData, standingsData] = await Promise.all([
        leagueService.getLeague(leagueId),
        leagueService.getLeagueStandings(leagueId, selectedDivision),
      ]);
      
      setLeague(leagueData);
      setStandings(standingsData);
      
      if (leagueData.divisions.length > 0 && !selectedDivision) {
        setSelectedDivision(leagueData.divisions[0].id);
      }
    } catch (err) {
      setError('Failed to load league data');
      console.error('Error loading league:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStandings = async () => {
    try {
      const standingsData = await leagueService.getLeagueStandings(leagueId, selectedDivision);
      setStandings(standingsData);
    } catch (err) {
      console.error('Error loading standings:', err);
    }
  };

  const getTeamName = (teamId: string) => {
    // This would typically come from a teams service
    return `Team ${teamId}`;
  };

  const getFormDisplay = (form: string[]) => {
    return form.slice(-5).map(result => {
      switch (result) {
        case 'W':
          return '🟢';
        case 'D':
          return '🟡';
        case 'L':
          return '🔴';
        default:
          return '⚪';
      }
    }).join('');
  };

  const getPositionColor = (position: number) => {
    if (position <= 4) return 'bg-green-50 text-green-800';
    if (position <= 8) return 'bg-blue-50 text-blue-800';
    if (position >= standings.length - 3) return 'bg-red-50 text-red-800';
    return 'bg-gray-50 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading league standings...</p>
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'League not found'}</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentDivision = league.divisions.find(d => d.id === selectedDivision);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{league.name}</h1>
              <p className="text-gray-600 mt-1">League Standings</p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                {league.status.replace('_', ' ')}
              </Badge>
              <Button variant="outline" onClick={() => window.history.back()}>
                Back to League
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Division Selector */}
      {league.divisions.length > 1 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex space-x-2">
              {league.divisions.map(division => (
                <Button
                  key={division.id}
                  variant={selectedDivision === division.id ? 'default' : 'outline'}
                  onClick={() => setSelectedDivision(division.id)}
                >
                  {division.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Standings Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDivision?.name || 'League'} Standings
            </h2>
            <p className="text-gray-600 mt-1">
              {standings.length} teams • {league.season}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Pos</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">P</TableHead>
                  <TableHead className="text-center">W</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">GF</TableHead>
                  <TableHead className="text-center">GA</TableHead>
                  <TableHead className="text-center">GD</TableHead>
                  <TableHead className="text-center">Pts</TableHead>
                  <TableHead className="text-center">Form</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((standing, index) => (
                  <TableRow key={standing.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge className={getPositionColor(standing.position)}>
                        {standing.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getTeamName(standing.teamId)}
                    </TableCell>
                    <TableCell className="text-center">{standing.stats.matchesPlayed}</TableCell>
                    <TableCell className="text-center">{standing.stats.matchesWon}</TableCell>
                    <TableCell className="text-center">{standing.stats.matchesDrawn}</TableCell>
                    <TableCell className="text-center">{standing.stats.matchesLost}</TableCell>
                    <TableCell className="text-center">{standing.stats.goalsFor}</TableCell>
                    <TableCell className="text-center">{standing.stats.goalsAgainst}</TableCell>
                    <TableCell className="text-center">
                      <span className={standing.stats.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {standing.stats.goalDifference > 0 ? '+' : ''}{standing.stats.goalDifference}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold">{standing.stats.points}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm">{getFormDisplay(standing.stats.form || [])}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-50 text-green-800">1-4</Badge>
              <span>Championship/Playoff</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-50 text-blue-800">5-8</Badge>
              <span>Mid-table</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-red-50 text-red-800">Relegation</Badge>
              <span>Bottom 3</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🟢🟡🔴</span>
              <span>W/D/L Form</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 