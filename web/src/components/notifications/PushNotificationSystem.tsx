"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  BellOff,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  Calendar,
  Trophy,
  MessageCircle,
  Shield,
  Trash2,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import { useLocalAuth } from '@/hooks/useLocalApi';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'team' | 'match' | 'tournament' | 'system' | 'payment';
}

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  category: string;
  variables: string[];
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'team-updates',
    name: 'Team Updates',
    description: 'Get notified about team roster changes, practice schedules, and announcements',
    enabled: true,
    category: 'team'
  },
  {
    id: 'match-reminders',
    name: 'Match Reminders',
    description: 'Receive reminders about upcoming matches and live updates',
    enabled: true,
    category: 'match'
  },
  {
    id: 'tournament-updates',
    name: 'Tournament Updates',
    description: 'Stay informed about tournament schedules, brackets, and results',
    enabled: true,
    category: 'tournament'
  },
  {
    id: 'payment-notifications',
    name: 'Payment Notifications',
    description: 'Get notified about payment confirmations and subscription renewals',
    enabled: false,
    category: 'payment'
  },
  {
    id: 'system-announcements',
    name: 'System Announcements',
    description: 'Receive important system updates and maintenance notifications',
    enabled: true,
    category: 'system'
  }
];

const mockNotificationHistory: NotificationHistory[] = [
  {
    id: '1',
    title: 'Match Reminder',
    message: 'Your team has a match tomorrow at 3:00 PM against Thunder FC',
    type: 'info',
    category: 'match',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    actionUrl: '/matches/123'
  },
  {
    id: '2',
    title: 'Payment Confirmed',
    message: 'Your monthly subscription payment of $29.99 has been processed successfully',
    type: 'success',
    category: 'payment',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true
  },
  {
    id: '3',
    title: 'Tournament Update',
    message: 'The Spring League tournament bracket has been updated. Check your team\'s new schedule.',
    type: 'info',
    category: 'tournament',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    actionUrl: '/tournaments/456'
  },
  {
    id: '4',
    title: 'Team Announcement',
    message: 'New practice schedule posted for next week. All players must attend.',
    type: 'warning',
    category: 'team',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: false,
    actionUrl: '/team/789/schedule'
  },
  {
    id: '5',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST',
    type: 'info',
    category: 'system',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    read: true
  }
];

const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'match-reminder',
    name: 'Match Reminder',
    title: 'Match Reminder: {teamName} vs {opponent}',
    message: 'Your team has a match {matchTime} against {opponent}. Location: {venue}',
    category: 'match',
    variables: ['teamName', 'opponent', 'matchTime', 'venue']
  },
  {
    id: 'practice-schedule',
    name: 'Practice Schedule',
    title: 'Practice Schedule Updated',
    message: 'New practice schedule for {teamName}: {practiceTime} at {location}',
    category: 'team',
    variables: ['teamName', 'practiceTime', 'location']
  },
  {
    id: 'tournament-update',
    name: 'Tournament Update',
    title: 'Tournament Update: {tournamentName}',
    message: 'The {tournamentName} bracket has been updated. Check your team\'s new schedule.',
    category: 'tournament',
    variables: ['tournamentName']
  },
  {
    id: 'payment-confirmation',
    name: 'Payment Confirmation',
    title: 'Payment Confirmed',
    message: 'Your payment of {amount} for {service} has been processed successfully',
    category: 'payment',
    variables: ['amount', 'service']
  }
];

export default function PushNotificationSystem() {
  const { user } = useLocalAuth();
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>(mockNotificationHistory);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(notificationTemplates);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});

  const handleSettingToggle = (settingId: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const markAsRead = (notificationId: string) => {
    setNotificationHistory(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotificationHistory(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const markAllAsRead = () => {
    setNotificationHistory(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotificationHistory([]);
  };

  const handleSubscribe = async () => {
    try {
      // Mock subscription logic
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          setIsSubscribed(true);
          // Here you would typically register with your push service
          console.log('Push notifications enabled');
        }
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
    }
  };

  const handleUnsubscribe = () => {
    setIsSubscribed(false);
    // Here you would typically unregister from your push service
    console.log('Push notifications disabled');
  };

  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from KP5 Academy',
        icon: '/images/logo.png'
      });
    }
  };

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'team': return <Users className="h-4 w-4" />;
      case 'match': return <Calendar className="h-4 w-4" />;
      case 'tournament': return <Trophy className="h-4 w-4" />;
      case 'payment': return <Shield className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const unreadCount = notificationHistory.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Push Notifications</h2>
          <p className="text-muted-foreground">
            Manage your notification preferences and view notification history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isSubscribed ? "default" : "secondary"}>
            {isSubscribed ? "Subscribed" : "Not Subscribed"}
          </Badge>
          {isSubscribed ? (
            <Button variant="outline" onClick={handleUnsubscribe}>
              <BellOff className="h-4 w-4 mr-2" />
              Unsubscribe
            </Button>
          ) : (
            <Button onClick={handleSubscribe}>
              <Bell className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">
            History
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getNotificationIcon(setting.category)}
                    <div>
                      <h4 className="font-medium">{setting.name}</h4>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => handleSettingToggle(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={sendTestNotification} disabled={!isSubscribed}>
                <Bell className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notification History</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={markAllAsRead}>
                    Mark All Read
                  </Button>
                  <Button variant="outline" onClick={clearAllNotifications}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {notificationHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <BellOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notificationHistory.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start space-x-3 p-4 border rounded-lg ${
                          !notification.read ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{notification.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {notification.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          {notification.actionUrl && (
                            <Button variant="link" className="p-0 h-auto text-xs">
                              View Details
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notification Templates</CardTitle>
                <Button onClick={() => setShowTemplates(!showTemplates)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplateVariables({});
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Title:</strong> {template.title}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Message:</strong> {template.message}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{template.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Variables: {template.variables.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 