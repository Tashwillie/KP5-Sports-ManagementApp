'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useEnhancedAuthContext } from '@/contexts/EnhancedAuthContext';
import { 
  Home, 
  Users, 
  Target, 
  Trophy, 
  BarChart3, 
  Calendar, 
  Building, 
  UserCheck, 
  Zap,
  FileText,
  DollarSign,
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  activeTab: string;
  userData?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
  { id: 'teams', label: 'Teams', icon: Users, href: '/teams' },
  { id: 'matches', label: 'Matches', icon: Target, href: '/matches' },
  { id: 'tournaments', label: 'Tournaments', icon: Trophy, href: '/tournaments' },
  { id: 'leagues', label: 'Leagues', icon: BarChart3, href: '/leagues' },
  { id: 'events', label: 'Events', icon: Calendar, href: '/events' },
  { id: 'clubs', label: 'Clubs', icon: Building, href: '/clubs' },
  { id: 'players', label: 'Players', icon: UserCheck, href: '/players' },
  { id: 'coaches', label: 'Coaches', icon: UserCheck, href: '/coaches' },
  { id: 'referees', label: 'Referees', icon: Zap, href: '/referees' },
  { id: 'registration', label: 'Registration', icon: FileText, href: '/registration' },
  { id: 'payments', label: 'Payments', icon: DollarSign, href: '/payments' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export default function Sidebar({ activeTab, userData }: SidebarProps) {
  const { user } = useEnhancedAuthContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Use userData prop if provided, otherwise fall back to auth context or default values
  const displayUser = userData || {
    id: user?.id || 'user123',
    name: user?.displayName || 'Admin User',
    email: user?.email || 'admin@example.com',
    role: user?.role?.replace('_', ' ') || 'Super Admin'
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <style jsx>{`
        .sidebar-container {
          transition: width 0.3s ease-in-out;
        }
        .nav-link:hover:not(.bg-primary) {
          background-color: #f8f9fa !important;
          color: #495057 !important;
        }
        .sidebar-text {
          opacity: ${isCollapsed ? '0' : '1'};
          transition: opacity 0.2s ease-in-out;
          white-space: nowrap;
          overflow: hidden;
        }
        .toggle-btn {
          transition: all 0.2s ease-in-out;
          border: none;
          background: #f8f9fa;
        }
        .toggle-btn:hover {
          background: #e9ecef;
          transform: scale(1.05);
        }
      `}</style>
      <div 
        className="bg-white border-end shadow-sm d-flex flex-column sidebar-container" 
        style={{
          width: isCollapsed ? '80px' : '320px',
          minHeight: '100vh', 
          flexShrink: 0,
          transition: 'width 0.3s ease-in-out'
        }}
      >
        <div className="d-flex flex-column h-100">
          {/* Toggle Button */}
          <div className="p-3 d-flex justify-content-end">
            <button
              onClick={toggleSidebar}
              className="btn btn-sm toggle-btn rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          <div className="flex-grow-1 px-4 pb-4">
            {/* KP5 Soccer Logo */}
            <div className="d-flex align-items-center mb-5">
              <div className="d-flex align-items-center justify-content-center flex-shrink-0" 
                   style={{width: isCollapsed ? '56px' : '160px', height: isCollapsed ? '56px' : '160px'}}>
                <img
                  src="/images/logo.png"
                  alt="KP5 Academy Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              {!isCollapsed && (
                <div className="ms-3 sidebar-text">
                  {/* No word-based site name */}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="d-flex align-items-center mb-5 p-4 rounded" style={{backgroundColor: '#f8f9fa'}}>
              <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" 
                   style={{width: '44px', height: '44px', backgroundColor: '#ffc107', color: 'white'}}>
                <Crown size={22} />
              </div>
              {!isCollapsed && (
                <div className="ms-3 sidebar-text">
                  <div className="fw-medium text-dark" style={{fontSize: '15px'}}>{displayUser.name}</div>
                  <div className="text-muted" style={{fontSize: '13px'}}>{displayUser.role}</div>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="nav flex-column">
              {navigationItems.map(({ id, label, icon: Icon, href }) => (
                <Link
                  key={id}
                  href={href}
                  className={`nav-link d-flex align-items-center py-3 px-4 mb-2 rounded text-decoration-none ${
                    activeTab === id 
                      ? 'bg-primary text-white' 
                      : 'text-muted hover-bg-light'
                  }`}
                  style={{
                    transition: 'all 0.2s ease',
                    fontSize: '15px',
                    fontWeight: '500',
                    minHeight: '48px'
                  }}
                  title={isCollapsed ? label : ''}
                >
                  <Icon size={18} className="flex-shrink-0" style={{marginRight: isCollapsed ? '0' : '12px'}} />
                  {!isCollapsed && <span className="sidebar-text">{label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
} 