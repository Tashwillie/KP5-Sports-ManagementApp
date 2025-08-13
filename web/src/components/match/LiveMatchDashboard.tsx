'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, Play, Pause, Square, Plus, Minus, Users, Target, AlertTriangle } from 'lucide-react';
import { LiveMatchControl } from '@/components/LiveMatchControl';

interface LiveMatchDashboardProps {
  matchId: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
    score: number;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
    score: number;
  };
  matchStatus: 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
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

export function LiveMatchDashboard({
  matchId,
  homeTeam,
  awayTeam,
  matchStatus,
  startTime,
  endTime
}: LiveMatchDashboardProps) {
  const [matchTime, setMatchTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [stats, setStats] = useState<MatchStats>({
    homeTeam: {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0
    },
    awayTeam: {
      possession: 50,
      shots: 0,
      shotsOnTarget: 0,
      corners: 0,
      fouls: 0,
      yellowCards: 0,
      redCards: 0
    }
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && matchStatus === 'in_progress') {
      interval = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, matchStatus]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'Live';
      case 'paused':
        return 'Paused';
      case 'completed':
        return 'Full Time';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Scheduled';
    }
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  {homeTeam.logo ? (
                    <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <Users className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <h3 className="font-semibold text-lg">{homeTeam.name}</h3>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {homeTeam.score} - {awayTeam.score}
                </div>
                <Badge className={`${getStatusColor(matchStatus)} text-white`}>
                  {getStatusText(matchStatus)}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  {awayTeam.logo ? (
                    <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <Users className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <h3 className="font-semibold text-lg">{awayTeam.name}</h3>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-gray-900">
                {formatTime(matchTime)}
              </div>
              <div className="text-sm text-gray-500">
                Match Time
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Match Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Home Team Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>{homeTeam.name} Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.homeTeam.possession}%</div>
                <div className="text-sm text-gray-600">Possession</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.homeTeam.shots}</div>
                <div className="text-sm text-gray-600">Shots</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.homeTeam.yellowCards}</div>
                <div className="text-sm text-gray-600">Yellow Cards</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.homeTeam.redCards}</div>
                <div className="text-sm text-gray-600">Red Cards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Away Team Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-red-600" />
              <span>{awayTeam.name} Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.awayTeam.possession}%</div>
                <div className="text-sm text-gray-600">Possession</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.awayTeam.shots}</div>
                <div className="text-sm text-gray-600">Shots</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.awayTeam.yellowCards}</div>
                <div className="text-sm text-gray-600">Yellow Cards</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.awayTeam.redCards}</div>
                <div className="text-sm text-gray-600">Red Cards</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Match Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Match Control Panel</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LiveMatchControl
            matchId={matchId}
            homeTeam={homeTeam.name}
            awayTeam={awayTeam.name}
          />
        </CardContent>
      </Card>

      {/* Match Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Match Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Match Started</span>
              <span className="text-xs text-gray-500 ml-auto">00:00</span>
            </div>
            {/* Add more timeline events here */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
