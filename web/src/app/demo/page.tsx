'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Trophy, 
  Calendar, 
  Zap, 
  Flag, 
  Play,
  Settings,
  Code,
  Database,
  Cloud,
  Shield,
  Bell,
  MessageSquare,
  CreditCard,
  FileText,
  BarChart3
} from 'lucide-react';

import ClubDashboard from '@/components/club/ClubDashboard';
import LiveMatchTracker from '@/components/match/LiveMatchTracker';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [demoUserId] = useState('demo-user-123');
  const [demoMatchId] = useState('demo-match-456');

  const features = [
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Real-time Database',
      description: 'Firestore with live updates and offline support',
      color: 'text-blue-600'
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: 'Cloud Functions',
      description: 'Serverless backend with automatic scaling',
      color: 'text-green-600'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Security Rules',
      description: 'Role-based access control and data validation',
      color: 'text-red-600'
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Push Notifications',
      description: 'Real-time notifications across web and mobile',
      color: 'text-purple-600'
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Real-time Chat',
      description: 'Team communication with live messaging',
      color: 'text-orange-600'
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: 'Payment Processing',
      description: 'Stripe integration for registrations and subscriptions',
      color: 'text-indigo-600'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'File Management',
      description: 'Secure file uploads and media management',
      color: 'text-pink-600'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analytics',
      description: 'Comprehensive reporting and insights',
      color: 'text-teal-600'
    }
  ];

  const techStack = [
    {
      category: 'Frontend',
      technologies: [
        { name: 'Next.js 14', description: 'React framework with App Router' },
        { name: 'TypeScript', description: 'Type-safe JavaScript' },
        { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
        { name: 'shadcn/ui', description: 'Modern component library' },
        { name: 'React Query', description: 'Server state management' }
      ]
    },
    {
      category: 'Backend',
      technologies: [
        { name: 'Firebase Firestore', description: 'NoSQL cloud database' },
        { name: 'Firebase Auth', description: 'Authentication service' },
        { name: 'Cloud Functions', description: 'Serverless functions' },
        { name: 'Firebase Storage', description: 'File storage service' },
        { name: 'Firebase Hosting', description: 'Web hosting platform' }
      ]
    },
    {
      category: 'Real-time',
      technologies: [
        { name: 'Firestore Listeners', description: 'Real-time data synchronization' },
        { name: 'FCM', description: 'Push notifications' },
        { name: 'WebSockets', description: 'Live communication' },
        { name: 'Offline Support', description: 'Data persistence' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold">KP5 Academy</span>
              </div>
              <Badge variant="outline" className="ml-4">
                Demo Mode
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Code className="mr-2 h-4 w-4" />
                View Source
              </Button>
              <Button size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="club-dashboard">Club Management</TabsTrigger>
            <TabsTrigger value="live-match">Live Match</TabsTrigger>
            <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Sports Management Platform
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A comprehensive, full-featured sports management system built with modern technologies.
                Experience real-time data synchronization, role-based access control, and seamless user experience.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className={`${feature.color} mb-2`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-2xl font-bold">1,234</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Active Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold">56</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Sports Clubs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span className="text-2xl font-bold">89</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Active Teams</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="text-2xl font-bold">234</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Events This Month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Club Dashboard Tab */}
          <TabsContent value="club-dashboard" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Club Management Dashboard</h2>
                <p className="text-muted-foreground">
                  Experience the full club management interface with real-time data and CRUD operations.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">Live Demo Features:</span>
                </div>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Real-time club data synchronization</li>
                  <li>• Create, edit, and delete clubs</li>
                  <li>• Team and player management</li>
                  <li>• Statistics and analytics</li>
                  <li>• Role-based access control</li>
                </ul>
              </div>

              <ClubDashboard userId={demoUserId} />
            </div>
          </TabsContent>

          {/* Live Match Tab */}
          <TabsContent value="live-match" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Live Match Tracker</h2>
                <p className="text-muted-foreground">
                  Experience real-time match data entry with live updates and event tracking.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <Play className="h-4 w-4" />
                  <span className="font-medium">Live Match Features:</span>
                </div>
                <ul className="mt-2 text-sm text-green-700 space-y-1">
                  <li>• Real-time match timer and controls</li>
                  <li>• Live event recording (goals, cards, substitutions)</li>
                  <li>• Instant score updates</li>
                  <li>• Team statistics tracking</li>
                  <li>• Referee controls and permissions</li>
                </ul>
              </div>

              <LiveMatchTracker matchId={demoMatchId} isReferee={true} />
            </div>
          </TabsContent>

          {/* Tech Stack Tab */}
          <TabsContent value="tech-stack" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Technology Stack</h2>
                <p className="text-muted-foreground">
                  Built with modern, scalable technologies for optimal performance and developer experience.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {techStack.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.technologies.map((tech, techIndex) => (
                          <div key={techIndex} className="space-y-1">
                            <div className="font-medium text-sm">{tech.name}</div>
                            <div className="text-xs text-muted-foreground">{tech.description}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Architecture Diagram */}
              <Card>
                <CardHeader>
                  <CardTitle>System Architecture</CardTitle>
                  <CardDescription>
                    High-level overview of the system architecture and data flow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <div className="text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <p className="font-medium">Architecture Diagram</p>
                      <p className="text-sm mt-2">
                        Frontend (Next.js) → API Layer → Firebase Services → Real-time Updates
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 