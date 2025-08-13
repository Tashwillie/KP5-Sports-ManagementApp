// User Role Permissions
export const ROLE_PERMISSIONS = {
  super_admin: {
    canManageUsers: true,
    canManageClubs: true,
    canManageTeams: true,
    canManagePlayers: true,
    canManageEvents: true,
    canManageTournaments: true,
    canManagePayments: true,
    canViewAnalytics: true,
    canManageSystem: true,
  },
  club_admin: {
    canManageUsers: false,
    canManageClubs: true,
    canManageTeams: true,
    canManagePlayers: true,
    canManageEvents: true,
    canManageTournaments: true,
    canManagePayments: true,
    canViewAnalytics: true,
    canManageSystem: false,
  },
  coach: {
    canManageUsers: false,
    canManageClubs: false,
    canManageTeams: true,
    canManagePlayers: true,
    canManageEvents: true,
    canManageTournaments: false,
    canManagePayments: false,
    canViewAnalytics: true,
    canManageSystem: false,
  },
  player: {
    canManageUsers: false,
    canManageClubs: false,
    canManageTeams: false,
    canManagePlayers: false,
    canManageEvents: false,
    canManageTournaments: false,
    canManagePayments: false,
    canViewAnalytics: false,
    canManageSystem: false,
  },
  parent: {
    canManageUsers: false,
    canManageClubs: false,
    canManageTeams: false,
    canManagePlayers: false,
    canManageEvents: false,
    canManageTournaments: false,
    canManagePayments: false,
    canViewAnalytics: false,
    canManageSystem: false,
  },
  referee: {
    canManageUsers: false,
    canManageClubs: false,
    canManageTeams: false,
    canManagePlayers: false,
    canManageEvents: true,
    canManageTournaments: false,
    canManagePayments: false,
    canViewAnalytics: false,
    canManageSystem: false,
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: 'Please enter a valid phone number',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  },
  jerseyNumber: {
    min: 0,
    max: 99,
    message: 'Jersey number must be between 0 and 99',
  },
  age: {
    min: 4,
    max: 100,
    message: 'Age must be between 4 and 100',
  },
} as const;

// Sports Configuration
export const SPORTS_CONFIG = {
  soccer: {
    positions: ['goalkeeper', 'defender', 'midfielder', 'forward'],
    maxPlayers: 18,
    minPlayers: 7,
    fieldSize: '11v11',
  },
  basketball: {
    positions: ['point_guard', 'shooting_guard', 'small_forward', 'power_forward', 'center'],
    maxPlayers: 15,
    minPlayers: 5,
    fieldSize: '5v5',
  },
  baseball: {
    positions: ['pitcher', 'catcher', 'first_base', 'second_base', 'third_base', 'shortstop', 'left_field', 'center_field', 'right_field'],
    maxPlayers: 20,
    minPlayers: 9,
    fieldSize: '9v9',
  },
  football: {
    positions: ['quarterback', 'running_back', 'wide_receiver', 'tight_end', 'offensive_line', 'defensive_line', 'linebacker', 'cornerback', 'safety'],
    maxPlayers: 53,
    minPlayers: 11,
    fieldSize: '11v11',
  },
} as const;

// Age Groups
export const AGE_GROUPS = {
  u6: { minAge: 4, maxAge: 6, displayName: 'Under 6' },
  u8: { minAge: 6, maxAge: 8, displayName: 'Under 8' },
  u10: { minAge: 8, maxAge: 10, displayName: 'Under 10' },
  u12: { minAge: 10, maxAge: 12, displayName: 'Under 12' },
  u14: { minAge: 12, maxAge: 14, displayName: 'Under 14' },
  u16: { minAge: 14, maxAge: 16, displayName: 'Under 16' },
  u18: { minAge: 16, maxAge: 18, displayName: 'Under 18' },
  adult: { minAge: 18, maxAge: 100, displayName: 'Adult' },
} as const;

// Event Types
export const EVENT_TYPES = {
  game: { displayName: 'Game', color: 'red', icon: '🏆' },
  practice: { displayName: 'Practice', color: 'blue', icon: '⚽' },
  tournament: { displayName: 'Tournament', color: 'purple', icon: '🏅' },
  meeting: { displayName: 'Meeting', color: 'green', icon: '📋' },
  tryout: { displayName: 'Tryout', color: 'orange', icon: '🎯' },
  other: { displayName: 'Other', color: 'gray', icon: '📅' },
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  event_reminder: { displayName: 'Event Reminder', icon: '⏰' },
  message: { displayName: 'Message', icon: '💬' },
  registration_update: { displayName: 'Registration Update', icon: '📝' },
  payment_reminder: { displayName: 'Payment Reminder', icon: '💰' },
  team_update: { displayName: 'Team Update', icon: '👥' },
  system: { displayName: 'System', icon: '🔧' },
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  pending: { displayName: 'Pending', color: 'yellow' },
  processing: { displayName: 'Processing', color: 'blue' },
  succeeded: { displayName: 'Paid', color: 'green' },
  failed: { displayName: 'Failed', color: 'red' },
  cancelled: { displayName: 'Cancelled', color: 'gray' },
  refunded: { displayName: 'Refunded', color: 'orange' },
} as const;

// Registration Status
export const REGISTRATION_STATUS = {
  pending: { displayName: 'Pending Review', color: 'yellow' },
  approved: { displayName: 'Approved', color: 'green' },
  rejected: { displayName: 'Rejected', color: 'red' },
  waitlist: { displayName: 'Waitlist', color: 'orange' },
  cancelled: { displayName: 'Cancelled', color: 'gray' },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/signin',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    resetPassword: '/api/auth/reset-password',
    verifyEmail: '/api/auth/verify-email',
  },
  users: {
    profile: '/api/users/profile',
    update: '/api/users/update',
    delete: '/api/users/delete',
  },
  clubs: {
    list: '/api/clubs',
    create: '/api/clubs/create',
    update: '/api/clubs/:id',
    delete: '/api/clubs/:id',
  },
  teams: {
    list: '/api/teams',
    create: '/api/teams/create',
    update: '/api/teams/:id',
    delete: '/api/teams/:id',
  },
  events: {
    list: '/api/events',
    create: '/api/events/create',
    update: '/api/events/:id',
    delete: '/api/events/:id',
  },
  payments: {
    create: '/api/payments/create',
    webhook: '/api/payments/webhook',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'kp5_auth_token',
  USER_PREFERENCES: 'kp5_user_preferences',
  THEME: 'kp5_theme',
  LANGUAGE: 'kp5_language',
  NOTIFICATIONS: 'kp5_notifications',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  FIREBASE_ERROR: 'Firebase error occurred. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  REGISTRATION_SUCCESS: 'Registration successful.',
  PAYMENT_SUCCESS: 'Payment processed successfully.',
} as const; 