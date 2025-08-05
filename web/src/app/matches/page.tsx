'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Trophy, 
  Play, 
  Pause, 
  Square,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Match {
  id: string;
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
  date: Date;
  time: string;
  venue: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  tournament?: string;
  referee?: string;
  events: MatchEvent[];
}

interface MatchEvent {
  id: string;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'injury';
  minute: number;
  playerId: string;
  playerName: string;
  teamId: string;
  description?: string;
  timestamp: Date;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed'>('all');
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockMatches: Match[] = [
      {
        id: '1',
        homeTeam: {
          id: 'team1',
          name: 'Elite Soccer Academy',
          score: 2,
        },
        awayTeam: {
          id: 'team2',
          name: 'Springfield United',
          score: 1,
        },
        date: new Date('2024-03-15'),
        time: '14:00',
        venue: 'Central Stadium',
        status: 'completed',
        tournament: 'Spring League',
        referee: 'John Smith',
        events: [
          {
            id: '1',
            type: 'goal',
            minute: 23,
            playerId: 'player1',
            playerName: 'Mike Johnson',
            teamId: 'team1',
            timestamp: new Date('2024-03-15T14:23:00'),
          },
          {
            id: '2',
            type: 'goal',
            minute: 45,
            playerId: 'player2',
            playerName: 'David Wilson',
            teamId: 'team2',
            timestamp: new Date('2024-03-15T14:45:00'),
          },
          {
            id: '3',
            type: 'goal',
            minute: 78,
            playerId: 'player3',
            playerName: 'Alex Brown',
            teamId: 'team1',
            timestamp: new Date('2024-03-15T15:18:00'),
          },
        ],
      },
      {
        id: '2',
        homeTeam: {
          id: 'team3',
          name: 'Riverside FC',
          score: 0,
        },
        awayTeam: {
          id: 'team4',
          name: 'Mountain View SC',
          score: 0,
        },
        date: new Date('2024-03-16'),
        time: '16:00',
        venue: 'Riverside Complex',
        status: 'scheduled',
        tournament: 'Spring League',
        referee: 'Sarah Davis',
        events: [],
      },
      {
        id: '3',
        homeTeam: {
          id: 'team5',
          name: 'City Stars',
          score: 1,
        },
        awayTeam: {
          id: 'team6',
          name: 'Valley United',
          score: 1,
        },
        date: new Date('2024-03-16'),
        time: '18:00',
        venue: 'City Arena',
        status: 'in_progress',
        tournament: 'Spring League',
        referee: 'Mike Wilson',
        events: [
          {
            id: '4',
            type: 'goal',
            minute: 12,
            playerId: 'player4',
            playerName: 'Chris Lee',
            teamId: 'team5',
            timestamp: new Date('2024-03-16T18:12:00'),
          },
          {
            id: '5',
            type: 'goal',
            minute: 34,
            playerId: 'player5',
            playerName: 'Tom Garcia',
            teamId: 'team6',
            timestamp: new Date('2024-03-16T18:34:00'),
          },
        ],
      },
    ];

