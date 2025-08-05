export interface RegistrationForm {
  id: string;
  name: string;
  description?: string;
  clubId: string;
  teamId?: string;
  eventId?: string;
  tournamentId?: string;
  type: RegistrationFormType;
  status: RegistrationFormStatus;
  isActive: boolean;
  isPublic: boolean;
  requiresApproval: boolean;
  maxRegistrations?: number;
  currentRegistrations: number;
  registrationDeadline?: Date;
  startDate?: Date;
  endDate?: Date;
  ageRestrictions?: AgeRestrictions;
  fields: FormField[];
  waivers: Waiver[];
  pricing: PricingStructure;
  notifications: RegistrationNotifications;
  settings: RegistrationFormSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type RegistrationFormType = 
  | 'player_registration'
  | 'team_registration'
  | 'tournament_registration'
  | 'event_registration'
  | 'tryout_registration'
  | 'camp_registration'
  | 'volunteer_registration'
  | 'custom';

export type RegistrationFormStatus = 
  | 'draft'
  | 'active'
  | 'paused'
  | 'closed'
  | 'archived';

export interface AgeRestrictions {
  minAge?: number;
  maxAge?: number;
  ageAsOfDate?: Date; // For calculating age as of a specific date
  birthYearRange?: {
    startYear: number;
    endYear: number;
  };
  ageGroups?: AgeGroup[];
}

export interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  description?: string;
  maxParticipants?: number;
  currentParticipants: number;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  validation?: FieldValidation;
  options?: FieldOption[];
  conditional?: ConditionalLogic;
  isVisible: boolean;
  isEditable: boolean;
}

export type FieldType = 
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'file'
  | 'image'
  | 'address'
  | 'emergency_contact'
  | 'medical_info'
  | 'jersey_number'
  | 'position'
  | 'experience_level'
  | 'custom';

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string; // Regex pattern
  required?: boolean;
  unique?: boolean;
  customValidation?: string; // Custom validation logic
}

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  isDefault?: boolean;
  isDisabled?: boolean;
}

export interface ConditionalLogic {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  action: 'show' | 'hide' | 'require' | 'make_optional';
}

