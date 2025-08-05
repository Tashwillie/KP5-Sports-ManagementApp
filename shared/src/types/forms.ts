import { Gender, AgeGroup, Sport, EventType } from './index';

// Form Types
export interface BasicFormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  validation?: FormValidation;
  defaultValue?: any;
  order: number;
}

export type FormFieldType = 
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'address'
  | 'emergency_contact';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean | string;
}

export interface BasicRegistrationForm {
  id: string;
  name: string;
  description?: string;
  clubId: string;
  teamId?: string;
  fields: BasicFormField[];
  ageFilters?: AgeFilter[];
  maxRegistrations?: number;
  registrationDeadline?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgeFilter {
  minAge: number;
  maxAge: number;
  gender?: Gender;
}

export interface FormSubmission {
  id: string;
  formId: string;
  userId: string;
  playerId?: string;
  data: Record<string, any>;
  status: FormSubmissionStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export type FormSubmissionStatus = 
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'waitlist';

// Custom Form Types
export interface CustomForm {
  id: string;
  name: string;
  description?: string;
  type: CustomFormType;
  fields: BasicFormField[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type CustomFormType = 
  | 'player_registration'
  | 'tryout_registration'
  | 'volunteer_signup'
  | 'feedback'
  | 'incident_report'
  | 'medical_form'
  | 'waiver'
  | 'custom';

// Waiver Types
export interface WaiverTemplate {
  id: string;
  name: string;
  content: string;
  version: string;
  isActive: boolean;
  requiredFor: WaiverRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WaiverRequirement {
  ageGroup?: AgeGroup;
  sport?: Sport;
  eventType?: EventType;
}

export interface SignedWaiver {
  id: string;
  waiverId: string;
  userId: string;
  playerId?: string;
  signedAt: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
}

// Form Analytics
export interface FormAnalytics {
  formId: string;
  totalSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  pendingSubmissions: number;
  averageCompletionTime: number;
  fieldCompletionRates: Record<string, number>;
  lastUpdated: Date;
} 