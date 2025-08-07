'use client';

import { useFirebase } from '@/contexts/FirebaseContext';
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientIds: string[];
  type: 'direct' | 'team' | 'club' | 'announcement' | 'system';
  content: string;
  attachments: MessageAttachment[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video';
  size: number;
}

export default function MessagesPage() {
  const { userData, loading } = useFirebase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Mock data for messages
  useEffect(() => {
    if (!loading) {
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 'coach-1',
          senderName: 'Coach Johnson',
          senderAvatar: '/api/placeholder/40/40',
          recipientIds: ['player-1', 'player-2'],
          type: 'team',
          content: 'Great practice today! Remember to work on your passing drills this weekend.',
          attachments: [],
          readBy: ['player-1'],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: '2',
          senderId: 'admin-1',
          senderName: 'Club Admin',
          senderAvatar: '/api/placeholder/40/40',
          recipientIds: ['all-players'],
          type: 'announcement',
          content: 'Important: Team photos will be taken this Saturday at 10 AM. Please arrive 15 minutes early.',
          attachments: [
            {
              id: 'att-1',
              name: 'photo-schedule.pdf',
              url: '/documents/photo-schedule.pdf',
              type: 'document',
              size: 245760,
            }
          ],
          readBy: ['player-1', 'player-2'],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: '3',
          senderId: 'player-2',
          senderName: 'Alex Smith',
          senderAvatar: '/api/placeholder/40/40',
          recipientIds: ['player-1'],
          type: 'direct',
          content: 'Hey! Are you coming to the extra practice session tomorrow?',
          attachments: [],
          readBy: ['player-1'],
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: '4',
          senderId: 'system',
          senderName: 'System',
          senderAvatar: '/api/placeholder/40/40',
          recipientIds: ['all-users'],
          type: 'system',
          content: 'Your account has been successfully verified. Welcome to KP5 Academy!',
          attachments: [],
          readBy: ['player-1'],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ];
      setMessages(mockMessages);
      setLoadingMessages(false);
    }
  }, [loading]);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || message.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const unreadCount = messages.filter(m => !m.readBy.includes(userData?.id || '')).length;

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

  if (loading || loadingMessages) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Messages</h1>
          <p className="text-muted mb-0">Communicate with your team and club members</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary">
            <i className="bi bi-plus-circle me-2"></i>
            New Message
          </button>
          <button className="btn btn-outline-secondary">
            <i className="bi bi-gear me-2"></i>
            Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-envelope text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Total Messages</h6>
                  <h4 className="mb-0">{messages.length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-envelope-exclamation text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Unread</h6>
                  <h4 className="mb-0">{unreadCount}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-people text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Team Messages</h6>
                  <h4 className="mb-0">{messages.filter(m => m.type === 'team').length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-megaphone text-info fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Announcements</h6>
                  <h4 className="mb-0">{messages.filter(m => m.type === 'announcement').length}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Message List */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Messages</h5>
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i className="bi bi-funnel me-1"></i>
                    Filter
                  </button>
                  <ul className="dropdown-menu">
                    <li><button className="dropdown-item" onClick={() => setActiveTab('all')}>All Messages</button></li>
                    <li><button className="dropdown-item" onClick={() => setActiveTab('direct')}>Direct Messages</button></li>
                    <li><button className="dropdown-item" onClick={() => setActiveTab('team')}>Team Messages</button></li>
                    <li><button className="dropdown-item" onClick={() => setActiveTab('announcement')}>Announcements</button></li>
                    <li><button className="dropdown-item" onClick={() => setActiveTab('system')}>System Messages</button></li>
                  </ul>
                </div>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`list-group-item list-group-item-action border-0 px-3 py-3 cursor-pointer ${
                      selectedMessage?.id === message.id ? 'bg-light' : ''
                    } ${!message.readBy.includes(userData?.id || '') ? 'fw-bold' : ''}`}
                    onClick={() => setSelectedMessage(message)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0">
                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-person text-white"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 ms-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="mb-1">{message.senderName}</h6>
                          <small className="text-muted">{formatTimeAgo(message.createdAt)}</small>
                        </div>
                        <p className="mb-1 text-truncate" style={{ maxWidth: '200px' }}>
                          {message.content}
                        </p>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge bg-${message.type === 'direct' ? 'primary' : message.type === 'team' ? 'success' : message.type === 'announcement' ? 'warning' : 'secondary'} rounded-pill`}>
                            {message.type}
                          </span>
                          {message.attachments.length > 0 && (
                            <small className="text-muted">
                              <i className="bi bi-paperclip me-1"></i>
                              {message.attachments.length}
                            </small>
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
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            {selectedMessage ? (
              <>
                <div className="card-header bg-white border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                        <i className="bi bi-person text-white fs-5"></i>
                      </div>
                      <div>
                        <h5 className="mb-1">{selectedMessage.senderName}</h5>
                        <p className="text-muted mb-0">
                          {formatTimeAgo(selectedMessage.createdAt)} • {selectedMessage.type}
                        </p>
                      </div>
                    </div>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i className="bi bi-three-dots"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li><button className="dropdown-item">Reply</button></li>
                        <li><button className="dropdown-item">Forward</button></li>
                        <li><button className="dropdown-item">Mark as Read</button></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item text-danger">Delete</button></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <p className="mb-0">{selectedMessage.content}</p>
                  </div>

                  {selectedMessage.attachments.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">Attachments</h6>
                      <div className="row">
                        {selectedMessage.attachments.map((attachment) => (
                          <div key={attachment.id} className="col-md-6 mb-3">
                            <div className="card border">
                              <div className="card-body p-3">
                                <div className="d-flex align-items-center">
                                  <div className="flex-shrink-0">
                                    <i className={`bi bi-${attachment.type === 'image' ? 'image' : attachment.type === 'document' ? 'file-earmark-text' : 'play-circle'} fs-4 text-primary`}></i>
                                  </div>
                                  <div className="flex-grow-1 ms-3">
                                    <h6 className="mb-1">{attachment.name}</h6>
                                    <small className="text-muted">{formatFileSize(attachment.size)}</small>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <button className="btn btn-sm btn-outline-primary">
                                      <i className="bi bi-download"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-top pt-3">
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type your reply..."
                      />
                      <button className="btn btn-primary">
                        <i className="bi bi-send me-2"></i>
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-body text-center py-5">
                <i className="bi bi-envelope fs-1 text-muted mb-3"></i>
                <h5 className="text-muted">Select a message to view</h5>
                <p className="text-muted">Choose a message from the list to read its content and reply.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 