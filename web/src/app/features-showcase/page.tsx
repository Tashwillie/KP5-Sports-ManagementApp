"use client";

import React, { useState } from 'react';
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
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';

export default function FeaturesShowcasePage() {
  const [activeTab, setActiveTab] = useState('messaging');

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section */}
      <div className="bg-white border-bottom">
        <div className="container py-5">
          <div className="text-center">
            <h1 className="display-4 fw-bold text-dark mb-3">
              🚀 Advanced Features Showcase
            </h1>
            <p className="lead text-muted mb-4 mx-auto" style={{maxWidth: '600px'}}>
              Explore the comprehensive sports management platform with real-time messaging, 
              file management, admin controls, push notifications, advanced analytics, and more.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <div className="d-flex align-items-center gap-2 bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                <Star className="h-4 w-4" />
                <span className="fw-medium">Real-time Messaging</span>
              </div>
              <div className="d-flex align-items-center gap-2 bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                <Upload className="h-4 w-4" />
                <span className="fw-medium">File Management</span>
              </div>
              <div className="d-flex align-items-center gap-2 bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                <Shield className="h-4 w-4" />
                <span className="fw-medium">Admin Dashboard</span>
              </div>
              <div className="d-flex align-items-center gap-2 bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">
                <Trophy className="h-4 w-4" />
                <span className="fw-medium">Tournament Management</span>
              </div>
              <div className="d-flex align-items-center gap-2 bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill">
                <Bell className="h-4 w-4" />
                <span className="fw-medium">Push Notifications</span>
              </div>
              <div className="d-flex align-items-center gap-2 bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                <TrendingUp className="h-4 w-4" />
                <span className="fw-medium">Advanced Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Tabs */}
      <div className="container py-5">
        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" id="featuresTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'messaging' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('messaging')}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="d-none d-sm-inline">Messaging</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'files' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('files')}
            >
              <Upload className="h-4 w-4" />
              <span className="d-none d-sm-inline">Files</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('admin')}
            >
              <Shield className="h-4 w-4" />
              <span className="d-none d-sm-inline">Admin</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'tournaments' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('tournaments')}
            >
              <Trophy className="h-4 w-4" />
              <span className="d-none d-sm-inline">Tournaments</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'matches' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('matches')}
            >
              <Calendar className="h-4 w-4" />
              <span className="d-none d-sm-inline">Live Matches</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'payments' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('payments')}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="d-none d-sm-inline">Payments</span>
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'analytics' ? 'active' : ''} d-flex align-items-center gap-2`}
              onClick={() => setActiveTab('analytics')}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="d-none d-sm-inline">Analytics</span>
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content" id="featuresTabContent">
          {/* Messaging Feature */}
          <div className={`tab-pane fade ${activeTab === 'messaging' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span>Real-Time Messaging System</span>
                </h5>
                <p className="text-muted mb-0">
                  Team chat and direct messaging with file sharing, real-time updates, and role-based access control.
                </p>
              </div>
              <div className="card-body">
                <ChatInterface />
              </div>
            </div>
          </div>

          {/* File Upload Feature */}
          <div className={`tab-pane fade ${activeTab === 'files' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <Upload className="h-5 w-5 text-success" />
                  <span>Advanced File Management</span>
                </h5>
                <p className="text-muted mb-0">
                  Drag-and-drop file uploads with progress tracking, categorization, and secure storage management.
                </p>
              </div>
              <div className="card-body">
                <FileUploadSystem />
              </div>
            </div>
          </div>

          {/* Admin Dashboard Feature */}
          <div className={`tab-pane fade ${activeTab === 'admin' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <Shield className="h-5 w-5 text-info" />
                  <span>Enhanced Admin Dashboard</span>
                </h5>
                <p className="text-muted mb-0">
                  Comprehensive user management, system analytics, activity monitoring, and security controls.
                </p>
              </div>
              <div className="card-body">
                <EnhancedAdminDashboard />
              </div>
            </div>
          </div>

          {/* Tournament Management Feature */}
          <div className={`tab-pane fade ${activeTab === 'tournaments' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  <span>Tournament Bracket Management</span>
                </h5>
                <p className="text-muted mb-0">
                  Interactive tournament brackets with automatic progression, seeding, and real-time updates.
                </p>
              </div>
              <div className="card-body">
                <TournamentBracket />
              </div>
            </div>
          </div>

          {/* Live Match Tracking Feature */}
          <div className={`tab-pane fade ${activeTab === 'matches' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <Calendar className="h-5 w-5 text-danger" />
                  <span>Live Match Tracking</span>
                </h5>
                <p className="text-muted mb-0">
                  Real-time match event entry for referees and admins with automatic stats updates and live synchronization.
                </p>
              </div>
              <div className="card-body">
                <LiveMatchTracker />
              </div>
            </div>
          </div>

          {/* Payment System Feature */}
          <div className={`tab-pane fade ${activeTab === 'payments' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Payment Management System</span>
                </h5>
                <p className="text-muted mb-0">
                  Comprehensive payment tracking, invoice management, and financial reporting for clubs and tournaments.
                </p>
              </div>
              <div className="card-body">
                <PaymentSystem />
              </div>
            </div>
          </div>

          {/* Advanced Analytics Feature */}
          <div className={`tab-pane fade ${activeTab === 'analytics' ? 'show active' : ''}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <span>Advanced Analytics Dashboard</span>
                </h5>
                <p className="text-muted mb-0">
                  Comprehensive analytics with performance metrics, user engagement, revenue tracking, and data visualization.
                </p>
              </div>
              <div className="card-body">
                <AdvancedAnalyticsDashboard />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="row g-4 mt-5">
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary bg-opacity-10 rounded p-2">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h5 className="fw-semibold mb-0">Real-Time Communication</h5>
                </div>
                <p className="text-muted mb-3">
                  Instant messaging between team members, coaches, and administrators with file sharing capabilities.
                </p>
                <ul className="small text-muted">
                  <li>Team and direct messaging</li>
                  <li>File and image sharing</li>
                  <li>Real-time notifications</li>
                  <li>Message history and search</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-success bg-opacity-10 rounded p-2">
                    <Upload className="h-6 w-6 text-success" />
                  </div>
                  <h5 className="fw-semibold mb-0">File Management</h5>
                </div>
                <p className="text-muted mb-3">
                  Secure file upload and management system with categorization, progress tracking, and access control.
                </p>
                <ul className="small text-muted">
                  <li>Drag-and-drop uploads</li>
                  <li>File categorization</li>
                  <li>Progress tracking</li>
                  <li>Secure storage</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-info bg-opacity-10 rounded p-2">
                    <Shield className="h-6 w-6 text-info" />
                  </div>
                  <h5 className="fw-semibold mb-0">Admin Controls</h5>
                </div>
                <p className="text-muted mb-3">
                  Comprehensive administrative dashboard with user management, analytics, and system monitoring.
                </p>
                <ul className="small text-muted">
                  <li>User management</li>
                  <li>System analytics</li>
                  <li>Activity monitoring</li>
                  <li>Security controls</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-warning bg-opacity-10 rounded p-2">
                    <Trophy className="h-6 w-6 text-warning" />
                  </div>
                  <h5 className="fw-semibold mb-0">Tournament Management</h5>
                </div>
                <p className="text-muted mb-3">
                  Advanced tournament bracket system with automatic progression and real-time updates.
                </p>
                <ul className="small text-muted">
                  <li>Interactive brackets</li>
                  <li>Automatic seeding</li>
                  <li>Real-time updates</li>
                  <li>Match scheduling</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-danger bg-opacity-10 rounded p-2">
                    <Calendar className="h-6 w-6 text-danger" />
                  </div>
                  <h5 className="fw-semibold mb-0">Live Match Tracking</h5>
                </div>
                <p className="text-muted mb-3">
                  Real-time match event entry for referees with automatic stats updates and live synchronization.
                </p>
                <ul className="small text-muted">
                  <li>Live event entry</li>
                  <li>Automatic stats</li>
                  <li>Real-time sync</li>
                  <li>Multi-device support</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary bg-opacity-10 rounded p-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h5 className="fw-semibold mb-0">Payment System</h5>
                </div>
                <p className="text-muted mb-3">
                  Comprehensive payment tracking and financial management for clubs and tournaments.
                </p>
                <ul className="small text-muted">
                  <li>Payment tracking</li>
                  <li>Invoice management</li>
                  <li>Financial reporting</li>
                  <li>Secure transactions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-5">
          <div className="card bg-primary text-white">
            <div className="card-body p-5">
              <h2 className="h3 fw-bold mb-3">Ready to Get Started?</h2>
              <p className="text-light mb-4">
                Experience the full power of our sports management platform with all these advanced features.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button className="btn btn-light btn-lg">
                  <ArrowRight className="h-4 w-4 me-2" />
                  Explore Dashboard
                </button>
                <button className="btn btn-outline-light btn-lg">
                  <Users className="h-4 w-4 me-2" />
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 