export interface Waiver {
  id: string;
  title: string;
  content: string;
  type: WaiverType;
  isRequired: boolean;
  requiresSignature: boolean;
  requiresParentSignature: boolean;
  minAgeForParentSignature?: number;
  version: string;
  effectiveDate: Date;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export type WaiverType = 
  | 'liability'
  | 'medical'
  | 'code_of_conduct'
  | 'photo_release'
  | 'emergency_contact'
  | 'transportation'
  | 'custom';

export interface PricingStructure {
  type: PricingType;
  basePrice: number;
  currency: string;
  discounts: Discount[];
  paymentPlans: PaymentPlan[];
  lateFees: LateFee[];
  refundPolicy: RegistrationRefundPolicy;
}

export type PricingType = 
  | 'fixed'
  | 'tiered'
  | 'early_bird'
  | 'dynamic'
  | 'free';

export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  code?: string;
  conditions: DiscountCondition[];
  validFrom: Date;
  validUntil?: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

export interface DiscountCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface PaymentPlan {
  id: string;
  name: string;
  numberOfPayments: number;
  paymentInterval: 'weekly' | 'biweekly' | 'monthly';
  firstPaymentAmount?: number;
  remainingPaymentAmount?: number;
  dueDates: Date[];
  isActive: boolean;
}

export interface LateFee {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  appliesAfter: Date;
  isActive: boolean;
}

export interface RegistrationRefundPolicy {
  allowsRefunds: boolean;
  refundPercentage: number;
  refundDeadline?: Date;
  processingFee?: number;
  conditions: string[];
}

export interface RegistrationNotifications {
  confirmationEmail: boolean;
  confirmationSMS: boolean;
  reminderEmails: boolean;
  reminderSMS: boolean;
  adminNotifications: boolean;
  customMessages: CustomMessage[];
}

export interface CustomMessage {
  id: string;
  type: 'email' | 'sms';
  trigger: 'registration' | 'payment' | 'reminder' | 'approval' | 'rejection';
  subject?: string;
  message: string;
  isActive: boolean;
}

export interface RegistrationFormSettings {
  allowMultipleRegistrations: boolean;
  requireUniqueEmail: boolean;
  requireUniquePhone: boolean;
  autoApprove: boolean;
  sendWelcomeEmail: boolean;
  collectEmergencyContact: boolean;
  collectMedicalInfo: boolean;
  allowFileUploads: boolean;
  maxFileSize: number; // MB
  allowedFileTypes: string[];
  enableWaitlist: boolean;
  waitlistCapacity: number;
  enablePartialPayments: boolean;
  requireWaiverSignature: boolean;
  enableRegistrationCodes: boolean;
  registrationCodes: RegistrationCode[];
}

export interface RegistrationCode {
  id: string;
  code: string;
  description?: string;
  maxUses: number;
  currentUses: number;
  discountId?: string;
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
}

export interface Registration {
  id: string;
  formId: string;
  registrantId: string;
  registrantName: string;
  registrantEmail: string;
  registrantPhone?: string;
  status: RegistrationStatus;
  submittedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  fields: RegistrationField[];
  waivers: WaiverSignature[];
  payments: RegistrationPayment[];
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  discountApplied?: string;
  registrationCode?: string;
  notes?: string;
  isWaitlisted: boolean;
  waitlistPosition?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type RegistrationStatus = 
  | 'pending'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'waitlisted'
  | 'expired';

export interface RegistrationField {
  fieldId: string;
  fieldName: string;
  fieldType: FieldType;
  value: any;
  isRequired: boolean;
  validationPassed: boolean;
  validationErrors?: string[];
}

export interface WaiverSignature {
  waiverId: string;
  waiverTitle: string;
  signedBy: string;
  signedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  parentSignature?: {
    parentName: string;
    parentEmail: string;
    signedAt: Date;
    relationship: string;
  };
}

export interface RegistrationPayment {
  id: string;
  amount: number;
  currency: string;
  method: RegistrationPaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentDate: Date;
  dueDate?: Date;
  description?: string;
  receiptUrl?: string;
  refundedAmount?: number;
  refundedAt?: Date;
}

export type RegistrationPaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'check'
  | 'cash'
  | 'stripe'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export interface RegistrationAnalytics {
  id: string;
  formId: string;
  date: Date;
  totalRegistrations: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
  rejectedRegistrations: number;
  cancelledRegistrations: number;
  waitlistedRegistrations: number;
  totalRevenue: number;
  averageRegistrationTime: number; // minutes
  conversionRate: number; // percentage
  fieldCompletionRates: Record<string, number>;
  popularFields: string[];
  dropoffPoints: string[];
  deviceTypes: Record<string, number>;
  referrerSources: Record<string, number>;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: FormTemplateCategory;
  type: RegistrationFormType;
  fields: FormField[];
  waivers: Waiver[];
  pricing: PricingStructure;
  settings: RegistrationFormSettings;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  tags: string[];
  createdAt: Date;
  createdBy: string;
}

export type FormTemplateCategory = 
  | 'sports'
  | 'education'
  | 'healthcare'
  | 'business'
  | 'community'
  | 'custom';

export interface RegistrationExport {
  id: string;
  formId: string;
  requestedBy: string;
  format: 'csv' | 'excel' | 'pdf';
  filters: ExportFilter[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  recordCount: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface ExportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
  value2?: any; // For 'between' operator
}

export interface RegistrationWorkflow {
  id: string;
  formId: string;
  name: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'payment' | 'notification' | 'assignment' | 'custom';
  order: number;
  assignees: string[]; // User IDs
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isRequired: boolean;
  estimatedTime?: number; // hours
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface WorkflowAction {
  type: 'send_email' | 'send_sms' | 'update_status' | 'assign_role' | 'create_task' | 'webhook';
  config: Record<string, any>;
} 