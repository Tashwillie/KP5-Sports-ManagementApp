import { VALIDATION_RULES, AGE_GROUPS, EVENT_TYPES, PAYMENT_STATUS, REGISTRATION_STATUS } from './constants';
import { UserRole, AgeGroup, Sport, EventType, PaymentStatus, RegistrationStatus } from '../types';

// Validation Helpers
export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.email.pattern.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return VALIDATION_RULES.phone.pattern.test(phone);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < VALIDATION_RULES.password.minLength) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!VALIDATION_RULES.password.pattern.test(password)) {
    return { isValid: false, message: VALIDATION_RULES.password.message };
  }
  return { isValid: true };
};

export const validateJerseyNumber = (number: number): boolean => {
  return number >= VALIDATION_RULES.jerseyNumber.min && number <= VALIDATION_RULES.jerseyNumber.max;
};

export const validateAge = (age: number): boolean => {
  return age >= VALIDATION_RULES.age.min && age <= VALIDATION_RULES.age.max;
};

// Date and Time Helpers
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString();
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return dateObj.toLocaleDateString();
  }
};

export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getAgeFromDate = (birthDate: Date | string): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const getAgeGroupFromAge = (age: number): AgeGroup => {
  for (const [group, config] of Object.entries(AGE_GROUPS)) {
    if (age >= config.minAge && age <= config.maxAge) {
      return group as AgeGroup;
    }
  }
  return 'adult';
};

export const isDateInPast = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

export const isDateInFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

// String Formatting Helpers
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Array and Object Helpers
export const groupBy = <T, K extends keyof any>(array: T[], key: (item: T) => K): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const group = key(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

// Permission Helpers
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const permissions = {
    super_admin: true, // Super admin has all permissions
    club_admin: ['manage_clubs', 'manage_teams', 'manage_players', 'manage_events', 'view_analytics'],
    coach: ['manage_teams', 'manage_players', 'manage_events', 'view_analytics'],
    player: ['view_own_profile', 'view_own_team'],
    parent: ['view_child_profile', 'view_child_team'],
    referee: ['manage_events'],
  };
  
  if (userRole === 'super_admin') return true;
  return permissions[userRole]?.includes(permission) || false;
};

// Status Helpers
export const getStatusColor = (status: PaymentStatus | RegistrationStatus | EventType): string => {
  if (status in PAYMENT_STATUS) {
    return PAYMENT_STATUS[status as PaymentStatus].color;
  }
  if (status in REGISTRATION_STATUS) {
    return REGISTRATION_STATUS[status as RegistrationStatus].color;
  }
  if (status in EVENT_TYPES) {
    return EVENT_TYPES[status as EventType].color;
  }
  return 'gray';
};

export const getStatusDisplayName = (status: PaymentStatus | RegistrationStatus | EventType): string => {
  if (status in PAYMENT_STATUS) {
    return PAYMENT_STATUS[status as PaymentStatus].displayName;
  }
  if (status in REGISTRATION_STATUS) {
    return REGISTRATION_STATUS[status as RegistrationStatus].displayName;
  }
  if (status in EVENT_TYPES) {
    return EVENT_TYPES[status as EventType].displayName;
  }
  return capitalizeFirst(status);
};

// File Helpers
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

export const isValidDocumentFile = (file: File): boolean => {
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  return validTypes.includes(file.type);
};

// URL Helpers
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getDomainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

// Math Helpers
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const roundToDecimal = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// Random Helpers
export const generateId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateJerseyNumber = (existingNumbers: number[]): number => {
  const availableNumbers = Array.from({ length: 100 }, (_, i) => i).filter(
    num => !existingNumbers.includes(num)
  );
  return availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
}; 