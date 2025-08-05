export interface AdminDashboard {
  id: string;
  userId: string;
  role: 'super_admin' | 'club_admin' | 'system_admin';
  permissions: AdminPermissions;
  settings: AdminSettings;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminPermissions {
  userManagement: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    assignRoles: boolean;
  };
  clubManagement: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
  systemManagement: {
    view: boolean;
    configure: boolean;
    backup: boolean;
    restore: boolean;
  };
  analytics: {
    view: boolean;
    export: boolean;
    configure: boolean;
  };
  contentManagement: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    moderate: boolean;
  };
  financialManagement: {
    view: boolean;
    process: boolean;
    refund: boolean;
    report: boolean;
  };
}

export interface AdminSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list' | 'compact';
    widgets: string[];
    refreshInterval: number; // seconds
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number; // minutes
    ipWhitelist: string[];
  };
}

export interface AdminAnalytics {
  id: string;
  date: Date;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  metrics: {
    users: UserMetrics;
    clubs: ClubMetrics;
    teams: TeamMetrics;
    events: EventMetrics;
    payments: PaymentMetrics;
    engagement: EngagementMetrics;
    system: SystemMetrics;
  };
  insights: AnalyticsInsight[];
  generatedAt: Date;
}

export interface UserMetrics {
  total: number;
  active: number;
  new: number;
  verified: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  growth: number; // percentage
  retention: number; // percentage
  churn: number; // percentage
}

export interface ClubMetrics {
  total: number;
  active: number;
  pending: number;
  verified: number;
  byLevel: Record<string, number>;
  byLocation: Record<string, number>;
  growth: number;
  averageTeams: number;
  averagePlayers: number;
}

export interface TeamMetrics {
  total: number;
  active: number;
  byAgeGroup: Record<string, number>;
  byGender: Record<string, number>;
  byLevel: Record<string, number>;
  averagePlayers: number;
  averageEvents: number;
}

export interface EventMetrics {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageAttendance: number;
  averageDuration: number; // minutes
}

export interface PaymentMetrics {
  total: number;
  amount: number;
  currency: string;
  successful: number;
  failed: number;
  pending: number;
  refunded: number;
  byMethod: Record<string, number>;
  averageAmount: number;
  conversionRate: number;
}

export interface EngagementMetrics {
  pageViews: number;
  uniqueVisitors: number;
  returningVisitors: number;
  averageSessionDuration: number; // seconds
  bounceRate: number;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
  }>;
  topReferrers: Array<{
    source: string;
    visits: number;
    percentage: number;
  }>;
  deviceTypes: Array<{
    device: string;
    visits: number;
    percentage: number;
  }>;
}

export interface SystemMetrics {
  uptime: number; // percentage
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  activeConnections: number;
  storageUsed: number; // bytes
  storageLimit: number; // bytes
  bandwidthUsed: number; // bytes
  bandwidthLimit: number; // bytes
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'users' | 'clubs' | 'teams' | 'events' | 'payments' | 'system';
  data: Record<string, any>;
  actionable: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'club_admin' | 'system_admin' | 'moderator';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  permissions: AdminPermissions;
  lastLogin: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    avatar?: string;
    phone?: string;
    timezone: string;
    language: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
  };
  activity: {
    lastActivity: Date;
    totalSessions: number;
    averageSessionDuration: number;
  };
}

export interface AdminAuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export interface AdminSystemHealth {
  id: string;
  timestamp: Date;
  status: 'healthy' | 'warning' | 'critical';
  services: {
    database: ServiceStatus;
    storage: ServiceStatus;
    auth: ServiceStatus;
    functions: ServiceStatus;
    messaging: ServiceStatus;
  };
  performance: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
    network: number; // bytes per second
  };
  errors: SystemError[];
  alerts: SystemAlert[];
}

export interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number; // milliseconds
  uptime: number; // percentage
  lastCheck: Date;
  error?: string;
}

export interface SystemError {
  id: string;
  type: string;
  message: string;
  stack?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface SystemAlert {
  id: string;
  type: 'performance' | 'security' | 'storage' | 'billing' | 'maintenance';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AdminReport {
  id: string;
  name: string;
  description: string;
  type: 'users' | 'clubs' | 'teams' | 'events' | 'payments' | 'analytics' | 'system';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  schedule: 'once' | 'daily' | 'weekly' | 'monthly';
  scheduleConfig: {
    time?: string; // HH:MM
    dayOfWeek?: number; // 0-6
    dayOfMonth?: number; // 1-31
    recipients: string[];
  };
  filters: Record<string, any>;
  columns: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  limit?: number;
  status: 'active' | 'inactive' | 'error';
  lastGenerated?: Date;
  nextGeneration?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  category: 'system' | 'user' | 'club' | 'payment' | 'security';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: string[];
  readBy: string[];
  actionUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminBackup {
  id: string;
  name: string;
  description: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  size: number; // bytes
  location: string;
  checksum: string;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  retentionDays: number;
  createdBy: string;
  errorMessage?: string;
}

export interface AdminMaintenance {
  id: string;
  title: string;
  description: string;
  type: 'scheduled' | 'emergency' | 'upgrade';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startTime: Date;
  endTime: Date;
  affectedServices: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface AdminBilling {
  id: string;
  period: string; // YYYY-MM
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  amount: number;
  currency: string;
  items: BillingItem[];
  dueDate: Date;
  paidAt?: Date;
  invoiceUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'storage' | 'bandwidth' | 'api_calls' | 'users' | 'features';
}

export interface AdminSettingsConfig {
  id: string;
  category: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  editable: boolean;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: any[];
  };
  updatedBy: string;
  updatedAt: Date;
}

export interface AdminDashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list' | 'gauge' | 'map';
  title: string;
  description?: string;
  config: {
    dataSource: string;
    refreshInterval: number;
    size: 'small' | 'medium' | 'large' | 'full';
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    options: Record<string, any>;
  };
  permissions: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminDashboardLayout {
  id: string;
  name: string;
  description: string;
  layout: {
    columns: number;
    rows: number;
    widgets: AdminDashboardWidget[];
  };
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
} 