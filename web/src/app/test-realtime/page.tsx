'use client';

import React, { useState } from 'react';
import { RealTimeProvider, useRealTimeContext, useMatchEvents, useChatMessages, useRealTimeNotifications } from '@kp5-academy/shared';

// Mock authentication token - in real app, this would come from your auth system
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiY29hY2giLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE2MzQ1Njc4OTl9.example';

function RealTimeTestContent() {
  const realTime = useRealTimeContext();
  const [message, setMessage] = useState('');
  const [matchId] = useState('test-match-123');
  const [chatRoomId] = useState('test-chat-room');

  // Subscribe to match events
  const { events: matchEvents, addEvent } = useMatchEvents(realTime, matchId);

  // Subscribe to chat messages
  const { messages: chatMessages, sendMessage } = useChatMessages(realTime, chatRoomId);

  // Subscribe to notifications
  const { notifications, sendNotification } = useRealTimeNotifications(realTime);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleAddGoal = (team: 'home' | 'away') => {
    addEvent({
      type: 'goal',
      team,
      playerName: `Player ${Math.floor(Math.random() * 10) + 1}`,
      minute: Math.floor(Date.now() / 60000) % 90
    });
  };

  const handleSendNotification = () => {
    sendNotification('user-123', {
      title: 'Test Notification',
      message: 'This is a test notification from the real-time system',
      type: 'info'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Real-Time Communication Test</h1>
      
      {/* Connection Status */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        <div className="space-y-2">
          <p>Status: <span className={`font-semibold ${realTime.isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {realTime.connectionState}
          </span></p>
          {realTime.error && (
            <p className="text-red-600">Error: {realTime.error.message}</p>
          )}
        </div>
      </div>

      {/* Match Events */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Match Events</h2>
        <div className="space-y-2 mb-4">
          <button
            onClick={() => handleAddGoal('home')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            Home Goal
          </button>
          <button
            onClick={() => handleAddGoal('away')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Away Goal
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto border rounded p-2">
          {matchEvents.length === 0 ? (
            <p className="text-gray-500">No match events yet</p>
          ) : (
            <div className="space-y-1">
              {matchEvents.map((event, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-semibold">{event.data.type}</span> - 
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                    event.data.team === 'home' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {event.data.team}
                  </span>
                  {event.data.playerName && (
                    <span className="ml-2 text-gray-600">({event.data.playerName})</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Chat Messages</h2>
        <div className="space-y-2 mb-4">
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
        <div className="max-h-40 overflow-y-auto border rounded p-2">
          {chatMessages.length === 0 ? (
            <p className="text-gray-500">No messages yet</p>
          ) : (
            <div className="space-y-1">
              {chatMessages.map((msg, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <span className="font-semibold">{msg.data.userEmail || 'Unknown'}:</span>
                  <span className="ml-2">{msg.data.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="space-y-2 mb-4">
          <button
            onClick={handleSendNotification}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Send Test Notification
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto border rounded p-2">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet</p>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification, index) => (
                <div key={index} className="text-sm p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <div className="font-semibold">{notification.data.title}</div>
                  <div className="text-gray-600">{notification.data.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">How to Test</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Open this page in multiple browser tabs/windows</li>
          <li>Click "Home Goal" or "Away Goal" to see real-time match events</li>
          <li>Send chat messages to see real-time chat</li>
          <li>Click "Send Test Notification" to see real-time notifications</li>
          <li>All events should appear in real-time across all open tabs</li>
        </ul>
      </div>
    </div>
  );
}

export default function RealTimeTestPage() {
  const realTimeConfig = {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
    token: MOCK_TOKEN,
    reconnectInterval: 5000,
    maxReconnectAttempts: 5
  };

  return (
    <RealTimeProvider config={realTimeConfig} autoConnect={true}>
      <RealTimeTestContent />
    </RealTimeProvider>
  );
}
