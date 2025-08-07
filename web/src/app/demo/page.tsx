'use client';

import React, { useState } from 'react';
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
      color: 'text-primary'
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: 'Cloud Functions',
      description: 'Serverless backend with automatic scaling',
      color: 'text-success'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Security Rules',
      description: 'Role-based access control and data validation',
      color: 'text-danger'
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Push Notifications',
      description: 'Real-time notifications across web and mobile',
      color: 'text-info'
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Real-time Chat',
      description: 'Team communication with live messaging',
      color: 'text-warning'
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: 'Payment Processing',
      description: 'Stripe integration for registrations and subscriptions',
      color: 'text-primary'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'File Management',
      description: 'Secure file uploads and media management',
      color: 'text-success'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Analytics',
      description: 'Comprehensive reporting and insights',
      color: 'text-info'
    }
  ];

  const techStack = [
    {
      category: 'Frontend',
      technologies: [
        { name: 'Next.js 14', description: 'React framework with App Router' },
        { name: 'TypeScript', description: 'Type-safe JavaScript' },
        { name: 'Bootstrap', description: 'CSS framework for responsive design' },
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
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-white border-bottom">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="h5 fw-bold mb-0">KP5 Academy</span>
              </div>
              <span className="badge bg-light text-dark">Demo Mode</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-outline-secondary btn-sm">
                <Code className="h-4 w-4 me-2" />
                View Source
              </button>
              <button className="btn btn-primary btn-sm">
                <Settings className="h-4 w-4 me-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Tabs */}
        <ul className="nav nav-tabs mb-4" id="demoTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'club-dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('club-dashboard')}
            >
              Club Management
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'live-match' ? 'active' : ''}`}
              onClick={() => setActiveTab('live-match')}
            >
              Live Match
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'tech-stack' ? 'active' : ''}`}
              onClick={() => setActiveTab('tech-stack')}
            >
              Tech Stack
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content" id="demoTabContent">
          {/* Overview Tab */}
          <div className={`tab-pane fade ${activeTab === 'overview' ? 'show active' : ''}`}>
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">
                Sports Management Platform
              </h1>
              <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                A comprehensive, full-featured sports management system built with modern technologies.
                Experience real-time data synchronization, role-based access control, and seamless user experience.
              </p>
            </div>

            {/* Features Grid */}
            <div className="row g-4 mb-5">
              {features.map((feature, index) => (
                <div key={index} className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <div className={`${feature.color} mb-3`}>
                        {feature.icon}
                      </div>
                      <h5 className="card-title">{feature.title}</h5>
                      <p className="card-text small text-muted">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="row g-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="h3 fw-bold mb-0">1,234</span>
                    </div>
                    <p className="small text-muted mb-0">Active Users</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-success" />
                      <span className="h3 fw-bold mb-0">56</span>
                    </div>
                    <p className="small text-muted mb-0">Sports Clubs</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-warning" />
                      <span className="h3 fw-bold mb-0">89</span>
                    </div>
                    <p className="small text-muted mb-0">Active Teams</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center">
                    <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-info" />
                      <span className="h3 fw-bold mb-0">234</span>
                    </div>
                    <p className="small text-muted mb-0">Events This Month</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Club Dashboard Tab */}
          <div className={`tab-pane fade ${activeTab === 'club-dashboard' ? 'show active' : ''}`}>
            <div className="mb-4">
              <h2 className="h3 fw-bold mb-2">Club Management Dashboard</h2>
              <p className="text-muted">
                Experience the full club management interface with real-time data and CRUD operations.
              </p>
            </div>
            
            <div className="alert alert-info mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Zap className="h-4 w-4" />
                <span className="fw-medium">Live Demo Features:</span>
              </div>
              <ul className="mb-0 small">
                <li>Real-time club data synchronization</li>
                <li>Create, edit, and delete clubs</li>
                <li>Team and player management</li>
                <li>Statistics and analytics</li>
                <li>Role-based access control</li>
              </ul>
            </div>

            <ClubDashboard userId={demoUserId} />
          </div>

          {/* Live Match Tab */}
          <div className={`tab-pane fade ${activeTab === 'live-match' ? 'show active' : ''}`}>
            <div className="mb-4">
              <h2 className="h3 fw-bold mb-2">Live Match Tracker</h2>
              <p className="text-muted">
                Experience real-time match data entry with live updates and event tracking.
              </p>
            </div>
            
            <div className="alert alert-success mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Play className="h-4 w-4" />
                <span className="fw-medium">Live Match Features:</span>
              </div>
              <ul className="mb-0 small">
                <li>Real-time match timer and controls</li>
                <li>Live event recording (goals, cards, substitutions)</li>
                <li>Instant score updates</li>
                <li>Team statistics tracking</li>
                <li>Referee controls and permissions</li>
              </ul>
            </div>

            <LiveMatchTracker matchId={demoMatchId} isReferee={true} />
          </div>

          {/* Tech Stack Tab */}
          <div className={`tab-pane fade ${activeTab === 'tech-stack' ? 'show active' : ''}`}>
            <div className="mb-4">
              <h2 className="h3 fw-bold mb-2">Technology Stack</h2>
              <p className="text-muted">
                Built with modern, scalable technologies for optimal performance and developer experience.
              </p>
            </div>

            <div className="row g-4 mb-5">
              {techStack.map((category, index) => (
                <div key={index} className="col-md-4">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-white">
                      <h5 className="mb-0">{category.category}</h5>
                    </div>
                    <div className="card-body">
                      <div className="d-flex flex-column gap-3">
                        {category.technologies.map((tech, techIndex) => (
                          <div key={techIndex}>
                            <div className="fw-medium small">{tech.name}</div>
                            <div className="small text-muted">{tech.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture Diagram */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">System Architecture</h5>
                <p className="text-muted mb-0">High-level overview of the system architecture and data flow</p>
              </div>
              <div className="card-body">
                <div className="bg-light rounded p-4 text-center">
                  <div className="text-muted">
                    <Database className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <p className="fw-medium">Architecture Diagram</p>
                    <p className="small mt-2">
                      Frontend (Next.js) → API Layer → Firebase Services → Real-time Updates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 