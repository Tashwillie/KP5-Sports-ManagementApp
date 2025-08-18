'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TournamentMatch } from '@/lib/services/tournamentsApiService';
import { Play, Pause, Square, Plus, Minus, Clock, Users, Trophy, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface LiveMatchTrackerProps {
  match: TournamentMatch;
  onMatchUpdate?: (matchId: string, updates: Partial<TournamentMatch>) => void;
  isReferee?: boolean;
}

interface MatchEvent {
  id: string;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'INJURY' | 'OTHER';
  playerId?: string;
  playerName?: string;
  teamId: string;
  teamName: string;
  minute: number;
  description: string;
  timestamp: Date;
}

interface MatchStats {
  homeTeam: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
  };
  awayTeam: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
    yellowCards: number;
    redCards: number;
  };
}

export const LiveMatchTracker: React.FC<LiveMatchTrackerProps> = ({
  match,
  onMatchUpdate,
  isReferee = false
}) => {
  const [matchTime, setMatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [stats, setStats] = useState<MatchStats>({
    homeTeam: {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
    },
    awayTeam: {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
    }
  });
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<MatchEvent['type']>('GOAL');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [eventDescription, setEventDescription] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');

  const { isConnected, send } = useWebSocket();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused]);

  // WebSocket connection for live updates
  useEffect(() => {
    if (isConnected && match.status === 'IN_PROGRESS') {
      send('SUBSCRIBE_MATCH', { matchId: match.id });
    }
  }, [isConnected, match.id, match.status, send]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startMatch = () => {
    if (onMatchUpdate) {
      onMatchUpdate(match.id, { status: 'IN_PROGRESS' });
      setIsRunning(true);
      setIsPaused(false);
      toast.success('Match started!');
    }
  };

  const pauseMatch = () => {
    setIsPaused(true);
    toast.info('Match paused');
  };

  const resumeMatch = () => {
    setIsPaused(false);
    toast.info('Match resumed');
  };

  const endMatch = () => {
    if (onMatchUpdate) {
      onMatchUpdate(match.id, { status: 'COMPLETED' });
      setIsRunning(false);
      setIsPaused(false);
      toast.success('Match completed!');
    }
  };

  const addGoal = (team: 'home' | 'away') => {
    if (!isReferee) {
      toast.error('Only referees can add goals');
      return;
    }

    const currentScore = team === 'home' ? (match.homeScore || 0) : (match.awayScore || 0);
    const newScore = currentScore + 1;
    
    if (onMatchUpdate) {
      const updates = team === 'home' 
        ? { homeScore: newScore }
        : { awayScore: newScore };
      
      onMatchUpdate(match.id, updates);
    }

    // Add event
    const newEvent: MatchEvent = {
      id: Date.now().toString(),
      type: 'GOAL',
      teamId: team === 'home' ? match.homeTeam.id : match.awayTeam.id,
      teamName: team === 'home' ? match.homeTeam.name : match.awayTeam.name,
      minute: Math.floor(matchTime / 60),
      description: `Goal scored by ${team === 'home' ? match.homeTeam.name : match.awayTeam.name}`,
      timestamp: new Date()
    };

    setEvents(prev => [...prev, newEvent]);
    toast.success(`Goal! ${team === 'home' ? match.homeTeam.name : match.awayTeam.name} scores!`);
  };

  const addCard = (team: 'home' | 'away', cardType: 'YELLOW_CARD' | 'RED_CARD') => {
    if (!isReferee) {
      toast.error('Only referees can add cards');
      return;
    }

    const teamStats = team === 'home' ? stats.homeTeam : stats.awayTeam;
    const newStats = { ...stats };
    
    if (cardType === 'YELLOW_CARD') {
      newStats[team === 'home' ? 'homeTeam' : 'awayTeam'].yellowCards = teamStats.yellowCards + 1;
    } else {
      newStats[team === 'home' ? 'homeTeam' : 'awayTeam'].redCards = teamStats.redCards + 1;
    }

    setStats(newStats);

    // Add event
    const newEvent: MatchEvent = {
      id: Date.now().toString(),
      type: cardType,
      teamId: team === 'home' ? match.homeTeam.id : match.awayTeam.id,
      teamName: team === 'home' ? match.homeTeam.name : match.awayTeam.name,
      minute: Math.floor(matchTime / 60),
      description: `${cardType === 'YELLOW_CARD' ? 'Yellow' : 'Red'} card for ${team === 'home' ? match.homeTeam.name : match.awayTeam.name}`,
      timestamp: new Date()
    };

    setEvents(prev => [...prev, newEvent]);
    toast.info(`${cardType === 'YELLOW_CARD' ? 'Yellow' : 'Red'} card issued`);
  };

  const addEvent = () => {
    if (!eventDescription.trim()) {
      toast.error('Please enter event description');
      return;
    }

    const newEvent: MatchEvent = {
      id: Date.now().toString(),
      type: selectedEventType,
      teamId: selectedTeam === 'home' ? match.homeTeam.id : match.awayTeam.id,
      teamName: selectedTeam === 'home' ? match.homeTeam.name : match.awayTeam.name,
      minute: Math.floor(matchTime / 60),
      description: eventDescription,
      timestamp: new Date()
    };

    setEvents(prev => [...prev, newEvent]);
    setShowEventForm(false);
    setEventDescription('');
    toast.success('Event added successfully');
  };

  const updateStats = (team: 'home' | 'away', stat: keyof MatchStats['homeTeam'], value: number) => {
    if (!isReferee) {
      toast.error('Only referees can update statistics');
      return;
    }

    const newStats = { ...stats };
    newStats[team === 'home' ? 'homeTeam' : 'awayTeam'][stat] = value;
    setStats(newStats);
  };

  if (!match) {
    return (
      <div className="text-center py-8">
        <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No match selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Live Match Tracker</h2>
          <div className="flex items-center space-x-2">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Live' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Teams and Score */}
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Home Team */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {match.homeTeam.logo && (
                <img
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  className="w-12 h-12 rounded-lg object-cover mr-3"
                />
              )}
              <h3 className="text-lg font-semibold">{match.homeTeam.name}</h3>
            </div>
            <div className="text-4xl font-bold text-blue-600">{match.homeScore || 0}</div>
          </div>

          {/* Match Info */}
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
              {formatTime(matchTime)}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {match.status === 'IN_PROGRESS' ? 'LIVE' : match.status}
            </div>
            
            {/* Match Controls */}
            {isReferee && (
              <div className="flex justify-center space-x-2">
                {!isRunning ? (
                  <button
                    onClick={startMatch}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Play size={16} className="mr-2" />
                    Start
                  </button>
                ) : (
                  <>
                    {!isPaused ? (
                      <button
                        onClick={pauseMatch}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center"
                      >
                        <Pause size={16} className="mr-2" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={resumeMatch}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Play size={16} className="mr-2" />
                        Resume
                      </button>
                    )}
                    <button
                      onClick={endMatch}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Square size={16} className="mr-2" />
                      End
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <h3 className="text-lg font-semibold mr-3">{match.awayTeam.name}</h3>
              {match.awayTeam.logo && (
                <img
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
            </div>
            <div className="text-4xl font-bold text-red-600">{match.awayScore || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isReferee && match.status === 'IN_PROGRESS' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          {/* Goals */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add Goal</h4>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={() => addGoal('home')}
                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  {match.homeTeam.name}
                </button>
                <button
                  onClick={() => addGoal('away')}
                  className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  {match.awayTeam.name}
                </button>
              </div>
            </div>

            {/* Cards */}
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add Card</h4>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={() => addCard('home', 'YELLOW_CARD')}
                  className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition-colors"
                >
                  Yellow
                </button>
                <button
                  onClick={() => addCard('home', 'RED_CARD')}
                  className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Red
                </button>
              </div>
              <div className="flex space-x-2 justify-center mt-2">
                <button
                  onClick={() => addCard('away', 'YELLOW_CARD')}
                  className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition-colors"
                >
                  Yellow
                </button>
                <button
                  onClick={() => addCard('away', 'RED_CARD')}
                  className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Red
                </button>
              </div>
            </div>
          </div>

          {/* Custom Event */}
          <div className="text-center">
            <button
              onClick={() => setShowEventForm(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Add Custom Event
            </button>
          </div>
        </div>
      )}

      {/* Match Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Statistics</h3>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Home Team Stats */}
          <div className="text-center">
            <h4 className="font-medium text-gray-700 mb-3">{match.homeTeam.name}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Possession:</span>
                <span>{stats.homeTeam.possession}%</span>
              </div>
              <div className="flex justify-between">
                <span>Shots:</span>
                <span>{stats.homeTeam.shots}</span>
              </div>
              <div className="flex justify-between">
                <span>Shots on Target:</span>
                <span>{stats.homeTeam.shotsOnTarget}</span>
              </div>
              <div className="flex justify-between">
                <span>Corners:</span>
                <span>{stats.homeTeam.corners}</span>
              </div>
              <div className="flex justify-between">
                <span>Fouls:</span>
                <span>{stats.homeTeam.fouls}</span>
              </div>
              <div className="flex justify-between">
                <span>Yellow Cards:</span>
                <span className="text-yellow-600 font-semibold">{stats.homeTeam.yellowCards}</span>
              </div>
              <div className="flex justify-between">
                <span>Red Cards:</span>
                <span className="text-red-600 font-semibold">{stats.homeTeam.redCards}</span>
              </div>
            </div>
          </div>

          {/* Match Events Timeline */}
          <div className="col-span-2">
            <h4 className="font-medium text-gray-700 mb-3">Match Events</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No events recorded yet</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded"
                  >
                    <div className="text-xs text-gray-500 min-w-[40px]">
                      {event.minute}'
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{event.description}</div>
                      <div className="text-xs text-gray-500">{event.teamName}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      event.type === 'GOAL' ? 'bg-green-100 text-green-800' :
                      event.type === 'YELLOW_CARD' ? 'bg-yellow-100 text-yellow-800' :
                      event.type === 'RED_CARD' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Custom Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value as MatchEvent['type'])}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GOAL">Goal</option>
                  <option value="YELLOW_CARD">Yellow Card</option>
                  <option value="RED_CARD">Red Card</option>
                  <option value="SUBSTITUTION">Substitution</option>
                  <option value="INJURY">Injury</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value as 'home' | 'away')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="home">{match.homeTeam.name}</option>
                  <option value="away">{match.awayTeam.name}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the event..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEventForm(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addEvent}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMatchTracker;
