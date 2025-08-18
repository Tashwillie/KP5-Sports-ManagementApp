"use client";

import React, { useState } from 'react';
import TournamentBracket from '@/components/tournament/TournamentBracket';
import LiveMatchTracker from '@/components/match/LiveMatchTracker';
import PaymentSystem from '@/components/payments/PaymentSystem';
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
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white border-bottom">
        <div className="container py-5">
          <div className="text-center">
            <h1 className="display-4 fw-bold text-dark mb-3">
              Advanced Features Demo
            </h1>
            <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
              Explore the comprehensive sports management features including tournament brackets, 
              live match tracking, and integrated payment systems.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" id="featuresTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'tournaments' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('tournaments')}
            >
              <Trophy className="h-4 w-4" />
              <span>Tournament Brackets</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'live-tracking' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('live-tracking')}
            >
              <Target className="h-4 w-4" />
              <span>Live Match Tracking</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'payments' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('payments')}
            >
              <DollarSign className="h-4 w-4" />
              <span>Payment System</span>
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content" id="featuresTabContent">
          {/* Tournament Brackets Tab */}
          <div className={`tab-pane fade ${activeTab === 'tournaments' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="mb-4">
                  <h2 className="h3 fw-bold text-dark mb-2">
                    Tournament Bracket System
                  </h2>
                  <p className="text-muted">
                    Manage tournament brackets with automatic progression, real-time score updates, 
                    and comprehensive match scheduling.
                  </p>
                </div>
                
                <TournamentBracket
                  tournament={{
                    id: "demo-tournament",
                    name: "Demo Tournament",
                    format: "knockout",
                    status: "active",
                    startDate: new Date('2024-01-15'),
                    endDate: new Date('2024-01-25'),
                    teams: sampleTeams.map(team => ({
                      id: team.id,
                      name: team.name,
                      logo: team.logo,
                      seed: team.seed
                    })),
                    matches: sampleMatches.map(match => ({
                      id: match.id,
                      homeTeam: { id: match.team1Id, name: sampleTeams.find(t => t.id === match.team1Id)?.name || 'Unknown' },
                      awayTeam: { id: match.team2Id, name: sampleTeams.find(t => t.id === match.team2Id)?.name || 'TBD' },
                      homeScore: match.team1Score,
                      awayScore: match.team2Score,
                      status: match.status,
                      startTime: match.scheduledTime,
                      location: match.venue,
                      round: match.round,
                      matchNumber: match.matchNumber,
                      winner: match.winnerId ? { id: match.winnerId, name: sampleTeams.find(t => t.id === match.winnerId)?.name || 'Unknown' } : undefined,
                      homeTeamId: match.team1Id,
                      awayTeamId: match.team2Id,
                      matchType: 'knockout',
                    })),
                    maxTeams: 8,
                    currentTeams: 6,
                    rounds: 1,
                    settings: { hasThirdPlace: false, hasSeeding: true, groupSize: 2, knockoutRounds: 1 },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Live Match Tracking Tab */}
          <div className={`tab-pane fade ${activeTab === 'live-tracking' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="mb-4">
                  <h2 className="h3 fw-bold text-dark mb-2">
                    Live Match Tracking
                  </h2>
                  <p className="text-muted">
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
            </div>
          </div>

          {/* Payment System Tab */}
          <div className={`tab-pane fade ${activeTab === 'payments' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="mb-4">
                  <h2 className="h3 fw-bold text-dark mb-2">
                    Payment Management System
                  </h2>
                  <p className="text-muted">
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
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="row g-4 mt-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded p-2 me-3">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <h5 className="card-title mb-0">Tournament Management</h5>
                </div>
                <ul className="list-unstyled">
                  <li className="d-flex align-items-center mb-2">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Automatic bracket generation</small>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Real-time score updates</small>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Team progression tracking</small>
                  </li>
                  <li className="d-flex align-items-center">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Match scheduling & venues</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success bg-opacity-10 rounded p-2 me-3">
                    <Target className="h-5 w-5 text-success" />
                  </div>
                  <h5 className="card-title mb-0">Live Match Tracking</h5>
                </div>
                <ul className="list-unstyled">
                  <li className="d-flex align-items-center mb-2">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Real-time event recording</small>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Goals, cards & substitutions</small>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Match timer & controls</small>
                  </li>
                  <li className="d-flex align-items-center">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Player statistics tracking</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-info bg-opacity-10 rounded p-2 me-3">
                    <DollarSign className="h-5 w-5 text-info" />
                  </div>
                  <h5 className="card-title mb-0">Payment Processing</h5>
                </div>
                <ul className="list-unstyled">
                  <li className="d-flex align-items-center mb-2">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Stripe integration</small>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">One-time & recurring payments</small>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Transaction management</small>
                  </li>
                  <li className="d-flex align-items-center">
                    <Star className="h-3 w-3 text-warning me-2" />
                    <small className="text-muted">Revenue analytics</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Features */}
        <div className="card border-0 shadow-sm mt-5">
          <div className="card-body p-4">
            <h3 className="h4 fw-bold text-dark mb-4">Technical Features</h3>
            <div className="row g-3">
              <div className="col-md-3 col-6">
                <div className="d-flex align-items-center">
                  <Zap className="h-4 w-4 text-primary me-2" />
                  <small>Real-time updates</small>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="d-flex align-items-center">
                  <Shield className="h-4 w-4 text-success me-2" />
                  <small>Secure payments</small>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="d-flex align-items-center">
                  <Users className="h-4 w-4 text-info me-2" />
                  <small>Multi-user support</small>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="d-flex align-items-center">
                  <Clock className="h-4 w-4 text-warning me-2" />
                  <small>Live synchronization</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 