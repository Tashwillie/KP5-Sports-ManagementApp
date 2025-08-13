'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLiveMatch } from '@kp5-academy/shared';
import { LiveMatchControl } from '@/components/LiveMatchControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, Users, Calendar } from 'lucide-react';

export default function LiveMatchPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const matchId = params.id as string;

  const {
    match,
    events,
    loading,
    error,
    refresh
  } = useLiveMatch({ matchId, autoSubscribe: true, enableRealTime: true });

  const [homeTeam, setHomeTeam] = useState<any>(null);
  const [awayTeam, setAwayTeam] = useState<any>(null);

  // Load team data when match is available
  useEffect(() => {
    if (match) {
      // In a real implementation, you would load team details from the API
      // For now, we'll use placeholder data
      setHomeTeam({
        id: match.homeTeamId,
        name: `Team ${match.homeTeamId}`,
        logo: null
      });
      setAwayTeam({
        id: match.awayTeamId,
        name: `Team ${match.awayTeamId}`,
        logo: null
      });
    }
  }, [match]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading match data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="mb-4">Error: {error}</p>
              <Button onClick={() => refresh()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="mb-4">Match not found</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Matches
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Live Match</h1>
            <p className="text-gray-600">Real-time match tracking and updates</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={match.status === 'in_progress' ? 'default' : 'secondary'}>
              {match.status === 'in_progress' ? 'LIVE' : match.status?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <LiveMatchControl
            matchId={matchId}
            homeTeam={homeTeam?.name || `Team ${match.homeTeamId}`}
            awayTeam={awayTeam?.name || `Team ${match.awayTeamId}`}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Match Info */}
          <Card>
            <CardHeader>
              <CardTitle>Match Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {match.startTime ? new Date(match.startTime).toLocaleDateString() : 'TBD'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {match.startTime ? new Date(match.startTime).toLocaleTimeString() : 'TBD'}
                </span>
              </div>

              {match.venue && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{match.venue}</span>
                </div>
              )}

              {match.tournamentId && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Tournament:</span>
                  <p className="text-sm text-gray-600">Tournament {match.tournamentId}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Match Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Events:</span>
                  <span className="font-semibold">{events.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Goals:</span>
                  <span className="font-semibold">
                    {events.filter(e => e.type === 'goal').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Yellow Cards:</span>
                  <span className="font-semibold">
                    {events.filter(e => e.type === 'yellow_card').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Red Cards:</span>
                  <span className="font-semibold">
                    {events.filter(e => e.type === 'red_card').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center text-gray-500 text-sm">No events yet</div>
              ) : (
                <div className="space-y-2">
                  {events.slice(-5).reverse().map((event) => (
                    <div key={event.id} className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500 font-mono">{event.minute}'</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.type === 'goal' ? 'bg-green-100 text-green-800' :
                        event.type === 'yellow_card' ? 'bg-yellow-100 text-yellow-800' :
                        event.type === 'red_card' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 