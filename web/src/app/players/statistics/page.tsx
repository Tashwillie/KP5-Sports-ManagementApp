'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Player, PlayerStats, Team } from '../../../../shared/src/types';
import { playerService } from '@/lib/services/playerService';

interface PlayerStatsRow {
  player: Player;
  stats: PlayerStats;
  team: Team;
  rank: number;
}

interface StatCategory {
  id: string;
  name: string;
  key: keyof PlayerStats;
  format: 'number' | 'percentage' | 'time' | 'currency';
  sortDirection: 'asc' | 'desc';
}

const statCategories: StatCategory[] = [
  { id: 'goals', name: 'Goals', key: 'goals', format: 'number', sortDirection: 'desc' },
  { id: 'assists', name: 'Assists', key: 'assists', format: 'number', sortDirection: 'desc' },
  { id: 'matches', name: 'Matches', key: 'matchesPlayed', format: 'number', sortDirection: 'desc' },
  { id: 'minutes', name: 'Minutes', key: 'minutesPlayed', format: 'time', sortDirection: 'desc' },
  { id: 'cards', name: 'Cards', key: 'yellowCards', format: 'number', sortDirection: 'asc' },
  { id: 'redCards', name: 'Red Cards', key: 'redCards', format: 'number', sortDirection: 'asc' },
  { id: 'passAccuracy', name: 'Pass Accuracy', key: 'passAccuracy', format: 'percentage', sortDirection: 'desc' },
  { id: 'shotAccuracy', name: 'Shot Accuracy', key: 'shotAccuracy', format: 'percentage', sortDirection: 'desc' },
];

export default function PlayerStatisticsPage() {
  const [players, setPlayers] = useState<PlayerStatsRow[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerStatsRow[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedStat, setSelectedStat] = useState<string>('goals');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlayerData();
  }, []);

  useEffect(() => {
    filterAndSortPlayers();
  }, [players, selectedTeam, selectedPosition, selectedStat]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const [playersData, teamsData] = await Promise.all([
        playerService.getAllPlayersWithStats(),
        playerService.getTeams(),
      ]);
      
      const playersWithStats = playersData.map((player, index) => ({
        player,
        stats: player.stats || {
          goals: 0,
          assists: 0,
          matchesPlayed: 0,
          minutesPlayed: 0,
          yellowCards: 0,
          redCards: 0,
          passAccuracy: 0,
          shotAccuracy: 0,
        },
        team: teamsData.find(t => t.id === player.teamId) || {
          id: '',
          name: 'Unknown Team',
          clubId: '',
          division: '',
          ageGroup: '',
          gender: '',
          season: '',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        rank: 0,
      }));
      
      setPlayers(playersWithStats);
      setTeams(teamsData);
    } catch (err) {
      setError('Failed to load player data');
      console.error('Error loading players:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPlayers = () => {
    let filtered = [...players];

    // Filter by team
    if (selectedTeam !== 'all') {
      filtered = filtered.filter(p => p.player.teamId === selectedTeam);
    }

    // Filter by position
    if (selectedPosition !== 'all') {
      filtered = filtered.filter(p => p.player.position === selectedPosition);
    }

    // Sort by selected stat
    const selectedCategory = statCategories.find(cat => cat.id === selectedStat);
    if (selectedCategory) {
      filtered.sort((a, b) => {
        const aValue = a.stats[selectedCategory.key] as number;
        const bValue = b.stats[selectedCategory.key] as number;
        
        if (selectedCategory.sortDirection === 'desc') {
          return bValue - aValue;
        } else {
          return aValue - bValue;
        }
      });
    }

    // Add ranks
    filtered = filtered.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    setFilteredPlayers(filtered);
  };

  const formatStatValue = (value: number, format: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'time':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return `${hours}h ${minutes}m`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return value.toLocaleString();
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'goalkeeper':
        return 'bg-yellow-100 text-yellow-800';
      case 'defender':
        return 'bg-blue-100 text-blue-800';
      case 'midfielder':
        return 'bg-green-100 text-green-800';
      case 'forward':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'bg-yellow-100 text-yellow-800';
    if (rank <= 10) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading player statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button className="mt-4" onClick={loadPlayerData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const selectedCategory = statCategories.find(cat => cat.id === selectedStat);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Player Statistics</h1>
              <p className="text-gray-600 mt-1">Comprehensive player performance analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                {filteredPlayers.length} Players
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
                  <SelectItem value="defender">Defender</SelectItem>
                  <SelectItem value="midfielder">Midfielder</SelectItem>
                  <SelectItem value="forward">Forward</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statistic</label>
              <Select value={selectedStat} onValueChange={setSelectedStat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Stat" />
                </SelectTrigger>
                <SelectContent>
                  {statCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={loadPlayerData}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory?.name} Leaders
            </h2>
            <p className="text-gray-600 mt-1">
              Top performers in {selectedCategory?.name.toLowerCase()}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-center">{selectedCategory?.name}</TableHead>
                  <TableHead className="text-center">Goals</TableHead>
                  <TableHead className="text-center">Assists</TableHead>
                  <TableHead className="text-center">Matches</TableHead>
                  <TableHead className="text-center">Minutes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.slice(0, 50).map((player) => (
                  <TableRow key={player.player.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge className={getRankColor(player.rank)}>
                        #{player.rank}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{player.player.displayName}</div>
                        <div className="text-sm text-gray-500">#{player.player.jerseyNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{player.team.name}</TableCell>
                    <TableCell>
                      <Badge className={getPositionColor(player.player.position || '')}>
                        {player.player.position || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {selectedCategory && formatStatValue(
                        player.stats[selectedCategory.key] as number,
                        selectedCategory.format
                      )}
                    </TableCell>
                    <TableCell className="text-center">{player.stats.goals}</TableCell>
                    <TableCell className="text-center">{player.stats.assists}</TableCell>
                    <TableCell className="text-center">{player.stats.matchesPlayed}</TableCell>
                    <TableCell className="text-center">
                      {formatStatValue(player.stats.minutesPlayed, 'time')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Players</h3>
            <p className="text-3xl font-bold text-blue-600">{players.length}</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Goals</h3>
            <p className="text-3xl font-bold text-green-600">
              {players.reduce((sum, p) => sum + p.stats.goals, 0)}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Assists</h3>
            <p className="text-3xl font-bold text-purple-600">
              {players.reduce((sum, p) => sum + p.stats.assists, 0)}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Avg. Matches</h3>
            <p className="text-3xl font-bold text-orange-600">
              {(players.reduce((sum, p) => sum + p.stats.matchesPlayed, 0) / players.length).toFixed(1)}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
} 