"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Trophy,
  DollarSign,
  Activity,
  Target,
  Award,
  Clock,
  MapPin,
  Eye,
  Download,
  RefreshCw,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { useLocalAuth } from '@/hooks/useLocalApi';

interface AnalyticsMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

interface PerformanceMetric {
  playerId: string;
  playerName: string;
  team: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  matchesPlayed: number;
  rating: number;
}

const mockMetrics: AnalyticsMetric[] = [
  {
    id: 'total-users',
    title: 'Total Users',
    value: '2,847',
    change: 12.5,
    changeType: 'increase',
    icon: <Users className="h-4 w-4" />,
    color: 'text-blue-600'
  },
  {
    id: 'active-teams',
    title: 'Active Teams',
    value: '156',
    change: 8.2,
    changeType: 'increase',
    icon: <Trophy className="h-4 w-4" />,
    color: 'text-green-600'
  },
  {
    id: 'matches-played',
    title: 'Matches Played',
    value: '1,234',
    change: -3.1,
    changeType: 'decrease',
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-orange-600'
  },
  {
    id: 'revenue',
    title: 'Monthly Revenue',
    value: '$45,678',
    change: 15.7,
    changeType: 'increase',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'text-purple-600'
  },
  {
    id: 'engagement',
    title: 'User Engagement',
    value: '87.3%',
    change: 5.2,
    changeType: 'increase',
    icon: <Activity className="h-4 w-4" />,
    color: 'text-indigo-600'
  },
  {
    id: 'conversion',
    title: 'Conversion Rate',
    value: '12.8%',
    change: 0,
    changeType: 'neutral',
    icon: <Target className="h-4 w-4" />,
    color: 'text-gray-600'
  }
];

const mockChartData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'User Registrations',
      data: [120, 190, 300, 500, 200, 300],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)'
    },
    {
      label: 'Active Users',
      data: [100, 150, 250, 400, 180, 280],
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgba(34, 197, 94, 1)'
    }
  ]
};

const mockPerformanceData: PerformanceMetric[] = [
  {
    playerId: '1',
    playerName: 'John Smith',
    team: 'Thunder FC',
    goals: 15,
    assists: 8,
    minutesPlayed: 1620,
    matchesPlayed: 18,
    rating: 8.7
  },
  {
    playerId: '2',
    playerName: 'Maria Garcia',
    team: 'Lightning United',
    goals: 12,
    assists: 12,
    minutesPlayed: 1440,
    matchesPlayed: 16,
    rating: 8.5
  },
  {
    playerId: '3',
    playerName: 'David Johnson',
    team: 'Storm Rovers',
    goals: 18,
    assists: 6,
    minutesPlayed: 1710,
    matchesPlayed: 19,
    rating: 8.9
  },
  {
    playerId: '4',
    playerName: 'Sarah Wilson',
    team: 'Thunder FC',
    goals: 10,
    assists: 15,
    minutesPlayed: 1530,
    matchesPlayed: 17,
    rating: 8.3
  },
  {
    playerId: '5',
    playerName: 'Michael Brown',
    team: 'Lightning United',
    goals: 14,
    assists: 9,
    minutesPlayed: 1590,
    matchesPlayed: 18,
    rating: 8.6
  }
];

// Simple chart component (in a real app, you'd use Chart.js or Recharts)
const SimpleBarChart: React.FC<{ data: ChartData }> = ({ data }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  
  return (
    <div className="space-y-4">
      {data.labels.map((label, index) => (
        <div key={label} className="flex items-center space-x-4">
          <div className="w-16 text-sm font-medium">{label}</div>
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              style={{
                width: `${(data.datasets[0].data[index] / maxValue) * 100}%`
              }}
            />
          </div>
          <div className="w-12 text-sm text-right">{data.datasets[0].data[index]}</div>
        </div>
      ))}
    </div>
  );
};

export default function AdvancedAnalyticsDashboard() {
  const { user } = useLocalAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>(mockPerformanceData);

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const exportData = (format: 'csv' | 'pdf') => {
    console.log(`Exporting data as ${format}`);
    // Mock export functionality
  };

  const refreshData = () => {
    console.log('Refreshing analytics data');
    // Mock refresh functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics for your sports platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className={metric.color}>{metric.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {getChangeIcon(metric.changeType)}
                <span className={getChangeColor(metric.changeType)}>
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </span>
                <span className="text-muted-foreground">from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Player Performance</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={mockChartData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Sessions</span>
                    <Badge variant="outline">1,234</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Page Views</span>
                    <Badge variant="outline">45,678</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <Badge variant="outline">23.4%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg. Session Duration</span>
                    <Badge variant="outline">4m 32s</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Performers</CardTitle>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics</SelectItem>
                    <SelectItem value="goals">Goals</SelectItem>
                    <SelectItem value="assists">Assists</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((player, index) => (
                  <div key={player.playerId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{player.playerName}</h4>
                        <p className="text-sm text-muted-foreground">{player.team}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm font-medium">{player.goals}</div>
                        <div className="text-xs text-muted-foreground">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{player.assists}</div>
                        <div className="text-xs text-muted-foreground">Assists</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{player.matchesPlayed}</div>
                        <div className="text-xs text-muted-foreground">Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{player.rating}</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        <Award className="h-3 w-3 mr-1" />
                        Top
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement by Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Players</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }} />
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Coaches</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }} />
                      </div>
                      <span className="text-sm font-medium">88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Admins</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }} />
                      </div>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Match Tracking</span>
                    <Badge variant="outline">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Team Chat</span>
                    <Badge variant="outline">Medium</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tournament Brackets</span>
                    <Badge variant="outline">High</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment System</span>
                    <Badge variant="outline">Low</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">$23,456</div>
                  <div className="text-sm text-muted-foreground">Monthly Subscriptions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$12,345</div>
                  <div className="text-sm text-muted-foreground">Tournament Fees</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">$9,877</div>
                  <div className="text-sm text-muted-foreground">Premium Features</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 