    setMatches(mockMatches);
    setLoading(false);
  }, []);

  const getStatusBadge = (status: Match['status']) => {
    const variants = {
      scheduled: 'secondary',
      in_progress: 'sports',
      completed: 'success',
      cancelled: 'destructive',
    } as const;

    const icons = {
      scheduled: Clock,
      in_progress: Play,
      completed: CheckCircle,
      cancelled: XCircle,
    };

    const Icon = icons[status];

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getEventIcon = (type: MatchEvent['type']) => {
    const icons = {
      goal: Target,
      assist: Award,
      yellow_card: AlertTriangle,
      red_card: XCircle,
      substitution: Users,
      injury: AlertTriangle,
    };

    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const filteredMatches = matches.filter(match => {
    if (filter !== 'all' && match.status !== filter) return false;
    if (selectedDate) {
      const matchDate = new Date(match.date);
      return matchDate.toDateString() === selectedDate.toDateString();
    }
    return true;
  });

  const handleStartMatch = (matchId: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, status: 'in_progress' as const }
        : match
    ));
    toast({
      title: "Match Started",
      description: "Live match data entry is now available.",
    });
  };

  const handleEndMatch = (matchId: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, status: 'completed' as const }
        : match
    ));
    toast({
      title: "Match Ended",
      description: "Match has been completed and statistics updated.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
            <p className="text-gray-600 mt-2">Track match results, live scoring, and statistics.</p>
          </div>
          <Dialog open={showCreateMatch} onOpenChange={setShowCreateMatch}>
            <DialogTrigger asChild>
              <Button leftIcon={<Plus />}>
                Schedule Match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Match</DialogTitle>
                <DialogDescription>
                  Create a new match with teams, date, time, and venue.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Home Team</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select home team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team1">Elite Soccer Academy</SelectItem>
                        <SelectItem value="team2">Springfield United</SelectItem>
                        <SelectItem value="team3">Riverside FC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Away Team</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select away team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team1">Elite Soccer Academy</SelectItem>
                        <SelectItem value="team2">Springfield United</SelectItem>
                        <SelectItem value="team3">Riverside FC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Time</label>
                      <Input type="time" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Venue</label>
                      <Input placeholder="Enter venue name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Referee</label>
                      <Input placeholder="Enter referee name" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateMatch(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    setShowCreateMatch(false);
                    toast({
                      title: "Match Scheduled",
                      description: "New match has been scheduled successfully.",
                    });
                  }}>
                    Schedule Match
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Match Schedule</CardTitle>
                <CardDescription>View and manage upcoming matches</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="list" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="live">Live Matches</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="list" className="space-y-4">
                    <div className="flex space-x-2 mb-4">
                      {(['all', 'scheduled', 'in_progress', 'completed'] as const).map((status) => (
                        <Button
                          key={status}
                          variant={filter === status ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilter(status)}
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </Button>
                      ))}
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teams</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Venue</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMatches.map((match) => (
                          <TableRow key={match.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{match.homeTeam.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{match.homeTeam.name}</span>
                                </div>
                                <span className="text-gray-400">vs</span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{match.awayTeam.name}</span>
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{match.awayTeam.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {match.date.toLocaleDateString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {match.time}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{match.venue}</div>
                              {match.referee && (
                                <div className="text-xs text-gray-500">Ref: {match.referee}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(match.status)}
                            </TableCell>
                            <TableCell>
                              <div className="text-lg font-bold">
                                {match.homeTeam.score} - {match.awayTeam.score}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {match.status === 'scheduled' && (
                                  <Button
                                    size="sm"
                                    variant="sports"
                                    onClick={() => handleStartMatch(match.id)}
                                  >
                                    Start
                                  </Button>
                                )}
                                {match.status === 'in_progress' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => window.location.href = `/matches/${match.id}/live`}
                                    >
                                      Live Control
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleEndMatch(match.id)}
                                    >
                                      End
                                    </Button>
                                  </>
                                )}
                                {match.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.location.href = `/matches/${match.id}`}
                                  >
                                    View Details
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="calendar" className="space-y-4">
                    <div className="text-center py-12">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
                      <p className="text-gray-600">Calendar view will be implemented here.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="live" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredMatches.filter(match => match.status === 'in_progress').map((match) => (
                        <Card key={match.id} variant="sports">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>LIVE MATCH</span>
                              <Badge variant="sports">LIVE</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-center mb-4">
                              <div className="text-2xl font-bold mb-2">
                                {match.homeTeam.score} - {match.awayTeam.score}
                              </div>
                              <div className="text-sm text-gray-600">
                                {match.homeTeam.name} vs {match.awayTeam.name}
                              </div>
                            </div>
                            <Button 
                              className="w-full" 
                              variant="sports"
                              onClick={() => window.location.href = `/matches/${match.id}/live`}
                            >
                              Enter Live Data
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Matches</span>
                  <span className="font-semibold">{matches.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Live Matches</span>
                  <span className="font-semibold text-green-600">
                    {matches.filter(m => m.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Today</span>
                  <span className="font-semibold">
                    {matches.filter(m => 
                      m.status === 'completed' && 
                      m.date.toDateString() === new Date().toDateString()
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upcoming</span>
                  <span className="font-semibold text-blue-600">
                    {matches.filter(m => m.status === 'scheduled').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 