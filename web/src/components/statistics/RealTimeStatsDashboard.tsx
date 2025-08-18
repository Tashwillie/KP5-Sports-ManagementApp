'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TournamentMatch } from '@/lib/services/tournamentsApiService';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  Clock, 
  Award, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface RealTimeStatsDashboardProps {
  match: TournamentMatch;
  isLive?: boolean;
}

interface PlayerStats {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  position: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
  fouls: number;
}

interface TeamStats {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  passes: number;
  passAccuracy: number;
  tackles: number;
  saves: number;
  offsides: number;
}

interface MatchAnalytics {
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  players: PlayerStats[];
  matchEvents: any[];
  possessionHistory: { time: number; home: number; away: number }[];
  momentum: { time: number; home: number; away: number }[];
}

export const RealTimeStatsDashboard: React.FC<RealTimeStatsDashboardProps> = ({
  match,
  isLive = false
}) => {
  const [analytics, setAnalytics] = useState<MatchAnalytics>({
    homeTeam: {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
      passes: 0,
      passAccuracy: 0,
      tackles: 0,
      saves: 0,
      offsides: 0,
    },
    awayTeam: {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0,
      passes: 0,
      passAccuracy: 0,
      tackles: 0,
      saves: 0,
      offsides: 0,
    },
    players: [],
    matchEvents: [],
    possessionHistory: [],
    momentum: []
  });

  const [selectedView, setSelectedView] = useState<'overview' | 'players' | 'analytics' | 'charts'>('overview');
  const [timeRange, setTimeRange] = useState<'match' | 'period' | 'last15'>('match');

  const { isConnected, send } = useWebSocket();

  // WebSocket connection for live updates
  useEffect(() => {
    if (isConnected && isLive && match.status === 'IN_PROGRESS') {
      send('SUBSCRIBE_MATCH_STATS', { matchId: match.id });
    }
  }, [isConnected, isLive, match.id, match.status, send]);

  // Simulate real-time data updates
  useEffect(() => {
    if (!isLive || match.status !== 'IN_PROGRESS') return;

    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        possessionHistory: [
          ...prev.possessionHistory,
          {
            time: Date.now(),
            home: Math.max(30, Math.min(70, prev.homeTeam.possession + (Math.random() - 0.5) * 2)),
            away: Math.max(30, Math.min(70, prev.awayTeam.possession + (Math.random() - 0.5) * 2))
          }
        ].slice(-20), // Keep last 20 data points
        momentum: [
          ...prev.momentum,
          {
            time: Date.now(),
            home: Math.random() * 100,
            away: Math.random() * 100
          }
        ].slice(-20)
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive, match.status]);

  const calculatePossession = useMemo(() => {
    const total = analytics.homeTeam.possession + analytics.awayTeam.possession;
    if (total === 0) return { home: 50, away: 50 };
    
    return {
      home: Math.round((analytics.homeTeam.possession / total) * 100),
      away: Math.round((analytics.awayTeam.possession / total) * 100)
    };
  }, [analytics.homeTeam.possession, analytics.awayTeam.possession]);

  const getTopPerformers = useMemo(() => {
    return analytics.players
      .sort((a, b) => (b.goals * 3 + b.assists * 2 + b.shotsOnTarget) - (a.goals * 3 + a.assists * 2 + a.shotsOnTarget))
      .slice(0, 5);
  }, [analytics.players]);

  const getTeamEfficiency = (team: TeamStats) => {
    const shotAccuracy = team.shots > 0 ? (team.shotsOnTarget / team.shots) * 100 : 0;
    const passEfficiency = team.passes > 0 ? team.passAccuracy : 0;
    const discipline = 100 - (team.yellowCards * 5 + team.redCards * 10);
    
    return Math.round((shotAccuracy + passEfficiency + discipline) / 3);
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Possession Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart size={20} className="mr-2" />
          Possession
        </h3>
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{calculatePossession.home}%</div>
            <div className="text-sm text-gray-600">{match.homeTeam.name}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{calculatePossession.away}%</div>
            <div className="text-sm text-gray-600">{match.awayTeam.name}</div>
          </div>
        </div>
        <div className="mt-4 bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${calculatePossession.home}%` }}
          />
        </div>
      </div>

      {/* Key Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 size={20} className="mr-2" />
          Key Statistics
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Shots</span>
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{analytics.homeTeam.shots}</span>
              <span className="text-gray-400">-</span>
              <span className="font-semibold">{analytics.awayTeam.shots}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Shots on Target</span>
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{analytics.homeTeam.shotsOnTarget}</span>
              <span className="text-gray-400">-</span>
              <span className="font-semibold">{analytics.awayTeam.shotsOnTarget}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Corners</span>
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{analytics.homeTeam.corners}</span>
              <span className="text-gray-400">-</span>
              <span className="font-semibold">{analytics.awayTeam.corners}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Fouls</span>
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{analytics.homeTeam.fouls}</span>
              <span className="text-gray-400">-</span>
              <span className="font-semibold">{analytics.awayTeam.fouls}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Efficiency */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2" />
          Team Efficiency
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{match.homeTeam.name}</span>
              <span>{getTeamEfficiency(analytics.homeTeam)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getTeamEfficiency(analytics.homeTeam)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{match.awayTeam.name}</span>
              <span>{getTeamEfficiency(analytics.awayTeam)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getTeamEfficiency(analytics.awayTeam)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Updates */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity size={20} className="mr-2" />
          Live Updates
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Real-time updates active' : 'Real-time updates offline'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlayers = () => (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award size={20} className="mr-2" />
          Top Performers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getTopPerformers.map((player, index) => (
            <div key={player.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{player.name}</h4>
                <span className="text-sm text-gray-500">{player.position}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">{player.teamName}</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{player.goals}</div>
                  <div className="text-gray-500">Goals</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{player.assists}</div>
                  <div className="text-gray-500">Assists</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{player.shotsOnTarget}</div>
                  <div className="text-gray-500">Shots</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Player Statistics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assists
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shots
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cards
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.players.map((player) => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{player.name}</div>
                    <div className="text-sm text-gray-500">{player.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.teamName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.goals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.assists}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.shots}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.passAccuracy}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {player.yellowCards > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {player.yellowCards}
                        </span>
                      )}
                      {player.redCards > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {player.redCards}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Possession Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Possession Timeline</h3>
        <div className="h-64 bg-gray-50 rounded-lg p-4">
          <div className="text-center text-gray-500">
            Chart visualization would go here
            <br />
            <small>Showing possession changes over time</small>
          </div>
        </div>
      </div>

      {/* Momentum Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Momentum Analysis</h3>
        <div className="h-64 bg-gray-50 rounded-lg p-4">
          <div className="text-center text-gray-500">
            Chart visualization would go here
            <br />
            <small>Showing team momentum throughout the match</small>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCharts = () => (
    <div className="space-y-6">
      {/* Shot Map */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shot Map</h3>
        <div className="h-80 bg-gray-50 rounded-lg p-4">
          <div className="text-center text-gray-500">
            Interactive shot map would go here
            <br />
            <small>Showing shot locations and outcomes</small>
          </div>
        </div>
      </div>

      {/* Heat Maps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{match.homeTeam.name} Heat Map</h3>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <div className="text-center text-gray-500">
              Heat map visualization
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{match.awayTeam.name} Heat Map</h3>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <div className="text-center text-gray-500">
              Heat map visualization
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Real-Time Statistics Dashboard</h2>
          <div className="flex items-center space-x-2">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Live' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'players', label: 'Players', icon: Users },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp },
            { key: 'charts', label: 'Charts', icon: PieChart }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedView(key as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} className="mr-2" />
              {label}
            </button>
          ))}
        </div>

        {/* Time Range Selector */}
        <div className="mt-4 flex items-center space-x-4">
          <span className="text-sm text-gray-600">Time Range:</span>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'match', label: 'Full Match' },
              { key: 'period', label: 'This Period' },
              { key: 'last15', label: 'Last 15 min' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeRange(key as any)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  timeRange === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedView === 'overview' && renderOverview()}
      {selectedView === 'players' && renderPlayers()}
      {selectedView === 'analytics' && renderAnalytics()}
      {selectedView === 'charts' && renderCharts()}
    </div>
  );
};

export default RealTimeStatsDashboard;
