// Firebase imports removed - will be replaced with API calls
import { 
  Payment, 
  Subscription, 
  Invoice,
  ApiResponse 
} from '@shared/types';
import apiClient from '../apiClient';

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  pendingPayments: number;
  overdueInvoices: number;
}

export class PaymentService {
  private static instance: PaymentService;

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Get payments with filters
  async getPayments(filters: {
    status?: string;
    dateRange?: string;
    search?: string;
  } = {}): Promise<Payment[]> {
    try {
      const response = await apiClient.getPayments();
      let payments = response.data || [];

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        payments = payments.filter(payment => payment.status === filters.status);
      }

      // Filter by date range
      if (filters.dateRange) {
        const days = parseInt(filters.dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        payments = payments.filter(payment => 
          new Date(payment.createdAt) >= cutoffDate
        );
      }

      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        payments = payments.filter(payment =>
          payment.customerName?.toLowerCase().includes(searchTerm) ||
          payment.id.toLowerCase().includes(searchTerm) ||
          payment.description?.toLowerCase().includes(searchTerm)
        );
      }

      return payments;
    } catch (error) {
      console.error('Error getting payments:', error);
      throw new Error('Failed to get payments');
    }
  }

  // Get subscriptions with filters
  async getSubscriptions(filters: {
    status?: string;
    dateRange?: string;
    search?: string;
  } = {}): Promise<Subscription[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/subscriptions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }

      const result = await response.json();
      let subscriptions = result.data || [];

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        subscriptions = subscriptions.filter(sub => sub.status === filters.status);
      }

      // Filter by date range
      if (filters.dateRange) {
        const days = parseInt(filters.dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        subscriptions = subscriptions.filter(sub => 
          new Date(sub.createdAt) >= cutoffDate
        );
      }

      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        subscriptions = subscriptions.filter(sub =>
          sub.customerName?.toLowerCase().includes(searchTerm) ||
          sub.id.toLowerCase().includes(searchTerm) ||
          sub.planName?.toLowerCase().includes(searchTerm)
        );
      }

      return subscriptions;
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      throw new Error('Failed to get subscriptions');
    }
  }

  // Get invoices with filters
  async getInvoices(filters: {
    status?: string;
    dateRange?: string;
    search?: string;
  } = {}): Promise<Invoice[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/invoices`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const result = await response.json();
      let invoices = result.data || [];

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        invoices = invoices.filter(invoice => invoice.status === filters.status);
      }

      // Filter by date range
      if (filters.dateRange) {
        const days = parseInt(filters.dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        invoices = invoices.filter(invoice => 
          new Date(invoice.createdAt) >= cutoffDate
        );
      }

      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        invoices = invoices.filter(invoice =>
          invoice.customerName?.toLowerCase().includes(searchTerm) ||
          invoice.id.toLowerCase().includes(searchTerm) ||
          invoice.description?.toLowerCase().includes(searchTerm)
        );
      }

      return invoices;
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw new Error('Failed to get invoices');
    }
  }

  // Get payment statistics
  async getPaymentStats(): Promise<PaymentStats> {
    try {
      const payments = await this.getPayments();
      const subscriptions = await this.getSubscriptions();
      const invoices = await this.getInvoices();

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const monthlyRevenue = payments
        .filter(p => {
          const paymentDate = new Date(p.createdAt);
          const now = new Date();
          return p.status === 'completed' && 
                 paymentDate.getMonth() === now.getMonth() && 
                 paymentDate.getFullYear() === now.getFullYear();
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const pendingPayments = payments.filter(p => p.status === 'pending').length;
      const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

      return {
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions,
        pendingPayments,
        overdueInvoices,
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw new Error('Failed to get payment stats');
    }
  }

  // Update payment status
  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // Process refund
  async processRefund(paymentId: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Send invoice reminder
  async sendInvoiceReminder(invoiceId: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/invoices/${invoiceId}/remind`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice reminder');
      }
    } catch (error) {
      console.error('Error sending invoice reminder:', error);
      throw new Error('Failed to send invoice reminder');
    }
  }

  // Create payment
  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const response = await apiClient.createPayment(paymentData);
      return response.data.id;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  // Create subscription
  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Create invoice
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  // Get payment by ID
  async getPayment(paymentId: string): Promise<Payment> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Payment not found');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw new Error('Failed to get payment');
    }
  }

  // Get subscription by ID
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Subscription not found');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error('Failed to get subscription');
    }
  }

  // Get invoice by ID
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/invoices/${invoiceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invoice not found');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw new Error('Failed to get invoice');
    }
  }

  // Real-time subscriptions (simplified for API-based approach)
  subscribeToPayments(callback: (payments: Payment[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const payments = await this.getPayments();
        callback(payments);
      } catch (error) {
        console.error('Error in payments subscription:', error);
        callback([]);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }

  subscribeToSubscriptions(callback: (subscriptions: Subscription[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const subscriptions = await this.getSubscriptions();
        callback(subscriptions);
      } catch (error) {
        console.error('Error in subscriptions subscription:', error);
        callback([]);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }

  subscribeToInvoices(callback: (invoices: Invoice[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const invoices = await this.getInvoices();
        callback(invoices);
      } catch (error) {
        console.error('Error in invoices subscription:', error);
        callback([]);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }
}

export const paymentService = PaymentService.getInstance(); 