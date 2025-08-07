'use client';

import React from 'react';
import {
  Users, 
  Calendar, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Plus,
  Activity,
  BarChart3,
  Settings,
  Bell,
  Search,
  Grid3X3,
  MessageCircle,
  ChevronDown,
  MoreVertical,
  Home,
  Folder,
  GraduationCap,
  ShoppingCart,
  Cloud,
  HelpCircle,
  Mail,
  Flag,
  Maximize2,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  GitBranch,
  Shield,
  Award,
  Zap,
  Heart,
  Play,
  Pause,
  Square,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  FileText,
  Image as ImageIcon,
  UserCheck,
  Building
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  userData?: {
    displayName?: string;
    email?: string;
  };
}

export default function Sidebar({ activeTab = 'dashboard', userData }: SidebarProps) {
  return (
    <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
      <div className="p-3">
        {/* Logo and Top Icons */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <img 
              src="/images/logo.png" 
              alt="KP5 Academy" 
              width={120} 
              height={45} 
              className="me-2"
              style={{maxWidth: '120px'}}
            />
          </div>
          <div className="d-flex gap-2">
            <Bell className="h-4 w-4 text-muted position-relative">
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{fontSize: '0.6rem'}}>3</span>
            </Bell>
            <Search className="h-4 w-4 text-muted" />
          </div>
        </div>

        {/* User Profile */}
        <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
          <div className="rounded-circle p-2 me-3" style={{backgroundColor: '#4169E1', opacity: 0.1}}>
            <User className="h-4 w-4" style={{color: '#4169E1'}} />
          </div>
          <div>
            <div className="fw-medium text-dark">{userData?.displayName || 'User'}</div>
            <small className="text-muted">{userData?.email || 'user@example.com'}</small>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Sports Management</small>
          <div className="d-flex flex-column gap-1">
            <a href="/dashboard" className={`btn btn-sm text-start ${activeTab === 'dashboard' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'dashboard' ? '#4169E1' : 'transparent'}}>
              <BarChart3 className="h-4 w-4 me-2" />
              Dashboard
            </a>
            <a href="/teams" className={`btn btn-sm text-start ${activeTab === 'teams' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'teams' ? '#4169E1' : 'transparent'}}>
              <Users className="h-4 w-4 me-2" />
              Teams
            </a>
            <a href="/matches" className={`btn btn-sm text-start ${activeTab === 'matches' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'matches' ? '#4169E1' : 'transparent'}}>
              <Calendar className="h-4 w-4 me-2" />
              Matches
            </a>
            <a href="/tournaments" className={`btn btn-sm text-start ${activeTab === 'tournaments' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'tournaments' ? '#4169E1' : 'transparent'}}>
              <Trophy className="h-4 w-4 me-2" />
              Tournaments
            </a>
            <a href="/events" className={`btn btn-sm text-start ${activeTab === 'events' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'events' ? '#4169E1' : 'transparent'}}>
              <Calendar className="h-4 w-4 me-2" />
              Events
            </a>
            <a href="/leagues" className={`btn btn-sm text-start ${activeTab === 'leagues' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'leagues' ? '#4169E1' : 'transparent'}}>
              <Trophy className="h-4 w-4 me-2" />
              Leagues
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Management</small>
          <div className="d-flex flex-column gap-1">
            <a href="/clubs" className={`btn btn-sm text-start ${activeTab === 'clubs' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'clubs' ? '#4169E1' : 'transparent'}}>
              <Building className="h-4 w-4 me-2" />
              Clubs
            </a>
            <a href="/players" className={`btn btn-sm text-start ${activeTab === 'players' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'players' ? '#4169E1' : 'transparent'}}>
              <UserCheck className="h-4 w-4 me-2" />
              Players
            </a>
            <a href="/coaches" className={`btn btn-sm text-start ${activeTab === 'coaches' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'coaches' ? '#4169E1' : 'transparent'}}>
              <GraduationCap className="h-4 w-4 me-2" />
              Coaches
            </a>
            <a href="/referees" className={`btn btn-sm text-start ${activeTab === 'referees' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'referees' ? '#4169E1' : 'transparent'}}>
              <Award className="h-4 w-4 me-2" />
              Referees
            </a>
            <a href="/registration" className={`btn btn-sm text-start ${activeTab === 'registration' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'registration' ? '#4169E1' : 'transparent'}}>
              <FileText className="h-4 w-4 me-2" />
              Registration
            </a>
            <a href="/payments" className={`btn btn-sm text-start ${activeTab === 'payments' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'payments' ? '#4169E1' : 'transparent'}}>
              <DollarSign className="h-4 w-4 me-2" />
              Payments
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Communication</small>
          <div className="d-flex flex-column gap-1">
            <a href="/messages" className={`btn btn-sm text-start ${activeTab === 'messages' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'messages' ? '#4169E1' : 'transparent'}}>
              <MessageCircle className="h-4 w-4 me-2" />
              Messages
            </a>
            <a href="/notifications" className={`btn btn-sm text-start ${activeTab === 'notifications' ? 'text-white' : 'text-muted'} border-0 text-decoration-none position-relative`} style={{backgroundColor: activeTab === 'notifications' ? '#4169E1' : 'transparent'}}>
              <Mail className="h-4 w-4 me-2" />
              Notifications
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>5</span>
            </a>
            <a href="/announcements" className={`btn btn-sm text-start ${activeTab === 'announcements' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'announcements' ? '#4169E1' : 'transparent'}}>
              <Bell className="h-4 w-4 me-2" />
              Announcements
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Content</small>
          <div className="d-flex flex-column gap-1">
            <a href="/media" className={`btn btn-sm text-start ${activeTab === 'media' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'media' ? '#4169E1' : 'transparent'}}>
              <Cloud className="h-4 w-4 me-2" />
              Media Library
            </a>
            <a href="/documents" className={`btn btn-sm text-start ${activeTab === 'documents' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'documents' ? '#4169E1' : 'transparent'}}>
              <FileText className="h-4 w-4 me-2" />
              Documents
            </a>
            <a href="/photos" className={`btn btn-sm text-start ${activeTab === 'photos' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'photos' ? '#4169E1' : 'transparent'}}>
              <ImageIcon className="h-4 w-4 me-2" />
              Photos
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">Analytics</small>
          <div className="d-flex flex-column gap-1">
            <a href="/analytics" className={`btn btn-sm text-start ${activeTab === 'analytics' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'analytics' ? '#4169E1' : 'transparent'}}>
              <BarChart3 className="h-4 w-4 me-2" />
              Analytics
            </a>
            <a href="/reports" className={`btn btn-sm text-start ${activeTab === 'reports' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'reports' ? '#4169E1' : 'transparent'}}>
              <FileText className="h-4 w-4 me-2" />
              Reports
            </a>
            <a href="/statistics" className={`btn btn-sm text-start ${activeTab === 'statistics' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'statistics' ? '#4169E1' : 'transparent'}}>
              <TrendingUp className="h-4 w-4 me-2" />
              Statistics
            </a>
          </div>
        </div>

        <div className="mb-4">
          <small className="text-muted text-uppercase fw-bold mb-2 d-block">System</small>
          <div className="d-flex flex-column gap-1">
            <a href="/dashboard/admin" className={`btn btn-sm text-start ${activeTab === 'admin' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'admin' ? '#4169E1' : 'transparent'}}>
              <Shield className="h-4 w-4 me-2" />
              Admin Panel
            </a>
            <a href="/settings" className={`btn btn-sm text-start ${activeTab === 'settings' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'settings' ? '#4169E1' : 'transparent'}}>
              <Settings className="h-4 w-4 me-2" />
              Settings
            </a>
            <a href="/profile" className={`btn btn-sm text-start ${activeTab === 'profile' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'profile' ? '#4169E1' : 'transparent'}}>
              <User className="h-4 w-4 me-2" />
              Profile
            </a>
            <a href="/help" className={`btn btn-sm text-start ${activeTab === 'help' ? 'text-white' : 'text-muted'} border-0 text-decoration-none`} style={{backgroundColor: activeTab === 'help' ? '#4169E1' : 'transparent'}}>
              <HelpCircle className="h-4 w-4 me-2" />
              Help & Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 