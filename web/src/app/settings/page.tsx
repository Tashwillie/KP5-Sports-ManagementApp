'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Bell,
  Home,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Trophy as TrophyIcon,
  MapPin as MapPinIcon,
  FileText as FileTextIcon,
  Settings as SettingsIcon,
  BarChart3,
  Target,
  User,
  Building,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Award,
  UserCheck,
  Activity,
  Trophy,
  Calendar,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle,
  Gavel,
  Shield,
  Zap,
  DollarSign,
  Save,
  Lock,
  Palette,
  Database,
  Shield as SecurityIcon,
  Bell as NotificationIcon,
  Globe as LanguageIcon,
  Monitor,
  Smartphone,
  Download,
  Upload,
  Key,
  Eye as VisibilityIcon,
  EyeOff,
  Wifi,
  WifiOff
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'textarea' | 'file';
  value: any;
  options?: string[];
  placeholder?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('settings');
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    timezone: 'UTC-5',
    language: 'English',
    
    // Security Settings
    twoFactorAuth: true,
    emailNotifications: true,
    smsNotifications: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    
    // Appearance Settings
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false,
    showAnimations: true,
    
    // Notification Settings
    matchReminders: true,
    tournamentUpdates: true,
    teamMessages: true,
    systemAlerts: true,
    emailDigest: 'weekly',
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '2',
    debugMode: false,
    analyticsEnabled: true
  });

  // Mock user data
  const userData = {
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin'
  };

  const settingsSections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your personal information and preferences',
      icon: <User size={20} />,
      items: [
        {
          id: 'firstName',
          title: 'First Name',
          description: 'Your first name as it appears on your profile',
          type: 'input',
          value: settings.firstName,
          placeholder: 'Enter your first name'
        },
        {
          id: 'lastName',
          title: 'Last Name',
          description: 'Your last name as it appears on your profile',
          type: 'input',
          value: settings.lastName,
          placeholder: 'Enter your last name'
        },
        {
          id: 'email',
          title: 'Email Address',
          description: 'Primary email address for account communications',
          type: 'input',
          value: settings.email,
          placeholder: 'Enter your email address'
        },
        {
          id: 'phone',
          title: 'Phone Number',
          description: 'Contact number for SMS notifications',
          type: 'input',
          value: settings.phone,
          placeholder: 'Enter your phone number'
        },
        {
          id: 'timezone',
          title: 'Timezone',
          description: 'Your local timezone for accurate scheduling',
          type: 'select',
          value: settings.timezone,
          options: ['UTC-8', 'UTC-7', 'UTC-6', 'UTC-5', 'UTC-4', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3', 'UTC+5:30', 'UTC+8']
        },
        {
          id: 'language',
          title: 'Language',
          description: 'Preferred language for the interface',
          type: 'select',
          value: settings.language,
          options: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Arabic', 'Chinese', 'Japanese']
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Manage your account security and privacy settings',
      icon: <Lock size={20} />,
      items: [
        {
          id: 'twoFactorAuth',
          title: 'Two-Factor Authentication',
          description: 'Add an extra layer of security to your account',
          type: 'toggle',
          value: settings.twoFactorAuth
        },
        {
          id: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Receive important updates via email',
          type: 'toggle',
          value: settings.emailNotifications
        },
        {
          id: 'smsNotifications',
          title: 'SMS Notifications',
          description: 'Receive urgent alerts via SMS',
          type: 'toggle',
          value: settings.smsNotifications
        },
        {
          id: 'sessionTimeout',
          title: 'Session Timeout',
          description: 'Automatically log out after inactivity (minutes)',
          type: 'select',
          value: settings.sessionTimeout,
          options: ['15', '30', '60', '120', '240']
        },
        {
          id: 'passwordExpiry',
          title: 'Password Expiry',
          description: 'Days before password expires',
          type: 'select',
          value: settings.passwordExpiry,
          options: ['30', '60', '90', '180', '365']
        }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel of your interface',
      icon: <Palette size={20} />,
      items: [
        {
          id: 'theme',
          title: 'Theme',
          description: 'Choose your preferred color scheme',
          type: 'select',
          value: settings.theme,
          options: ['light', 'dark', 'auto']
        },
        {
          id: 'sidebarCollapsed',
          title: 'Collapsed Sidebar',
          description: 'Start with sidebar collapsed by default',
          type: 'toggle',
          value: settings.sidebarCollapsed
        },
        {
          id: 'compactMode',
          title: 'Compact Mode',
          description: 'Use more compact spacing throughout',
          type: 'toggle',
          value: settings.compactMode
        },
        {
          id: 'showAnimations',
          title: 'Show Animations',
          description: 'Enable smooth transitions and animations',
          type: 'toggle',
          value: settings.showAnimations
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure how and when you receive notifications',
      icon: <Bell size={20} />,
      items: [
        {
          id: 'matchReminders',
          title: 'Match Reminders',
          description: 'Get notified before upcoming matches',
          type: 'toggle',
          value: settings.matchReminders
        },
        {
          id: 'tournamentUpdates',
          title: 'Tournament Updates',
          description: 'Receive updates about tournaments you\'re involved in',
          type: 'toggle',
          value: settings.tournamentUpdates
        },
        {
          id: 'teamMessages',
          title: 'Team Messages',
          description: 'Notifications for team communications',
          type: 'toggle',
          value: settings.teamMessages
        },
        {
          id: 'systemAlerts',
          title: 'System Alerts',
          description: 'Important system notifications and updates',
          type: 'toggle',
          value: settings.systemAlerts
        },
        {
          id: 'emailDigest',
          title: 'Email Digest',
          description: 'Frequency of email summaries',
          type: 'select',
          value: settings.emailDigest,
          options: ['daily', 'weekly', 'monthly', 'never']
        }
      ]
    },
    {
      id: 'system',
      title: 'System Settings',
      description: 'Advanced system configuration and preferences',
      icon: <Database size={20} />,
      items: [
        {
          id: 'autoBackup',
          title: 'Auto Backup',
          description: 'Automatically backup your data',
          type: 'toggle',
          value: settings.autoBackup
        },
        {
          id: 'backupFrequency',
          title: 'Backup Frequency',
          description: 'How often to create backups',
          type: 'select',
          value: settings.backupFrequency,
          options: ['daily', 'weekly', 'monthly']
        },
        {
          id: 'dataRetention',
          title: 'Data Retention',
          description: 'Keep backup data for (years)',
          type: 'select',
          value: settings.dataRetention,
          options: ['1', '2', '3', '5', '10']
        },
        {
          id: 'debugMode',
          title: 'Debug Mode',
          description: 'Enable detailed logging for troubleshooting',
          type: 'toggle',
          value: settings.debugMode
        },
        {
          id: 'analyticsEnabled',
          title: 'Analytics',
          description: 'Help improve the platform with usage analytics',
          type: 'toggle',
          value: settings.analyticsEnabled
        }
      ]
    }
  ];

  const handleSettingChange = (sectionId: string, itemId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSaveSettings = () => {
    // Mock API call to save settings
    console.log('Saving settings:', settings);
    // In real implementation, this would call an API
    alert('Settings saved successfully!');
  };

  const renderSettingItem = (section: SettingsSection, item: SettingsItem) => {
    const currentValue = settings[item.id as keyof typeof settings];

    switch (item.type) {
      case 'toggle':
        return (
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id={item.id}
              checked={currentValue as boolean}
              onChange={(e) => handleSettingChange(section.id, item.id, e.target.checked)}
            />
            <label className="form-check-label" htmlFor={item.id}>
              {item.title}
            </label>
          </div>
        );

      case 'select':
        return (
          <div>
            <label htmlFor={item.id} className="form-label fw-medium">
              {item.title}
            </label>
            <select
              id={item.id}
              className="form-select"
              value={currentValue as string}
              onChange={(e) => handleSettingChange(section.id, item.id, e.target.value)}
            >
              {item.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'input':
        return (
          <div>
            <label htmlFor={item.id} className="form-label fw-medium">
              {item.title}
            </label>
            <input
              type="text"
              id={item.id}
              className="form-control"
              value={currentValue as string}
              placeholder={item.placeholder}
              onChange={(e) => handleSettingChange(section.id, item.id, e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const currentSection = settingsSections.find(section => section.id === activeSection);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar activeTab="settings" userData={userData} />

      {/* Main Content */}
      <div className="flex-grow-1 bg-light">
        {/* Header */}
        <div className="bg-white border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-3">Settings</h4>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center">
                <Bell size={16} className="me-1" />
                Notifications
              </button>
              <button 
                className="btn text-white btn-sm d-flex align-items-center"
                style={{backgroundColor: '#4169E1'}}
                onClick={handleSaveSettings}
              >
                <Save size={16} className="me-1" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-4">
          <div className="row">
            {/* Settings Navigation */}
            <div className="col-lg-3 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {settingsSections.map((section) => (
                      <button
                        key={section.id}
                        className={`list-group-item list-group-item-action border-0 d-flex align-items-center py-3 px-4 ${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                        style={activeSection === section.id ? {backgroundColor: '#4169E1', color: 'white'} : {}}
                      >
                        <div className="me-3">
                          {section.icon}
                        </div>
                        <div className="text-start">
                          <div className="fw-medium">{section.title}</div>
                          <small className={activeSection === section.id ? 'text-white-50' : 'text-muted'}>
                            {section.description}
                          </small>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="col-lg-9">
              {currentSection && (
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-bottom">
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        {currentSection.icon}
                      </div>
                      <div>
                        <h5 className="mb-1">{currentSection.title}</h5>
                        <p className="text-muted mb-0">{currentSection.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      {currentSection.items.map((item) => (
                        <div key={item.id} className="col-12">
                          <div className="border rounded p-4">
                            <div className="mb-3">
                              <h6 className="fw-medium mb-1">{item.title}</h6>
                              <p className="text-muted small mb-0">{item.description}</p>
                            </div>
                            {renderSettingItem(currentSection, item)}
                          </div>
                        </div>
                      ))}
                    </div>
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