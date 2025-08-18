'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Target, 
  Calendar, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Play, 
  Pause, 
  ArrowUp, 
  ArrowDown,
  Star,
  Award,
  Activity,
  Eye,
  ChevronRight,
  Filter,
  RefreshCw,
  Plus
} from 'lucide-react';
import { DashboardData } from '@/lib/services/dashboardService';
import { User } from '@shared/types/auth';
import enhancedApiClient from '@/lib/enhancedApiClient';
import matchService from '@/lib/services/matchService';
import playerService from '@/lib/services/playerService';
import tournamentService from '@/lib/services/tournamentService';
import analyticsService, { ChartData } from '@/lib/services/analyticsService';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface League {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'upcoming' | 'completed';
  teams: number;
  matches: number;
  season: string;
  logo?: string;
  standings?: TeamStanding[];
}

interface TeamStanding {
  position: number;
  teamId: string;
  teamName: string;
  logo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[];
  trend: 'up' | 'down' | 'same';
}

interface Match {
  id: string;
  title: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
  };
  score?: {
    home: number;
    away: number;
  };
  status: 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed';
  startTime: string;
  venue?: string;
  minute?: number;
  events?: MatchEvent[];
}

interface MatchEvent {
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  minute: number;
  player: string;
  team: 'home' | 'away';
  description: string;
}

interface Player {
  id: string;
  name: string;
  position: string;
  teamId: string;
  teamName: string;
  avatar?: string;
  stats: {
    goals: number;
    assists: number;
    matches: number;
    minutes: number;
    yellowCards: number;
    redCards: number;
    rating: number;
  };
}

interface Event {
  id: string;
  title: string;
  type: 'match' | 'tournament' | 'training' | 'meeting';
  date: string;
  location?: string;
  participants?: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface SportsDashboardProps {
  user: User;
  data: DashboardData;
  onRefresh: () => void;
}

export const SportsDashboard: React.FC<SportsDashboardProps> = ({
  user,
  data,
  onRefresh
}) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Chart data state
  const [matchesOverTimeData, setMatchesOverTimeData] = useState<ChartData | null>(null);
  const [teamPerformanceData, setTeamPerformanceData] = useState<ChartData | null>(null);
  const [registrationTrendsData, setRegistrationTrendsData] = useState<ChartData | null>(null);
  const [playerDistributionData, setPlayerDistributionData] = useState<ChartData | null>(null);
  const [matchStatistics, setMatchStatistics] = useState<any>(null);
  
