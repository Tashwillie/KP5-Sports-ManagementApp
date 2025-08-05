'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Star,
  Plus,
  Search,
  Filter,
  Bell,
  Settings
} from 'lucide-react';
import { useLocalAuth, useLocalClubs, useLocalTeams, useLocalEvents, useLocalMatches } from '@/hooks/useLocalApi';
import { toast } from 'sonner';

interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  upcomingEvents: number;
  activeClubs: number;
  totalMatches: number;
  completedEvents: number;
}

interface FeaturedMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  venue: string;
  competition: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'match' | 'event' | 'system' | 'achievement';
  read: boolean;
}

export default function DashboardPage() {
  const { user } = useLocalAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // API hooks for real data
  const { data: clubs, isLoading: clubsLoading } = useLocalClubs();
  const { data: teams, isLoading: teamsLoading } = useLocalTeams();
  const { data: events, isLoading: eventsLoading } = useLocalEvents();
  const { data: matches, isLoading: matchesLoading } = useLocalMatches();

  // Calculate real stats from API data
  const stats: DashboardStats = {
    totalTeams: teams?.length || 0,
    totalPlayers: teams?.reduce((acc, team) => acc + (team.players?.length || 0), 0) || 0,
    upcomingEvents: events?.filter(event => new Date(event.startDate) > new Date()).length || 0,
    activeClubs: clubs?.length || 0,
    totalMatches: matches?.length || 0,
    completedEvents: events?.filter(event => new Date(event.endDate) < new Date()).length || 0,
  };

  // Mock featured match data (replace with real data when available)
  const featuredMatch: FeaturedMatch = {
    id: '1',
    homeTeam: 'KP5 Elite',
    awayTeam: 'City Rovers',
    homeLogo: '/images/teams/kp5-elite.png',
    awayLogo: '/images/teams/city-rovers.png',
    date: '2024-01-15',
    time: '20:00',
    status: 'upcoming',
    venue: 'Academy Stadium',
    competition: 'Premier League'
  };

  // Mock notifications (replace with real data)
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Match Reminder',
      message: 'Your match against City Rovers starts in 2 hours',
      time: '2 hours ago',
      type: 'match',
      read: false
    },
    {
      id: '2',
      title: 'Training Session',
      message: 'New training session scheduled for tomorrow',
      time: '4 hours ago',
      type: 'event',
      read: false
    },
    {
      id: '3',
      title: 'Achievement Unlocked',
      message: 'Congratulations! You\'ve completed 10 matches',
      time: '1 day ago',
      type: 'achievement',
      read: true
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white';
      case 'upcoming':
        return 'bg-blue-500 text-white';
      case 'finished':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Trophy className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'achievement':
        return <Star className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to KP5 Academy</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your dashboard</p>
                            <div className="flex space-x-2">
                    <Button onClick={() => window.location.href = '/auth/signin'}>
                      Sign In
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/advanced-features'}>
                      View Advanced Features
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/features-showcase'}>
                      🚀 New Features
                    </Button>
                  </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.displayName?.split(' ')[0] || 'Player'}!
              </h1>
              <p className="text-gray-600 mt-1">
                {formatTime(currentTime)} • {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Teams</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Players</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPlayers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Clubs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeClubs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Target className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Matches</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMatches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Featured Match */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Featured Match
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getStatusColor(featuredMatch.status)}>
                        {featuredMatch.status.toUpperCase()}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        {featuredMatch.competition}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center flex-1">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-xl font-bold text-blue-600">KP5</span>
                        </div>
                        <p className="font-semibold text-gray-900">{featuredMatch.homeTeam}</p>
                      </div>
                      
                      <div className="text-center mx-4">
                        <div className="text-2xl font-bold text-gray-900">VS</div>
                        <div className="text-sm text-gray-600 mt-1">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {featuredMatch.time}
                        </div>
                      </div>
                      
                      <div className="text-center flex-1">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-xl font-bold text-purple-600">CR</span>
                        </div>
                        <p className="font-semibold text-gray-900">{featuredMatch.awayTeam}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {featuredMatch.venue}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'match' ? 'bg-red-100' :
                          notification.type === 'event' ? 'bg-blue-100' :
                          notification.type === 'achievement' ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Matches</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search matches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {matchesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading matches...</p>
                  </div>
                ) : matches && matches.length > 0 ? (
                  <div className="space-y-4">
                    {matches.slice(0, 5).map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-semibold">{match.homeTeam}</p>
                            <p className="text-sm text-gray-600">Home</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {match.homeScore} - {match.awayScore}
                            </div>
                            <Badge className={getStatusColor(match.status)}>
                              {match.status}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">{match.awayTeam}</p>
                            <p className="text-sm text-gray-600">Away</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{match.date}</p>
                          <p className="text-sm text-gray-600">{match.venue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No matches found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Upcoming Events</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading events...</p>
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-sm text-gray-600">{event.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{event.startDate}</p>
                          <p className="text-sm text-gray-600">{event.venue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No upcoming events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'match' ? 'bg-red-100' :
                        notification.type === 'event' ? 'bg-blue-100' :
                        notification.type === 'achievement' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 