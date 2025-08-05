'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiveMatch, LiveMatchEvent, LiveMatchEventType, LiveMatchStatus } from '../../../../../../shared/src/types';
import { useLiveMatch } from '../../../../../../shared/src/hooks/useLiveMatch';

export default function LiveMatchPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [eventType, setEventType] = useState<LiveMatchEventType>('goal');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState<any>({});
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Use Firebase service with real-time updates
  const { 
    match, 
    events, 
    loading, 
    error, 
    startMatch, 
    endMatch, 
    addEvent 
  } = useLiveMatch({ matchId });

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setCurrentMinute(prev => prev + 1);
      }, 60000); // 1 minute intervals
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const handleStartMatch = async () => {
    if (!match) return;
    
    const success = await startMatch();
    if (success) {
      setIsTimerRunning(true);
      startTimeRef.current = new Date();
    }
  };

  const pauseMatch = () => {
    setIsTimerRunning(false);
  };

  const resumeMatch = () => {
    setIsTimerRunning(true);
  };

  const handleEndMatch = async () => {
    if (!match) return;
    
    const success = await endMatch();
    if (success) {
      setIsTimerRunning(false);
    }
  };

  const handleAddEvent = async () => {
    if (!match || !selectedPlayer) return;

    const success = await addEvent({
      type: eventType,
      minute: currentMinute,
      playerId: selectedPlayer,
      teamId: selectedTeam === 'home' ? match.homeTeamId : match.awayTeamId,
      data: eventData,
    });

    if (success) {
      // Reset form
      setShowEventForm(false);
      setSelectedPlayer('');
      setEventData({});
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Match not found</h2>
          <Button variant="default" onClick={() => router.push('/matches')}>
            Back to Matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/matches')}>
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Live Match Control</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                match.status === 'in_progress' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {match.status === 'in_progress' ? 'LIVE' : match.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Match Timer and Control */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Timer</h3>
              
              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
                  {formatTime(currentMinute)}
                </div>
                <p className="text-sm text-gray-600">Match Time</p>
              </div>

              {/* Timer Controls */}
              <div className="space-y-3 mb-6">
                {match.status === 'scheduled' && (
                                     <Button 
                     variant="default" 
                     className="w-full"
                     onClick={handleStartMatch}
                   >
                     Start Match
                   </Button>
                )}
                
                {match.status === 'in_progress' && (
                  <>
                    {isTimerRunning ? (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={pauseMatch}
                      >
                        Pause Match
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={resumeMatch}
                      >
                        Resume Match
                      </Button>
                    )}
                    
                                         <Button 
                       variant="destructive" 
                       className="w-full"
                       onClick={handleEndMatch}
                     >
                       End Match
                     </Button>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Home Goals:</span>
                    <span className="font-medium">{match.stats.homeTeam.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Away Goals:</span>
                    <span className="font-medium">{match.stats.awayTeam.goals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yellow Cards:</span>
                    <span className="font-medium">{match.stats.yellowCards.home + match.stats.yellowCards.away}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Red Cards:</span>
                    <span className="font-medium">{match.stats.redCards.home + match.stats.redCards.away}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Event Entry */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Event Entry</h3>
                <Button 
                  variant="default"
                  onClick={() => setShowEventForm(!showEventForm)}
                >
                  {showEventForm ? 'Cancel' : 'Add Event'}
                </Button>
              </div>

              {showEventForm && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Team Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value as 'home' | 'away')}
                      >
                        <option value="home">Home Team</option>
                        <option value="away">Away Team</option>
                      </select>
                    </div>

                    {/* Event Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as LiveMatchEventType)}
                      >
                        <option value="goal">Goal</option>
                        <option value="assist">Assist</option>
                        <option value="yellow_card">Yellow Card</option>
                        <option value="red_card">Red Card</option>
                        <option value="substitution_in">Substitution In</option>
                        <option value="substitution_out">Substitution Out</option>
                        <option value="injury">Injury</option>
                        <option value="penalty_goal">Penalty Goal</option>
                        <option value="penalty_miss">Penalty Miss</option>
                        <option value="own_goal">Own Goal</option>
                      </select>
                    </div>

                    {/* Player Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Player
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedPlayer}
                        onChange={(e) => setSelectedPlayer(e.target.value)}
                      >
                        <option value="">Select Player</option>
                        <option value="player1">Player 1</option>
                        <option value="player2">Player 2</option>
                        <option value="player3">Player 3</option>
                        <option value="player4">Player 4</option>
                      </select>
                    </div>

                    {/* Minute */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minute
                      </label>
                      <Input
                        type="number"
                        value={currentMinute}
                        onChange={(e) => setCurrentMinute(parseInt(e.target.value) || 0)}
                        min="0"
                        max="120"
                      />
                    </div>
                  </div>

                  {/* Additional Event Data */}
                  {eventType === 'goal' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Goal Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={eventData.goalType || ''}
                        onChange={(e) => setEventData({ ...eventData, goalType: e.target.value })}
                      >
                        <option value="">Select Goal Type</option>
                        <option value="open_play">Open Play</option>
                        <option value="penalty">Penalty</option>
                        <option value="free_kick">Free Kick</option>
                        <option value="corner">Corner</option>
                        <option value="own_goal">Own Goal</option>
                      </select>
                    </div>
                  )}

                  {(eventType === 'yellow_card' || eventType === 'red_card') && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter card reason..."
                        value={eventData.cardReason || ''}
                        onChange={(e) => setEventData({ ...eventData, cardReason: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="mt-6 flex space-x-3">
                                         <Button 
                       variant="default"
                       onClick={handleAddEvent}
                       disabled={!selectedPlayer}
                       className="flex-1"
                     >
                       Add Event
                     </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowEventForm(false);
                        setSelectedPlayer('');
                        setEventData({});
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Recent Events */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Events</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                                   {events.length === 0 ? (
                   <p className="text-gray-500 text-sm">No events recorded yet.</p>
                 ) : (
                   events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-900">
                            {event.minute}'
                          </div>
                          <div className="text-sm text-gray-600">
                            {event.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Player {event.playerId}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {event.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 