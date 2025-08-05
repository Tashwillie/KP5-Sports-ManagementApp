'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Team } from '../../../../shared/src/types';

interface TeamCardProps {
  team: Team;
  showActions?: boolean;
  onEdit?: (team: Team) => void;
  onDelete?: (teamId: string) => void;
  onManageRoster?: (teamId: string) => void;
}

export function TeamCard({ team, showActions = false, onEdit, onDelete, onManageRoster }: TeamCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await onDelete(team.id);
      } catch (error) {
        console.error('Error deleting team:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getWinPercentage = () => {
    const total = team.stats.wins + team.stats.losses + team.stats.draws;
    if (total === 0) return 0;
    return Math.round((team.stats.wins / total) * 100);
  };

  const getGoalDifference = () => {
    return team.stats.goalsFor - team.stats.goalsAgainst;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Team Header */}
      <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
        {team.logoURL ? (
          <Image
            src={team.logoURL}
            alt={`${team.name} logo`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-blue-600 text-2xl font-bold">
                {team.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant={team.isActive ? 'default' : 'secondary'}>
            {team.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Jersey Colors Preview */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          <div 
            className="w-6 h-4 rounded border border-white"
            style={{ backgroundColor: team.jerseyColors.primary }}
          />
          <div 
            className="w-6 h-4 rounded border border-white"
            style={{ backgroundColor: team.jerseyColors.secondary }}
          />
        </div>
      </div>

      {/* Team Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {team.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {team.description || 'No description available'}
          </p>
          
          {/* Team Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Division:</span>
              <div className="font-medium">{team.division}</div>
            </div>
            <div>
              <span className="text-gray-500">Season:</span>
              <div className="font-medium">{team.season}</div>
            </div>
            <div>
              <span className="text-gray-500">Age Group:</span>
              <div className="font-medium">{team.ageGroup.category}</div>
            </div>
            <div>
              <span className="text-gray-500">Players:</span>
              <div className="font-medium">{team.roster.players.length}</div>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Season Stats</h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {team.stats.wins}
              </div>
              <div className="text-xs text-gray-500">Wins</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {team.stats.losses}
              </div>
              <div className="text-xs text-gray-500">Losses</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                {team.stats.draws}
              </div>
              <div className="text-xs text-gray-500">Draws</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {getWinPercentage()}%
              </div>
              <div className="text-xs text-gray-500">Win %</div>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span>Goals: {team.stats.goalsFor} - {team.stats.goalsAgainst}</span>
              <span className={getGoalDifference() >= 0 ? 'text-green-600' : 'text-red-600'}>
                {getGoalDifference() >= 0 ? '+' : ''}{getGoalDifference()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Points: {team.stats.points}</span>
              <span>Matches: {team.stats.matchesPlayed}</span>
            </div>
          </div>
        </div>

        {/* Team Settings */}
        {team.settings && (
          <div className="flex flex-wrap gap-2 mb-4">
            {team.settings.isPublic && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
            {team.settings.allowJoinRequests && (
              <Badge variant="outline" className="text-xs">
                Open Join
              </Badge>
            )}
            {team.settings.requireApproval && (
              <Badge variant="outline" className="text-xs">
                Approval Required
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/team/${team.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          
          {showActions && (
            <>
              {onManageRoster && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageRoster(team.id)}
                >
                  Roster
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(team)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
} 