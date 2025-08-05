"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
                MessageCircle,
              Upload,
              Shield,
              Users,
              Trophy,
              Calendar,
              BarChart3,
              Settings,
              ArrowRight,
              Star,
              Bell,
              TrendingUp
} from 'lucide-react';
import ChatInterface from '@/components/messaging/ChatInterface';
import FileUploadSystem from '@/components/upload/FileUploadSystem';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import TournamentBracket from '@/components/tournament/TournamentBracket';
import LiveMatchTracker from '@/components/match/LiveMatchTracker';
import PaymentSystem from '@/components/payments/PaymentSystem';
import PushNotificationSystem from '@/components/notifications/PushNotificationSystem';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';

export default function FeaturesShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 Advanced Features Showcase
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Explore the comprehensive sports management platform with real-time messaging, 
              file management, admin controls, push notifications, advanced analytics, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <Star className="h-4 w-4" />
                <span className="font-medium">Real-time Messaging</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                <Upload className="h-4 w-4" />
                <span className="font-medium">File Management</span>
              </div>
              <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Admin Dashboard</span>
              </div>
              <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full">
                <Trophy className="h-4 w-4" />
                <span className="font-medium">Tournament Management</span>
              </div>
              <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
                <Bell className="h-4 w-4" />
                <span className="font-medium">Push Notifications</span>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Advanced Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="messaging" className="space-y-8">
          <TabsList className="grid w-full grid-cols-8 h-auto bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="messaging" className="flex items-center space-x-2 py-3">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Messaging</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center space-x-2 py-3">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Files</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2 py-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="flex items-center space-x-2 py-3">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Tournaments</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center space-x-2 py-3">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Live Matches</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2 py-3">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2 py-3">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Messaging Feature */}
          <TabsContent value="messaging" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span>Real-Time Messaging System</span>
                </CardTitle>
                <p className="text-gray-600">
                  Team chat and direct messaging with file sharing, real-time updates, and role-based access control.
                </p>
              </CardHeader>
              <CardContent>
                <ChatInterface />
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Upload Feature */}
          <TabsContent value="files" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-green-600" />
                  <span>Advanced File Management</span>
                </CardTitle>
                <p className="text-gray-600">
                  Drag-and-drop file uploads with progress tracking, categorization, and secure storage management.
                </p>
              </CardHeader>
              <CardContent>
                <FileUploadSystem />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Dashboard Feature */}
          <TabsContent value="admin" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Enhanced Admin Dashboard</span>
                </CardTitle>
                <p className="text-gray-600">
                  Comprehensive user management, system analytics, activity monitoring, and security controls.
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedAdminDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tournament Management Feature */}
          <TabsContent value="tournaments" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-orange-600" />
                  <span>Tournament Bracket Management</span>
                </CardTitle>
                <p className="text-gray-600">
                  Interactive tournament brackets with automatic progression, seeding, and real-time updates.
                </p>
              </CardHeader>
              <CardContent>
                <TournamentBracket />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Match Tracking Feature */}
          <TabsContent value="matches" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <span>Live Match Tracking</span>
                </CardTitle>
                <p className="text-gray-600">
                  Real-time match event entry for referees and admins with automatic stats updates and live synchronization.
                </p>
              </CardHeader>
              <CardContent>
                <LiveMatchTracker />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment System Feature */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <span>Payment Management System</span>
                </CardTitle>
                <p className="text-gray-600">
                  Comprehensive payment tracking, invoice management, and financial reporting for clubs and tournaments.
                </p>
              </CardHeader>
              <CardContent>
                <PaymentSystem />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Push Notifications Feature */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  <span>Push Notification System</span>
                </CardTitle>
                <p className="text-gray-600">
                  Comprehensive notification management with preferences, history, templates, and real-time delivery.
                </p>
              </CardHeader>
              <CardContent>
                <PushNotificationSystem />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Analytics Feature */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <span>Advanced Analytics Dashboard</span>
                </CardTitle>
                <p className="text-gray-600">
                  Comprehensive analytics with performance metrics, user engagement, revenue tracking, and data visualization.
                </p>
              </CardHeader>
              <CardContent>
                <AdvancedAnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Real-Time Communication</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Instant messaging between team members, coaches, and administrators with file sharing capabilities.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Team and direct messaging</li>
                <li>• File and image sharing</li>
                <li>• Real-time notifications</li>
                <li>• Message history and search</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">File Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Secure file upload and management system with categorization, progress tracking, and access control.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Drag-and-drop uploads</li>
                <li>• File categorization</li>
                <li>• Progress tracking</li>
                <li>• Secure storage</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Admin Controls</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Comprehensive administrative dashboard with user management, analytics, and system monitoring.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• User management</li>
                <li>• System analytics</li>
                <li>• Activity monitoring</li>
                <li>• Security controls</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold">Tournament Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Advanced tournament bracket system with automatic progression and real-time updates.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Interactive brackets</li>
                <li>• Automatic seeding</li>
                <li>• Real-time updates</li>
                <li>• Match scheduling</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Live Match Tracking</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Real-time match event entry for referees with automatic stats updates and live synchronization.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Live event entry</li>
                <li>• Automatic stats</li>
                <li>• Real-time sync</li>
                <li>• Multi-device support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold">Payment System</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Comprehensive payment tracking and financial management for clubs and tournaments.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Payment tracking</li>
                <li>• Invoice management</li>
                <li>• Financial reporting</li>
                <li>• Secure transactions</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold">Push Notifications</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Advanced notification system with customizable preferences, templates, and real-time delivery.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Customizable preferences</li>
                <li>• Notification templates</li>
                <li>• Real-time delivery</li>
                <li>• History tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold">Advanced Analytics</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Comprehensive analytics dashboard with performance metrics, user engagement, and data visualization.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Performance metrics</li>
                <li>• User engagement</li>
                <li>• Revenue tracking</li>
                <li>• Data visualization</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-blue-100 mb-6">
                Experience the full power of our sports management platform with all these advanced features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Explore Dashboard
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Users className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 