import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Payment, 
  Subscription, 
  Invoice,
  ApiResponse 
} from '../../../../shared/src/types';

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  pendingPayments: number;
  overdueInvoices: number;
}

export class PaymentService {
  private static instance: PaymentService;
  private paymentsCollection = collection(db, 'payments');
  private subscriptionsCollection = collection(db, 'subscriptions');
  private invoicesCollection = collection(db, 'invoices');

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
      let q = query(
        this.paymentsCollection,
        orderBy('createdAt', 'desc')
      );

      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      let payments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Payment;
      });

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
      let q = query(
        this.subscriptionsCollection,
        orderBy('createdAt', 'desc')
      );

      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      let subscriptions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate(),
          nextBillingDate: data.nextBillingDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Subscription;
      });

      // Filter by date range
      if (filters.dateRange) {
        const days = parseInt(filters.dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        subscriptions = subscriptions.filter(subscription => 
          new Date(subscription.createdAt) >= cutoffDate
        );
      }

      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        subscriptions = subscriptions.filter(subscription =>
          subscription.customerName?.toLowerCase().includes(searchTerm) ||
          subscription.id.toLowerCase().includes(searchTerm) ||
          subscription.planName?.toLowerCase().includes(searchTerm)
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
      let q = query(
        this.invoicesCollection,
        orderBy('createdAt', 'desc')
      );

      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      const querySnapshot = await getDocs(q);
      let invoices = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate() || new Date(),
          paidDate: data.paidDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Invoice;
      });

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
      const [payments, subscriptions, invoices] = await Promise.all([
        this.getPayments(),
        this.getSubscriptions(),
        this.getInvoices(),
      ]);

      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const monthlyRevenue = payments
        .filter(p => p.status === 'completed' && new Date(p.createdAt) >= thirtyDaysAgo)
        .reduce((sum, p) => sum + p.amount, 0);

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      const pendingPayments = payments.filter(p => p.status === 'pending').length;
      const overdueInvoices = invoices.filter(i => 
        i.status === 'unpaid' && new Date(i.dueDate) < now
      ).length;

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
      const docRef = doc(this.paymentsCollection, paymentId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // Process refund
  async processRefund(paymentId: string): Promise<void> {
    try {
      // This would typically call Stripe API to process refund
      // For now, just update the status
      await this.updatePaymentStatus(paymentId, 'refunded');
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const docRef = doc(this.subscriptionsCollection, subscriptionId);
      await updateDoc(docRef, {
        status: 'cancelled',
        endDate: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Send invoice reminder
  async sendInvoiceReminder(invoiceId: string): Promise<void> {
    try {
      // This would typically send an email reminder
      // For now, just log the action
      console.log(`Sending reminder for invoice ${invoiceId}`);
    } catch (error) {
      console.error('Error sending invoice reminder:', error);
      throw new Error('Failed to send invoice reminder');
    }
  }

  // Create payment
  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.paymentsCollection, {
        ...paymentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  // Create subscription
  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.subscriptionsCollection, {
        ...subscriptionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Create invoice
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.invoicesCollection, {
        ...invoiceData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw new Error('Failed to create invoice');
    }
  }

  // Get payment by ID
  async getPayment(paymentId: string): Promise<Payment> {
    try {
      const docRef = doc(this.paymentsCollection, paymentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Payment not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Payment;
    } catch (error) {
      console.error('Error getting payment:', error);
      throw new Error('Failed to get payment');
    }
  }

  // Get subscription by ID
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const docRef = doc(this.subscriptionsCollection, subscriptionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Subscription not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate(),
        nextBillingDate: data.nextBillingDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw new Error('Failed to get subscription');
    }
  }

  // Get invoice by ID
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const docRef = doc(this.invoicesCollection, invoiceId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Invoice not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        dueDate: data.dueDate?.toDate() || new Date(),
        paidDate: data.paidDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Invoice;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw new Error('Failed to get invoice');
    }
  }

  // Subscribe to payment updates
  subscribeToPayments(callback: (payments: Payment[]) => void): () => void {
    const q = query(
      this.paymentsCollection,
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const payments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Payment;
      });
      
      callback(payments);
    });
  }

  // Subscribe to subscription updates
  subscribeToSubscriptions(callback: (subscriptions: Subscription[]) => void): () => void {
    const q = query(
      this.subscriptionsCollection,
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const subscriptions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate(),
          nextBillingDate: data.nextBillingDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Subscription;
      });
      
      callback(subscriptions);
    });
  }
}

export const paymentService = PaymentService.getInstance(); 