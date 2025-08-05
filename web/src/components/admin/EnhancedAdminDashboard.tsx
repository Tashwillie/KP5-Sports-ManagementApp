"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  Settings, 
  Shield, 
  BarChart3, 
  TrendingUp,
  UserPlus,
  UserMinus,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useLocalAuth } from '@/hooks/useLocalApi';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'club_admin' | 'coach' | 'player' | 'parent' | 'referee';
  status: 'active' | 'inactive' | 'suspended';
  lastActive: Date;
  createdAt: Date;
  avatar?: string;
  phone?: string;
  location?: string;
}

interface SystemMetric {
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  details: string;
  severity: 'info' | 'warning' | 'error';
}

export default function EnhancedAdminDashboard() {
  const { user } = useLocalAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: 'super_admin',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 30),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        phone: '+1 (555) 123-4567',
        location: 'New York, NY'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        role: 'club_admin',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        phone: '+1 (555) 234-5678',
        location: 'Los Angeles, CA'
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike.davis@example.com',
        role: 'coach',
        status: 'active',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 5),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        phone: '+1 (555) 345-6789',
        location: 'Chicago, IL'
      },
      {
        id: '4',
        name: 'Emily Wilson',
        email: 'emily.wilson@example.com',
        role: 'player',
        status: 'inactive',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
        phone: '+1 (555) 456-7890',
        location: 'Miami, FL'
      },
      {
        id: '5',
        name: 'David Brown',
        email: 'david.brown@example.com',
        role: 'referee',
        status: 'suspended',
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        phone: '+1 (555) 567-8901',
        location: 'Seattle, WA'
      }
    ];

    const mockActivityLogs: ActivityLog[] = [
      {
        id: '1',
        user: 'John Smith',
        action: 'User created',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        details: 'New user account created for Sarah Johnson',
        severity: 'info'
      },
      {
        id: '2',
        user: 'System',
        action: 'Security alert',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        details: 'Multiple failed login attempts detected',
        severity: 'warning'
      },
      {
        id: '3',
        user: 'Sarah Johnson',
        action: 'Role updated',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        details: 'User role changed from player to club_admin',
        severity: 'info'
      },
      {
        id: '4',
        user: 'Mike Davis',
        action: 'Account suspended',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        details: 'Account suspended due to policy violation',
        severity: 'error'
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setActivityLogs(mockActivityLogs);
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  const systemMetrics: SystemMetric[] = [
    {
      name: 'Total Users',
      value: 1247,
      change: 12.5,
      changeType: 'increase',
      icon: <Users className="h-4 w-4" />
    },
    {
      name: 'Active Sessions',
      value: 89,
      change: -3.2,
      changeType: 'decrease',
      icon: <Activity className="h-4 w-4" />
    },
    {
      name: 'Revenue',
      value: 45678,
      change: 8.7,
      changeType: 'increase',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      name: 'Events Today',
      value: 23,
      change: 15.4,
      changeType: 'increase',
      icon: <Calendar className="h-4 w-4" />
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'club_admin': return 'bg-blue-100 text-blue-800';
      case 'coach': return 'bg-green-100 text-green-800';
      case 'player': return 'bg-purple-100 text-purple-800';
      case 'parent': return 'bg-orange-100 text-orange-800';
      case 'referee': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserAction = (action: string, userId: string) => {
    console.log(`${action} user ${userId}`);
    // Implement actual user management logic here
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, monitor system, and control access</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                  <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                </div>
                <div className={`p-2 rounded-full ${metric.changeType === 'increase' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {metric.icon}
                </div>
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className={`h-4 w-4 mr-1 ${metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Activity Log</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>System Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="club_admin">Club Admin</option>
                  <option value="coach">Coach</option>
                  <option value="player">Player</option>
                  <option value="parent">Parent</option>
                  <option value="referee">Referee</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role.replace('_', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500">
                        Last active: {formatTimeAgo(user.lastActive)}
                      </p>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                  <p className="text-gray-500">Chart placeholder - User growth over time</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                  <p className="text-gray-500">Chart placeholder - Role distribution</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity === 'error' && <AlertTriangle className="h-4 w-4" />}
                        {log.severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
                        {log.severity === 'info' && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{log.action}</h3>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <p className="text-xs text-gray-500">by {log.user}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimeAgo(log.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Require 2FA for all users</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Session Timeout</h3>
                    <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Password Policy</h3>
                    <p className="text-sm text-gray-600">Minimum password requirements</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600">System alert preferences</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Backup Schedule</h3>
                    <p className="text-sm text-gray-600">Automated data backups</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">API Rate Limiting</h3>
                    <p className="text-sm text-gray-600">Request throttling settings</p>
                  </div>
                  <Button variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 