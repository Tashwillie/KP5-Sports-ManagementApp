export interface Payment {
  id: string;
  userId: string;
  clubId?: string;
  teamId?: string;
  eventId?: string;
  tournamentId?: string;
  registrationId?: string;
  type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  description: string;
  metadata: PaymentMetadata;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  invoiceId?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  refundReason?: string;
  processingFee?: number;
  taxAmount?: number;
  discountAmount?: number;
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  dueDate?: Date;
  expiresAt?: Date;
}

export type PaymentType = 
  | 'registration_fee'
  | 'tournament_fee'
  | 'event_fee'
  | 'membership_fee'
  | 'subscription'
  | 'donation'
  | 'merchandise'
  | 'camp_fee'
  | 'training_fee'
  | 'equipment_fee'
  | 'insurance_fee'
  | 'custom';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed'
  | 'expired';

export type PaymentMethod = 
  | 'stripe_card'
  | 'stripe_bank_transfer'
  | 'stripe_apple_pay'
  | 'stripe_google_pay'
  | 'paypal'
  | 'cash'
  | 'check'
  | 'bank_transfer'
  | 'credit_card'
  | 'debit_card';

export interface PaymentMetadata {
  registrationFormId?: string;
  playerId?: string;
  teamId?: string;
  eventName?: string;
  tournamentName?: string;
  season?: string;
  ageGroup?: string;
  jerseyNumber?: string;
  customFields?: Record<string, any>;
  notes?: string;
  adminNotes?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  clubId?: string;
  teamId?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  type: InvoiceType;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  dueDate: Date;
  paidDate?: Date;
  paymentId?: string;
  stripeInvoiceId?: string;
  stripeCustomerId?: string;
  billingAddress: BillingAddress;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
}

export type InvoiceStatus = 
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'void';

export type InvoiceType = 
  | 'registration'
  | 'membership'
  | 'tournament'
  | 'event'
  | 'subscription'
  | 'equipment'
  | 'training'
  | 'custom';

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  taxAmount?: number;
  metadata?: Record<string, any>;
}

export interface BillingAddress {
  name: string;
  email: string;
  phone?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  clubId?: string;
  teamId?: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  endedAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  amount: number;
  currency: string;
  interval: SubscriptionInterval;
  intervalCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

export type SubscriptionInterval = 
  | 'day'
  | 'week'
  | 'month'
  | 'year';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  clubId?: string;
  teamId?: string;
  price: number;
  currency: string;
  interval: SubscriptionInterval;
  intervalCount: number;
  trialPeriodDays?: number;
  features: SubscriptionFeature[];
  maxMembers?: number;
  maxTeams?: number;
  maxEvents?: number;
  stripePriceId: string;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description?: string;
  value: string | number | boolean;
  type: 'boolean' | 'number' | 'string';
}

export interface PaymentIntent {
  id: string;
  paymentId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  clientSecret: string;
  paymentMethodTypes: string[];
  confirmationMethod: 'automatic' | 'manual';
  captureMethod: 'automatic' | 'manual';
  setupFutureUsage?: 'off_session' | 'on_session';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentIntentStatus = 
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'requires_capture'
  | 'canceled'
  | 'succeeded';

export interface SavedPaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  type: PaymentMethodType;
  card?: CardDetails;
  billingDetails: BillingAddress;
  isDefault: boolean;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentMethodType = 
  | 'card'
  | 'bank_account'
  | 'sepa_debit'
  | 'ideal'
  | 'sofort'
  | 'bancontact';

export interface CardDetails {
  brand: string;
  country?: string;
  expMonth: number;
  expYear: number;
  funding: string;
  last4: string;
  fingerprint?: string;
}

export interface PaymentReminder {
  id: string;
  paymentId: string;
  userId: string;
  type: ReminderType;
  status: ReminderStatus;
  scheduledDate: Date;
  sentDate?: Date;
  emailSent: boolean;
  smsSent: boolean;
  pushSent: boolean;
  message: string;
  subject?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type ReminderType = 
  | 'payment_due'
  | 'payment_overdue'
  | 'subscription_renewal'
  | 'trial_ending'
  | 'payment_failed'
  | 'custom';

export type ReminderStatus = 
  | 'scheduled'
  | 'sent'
  | 'failed'
  | 'cancelled';

export interface PaymentWebhook {
  id: string;
  stripeEventId: string;
  type: string;
  status: 'pending' | 'processed' | 'failed';
  data: Record<string, any>;
  processedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

export interface PaymentAnalytics {
  id: string;
  clubId?: string;
  teamId?: string;
  date: Date;
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  averagePaymentAmount: number;
  paymentMethods: Record<string, number>;
  paymentTypes: Record<string, number>;
  conversionRate: number;
  revenueByType: Record<string, number>;
  topPaymentMethods: string[];
  createdAt: Date;
}

export interface Refund {
  id: string;
  paymentId: string;
  stripeRefundId: string;
  amount: number;
  currency: string;
  reason: RefundReason;
  status: RefundStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type RefundReason = 
  | 'duplicate'
  | 'fraudulent'
  | 'requested_by_customer'
  | 'expired_uncaptured_charge'
  | 'administrative';

export type RefundStatus = 
  | 'succeeded'
  | 'pending'
  | 'failed'
  | 'canceled';

export interface PaymentSettings {
  id: string;
  clubId?: string;
  teamId?: string;
  stripeAccountId?: string;
  stripePublishableKey: string;
  stripeSecretKey?: string;
  webhookEndpoint?: string;
  webhookSecret?: string;
  defaultCurrency: string;
  supportedCurrencies: string[];
  taxRates: TaxRate[];
  paymentMethods: PaymentMethodConfig[];
  invoiceSettings: InvoiceSettings;
  subscriptionSettings: SubscriptionSettings;
  reminderSettings: ReminderSettings;
  refundPolicy: RefundPolicy;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  isInclusive: boolean;
  country?: string;
  state?: string;
  postalCode?: string;
  isActive: boolean;
}

export interface PaymentMethodConfig {
  type: PaymentMethodType;
  isEnabled: boolean;
  processingFee?: number;
  processingFeeType?: 'percentage' | 'fixed';
  minimumAmount?: number;
  maximumAmount?: number;
}

export interface InvoiceSettings {
  defaultDueDays: number;
  autoSendInvoices: boolean;
  invoicePrefix: string;
  invoiceNumberFormat: string;
  defaultTerms: string;
  defaultNotes: string;
  logoUrl?: string;
  companyInfo: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface SubscriptionSettings {
  allowTrialPeriods: boolean;
  defaultTrialDays: number;
  prorateOnUpgrade: boolean;
  prorateOnDowngrade: boolean;
  allowCancellation: boolean;
  cancellationNoticeDays: number;
  autoRenewal: boolean;
}

export interface ReminderSettings {
  enableEmailReminders: boolean;
  enableSMSReminders: boolean;
  enablePushReminders: boolean;
  reminderSchedule: {
    daysBeforeDue: number[];
    daysAfterDue: number[];
  };
  customMessages: Record<string, string>;
}

export interface RefundPolicy {
  allowsRefunds: boolean;
  refundWindowDays: number;
  processingFeePercentage: number;
  minimumRefundAmount: number;
  refundReasons: string[];
  requiresApproval: boolean;
}

export interface StripeCustomer {
  id: string;
  userId: string;
  stripeCustomerId: string;
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSession {
  id: string;
  paymentId: string;
  sessionId: string;
  status: 'active' | 'expired' | 'completed' | 'cancelled';
  expiresAt: Date;
  returnUrl?: string;
  cancelUrl?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
} 