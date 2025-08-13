'use client';

import React from 'react';
import WebSocketStatus from '@/components/common/WebSocketStatus';

interface SidebarProps {
  activeTab: string;
}

export default function Sidebar({ activeTab }: SidebarProps) {
  return (
    <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
      <div className="p-3">
        {/* Logo and Top Icons */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <h4 className="mb-0">KP5 Academy</h4>
          </div>
          <div className="d-flex gap-2">
            <i className="bi bi-bell text-muted"></i>
            <i className="bi bi-search text-muted"></i>
          </div>
        </div>

        {/* User Profile */}
        <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
          <div className="rounded-circle p-2 me-3" style={{backgroundColor: '#4169E1', opacity: 0.1}}>
            <i className="bi bi-person" style={{color: '#4169E1'}}></i>
          </div>
          <div>
            <div className="fw-medium text-dark">Admin User</div>
            <small className="text-muted">admin@kp5academy.com</small>
          </div>
        </div>

        {/* WebSocket Status */}
        <div className="px-3 py-2">
          <WebSocketStatus variant="compact" showControls={false} />
        </div>

        {/* Navigation Links */}
        <ul className="nav flex-column">
          <li className="nav-item">
            <a href="/dashboard" className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}>
              <i className="bi bi-graph-up me-2"></i> Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a href="/teams" className={`nav-link ${activeTab === 'teams' ? 'active' : ''}`}>
              <i className="bi bi-people me-2"></i> Teams
            </a>
          </li>
          <li className="nav-item">
            <a href="/teams/create" className={`nav-link ${activeTab === 'teams-create' ? 'active' : ''}`}>
              <i className="bi bi-plus-circle me-2"></i> Create Team
            </a>
          </li>
          <li className="nav-item">
            <a href="/matches" className={`nav-link ${activeTab === 'matches' ? 'active' : ''}`}>
              <i className="bi bi-calendar me-2"></i> Matches
            </a>
          </li>
          <li className="nav-item">
            <a href="/live-match-demo" className={`nav-link ${activeTab === 'live-match-demo' ? 'active' : ''}`}>
              <i className="bi bi-play-circle me-2"></i> Live Match Demo
            </a>
          </li>
          <li className="nav-item">
            <a href="/multi-device-demo" className={`nav-link ${activeTab === 'multi-device-demo' ? 'active' : ''}`}>
              <i className="bi bi-phone me-2"></i> Multi-Device Demo
            </a>
          </li>
          <li className="nav-item">
            <a href="/advanced-features-demo" className={`nav-link ${activeTab === 'advanced-features-demo' ? 'active' : ''}`}>
              <i className="bi bi-trophy me-2"></i> Advanced Features Demo
            </a>
          </li>
          <li className="nav-item">
            <a href="/test-backend-connection" className={`nav-link ${activeTab === 'test-backend-connection' ? 'active' : ''}`}>
              <i className="bi bi-database me-2"></i> Test Backend Connection
            </a>
          </li>
          <li className="nav-item">
            <a href="/charts-demo" className={`nav-link ${activeTab === 'charts-demo' ? 'active' : ''}`}>
              <i className="bi bi-bar-chart me-2"></i> Charts & Analytics
            </a>
          </li>
                          <li className="nav-item">
                  <a href="/enhanced-auth-demo" className={`nav-link ${activeTab === 'enhanced-auth-demo' ? 'active' : ''}`}>
                    <i className="bi bi-shield-lock me-2"></i> Enhanced Authentication
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/backend-permissions-demo" className={`nav-link ${activeTab === 'backend-permissions-demo' ? 'active' : ''}`}>
                    <i className="bi bi-database-check me-2"></i> Backend Permissions
                  </a>
                </li>
                <li className="nav-item">
                  <a href="/permission-ui-demo" className={`nav-link ${activeTab === 'permission-ui-demo' ? 'active' : ''}`}>
                    <i className="bi bi-shield-check me-2"></i> Permission UI Demo
                  </a>
                </li>
          <li className="nav-item">
            <a href="/tournaments" className={`nav-link ${activeTab === 'tournaments' ? 'active' : ''}`}>
              <i className="bi bi-trophy me-2"></i> Tournaments
            </a>
          </li>
          <li className="nav-item">
            <a href="/tournaments/create" className={`nav-link ${activeTab === 'tournaments-create' ? 'active' : ''}`}>
              <i className="bi bi-plus-circle me-2"></i> Create Tournament
            </a>
          </li>
          <li className="nav-item">
            <a href="/events" className={`nav-link ${activeTab === 'events' ? 'active' : ''}`}>
              <i className="bi bi-calendar-event me-2"></i> Events
            </a>
          </li>
          <li className="nav-item">
            <a href="/leagues" className={`nav-link ${activeTab === 'leagues' ? 'active' : ''}`}>
              <i className="bi bi-trophy me-2"></i> Leagues
            </a>
          </li>
        </ul>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Management</small>
          <div className="d-flex flex-column gap-1">
            <a href="/clubs" className={`btn btn-sm text-start ${activeTab === 'clubs' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'clubs' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-building me-2"></i>
              Clubs
            </a>
            <a href="/clubs/create" className={`btn btn-sm text-start ${activeTab === 'clubs-create' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'clubs-create' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-plus-circle me-2"></i>
              Create Club
            </a>
            <a href="/players" className={`btn btn-sm text-start ${activeTab === 'players' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'players' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-person me-2"></i>
              Players
            </a>
            <a href="/coaches" className={`btn btn-sm text-start ${activeTab === 'coaches' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'coaches' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-shield me-2"></i>
              Coaches
            </a>
            <a href="/referees" className={`btn btn-sm text-start ${activeTab === 'referees' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'referees' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-shield me-2"></i>
              Referees
            </a>
            <a href="/registration" className={`btn btn-sm text-start ${activeTab === 'registration' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'registration' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-person-plus me-2"></i>
              Registration
            </a>
            <a href="/payments" className={`btn btn-sm text-start ${activeTab === 'payments' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'payments' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-credit-card me-2"></i>
              Payments
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Communication</small>
          <div className="d-flex flex-column gap-1">
            <a href="/messages" className={`btn btn-sm text-start ${activeTab === 'messages' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'messages' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-chat me-2"></i>
              Messages
            </a>
            <a href="/notifications" className={`btn btn-sm text-start ${activeTab === 'notifications' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'notifications' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-bell me-2"></i>
              Notifications
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Development</small>
          <div className="d-flex flex-column gap-1">
            <a href="/test-api" className={`btn btn-sm text-start ${activeTab === 'test-api' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'test-api' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-code me-2"></i>
              Test API
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Content</small>
          <div className="d-flex flex-column gap-1">
            <a href="/media" className={`btn btn-sm text-start ${activeTab === 'media' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'media' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-cloud me-2"></i>
              Media Library
            </a>
            <a href="/documents" className={`btn btn-sm text-start ${activeTab === 'documents' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'documents' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-file-text me-2"></i>
              Documents
            </a>
            <a href="/photos" className={`btn btn-sm text-start ${activeTab === 'photos' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'photos' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-image me-2"></i>
              Photos
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Analytics</small>
          <div className="d-flex flex-column gap-1">
            <a href="/analytics" className={`btn btn-sm text-start ${activeTab === 'analytics' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'analytics' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-graph-up me-2"></i>
              Analytics
            </a>
            <a href="/reports" className={`btn btn-sm text-start ${activeTab === 'reports' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'reports' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-file-text me-2"></i>
              Reports
            </a>
            <a href="/statistics" className={`btn btn-sm text-start ${activeTab === 'statistics' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'statistics' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-bar-chart me-2"></i>
              Statistics
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">System</small>
          <div className="d-flex flex-column gap-1">
            <a href="/admin" className={`btn btn-sm text-start ${activeTab === 'admin' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'admin' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-shield me-2"></i>
              Admin Panel
            </a>
            <a href="/settings" className={`btn btn-sm text-start ${activeTab === 'settings' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'settings' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-gear me-2"></i>
              Settings
            </a>
            <a href="/profile" className={`btn btn-sm text-start ${activeTab === 'profile' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'profile' ? '#4169E1' : 'transparent'}}>
              <i className="bi bi-person-circle me-2"></i>
              Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 