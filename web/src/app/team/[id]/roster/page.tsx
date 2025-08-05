'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RosterManagement } from '@/components/roster/RosterManagement';
import { TeamService } from '@/lib/services/teamService';
import { Team } from '../../../../../shared/src/types';
import { useLocalAuth } from '@/hooks/useLocalApi';

export default function TeamRosterPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useLocalAuth();
  const teamId = params.id as string;
  
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const teamData = await TeamService.getTeam(teamId);
      if (!teamData) {
        setError('Team not found');
        return;
      }
      
      setTeam(teamData);
    } catch (error) {
      console.error('Error loading team:', error);
      setError('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const handleRosterUpdate = () => {
    // Refresh team data after roster changes
    loadTeam();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading team roster...</span>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Team Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested team could not be found.'}</p>
          <Button onClick={() => router.push('/teams')}>
            Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="text-sm"
              >
                ← Back
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">{team.name} - Roster</h1>
            </div>
            <p className="text-gray-600">
              Manage your team roster, add players, and track team composition
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/team/${team.id}`)}
            >
              Team Overview
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/team/${team.id}/schedule`)}
            >
              Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Team Info Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">{team.roster.players.length}</div>
            <div className="text-blue-100">Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{team.roster.coaches.length}</div>
            <div className="text-blue-100">Coaches</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{team.roster.managers.length}</div>
            <div className="text-blue-100">Managers</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{team.stats.matchesPlayed}</div>
            <div className="text-blue-100">Matches Played</div>
          </div>
        </div>
      </div>

      {/* Roster Management */}
      <RosterManagement 
        team={team} 
        onUpdate={handleRosterUpdate}
      />
    </div>
  );
} 