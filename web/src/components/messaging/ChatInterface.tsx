"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users, MessageCircle, MoreVertical } from 'lucide-react';
import { useLocalAuth } from '@/hooks/useLocalApi';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'team' | 'direct';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export default function ChatInterface() {
  const { user } = useLocalAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockChatRooms: ChatRoom[] = [
      {
        id: 'team-1',
        name: 'Team Alpha',
        type: 'team',
        participants: ['user1', 'user2', 'user3'],
        unreadCount: 3,
        lastMessage: {
          id: 'msg-1',
          senderId: 'user2',
          senderName: 'John Doe',
          content: 'Great practice today!',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'text'
        }
      },
      {
        id: 'direct-1',
        name: 'Sarah Coach',
        type: 'direct',
        participants: ['user1', 'coach1'],
        unreadCount: 1,
        lastMessage: {
          id: 'msg-2',
          senderId: 'coach1',
          senderName: 'Sarah Coach',
          content: 'See you at practice tomorrow',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          type: 'text'
        }
      }
    ];

    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        senderId: 'user2',
        senderName: 'John Doe',
        senderAvatar: '/api/placeholder/32/32',
        content: 'Great practice today!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: 'text'
      },
      {
        id: 'msg-2',
        senderId: 'user1',
        senderName: user?.displayName || 'You',
        senderAvatar: '/api/placeholder/32/32',
        content: 'Absolutely! Everyone played really well.',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        type: 'text'
      },
      {
        id: 'msg-3',
        senderId: 'user3',
        senderName: 'Mike Johnson',
        senderAvatar: '/api/placeholder/32/32',
        content: 'Can\'t wait for the next game!',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        type: 'text'
      }
    ];

    setChatRooms(mockChatRooms);
    setMessages(mockMessages);
    setActiveChat('team-1');
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedFile) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: user?.uid || 'user1',
      senderName: user?.displayName || 'You',
      senderAvatar: user?.photoURL || '/api/placeholder/32/32',
      content: newMessage,
      timestamp: new Date(),
      type: selectedFile ? 'file' : 'text',
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      fileName: selectedFile?.name
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setSelectedFile(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[600px] flex border rounded-lg overflow-hidden">
      {/* Chat Rooms Sidebar */}
      <div className="w-80 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        
        <ScrollArea className="h-[calc(600px-80px)]">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                activeChat === room.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setActiveChat(room.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/api/placeholder/40/40" />
                    <AvatarFallback>
                      {room.type === 'team' ? <Users className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    {room.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {room.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {room.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatTime(room.lastMessage.timestamp)}
                    </span>
                  )}
                  {room.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {room.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" />
                    <AvatarFallback>
                      {chatRooms.find(r => r.id === activeChat)?.type === 'team' ? 
                        <Users className="h-4 w-4" /> : 
                        <MessageCircle className="h-4 w-4" />
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {chatRooms.find(r => r.id === activeChat)?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {chatRooms.find(r => r.id === activeChat)?.type === 'team' ? 
                        'Team Chat' : 'Direct Message'
                      }
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.senderId === user?.uid ? 'order-2' : 'order-1'}`}>
                      {message.senderId !== user?.uid && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={message.senderAvatar} />
                            <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{message.senderName}</span>
                        </div>
                      )}
                      
                      <div
                        className={`rounded-lg p-3 ${
                          message.senderId === user?.uid
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.type === 'file' ? (
                          <div className="flex items-center space-x-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{message.fileName}</p>
                              <p className="text-xs opacity-75">File shared</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      
                      <span className={`text-xs text-gray-500 mt-1 block ${
                        message.senderId === user?.uid ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>📎</span>
                  </Button>
                </label>
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {selectedFile && (
                <div className="mt-2 p-2 bg-gray-50 rounded flex items-center justify-between">
                  <span className="text-sm">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Select a chat</h3>
              <p className="text-gray-500">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 