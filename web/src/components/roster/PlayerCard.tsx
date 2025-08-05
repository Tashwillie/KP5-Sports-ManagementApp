'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Player, PlayerPosition } from '../../../../shared/src/types';
import { PlayerService } from '../../lib/services/playerService';

interface PlayerCardProps {
  player: Player;
  showActions?: boolean;
  onEdit?: (player: Player) => void;
  onViewStats?: (playerId: string) => void;
  onViewProfile?: (playerId: string) => void;
}

export function PlayerCard({ 
  player, 
  showActions = false, 
  onEdit, 
  onViewStats, 
  onViewProfile 
}: PlayerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const age = PlayerService.calculateAge(player.dateOfBirth);
  
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

  const getAvailabilityColor = (status: string): string => {
    const colors: Record<string, string> = {
      'available': 'bg-green-100 text-green-800',
      'unavailable': 'bg-gray-100 text-gray-800',
      'injured': 'bg-red-100 text-red-800',
      'suspended': 'bg-orange-100 text-orange-800',
      'on_leave': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (rating: number): string => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Player Header */}
      <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-600">
        {player.photoURL ? (
          <Image
            src={player.photoURL}
            alt={player.displayName || `${player.firstName} ${player.lastName}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-blue-600 text-3xl font-bold">
                {(player.firstName?.charAt(0) || '') + (player.lastName?.charAt(0) || '')}
              </span>
            </div>
          </div>
        )}
        
        {/* Jersey Number */}
        {player.jerseyNumber && (
          <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-blue-600 text-xl font-bold">
              {player.jerseyNumber}
            </span>
          </div>
        )}

        {/* Availability Status */}
        <div className="absolute top-4 right-4">
          <Badge className={getAvailabilityColor(player.availability.status)}>
            {player.availability.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Performance Rating */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
            <span className={`text-lg font-bold ${getPerformanceColor(player.performance.overallRating)}`}>
              {player.performance.overallRating}
            </span>
          </div>
        </div>
      </div>

      {/* Player Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {player.displayName || `${player.firstName} ${player.lastName}`}
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            {age} years old • {player.height}cm • {player.weight}kg
          </p>
          
          {/* Positions */}
          <div className="flex flex-wrap gap-2 mb-3">
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

          {/* Key Stats */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {player.stats.goals}
              </div>
              <div className="text-xs text-gray-500">Goals</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {player.stats.assists}
              </div>
              <div className="text-xs text-gray-500">Assists</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {player.stats.matchesPlayed}
              </div>
              <div className="text-xs text-gray-500">Matches</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {player.stats.minutesPlayed}
              </div>
              <div className="text-xs text-gray-500">Minutes</div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            {/* Performance Metrics */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Performance</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>Fitness:</span>
                  <span className={getPerformanceColor(player.performance.fitnessLevel)}>
                    {player.performance.fitnessLevel}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className={getPerformanceColor(player.performance.speed)}>
                    {player.performance.speed}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Strength:</span>
                  <span className={getPerformanceColor(player.performance.strength)}>
                    {player.performance.strength}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Leadership:</span>
                  <span className={getPerformanceColor(player.performance.leadership)}>
                    {player.performance.leadership}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Skills */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Technical Skills</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Passing</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${player.performance.passing * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs w-8 text-right">{player.performance.passing}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Shooting</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${player.performance.shooting * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs w-8 text-right">{player.performance.shooting}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Dribbling</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${player.performance.dribbling * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs w-8 text-right">{player.performance.dribbling}/10</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Defending</span>
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${player.performance.defending * 10}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs w-8 text-right">{player.performance.defending}/10</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Preferred Foot:</span>
                <div className="font-medium capitalize">
                  {player.preferredFoot || player.dominantFoot}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Potential:</span>
                <div className={`font-medium ${getPerformanceColor(player.performance.potentialRating)}`}>
                  {player.performance.potentialRating}/10
                </div>
              </div>
            </div>

            {/* Medical Info */}
            {player.medicalInfo.allergies.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Medical Notes</h4>
                <p className="text-xs text-red-600">
                  Allergies: {player.medicalInfo.allergies.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
          
          {showActions && (
            <>
              {onViewProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile(player.id)}
                >
                  Profile
                </Button>
              )}
              {onViewStats && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewStats(player.id)}
                >
                  Stats
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(player)}
                >
                  Edit
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
} 