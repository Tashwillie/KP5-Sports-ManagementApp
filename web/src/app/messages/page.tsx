'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { 
  Users, Calendar, Trophy, Target, TrendingUp, Clock, MapPin, Plus, Activity, BarChart3, Settings,
  Bell, Search, Grid3X3, MessageCircle, ChevronDown, MoreVertical, Home, Folder, GraduationCap,
  ShoppingCart, Cloud, HelpCircle, Mail, Flag, Maximize2, User, CheckCircle, AlertCircle, XCircle,
  GitBranch, Shield, Award, Zap, Heart, Play, Pause, Square, AlertTriangle, TrendingDown, DollarSign,
  FileText, ImageIcon, Send, Paperclip, Smile, Phone, Video, Edit, Trash2, Archive, Star, Reply, Forward
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesContent />
    </ProtectedRoute>
  );
}

function MessagesContent() {
  const { userData, loading  } = useAuth();
  const { messages, loading: loadingMessages, error, refetch } = useMessages();
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[number] | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'unread') return matchesSearch; // backend read state not wired yet
    if (activeTab === 'direct') return matchesSearch && message.type === 'direct';
    if (activeTab === 'team') return matchesSearch && message.type === 'team';
    if (activeTab === 'announcements') return matchesSearch && message.type === 'announcement';
    
    return matchesSearch;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    return 'Just now';
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'direct': return <User className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'club': return <GraduationCap className="h-4 w-4" />;
      case 'announcement': return <Bell className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'text-primary';
      case 'team': return 'text-success';
      case 'club': return 'text-info';
      case 'announcement': return 'text-warning';
      case 'system': return 'text-secondary';
      default: return 'text-muted';
    }
  };

  if (loading || loadingMessages) {
    return (
      <div className="d-flex">
        <div className="bg-white border-end" style={{width: '280px', minHeight: '100vh'}}>
          <div className="p-3">
            <div className="placeholder-glow">
              <div className="placeholder col-8 mb-4"></div>
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder col-10 mb-2"></div>
            </div>
          </div>
        </div>
        <div className="flex-grow-1 bg-light">
          <div className="p-4">
            <div className="placeholder-glow">
              <div className="placeholder col-4 mb-4"></div>
              <div className="placeholder col-8 mb-3"></div>
              <div className="placeholder col-6 mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <p className="text-danger mb-3">{error}</p>
          <button className="btn btn-primary" onClick={refetch}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2 className="h2 fw-bold text-dark mb-3">Access Denied</h2>
          <p className="text-muted">Please sign in to access messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
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
              <div className="fw-medium text-dark">{userData.displayName || 'User'}</div>
              <small className="text-muted">{userData.email}</small>
            </div>
          </div>

          {/* Navigation */}
          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Sports Management</small>
            <div className="d-flex flex-column gap-1">
              <a href="/dashboard" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <BarChart3 className="h-4 w-4 me-2" />
                Dashboard
              </a>
              <a href="/teams" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Users className="h-4 w-4 me-2" />
                Teams
              </a>
              <a href="/matches" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Calendar className="h-4 w-4 me-2" />
                Matches
              </a>
              <a href="/tournaments" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Trophy className="h-4 w-4 me-2" />
                Tournaments
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Management</small>
            <div className="d-flex flex-column gap-1">
              <a href="/clubs" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <GraduationCap className="h-4 w-4 me-2" />
                Clubs
              </a>
              <a href="/players" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Users className="h-4 w-4 me-2" />
                Players
              </a>
              <a href="/coaches" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Shield className="h-4 w-4 me-2" />
                Coaches
              </a>
              <a href="/referees" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Shield className="h-4 w-4 me-2" />
                Referees
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
              <a href="/notifications" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Mail className="h-4 w-4 me-2" />
                Notifications
              </a>
              <a href="/announcements" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Bell className="h-4 w-4 me-2" />
                Announcements
              </a>
            </div>
          </div>

          <div className="mb-4">
            <small className="text-muted text-uppercase fw-bold mb-2 d-block">Content</small>
            <div className="d-flex flex-column gap-1">
              <a href="/media" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <Cloud className="h-4 w-4 me-2" />
                Media Library
              </a>
              <a href="/documents" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <FileText className="h-4 w-4 me-2" />
                Documents
              </a>
              <a href="/photos" className="btn btn-sm text-start text-muted border-0 text-decoration-none">
                <ImageIcon className="h-4 w-4 me-2" />
                Photos
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Top Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <div>
                <h5 className="mb-0">Messages</h5>
                <small className="text-muted">
                  <MessageCircle className="h-3 w-3 me-1" />
                  {filteredMessages.length} messages
                </small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              <div className="input-group" style={{width: '300px'}}>
                <span className="input-group-text bg-white border-end-0">
                  <Search className="h-4 w-4 text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className="btn btn-sm" 
                style={{backgroundColor: '#4169E1', borderColor: '#4169E1', color: 'white'}}
                onClick={() => setShowCompose(true)}
              >
                <Plus className="h-4 w-4 me-1" />
                New Message
              </button>
            </div>
          </div>
        </div>

        {/* Main Messages Content */}
        <div className="p-4">
          <div className="row">
            {/* Message List */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-0">
                  <ul className="nav nav-tabs card-header-tabs" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                      >
                        All
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'unread' ? 'active' : ''}`}
                        onClick={() => setActiveTab('unread')}
                      >
                        Unread
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'direct' ? 'active' : ''}`}
                        onClick={() => setActiveTab('direct')}
                      >
                        Direct
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'team' ? 'active' : ''}`}
                        onClick={() => setActiveTab('team')}
                      >
                        Team
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button 
                        className={`nav-link ${activeTab === 'announcements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('announcements')}
                      >
                        Announcements
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`list-group-item list-group-item-action border-0 ${
                          selectedMessage?.id === message.id ? 'active' : ''
                        }`}
                        onClick={() => setSelectedMessage(message)}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="d-flex align-items-start">
                          <div className="flex-shrink-0 me-3">
                            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                              {getMessageTypeIcon(message.type)}
                            </div>
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex justify-content-between align-items-start">
                              <h6 className="mb-1 text-truncate">{message.senderName}</h6>
                              <small className="text-muted">{formatTimeAgo(message.createdAt)}</small>
                            </div>
                            <p className="mb-1 text-truncate" style={{fontSize: '0.875rem'}}>
                              {message.content}
                            </p>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`badge ${getMessageTypeColor(message.type)}`}>
                                {message.type}
                              </span>
                              {message.attachments.length > 0 && (
                                <Paperclip className="h-3 w-3 text-muted" />
                              )}
                              {!message.readBy.includes(userData?.id || '') && (
                                <div className="bg-primary rounded-circle" style={{width: '8px', height: '8px'}}></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Detail */}
            <div className="col-lg-8">
              {selectedMessage ? (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent border-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                          {getMessageTypeIcon(selectedMessage.type)}
                        </div>
                        <div>
                          <h6 className="mb-0">{selectedMessage.senderName}</h6>
                          <small className="text-muted">
                            {formatTimeAgo(selectedMessage.createdAt)} • {selectedMessage.type}
                          </small>
                        </div>
                      </div>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary">
                          <Reply className="h-4 w-4" />
                        </button>
                        <button className="btn btn-outline-secondary">
                          <Forward className="h-4 w-4" />
                        </button>
                        <button className="btn btn-outline-secondary">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <p className="mb-3">{selectedMessage.content}</p>
                      
                      {selectedMessage.attachments.length > 0 && (
                        <div className="mb-3">
                          <h6 className="mb-2">Attachments</h6>
                          {selectedMessage.attachments.map((attachment) => (
                            <div key={attachment.id} className="d-flex align-items-center p-2 bg-light rounded">
                              <Paperclip className="h-4 w-4 me-2 text-muted" />
                              <div className="flex-grow-1">
                                <div className="fw-medium">{attachment.name}</div>
                                <small className="text-muted">{formatFileSize(attachment.size)}</small>
                              </div>
                              <button className="btn btn-sm btn-outline-primary">Download</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reply Section */}
                    <div className="border-top pt-3">
                      <div className="d-flex gap-2 mb-3">
                        <button className="btn btn-outline-secondary btn-sm">
                          <Paperclip className="h-4 w-4" />
                        </button>
                        <button className="btn btn-outline-secondary btn-sm">
                          <Smile className="h-4 w-4" />
                        </button>
                        <button className="btn btn-outline-secondary btn-sm">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="btn btn-outline-secondary btn-sm">
                          <Video className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="input-group">
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Type your reply..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button className="btn btn-primary">
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <MessageCircle className="h-12 w-12 text-muted mb-3" />
                    <h5 className="text-muted">Select a message to view</h5>
                    <p className="text-muted">Choose a message from the list to read and reply</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 