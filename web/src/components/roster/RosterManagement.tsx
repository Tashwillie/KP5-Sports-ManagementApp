'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Player, Team, TeamMember, PlayerPosition } from '../../../../shared/src/types';
import { TeamService } from '../../lib/services/teamService';
import { PlayerService } from '../../lib/services/playerService';
import { useAuth } from '../providers/AuthProvider';

interface RosterManagementProps {
  team: Team;
  onUpdate?: () => void;
}

export function RosterManagement({ team, onUpdate }: RosterManagementProps) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<PlayerPosition | 'all'>('all');
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadRoster();
  }, [team.id]);

  const loadRoster = async () => {
    try {
      setLoading(true);
      
      // Load team members
      const members = await TeamService.getTeamMembers(team.id);
      setTeamMembers(members);

      // Load players for this team
      const teamPlayers = await PlayerService.getPlayersByTeam(team.id);
      setPlayers(teamPlayers);

      // Load available players from the club
      const clubPlayers = await PlayerService.getPlayersByClub(team.clubId);
      const available = clubPlayers.filter(player => !player.teamIds.includes(team.id));
      setAvailablePlayers(available);
    } catch (error) {
      console.error('Error loading roster:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (playerId: string, role: 'player' | 'coach' | 'manager', position?: string, jerseyNumber?: number) => {
    try {
      // Add player to team
      await TeamService.addTeamMember({
        teamId: team.id,
        userId: playerId,
        role,
        position: position || '',
        jerseyNumber: jerseyNumber || null,
        joinedAt: new Date(),
        isActive: true,
      });

      // Update player's teamIds
      const player = availablePlayers.find(p => p.id === playerId);
      if (player) {
        await PlayerService.updatePlayer(playerId, {
          teamIds: [...player.teamIds, team.id],
        });
      }

      await loadRoster();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding player to team:', error);
      alert('Failed to add player to team');
    }
  };

  const handleRemovePlayer = async (userId: string) => {
    try {
      if (!confirm('Are you sure you want to remove this player from the team?')) {
        return;
      }

      await TeamService.removeTeamMember(team.id, userId);

      // Update player's teamIds
      const player = players.find(p => p.userId === userId);
      if (player) {
        await PlayerService.updatePlayer(player.id, {
          teamIds: player.teamIds.filter(id => id !== team.id),
        });
      }

      await loadRoster();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing player from team:', error);
      alert('Failed to remove player from team');
    }
  };

  const handleUpdateJerseyNumber = async (userId: string, jerseyNumber: number | null) => {
    try {
      await TeamService.updateTeamMember(team.id, userId, { jerseyNumber });
      await loadRoster();
    } catch (error) {
      console.error('Error updating jersey number:', error);
      alert('Failed to update jersey number');
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPosition = selectedPosition === 'all' || 
                           player.positions?.includes(selectedPosition) ||
                           player.position === selectedPosition;

    return matchesSearch && matchesPosition;
  });

  const getPlayerRole = (userId: string): TeamMember | null => {
    return teamMembers.find(member => member.userId === userId) || null;
  };

  const canManageRoster = user && (
    user.id === team.createdBy || 
    user.role === 'super_admin' || 
    teamMembers.find(m => m.userId === user.id && m.role === 'manager')
  );

  const getPositionColor = (position: PlayerPosition): string => {
    const colors: Record<PlayerPosition, string> = {
      'goalkeeper': 'bg-yellow-100 text-yellow-800',
      'defender': 'bg-blue-100 text-blue-800',
      'midfielder': 'bg-green-100 text-green-800',
      'forward': 'bg-red-100 text-red-800',
      'striker': 'bg-purple-100 text-purple-800',
      'winger': 'bg-pink-100 text-pink-800',
      'fullback': 'bg-indigo-100 text-indigo-800',
      'centerback': 'bg-cyan-100 text-cyan-800',
      'defensive_midfielder': 'bg-emerald-100 text-emerald-800',
      'attacking_midfielder': 'bg-orange-100 text-orange-800',
      'utility': 'bg-gray-100 text-gray-800',
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading roster...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Roster</h2>
          <p className="text-gray-600">
            {players.length} players • {teamMembers.filter(m => m.role === 'coach').length} coaches • {teamMembers.filter(m => m.role === 'manager').length} managers
          </p>
        </div>
        
        {canManageRoster && (
          <Button onClick={() => setShowAddPlayer(true)}>
            Add Player
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search players by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value as PlayerPosition | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Positions</option>
          <option value="goalkeeper">Goalkeeper</option>
          <option value="defender">Defender</option>
          <option value="midfielder">Midfielder</option>
          <option value="forward">Forward</option>
          <option value="striker">Striker</option>
          <option value="winger">Winger</option>
          <option value="fullback">Fullback</option>
          <option value="centerback">Center Back</option>
          <option value="defensive_midfielder">Defensive Midfielder</option>
          <option value="attacking_midfielder">Attacking Midfielder</option>
          <option value="utility">Utility</option>
        </select>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => {
          const member = getPlayerRole(player.userId);
          const age = PlayerService.calculateAge(player.dateOfBirth);
          
          return (
            <Card key={player.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {player.photoURL ? (
                      <img
                        src={player.photoURL}
                        alt={player.displayName || `${player.firstName} ${player.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 font-semibold">
                        {(player.firstName?.charAt(0) || '') + (player.lastName?.charAt(0) || '')}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {player.displayName || `${player.firstName} ${player.lastName}`}
                    </h3>
                    <p className="text-sm text-gray-500">{age} years old</p>
                  </div>
                </div>
                
                {member?.jerseyNumber && (
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {member.jerseyNumber}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {/* Position */}
                <div className="flex flex-wrap gap-1">
                  {player.positions?.map((position) => (
                    <Badge
                      key={position}
                      className={`text-xs ${getPositionColor(position)}`}
                    >
                      {PlayerService.getPositionDisplayName(position)}
                    </Badge>
                  )) || (
                    <Badge className={`text-xs ${getPositionColor(player.position)}`}>
                      {PlayerService.getPositionDisplayName(player.position)}
                    </Badge>
                  )}
                </div>

                {/* Role */}
                {member && (
                  <Badge variant="outline" className="text-xs">
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">{player.stats.goals}</span> Goals
                  </div>
                  <div>
                    <span className="font-medium">{player.stats.assists}</span> Assists
                  </div>
                  <div>
                    <span className="font-medium">{player.stats.matchesPlayed}</span> Matches
                  </div>
                </div>

                {/* Actions */}
                {canManageRoster && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newNumber = prompt('Enter jersey number (or leave empty to remove):');
                        if (newNumber !== null) {
                          const number = newNumber.trim() === '' ? null : parseInt(newNumber);
                          handleUpdateJerseyNumber(player.userId, number);
                        }
                      }}
                    >
                      Jersey #
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePlayer(player.userId)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPlayers.length === 0 && (
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No players found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedPosition !== 'all'
              ? 'No players match your search criteria.'
              : 'This team has no players yet.'}
          </p>
          {canManageRoster && (
            <div className="mt-6">
              <Button onClick={() => setShowAddPlayer(true)}>
                Add Your First Player
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddPlayerModal
              team={team}
              availablePlayers={availablePlayers}
              onAdd={handleAddPlayer}
              onClose={() => setShowAddPlayer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Add Player Modal Component
interface AddPlayerModalProps {
  team: Team;
  availablePlayers: Player[];
  onAdd: (playerId: string, role: 'player' | 'coach' | 'manager', position?: string, jerseyNumber?: number) => void;
  onClose: () => void;
}

function AddPlayerModal({ team, availablePlayers, onAdd, onClose }: AddPlayerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [role, setRole] = useState<'player' | 'coach' | 'manager'>('player');
  const [position, setPosition] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState<number | null>(null);

  const filteredPlayers = availablePlayers.filter(player =>
    player.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedPlayer) return;
    
    onAdd(selectedPlayer.id, role, position || undefined, jerseyNumber || undefined);
    onClose();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Add Player to {team.name}</h3>
        <p className="text-gray-600">Select a player from your club to add to the team</p>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Players
          </label>
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Available Players */}
        <div className="max-h-60 overflow-y-auto border rounded-md p-2">
          {filteredPlayers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No available players found</p>
          ) : (
            <div className="space-y-2">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 rounded-md cursor-pointer border ${
                    selectedPlayer?.id === player.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {player.displayName || `${player.firstName} ${player.lastName}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {PlayerService.getPositionDisplayName(player.position)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {PlayerService.calculateAge(player.dateOfBirth)} years
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'player' | 'coach' | 'manager')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="player">Player</option>
            <option value="coach">Coach</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        {/* Position (for players) */}
        {role === 'player' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position (optional)
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select position</option>
              <option value="goalkeeper">Goalkeeper</option>
              <option value="defender">Defender</option>
              <option value="midfielder">Midfielder</option>
              <option value="forward">Forward</option>
              <option value="striker">Striker</option>
              <option value="winger">Winger</option>
              <option value="fullback">Fullback</option>
              <option value="centerback">Center Back</option>
              <option value="defensive_midfielder">Defensive Midfielder</option>
              <option value="attacking_midfielder">Attacking Midfielder</option>
              <option value="utility">Utility</option>
            </select>
          </div>
        )}

        {/* Jersey Number */}
        {role === 'player' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jersey Number (optional)
            </label>
            <Input
              type="number"
              min="1"
              max="99"
              placeholder="Enter jersey number"
              value={jerseyNumber || ''}
              onChange={(e) => setJerseyNumber(e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t mt-6">
        <Button
          onClick={handleSubmit}
          disabled={!selectedPlayer}
          className="flex-1"
        >
          Add to Team
        </Button>
        
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
} 