"use client";

import React, { useState } from 'react';
import { TournamentBracket } from '@/components/tournament/TournamentBracket';
import { LiveMatchTracker } from '@/components/match/LiveMatchTracker';
import { PaymentSystem } from '@/components/payments/PaymentSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Target, 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin,
  Star,
  Award,
  Clock,
  Zap,
  Shield
} from 'lucide-react';

// Sample data for demonstration
const sampleTeams = [
  { id: '1', name: 'Red Dragons', logo: '/images/teams/red-dragons.png', seed: 1, wins: 5, losses: 1, pointsFor: 15, pointsAgainst: 8 },
  { id: '2', name: 'Blue Eagles', logo: '/images/teams/blue-eagles.png', seed: 2, wins: 4, losses: 2, pointsFor: 12, pointsAgainst: 9 },
  { id: '3', name: 'Green Lions', logo: '/images/teams/green-lions.png', seed: 3, wins: 3, losses: 3, pointsFor: 10, pointsAgainst: 11 },
  { id: '4', name: 'Yellow Tigers', logo: '/images/teams/yellow-tigers.png', seed: 4, wins: 2, losses: 4, pointsFor: 8, pointsAgainst: 13 },
  { id: '5', name: 'Purple Panthers', logo: '/images/teams/purple-panthers.png', seed: 5, wins: 1, losses: 5, pointsFor: 6, pointsAgainst: 15 },
  { id: '6', name: 'Orange Bears', logo: '/images/teams/orange-bears.png', seed: 6, wins: 0, losses: 6, pointsFor: 4, pointsAgainst: 17 },
];

const sampleMatches = [
  { id: '1', team1Id: '1', team2Id: '2', team1Score: 3, team2Score: 1, winnerId: '1', round: 1, matchNumber: 1, status: 'completed' as const, scheduledTime: new Date('2024-01-15T14:00:00'), venue: 'Main Stadium' },
  { id: '2', team1Id: '3', team2Id: '4', team1Score: 2, team2Score: 0, winnerId: '3', round: 1, matchNumber: 2, status: 'completed' as const, scheduledTime: new Date('2024-01-15T16:00:00'), venue: 'Main Stadium' },
  { id: '3', team1Id: '5', team2Id: '6', team1Score: 1, team2Score: 1, winnerId: undefined, round: 1, matchNumber: 3, status: 'completed' as const, scheduledTime: new Date('2024-01-15T18:00:00'), venue: 'Main Stadium' },
  { id: '4', team1Id: '1', team2Id: '3', team1Score: 2, team2Score: 1, winnerId: '1', round: 2, matchNumber: 4, status: 'completed' as const, scheduledTime: new Date('2024-01-20T15:00:00'), venue: 'Main Stadium' },
  { id: '5', team1Id: '4', team2Id: '5', team1Score: undefined, team2Score: undefined, winnerId: undefined, round: 2, matchNumber: 5, status: 'scheduled' as const, scheduledTime: new Date('2024-01-20T17:00:00'), venue: 'Main Stadium' },
  { id: '6', team1Id: '1', team2Id: 'TBD', team1Score: undefined, team2Score: undefined, winnerId: undefined, round: 3, matchNumber: 6, status: 'scheduled' as const, scheduledTime: new Date('2024-01-25T16:00:00'), venue: 'Main Stadium' },
];

const samplePlayers = [
  { id: '1', name: 'John Smith', number: 10, position: 'Forward', teamId: '1' },
  { id: '2', name: 'Mike Johnson', number: 7, position: 'Midfielder', teamId: '1' },
  { id: '3', name: 'David Wilson', number: 1, position: 'Goalkeeper', teamId: '1' },
  { id: '4', name: 'Chris Brown', number: 9, position: 'Forward', teamId: '2' },
  { id: '5', name: 'Alex Davis', number: 6, position: 'Defender', teamId: '2' },
  { id: '6', name: 'Sam Miller', number: 12, position: 'Goalkeeper', teamId: '2' },
];

const samplePaymentItems = [
  {
    id: '1',
    name: 'Summer Tournament Registration',
    description: 'Annual summer soccer tournament for all age groups',
    amount: 75.00,
    currency: 'USD',
    type: 'one_time' as const,
    category: 'tournament' as const,
    maxParticipants: 200,
    currentParticipants: 156,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-15'),
    venue: 'City Sports Complex',
    isActive: true
  },
  {
    id: '2',
    name: 'Monthly Club Membership',
    description: 'Access to training facilities and coaching sessions',
    amount: 45.00,
    currency: 'USD',
    type: 'recurring' as const,
    category: 'membership' as const,
    recurringInterval: 'monthly' as const,
    maxParticipants: undefined,
    currentParticipants: 89,
    isActive: true
  },
  {
    id: '3',
    name: 'Professional Training Camp',
    description: 'Weekend intensive training with professional coaches',
    amount: 150.00,
    currency: 'USD',
    type: 'one_time' as const,
    category: 'training' as const,
    maxParticipants: 50,
    currentParticipants: 32,
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-03-17'),
    venue: 'Elite Training Center',
    isActive: true
  }
];