  // Quick actions state
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    loadSportsData();
  }, []);

  const loadSportsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLeagues(),
        loadMatches(),
        loadPlayers(),
        loadEvents(),
        loadChartData()
      ]);
    } catch (error) {
      console.error('Error loading sports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const [
        matchesOverTime,
        teamPerformance,
        registrationTrends,
        playerDistribution,
        matchStats
      ] = await Promise.all([
        analyticsService.getMatchesOverTime(30),
        analyticsService.getTeamPerformance(selectedLeague || undefined),
        analyticsService.getRegistrationTrends(6),
        analyticsService.getPlayerPerformanceDistribution(),
        analyticsService.getMatchStatistics()
      ]);

      setMatchesOverTimeData(matchesOverTime);
      setTeamPerformanceData(teamPerformance);
      setRegistrationTrendsData(registrationTrends);
      setPlayerDistributionData(playerDistribution);
      setMatchStatistics(matchStats);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const loadLeagues = async () => {
    try {
      // Get tournaments as leagues using the tournament service
      const tournaments = await tournamentService.getTournaments({ limit: 10 });
      
      const leaguesData: League[] = await Promise.all(
        tournaments.map(async (tournament: any) => {
          // Get teams count for this tournament
          const teams = await tournamentService.getTournamentTeams(tournament.id);
          
          // Get matches for this tournament
          const matches = await tournamentService.getTournamentMatches(tournament.id);

          // Get standings
          const standings = await tournamentService.getTournamentStandings(tournament.id);

          return {
            id: tournament.id,
            name: tournament.name,
            description: tournament.description || 'Professional League',
            status: tournament.status?.toLowerCase() || 'active',
            teams: teams.length,
            matches: matches.length,
            season: tournament.season || new Date().getFullYear().toString(),
            standings: standings.map((standing: any) => ({
              position: standing.position,
              teamId: standing.teamId,
              teamName: standing.teamName,
              played: standing.played,
              won: standing.won,
              drawn: standing.drawn,
              lost: standing.lost,
              goalsFor: standing.goalsFor,
              goalsAgainst: standing.goalsAgainst,
              goalDifference: standing.goalDifference,
              points: standing.points,
              form: standing.form || [],
              trend: standing.trend || 'same'
            }))
          };
        })
      );

      setLeagues(leaguesData);
      if (leaguesData.length > 0 && !selectedLeague) {
        setSelectedLeague(leaguesData[0].id);
      }
    } catch (error) {
      console.error('Error loading leagues:', error);
    }
  };

  const generateStandings = async (tournamentId: string, teams: any[]): Promise<TeamStanding[]> => {
    try {
      // Get matches for this tournament to calculate standings
      const matchesResponse = await enhancedApiClient.get(`/tournaments/${tournamentId}/matches`);
      const matches = matchesResponse.data || [];
      
      const standings: TeamStanding[] = teams.map((team, index) => {
        // Calculate stats from matches (simplified calculation)
        const teamMatches = matches.filter((match: any) => 
          match.homeTeamId === team.id || match.awayTeamId === team.id
        );
        
        let won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0;
        
        teamMatches.forEach((match: any) => {
          if (match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined) {
            const isHome = match.homeTeamId === team.id;
            const teamScore = isHome ? match.homeScore : match.awayScore;
            const opponentScore = isHome ? match.awayScore : match.homeScore;
            
            goalsFor += teamScore;
            goalsAgainst += opponentScore;
            
            if (teamScore > opponentScore) won++;
            else if (teamScore < opponentScore) lost++;
            else drawn++;
          }
        });

        const points = won * 3 + drawn;
        const played = won + drawn + lost;

        return {
          position: index + 1,
          teamId: team.id,
          teamName: team.name,
          played,
          won,
          drawn,
          lost,
          goalsFor,
          goalsAgainst,
          goalDifference: goalsFor - goalsAgainst,
          points,
          form: ['W', 'W', 'D', 'L', 'W'].slice(0, Math.min(5, played)),
          trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'same' : 'down'
        };
      });

      // Sort by points, then goal difference
      return standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalDifference - a.goalDifference;
      }).map((standing, index) => ({ ...standing, position: index + 1 }));
      
    } catch (error) {
      console.error('Error generating standings:', error);
      return [];
    }
  };

  const loadMatches = async () => {
    try {
      // Get live matches
      const liveMatchesData = await matchService.getLiveMatches();
      setLiveMatches(liveMatchesData.map(match => ({
        id: match.id,
        title: match.title,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        score: match.score,
        status: match.status,
        startTime: match.startTime,
        venue: match.venue,
        minute: match.minute
      })));

      // Get upcoming matches
      const upcomingMatchesData = await matchService.getUpcomingMatches(10);
      setUpcomingMatches(upcomingMatchesData.map((match: any) => ({
        id: match.id,
        title: match.title || `${match.homeTeam?.name || 'Team A'} vs ${match.awayTeam?.name || 'Team B'}`,
        homeTeam: {
          id: match.homeTeamId || match.homeTeam?.id,
          name: match.homeTeam?.name || 'Home Team',
          logo: match.homeTeam?.logo
        },
        awayTeam: {
          id: match.awayTeamId || match.awayTeam?.id,
          name: match.awayTeam?.name || 'Away Team',
          logo: match.awayTeam?.logo
        },
        score: match.homeScore !== undefined && match.awayScore !== undefined ? {
          home: match.homeScore,
          away: match.awayScore
        } : undefined,
        status: match.status?.toLowerCase() || 'scheduled',
        startTime: match.startTime || match.date,
        venue: match.location || match.venue,
        minute: match.minute
      })));

      // Get recent matches
      const recentMatchesData = await matchService.getRecentMatches(10);
      setRecentMatches(recentMatchesData.map((match: any) => ({
        id: match.id,
        title: match.title || `${match.homeTeam?.name || 'Team A'} vs ${match.awayTeam?.name || 'Team B'}`,
        homeTeam: {
          id: match.homeTeamId || match.homeTeam?.id,
          name: match.homeTeam?.name || 'Home Team',
          logo: match.homeTeam?.logo
        },
        awayTeam: {
          id: match.awayTeamId || match.awayTeam?.id,
          name: match.awayTeam?.name || 'Away Team',
          logo: match.awayTeam?.logo
        },
        score: match.homeScore !== undefined && match.awayScore !== undefined ? {
          home: match.homeScore,
          away: match.awayScore
        } : undefined,
        status: match.status?.toLowerCase() || 'finished',
        startTime: match.startTime || match.date,
        venue: match.location || match.venue,
        minute: match.minute
      })));
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const loadPlayers = async () => {
    try {
      // Use player service to get top scorers
      const topScorers = await playerService.getTopScorers(10);
      setTopPlayers(topScorers.map(player => ({
        id: player.id,
        name: player.name,
        position: player.position,
        teamId: player.teamId,
        teamName: player.teamName,
        avatar: player.avatar,
        stats: {
          goals: player.stats.goals,
          assists: player.stats.assists,
          matches: player.stats.matches,
          minutes: player.stats.minutesPlayed,
          yellowCards: player.stats.yellowCards,
          redCards: player.stats.redCards,
          rating: player.stats.rating
        }
      })));
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await enhancedApiClient.get('/events');
      if (response.success && response.data) {
        const events = Array.isArray(response.data) ? response.data : response.data.events || [];
        
        const eventsData: Event[] = events.map((event: any) => ({
          id: event.id,
          title: event.title || event.name,
          type: event.type?.toLowerCase() || 'match',
          date: event.date || event.startDate,
          location: event.location,
          participants: event.participants || 0,
          status: event.status?.toLowerCase() || 'upcoming'
        }));

        const now = new Date();
        const upcoming = eventsData.filter(e => new Date(e.date) > now).slice(0, 5);
        const past = eventsData.filter(e => new Date(e.date) <= now).slice(0, 5);

        setUpcomingEvents(upcoming);
        setPastEvents(past);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const getMatchStatusBadge = (status: string) => {
    switch (status) {
      case 'live': return 'bg-danger';
      case 'halftime': return 'bg-warning';
      case 'finished': return 'bg-success';
      case 'scheduled': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const getFormIcon = (result: string) => {
    switch (result) {
      case 'W': return <div className="badge bg-success rounded-circle" style={{width: '20px', height: '20px', fontSize: '10px'}}>W</div>;
      case 'D': return <div className="badge bg-warning rounded-circle" style={{width: '20px', height: '20px', fontSize: '10px'}}>D</div>;
      case 'L': return <div className="badge bg-danger rounded-circle" style={{width: '20px', height: '20px', fontSize: '10px'}}>L</div>;
      default: return null;
    }
  };

  const selectedLeagueData = leagues.find(l => l.id === selectedLeague);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
      },
      y: {
        display: true,
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  // Quick actions
  const quickActions = [
    {
      title: 'Create Match',
      description: 'Schedule a new match',
      icon: <Plus size={20} />,
      action: () => window.location.href = '/matches/create',
      color: 'btn-primary',
      available: true
    },
    {
      title: 'Add Team',
      description: 'Register new team',
      icon: <Users size={20} />,
      action: () => window.location.href = '/teams/create',
      color: 'btn-success',
      available: true
    },
    {
      title: 'Create Tournament',
      description: 'Set up tournament',
      icon: <Trophy size={20} />,
      action: () => window.location.href = '/tournaments/create',
      color: 'btn-warning',
      available: user.role === 'SUPER_ADMIN' || user.role === 'CLUB_ADMIN'
    },
    {
      title: 'Live Match',
      description: 'Start live tracking',
      icon: <Play size={20} />,
      action: () => window.location.href = '/live-match-demo',
      color: 'btn-danger',
      available: true
    },
    {
      title: 'View Analytics',
      description: 'Detailed insights',
      icon: <TrendingUp size={20} />,
      action: () => window.location.href = '/analytics',
      color: 'btn-info',
      available: true
    },
    {
      title: 'Manage Players',
      description: 'Player management',
      icon: <Users size={20} />,
      action: () => window.location.href = '/players',
      color: 'btn-secondary',
      available: true
    }
  ].filter(action => action.available);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-1">Sports Dashboard</h2>
              <p className="text-muted mb-0">Live matches, standings, and player statistics</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw size={16} className={`me-1 ${loading ? 'spinner-border spinner-border-sm' : ''}`} />
                Refresh
              </button>
              <button className="btn btn-outline-secondary">
                <Filter size={16} className="me-1" />
                Filter
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => setShowQuickActions(!showQuickActions)}
              >
                <Plus size={16} className="me-1" />
                Quick Actions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {quickActions.map((action, index) => (
                    <div key={index} className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3">
                      <button
                        className={`btn ${action.color} w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3`}
                        onClick={action.action}
                        style={{ minHeight: '120px' }}
                      >
                        <div className="mb-2">
                          {action.icon}
                        </div>
                        <div className="fw-bold small">{action.title}</div>
                        <small className="opacity-75">{action.description}</small>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Overview */}
      {matchStatistics && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="mb-0">Match Statistics Overview</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-2">
                    <div className="h4 text-primary mb-1">{matchStatistics.totalMatches}</div>
                    <small className="text-muted">Total Matches</small>
                  </div>
                  <div className="col-md-2">
                    <div className="h4 text-danger mb-1">{matchStatistics.liveMatches}</div>
                    <small className="text-muted">Live Now</small>
                  </div>
                  <div className="col-md-2">
                    <div className="h4 text-warning mb-1">{matchStatistics.upcomingMatches}</div>
                    <small className="text-muted">Upcoming</small>
                  </div>
                  <div className="col-md-2">
                    <div className="h4 text-success mb-1">{matchStatistics.completedMatches}</div>
                    <small className="text-muted">Completed</small>
                  </div>
                  <div className="col-md-2">
                    <div className="h4 text-info mb-1">{matchStatistics.totalGoals}</div>
                    <small className="text-muted">Total Goals</small>
                  </div>
                  <div className="col-md-2">
                    <div className="h4 text-secondary mb-1">{matchStatistics.averageGoalsPerMatch}</div>
                    <small className="text-muted">Avg Goals/Match</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <div className="d-flex align-items-center">
                  <div className="bg-danger rounded-circle me-2" style={{width: '8px', height: '8px'}}></div>
                  <h5 className="mb-0">Live Matches</h5>
                  <span className="badge bg-danger ms-2">LIVE</span>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  {liveMatches.map((match) => (
                    <div key={match.id} className="col-xl-4 col-lg-6 mb-3">
                      <div className="card border-danger">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="badge bg-danger">
                              <Play size={12} className="me-1" />
                              {match.minute}'
                            </span>
                            <small className="text-muted">{match.venue}</small>
                          </div>
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="text-center flex-grow-1">
                              <div className="fw-bold">{match.homeTeam.name}</div>
                              <div className="h2 text-primary mt-2">{match.score?.home || 0}</div>
                            </div>
                            <div className="text-center mx-3">
                              <div className="text-muted small">VS</div>
                            </div>
                            <div className="text-center flex-grow-1">
                              <div className="fw-bold">{match.awayTeam.name}</div>
                              <div className="h2 text-primary mt-2">{match.score?.away || 0}</div>
                            </div>
                          </div>
                          
                          <div className="text-center mt-3">
                            <button className="btn btn-sm btn-outline-danger">
                              <Eye size={14} className="me-1" />
                              Watch Live
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="row">
        {/* League Overview */}
        <div className="col-xl-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">League Overview</h5>
                <select 
                  className="form-select form-select-sm"
                  style={{width: 'auto'}}
                  value={selectedLeague || ''}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                >
                  {leagues.map(league => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="card-body">
              {selectedLeagueData && (
                <>
                  {/* League Info */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary rounded p-3 me-3">
                          <Trophy size={24} className="text-white" />
                        </div>
                        <div>
                          <h4 className="mb-0">{selectedLeagueData.name}</h4>
                          <p className="text-muted mb-0">{selectedLeagueData.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="fw-bold text-primary">{selectedLeagueData.teams}</div>
                          <small className="text-muted">Teams</small>
                        </div>
                        <div className="col-4">
                          <div className="fw-bold text-success">{selectedLeagueData.matches}</div>
                          <small className="text-muted">Matches</small>
                        </div>
                        <div className="col-4">
                          <div className="fw-bold text-info">{selectedLeagueData.season}</div>
                          <small className="text-muted">Season</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Standings Table */}
                  {selectedLeagueData.standings && selectedLeagueData.standings.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th style={{width: '50px'}}>#</th>
                            <th>Team</th>
                            <th className="text-center">Played</th>
                            <th className="text-center">Won</th>
                            <th className="text-center">Drawn</th>
                            <th className="text-center">Lost</th>
                            <th className="text-center">GF</th>
                            <th className="text-center">GA</th>
                            <th className="text-center">GD</th>
                            <th className="text-center">Points</th>
                            <th className="text-center">Form</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedLeagueData.standings.slice(0, 10).map((team) => (
                            <tr key={team.teamId}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <span className="fw-bold">{team.position}</span>
                                  {team.trend === 'up' && <ArrowUp size={12} className="text-success ms-1" />}
                                  {team.trend === 'down' && <ArrowDown size={12} className="text-danger ms-1" />}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary rounded-circle me-2" style={{width: '24px', height: '24px'}}></div>
                                  <span className="fw-medium">{team.teamName}</span>
                                </div>
                              </td>
                              <td className="text-center">{team.played}</td>
                              <td className="text-center text-success">{team.won}</td>
                              <td className="text-center text-warning">{team.drawn}</td>
                              <td className="text-center text-danger">{team.lost}</td>
                              <td className="text-center">{team.goalsFor}</td>
                              <td className="text-center">{team.goalsAgainst}</td>
                              <td className="text-center">
                                <span className={team.goalDifference >= 0 ? 'text-success' : 'text-danger'}>
                                  {team.goalDifference >= 0 ? '+' : ''}{team.goalDifference}
                                </span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-primary">{team.points}</span>
                              </td>
                              <td className="text-center">
                                <div className="d-flex gap-1 justify-content-center">
                                  {team.form.slice(-5).map((result, index) => (
                                    <div key={index}>{getFormIcon(result)}</div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-xl-4">
          {/* Top Players */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Top Scorers</h5>
            </div>
            <div className="card-body">
              {topPlayers.slice(0, 5).map((player, index) => (
                <div key={player.id} className="d-flex align-items-center mb-3">
                  <div className="position-relative me-3">
                    <div className="bg-secondary rounded-circle" style={{width: '40px', height: '40px'}}></div>
                    {index < 3 && (
                      <div className={`position-absolute top-0 start-100 translate-middle badge rounded-pill ${
                        index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-danger'
                      }`} style={{fontSize: '8px'}}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-medium">{player.name}</div>
                    <small className="text-muted">{player.teamName}</small>
                  </div>
                  <div className="text-end">
                    <div className="fw-bold text-primary">{player.stats.goals}</div>
                    <small className="text-muted">goals</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Upcoming Matches</h5>
            </div>
            <div className="card-body">
              {upcomingMatches.slice(0, 5).map((match) => (
                <div key={match.id} className="d-flex align-items-center justify-content-between mb-3 p-2 rounded bg-light">
                  <div className="flex-grow-1">
                    <div className="small fw-medium">
                      {match.homeTeam.name} vs {match.awayTeam.name}
                    </div>
                    <div className="d-flex align-items-center mt-1">
                      <Clock size={12} className="text-muted me-1" />
                      <small className="text-muted">
                        {new Date(match.startTime).toLocaleDateString()} at {new Date(match.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </small>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Recent Results</h5>
            </div>
            <div className="card-body">
              {recentMatches.slice(0, 5).map((match) => (
                <div key={match.id} className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <div className="small fw-medium">
                      {match.homeTeam.name} {match.score?.home || 0} - {match.score?.away || 0} {match.awayTeam.name}
                    </div>
                    <small className="text-muted">
                      {new Date(match.startTime).toLocaleDateString()}
                    </small>
                  </div>
                  <span className={`badge ${getMatchStatusBadge(match.status)}`}>
                    {match.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mb-4">
        {/* Matches Over Time Chart */}
        <div className="col-xl-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Matches & Goals Over Time</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {matchesOverTimeData ? (
                  <Line data={matchesOverTimeData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player Performance Distribution */}
        <div className="col-xl-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Player Performance</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {playerDistributionData ? (
                  <Doughnut data={playerDistributionData} options={doughnutOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Chart */}
        <div className="col-xl-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Team Performance Comparison</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {teamPerformanceData ? (
                  <Bar data={teamPerformanceData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Registration Trends Chart */}
        <div className="col-xl-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Registration Trends</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {registrationTrendsData ? (
                  <Bar data={registrationTrendsData} options={chartOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Upcoming Events</h5>
            </div>
            <div className="card-body">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded p-2 me-3">
                      <Calendar size={16} className="text-white" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">{event.title}</div>
                      <small className="text-muted">
                        {new Date(event.date).toLocaleDateString()} • {event.location}
                      </small>
                    </div>
                    <span className="badge bg-light text-dark">{event.type}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Calendar size={48} className="text-muted mb-2" />
                  <p className="text-muted">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent">
              <h5 className="mb-0">Past Events</h5>
            </div>
            <div className="card-body">
              {pastEvents.length > 0 ? (
                pastEvents.map((event) => (
                  <div key={event.id} className="d-flex align-items-center mb-3">
                    <div className="bg-secondary rounded p-2 me-3">
                      <Activity size={16} className="text-white" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium">{event.title}</div>
                      <small className="text-muted">
                        {new Date(event.date).toLocaleDateString()} • {event.location}
                      </small>
                    </div>
                    <span className="badge bg-success">Completed</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Activity size={48} className="text-muted mb-2" />
                  <p className="text-muted">No past events</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
