'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  BarChart3, 
  TrendingUp,
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
  RefreshCw,
  Database,
  Server,
  Network,
  HardDrive,
  Cpu,
  Memory,
  Zap
} from 'lucide-react';

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  database: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface SecurityMetrics {
  activeUsers: number;
  failedLogins: number;
  suspiciousActivity: number;
  blockedIPs: number;
  lastIncident: Date;
  threatLevel: 'low' | 'medium' | 'high';
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  loadAverage: number;
}

interface AdvancedAdminToolsProps {
  onUserAction?: (action: string, userId: string) => void;
  onSystemAction?: (action: string, data: any) => void;
  onSecurityAction?: (action: string, data: any) => void;
}

export function AdvancedAdminTools({
  onUserAction,
  onSystemAction,
  onSecurityAction
}: AdvancedAdminToolsProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 85,
    database: 92,
    status: 'healthy'
  });
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    activeUsers: 1247,
    failedLogins: 23,
    suspiciousActivity: 5,
    blockedIPs: 12,
    lastIncident: new Date(Date.now() - 1000 * 60 * 60 * 2),
    threatLevel: 'low'
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    responseTime: 245,
    throughput: 1250,
    errorRate: 0.12,
    uptime: 99.8,
    loadAverage: 1.2
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'security' | 'performance' | 'system'>('overview');

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(95, prev.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(50, Math.min(95, prev.disk + (Math.random() - 0.5) * 2)),
        network: Math.max(60, Math.min(98, prev.network + (Math.random() - 0.5) * 8)),
        database: Math.max(80, Math.min(99, prev.database + (Math.random() - 0.5) * 3))
      }));

      setPerformanceMetrics(prev => ({
        ...prev,
        responseTime: Math.max(100, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 50)),
        throughput: Math.max(800, Math.min(2000, prev.throughput + (Math.random() - 0.5) * 100)),
        errorRate: Math.max(0.01, Math.min(1.0, prev.errorRate + (Math.random() - 0.5) * 0.1)),
        loadAverage: Math.max(0.5, Math.min(3.0, prev.loadAverage + (Math.random() - 0.5) * 0.3))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = (value: number) => {
    if (value >= 90) return { status: 'Critical', color: 'bg-red-100 text-red-800' };
    if (value >= 75) return { status: 'Warning', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Healthy', color: 'bg-green-100 text-green-800' };
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Advanced Administrative Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Performance</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>System</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* System Health Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="h-4 w-4 mr-2" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'CPU', value: systemHealth.cpu, icon: Cpu },
                      { name: 'Memory', value: systemHealth.memory, icon: Memory },
                      { name: 'Disk', value: systemHealth.disk, icon: HardDrive },
                      { name: 'Network', value: systemHealth.network, icon: Network },
                      { name: 'Database', value: systemHealth.database, icon: Database }
                    ].map(({ name, value, icon: Icon }) => {
                      const status = getHealthStatus(value);
                      return (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  value >= 90 ? 'bg-red-500' : 
                                  value >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <Badge className={status.color}>
                              {value.toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Security Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Security Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Users</span>
                      <span className="font-medium">{securityMetrics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Failed Logins</span>
                      <Badge className="bg-red-100 text-red-800">
                        {securityMetrics.failedLogins}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Suspicious Activity</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {securityMetrics.suspiciousActivity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Blocked IPs</span>
                      <Badge className="bg-orange-100 text-orange-800">
                        {securityMetrics.blockedIPs}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Threat Level</span>
                      <Badge className={getThreatLevelColor(securityMetrics.threatLevel)}>
                        {securityMetrics.threatLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Time</span>
                      <span className="font-medium">{performanceMetrics.responseTime}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Throughput</span>
                      <span className="font-medium">{performanceMetrics.throughput}/sec</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate</span>
                      <Badge className={performanceMetrics.errorRate > 0.5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                        {performanceMetrics.errorRate.toFixed(2)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="font-medium">{performanceMetrics.uptime}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Load Average</span>
                      <span className="font-medium">{performanceMetrics.loadAverage}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input placeholder="Search users..." />
                      </div>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { role: 'super_admin', count: 3, color: 'bg-red-100 text-red-800' },
                        { role: 'club_admin', count: 15, color: 'bg-blue-100 text-blue-800' },
                        { role: 'coach', count: 45, color: 'bg-green-100 text-green-800' },
                        { role: 'player', count: 892, color: 'bg-purple-100 text-purple-800' },
                        { role: 'parent', count: 234, color: 'bg-orange-100 text-orange-800' },
                        { role: 'referee', count: 58, color: 'bg-yellow-100 text-yellow-800' }
                      ].map(({ role, count, color }) => (
                        <div key={role} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium capitalize">{role.replace('_', ' ')}</div>
                              <div className="text-sm text-gray-600">{count} users</div>
                            </div>
                            <Badge className={color}>
                              {((count / 1247) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Recent Security Events</h3>
                        <div className="space-y-2">
                          {[
                            { type: 'Failed Login', count: 5, time: '2 min ago', severity: 'warning' },
                            { type: 'Suspicious IP', count: 1, time: '5 min ago', severity: 'high' },
                            { type: 'Rate Limit Exceeded', count: 3, time: '10 min ago', severity: 'medium' },
                            { type: 'Unauthorized Access', count: 1, time: '15 min ago', severity: 'high' }
                          ].map((event, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{event.type}</div>
                                <div className="text-sm text-gray-600">{event.time}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={
                                  event.severity === 'high' ? 'bg-red-100 text-red-800' :
                                  event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }>
                                  {event.count}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Security Actions</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Block Suspicious IPs
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Users className="h-4 w-4 mr-2" />
                            Review User Sessions
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Activity className="h-4 w-4 mr-2" />
                            Security Audit
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Update Security Rules
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Real-time Metrics</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>Response Time</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    performanceMetrics.responseTime > 400 ? 'bg-red-500' :
                                    performanceMetrics.responseTime > 300 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(100, (performanceMetrics.responseTime / 500) * 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{performanceMetrics.responseTime}ms</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Throughput</span>
                            <span className="font-medium">{performanceMetrics.throughput}/sec</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Error Rate</span>
                            <Badge className={performanceMetrics.errorRate > 0.5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                              {performanceMetrics.errorRate.toFixed(2)}%
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Performance Actions</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear Cache
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Database className="h-4 w-4 mr-2" />
                            Optimize Database
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Server className="h-4 w-4 mr-2" />
                            Restart Services
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Performance Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Administration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">System Status</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Web Server</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Online</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Database</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Online</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Cache Server</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Online</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>File Storage</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Online</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">System Actions</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            System Configuration
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Database className="h-4 w-4 mr-2" />
                            Backup Database
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            System Maintenance
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="h-4 w-4 mr-2" />
                            Export System Logs
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 