const sampleTransactions = [
  {
    id: '1',
    paymentItemId: '1',
    userId: 'user1',
    userName: 'John Smith',
    amount: 75.00,
    currency: 'USD',
    status: 'completed' as const,
    paymentMethod: 'card' as const,
    stripePaymentIntentId: 'pi_1234567890',
    createdAt: new Date('2024-01-10T10:30:00'),
    updatedAt: new Date('2024-01-10T10:32:00')
  },
  {
    id: '2',
    paymentItemId: '2',
    userId: 'user2',
    userName: 'Mike Johnson',
    amount: 45.00,
    currency: 'USD',
    status: 'completed' as const,
    paymentMethod: 'card' as const,
    stripePaymentIntentId: 'pi_1234567891',
    createdAt: new Date('2024-01-12T14:15:00'),
    updatedAt: new Date('2024-01-12T14:17:00')
  },
  {
    id: '3',
    paymentItemId: '3',
    userId: 'user3',
    userName: 'David Wilson',
    amount: 150.00,
    currency: 'USD',
    status: 'pending' as const,
    paymentMethod: 'bank_transfer' as const,
    createdAt: new Date('2024-01-14T09:45:00'),
    updatedAt: new Date('2024-01-14T09:45:00')
  }
];

export default function AdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState('tournaments');

  const handleMatchUpdate = (matchId: string, updates: any) => {
    console.log('Match updated:', matchId, updates);
  };

  const handleTeamAdvance = (matchId: string, winnerId: string) => {
    console.log('Team advanced:', matchId, winnerId);
  };

  const handleEventAdd = (event: any) => {
    console.log('Event added:', event);
  };

  const handleEventUpdate = (eventId: string, updates: any) => {
    console.log('Event updated:', eventId, updates);
  };

  const handleEventDelete = (eventId: string) => {
    console.log('Event deleted:', eventId);
  };

  const handleMatchStateChange = (state: any) => {
    console.log('Match state changed:', state);
  };

  const handleScoreUpdate = (teamId: string, score: number) => {
    console.log('Score updated:', teamId, score);
  };

  const handlePaymentItemCreate = (item: any) => {
    console.log('Payment item created:', item);
  };

  const handlePaymentItemUpdate = (id: string, updates: any) => {
    console.log('Payment item updated:', id, updates);
  };

  const handlePaymentItemDelete = (id: string) => {
    console.log('Payment item deleted:', id);
  };

  const handlePaymentProcess = async (paymentItemId: string, userId: string, paymentMethod: string) => {
    console.log('Payment processed:', paymentItemId, userId, paymentMethod);
  };

  const handlePaymentRefund = async (transactionId: string, reason: string) => {
    console.log('Payment refunded:', transactionId, reason);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Features Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the comprehensive sports management features including tournament brackets, 
              live match tracking, and integrated payment systems.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tournaments" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Tournament Brackets</span>
            </TabsTrigger>
            <TabsTrigger value="live-tracking" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Live Match Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Payment System</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tournament Bracket System
                </h2>
                <p className="text-gray-600">
                  Manage tournament brackets with automatic progression, real-time score updates, 
                  and comprehensive match scheduling.
                </p>
              </div>
              
              <TournamentBracket
                tournamentId="demo-tournament"
                teams={sampleTeams}
                matches={sampleMatches}
                bracketType="single_elimination"
                onMatchUpdate={handleMatchUpdate}
                onTeamAdvance={handleTeamAdvance}
              />
            </div>
          </TabsContent>

          <TabsContent value="live-tracking" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Live Match Tracking
                </h2>
                <p className="text-gray-600">
                  Real-time match data entry for referees and administrators with comprehensive 
                  event tracking and statistics.
                </p>
              </div>
              
              <LiveMatchTracker
                matchId="demo-match"
                team1={{
                  id: '1',
                  name: 'Red Dragons',
                  logo: '/images/teams/red-dragons.png',
                  players: samplePlayers.filter(p => p.teamId === '1')
                }}
                team2={{
                  id: '2',
                  name: 'Blue Eagles',
                  logo: '/images/teams/blue-eagles.png',
                  players: samplePlayers.filter(p => p.teamId === '2')
                }}
                onEventAdd={handleEventAdd}
                onEventUpdate={handleEventUpdate}
                onEventDelete={handleEventDelete}
                onMatchStateChange={handleMatchStateChange}
                onScoreUpdate={handleScoreUpdate}
              />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Management System
                </h2>
                <p className="text-gray-600">
                  Comprehensive payment processing with Stripe integration, supporting one-time 
                  and recurring payments for tournaments, memberships, and training programs.
                </p>
              </div>
              
              <PaymentSystem
                paymentItems={samplePaymentItems}
                transactions={sampleTransactions}
                onPaymentItemCreate={handlePaymentItemCreate}
                onPaymentItemUpdate={handlePaymentItemUpdate}
                onPaymentItemDelete={handlePaymentItemDelete}
                onPaymentProcess={handlePaymentProcess}
                onPaymentRefund={handlePaymentRefund}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Tournament Management</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Automatic bracket generation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Real-time score updates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Team progression tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Match scheduling & venues</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Live Match Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Real-time event recording</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Goals, cards & substitutions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Match timer & controls</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Player statistics tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Payment Processing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Stripe integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>One-time & recurring payments</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Transaction management</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Revenue analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Technical Features */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm">Real-time updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm">Secure payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Multi-user support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm">Live synchronization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 