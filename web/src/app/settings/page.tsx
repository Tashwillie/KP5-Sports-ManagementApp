'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLocalAuth } from '@/hooks/useLocalApi';
import { 
  Settings, 
  Bell, 
  Shield, 
  User, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  Globe,
  Palette,
  Download,
  Upload,
  Trash2,
  Key,
  Smartphone,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  matchReminders: boolean;
  teamUpdates: boolean;
  paymentReminders: boolean;
  weeklyReports: boolean;
  tournamentAlerts: boolean;
  practiceReminders: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'team_only';
  showEmail: boolean;
  showPhone: boolean;
  showStats: boolean;
  allowContact: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
  deviceManagement: boolean;
}

export default function SettingsPage() {
  const { user, loading } = useLocalAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { toast } = useToast();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    dateOfBirth: user?.dateOfBirth || '',
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    matchReminders: true,
    teamUpdates: true,
    paymentReminders: true,
    weeklyReports: false,
    tournamentAlerts: true,
    practiceReminders: true,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'team_only',
    showEmail: false,
    showPhone: false,
    showStats: true,
    allowContact: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
    deviceManagement: true,
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  const handlePrivacyChange = (setting: keyof PrivacySettings, value: any) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: value,
    });
  };

  const handleSecurityChange = (setting: keyof SecuritySettings, value: any) => {
    setSecuritySettings({
      ...securitySettings,
      [setting]: value,
    });
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Implement actual password update logic
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password.",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileData);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationSave = async () => {
    try {
      // TODO: Implement notification settings save
      toast({
        title: "Success",
        description: "Notification settings saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    }
  };

  const handlePrivacySave = async () => {
    try {
      // TODO: Implement privacy settings save
      toast({
        title: "Success",
        description: "Privacy settings saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy settings.",
        variant: "destructive",
      });
    }
  };

  const handleSecuritySave = async () => {
    try {
      // TODO: Implement security settings save
      toast({
        title: "Success",
        description: "Security settings saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save security settings.",
        variant: "destructive",
      });
    }
  };

  const handleDataExport = async () => {
    try {
      // TODO: Implement data export
      toast({
        title: "Export Started",
        description: "Your data export has been initiated. You'll receive an email when it's ready.",
      });
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  };

  const handleAccountDeletion = async () => {
    try {
      // TODO: Implement account deletion
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal information and profile details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.photoURL} />
                      <AvatarFallback>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" leftIcon={<Camera />}>
                        Change Photo
                      </Button>
                      <p className="text-sm text-gray-500">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      leftIcon={<User />}
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      leftIcon={<User />}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      leftIcon={<Mail />}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      leftIcon={<Phone />}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Location"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      leftIcon={<Globe />}
                    />
                    <Input
                      label="Date of Birth"
                      type="date"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      rows={4}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" leftIcon={<Save />} loading={loading}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <Input
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    leftIcon={<Lock />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      leftIcon={<Key />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                    <Input
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      leftIcon={<Key />}
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" leftIcon={<Save />}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={() => handleNotificationChange('emailNotifications')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Weekly Reports</p>
                          <p className="text-sm text-gray-500">Get weekly performance summaries</p>
                        </div>
                        <Switch
                          checked={notificationSettings.weeklyReports}
                          onCheckedChange={() => handleNotificationChange('weeklyReports')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-500">Receive notifications on your device</p>
                        </div>
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={() => handleNotificationChange('pushNotifications')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Match Reminders</p>
                          <p className="text-sm text-gray-500">Get reminded about upcoming matches</p>
                        </div>
                        <Switch
                          checked={notificationSettings.matchReminders}
                          onCheckedChange={() => handleNotificationChange('matchReminders')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Practice Reminders</p>
                          <p className="text-sm text-gray-500">Get reminded about practice sessions</p>
                        </div>
                        <Switch
                          checked={notificationSettings.practiceReminders}
                          onCheckedChange={() => handleNotificationChange('practiceReminders')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Team Updates</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Team Updates</p>
                          <p className="text-sm text-gray-500">Notifications about team changes</p>
                        </div>
                        <Switch
                          checked={notificationSettings.teamUpdates}
                          onCheckedChange={() => handleNotificationChange('teamUpdates')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Tournament Alerts</p>
                          <p className="text-sm text-gray-500">Important tournament notifications</p>
                        </div>
                        <Switch
                          checked={notificationSettings.tournamentAlerts}
                          onCheckedChange={() => handleNotificationChange('tournamentAlerts')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleNotificationSave} leftIcon={<Save />}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy & Visibility</span>
                </CardTitle>
                <CardDescription>
                  Control who can see your information and activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Profile Visibility</label>
                      <Select
                        value={privacySettings.profileVisibility}
                        onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public - Anyone can see</SelectItem>
                          <SelectItem value="team_only">Team Only - Only team members</SelectItem>
                          <SelectItem value="private">Private - Only you</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Show Email Address</p>
                          <p className="text-sm text-gray-500">Display your email on your profile</p>
                        </div>
                        <Switch
                          checked={privacySettings.showEmail}
                          onCheckedChange={() => handlePrivacyChange('showEmail', !privacySettings.showEmail)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Show Phone Number</p>
                          <p className="text-sm text-gray-500">Display your phone on your profile</p>
                        </div>
                        <Switch
                          checked={privacySettings.showPhone}
                          onCheckedChange={() => handlePrivacyChange('showPhone', !privacySettings.showPhone)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Show Statistics</p>
                          <p className="text-sm text-gray-500">Display your performance stats</p>
                        </div>
                        <Switch
                          checked={privacySettings.showStats}
                          onCheckedChange={() => handlePrivacyChange('showStats', !privacySettings.showStats)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Allow Contact</p>
                          <p className="text-sm text-gray-500">Let others contact you directly</p>
                        </div>
                        <Switch
                          checked={privacySettings.allowContact}
                          onCheckedChange={() => handlePrivacyChange('allowContact', !privacySettings.allowContact)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handlePrivacySave} leftIcon={<Save />}>
                      Save Privacy Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your account security and authentication.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={() => handleSecurityChange('twoFactorAuth', !securitySettings.twoFactorAuth)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Session Timeout</label>
                      <Select
                        value={securitySettings.sessionTimeout.toString()}
                        onValueChange={(value) => handleSecurityChange('sessionTimeout', parseInt(value))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Login Notifications</p>
                        <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                      </div>
                      <Switch
                        checked={securitySettings.loginNotifications}
                        onCheckedChange={() => handleSecurityChange('loginNotifications', !securitySettings.loginNotifications)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Device Management</p>
                        <p className="text-sm text-gray-500">Manage active sessions and devices</p>
                      </div>
                      <Switch
                        checked={securitySettings.deviceManagement}
                        onCheckedChange={() => handleSecurityChange('deviceManagement', !securitySettings.deviceManagement)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSecuritySave} leftIcon={<Save />}>
                      Save Security Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Data Management</span>
                </CardTitle>
                <CardDescription>
                  Export your data or manage your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Export Your Data</p>
                        <p className="text-sm text-blue-700">Download all your data in a portable format</p>
                      </div>
                      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" leftIcon={<Download />}>
                            Export Data
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Export Your Data</DialogTitle>
                            <DialogDescription>
                              This will create a ZIP file containing all your data including profile, matches, statistics, and settings.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              The export process may take a few minutes. You'll receive an email with the download link when it's ready.
                            </p>
                            <div className="flex justify-end space-x-3">
                              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleDataExport} leftIcon={<Download />}>
                                Start Export
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-red-900">Delete Account</p>
                        <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                      </div>
                      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" leftIcon={<Trash2 />}>
                            Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Account</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. All your data will be permanently deleted.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              Please type "DELETE" to confirm you want to permanently delete your account.
                            </p>
                            <Input placeholder="Type DELETE to confirm" />
                            <div className="flex justify-end space-x-3">
                              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                              </Button>
                              <Button variant="destructive" onClick={handleAccountDeletion} leftIcon={<Trash2 />}>
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 