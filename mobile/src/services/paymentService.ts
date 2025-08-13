import {
  Payment,
  PaymentType,
  PaymentStatus,
  PaymentMethod as PaymentMethodType,
  Invoice,
  InvoiceStatus,
  InvoiceType,
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
  PaymentIntent,
  SavedPaymentMethod,
  PaymentReminder,
  Refund,
  PaymentSettings,
  StripeCustomer,
  PaymentSession,
} from '@shared/types/payment';

export class PaymentService {
  // Payment Management
  async createPayment(
    paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const paymentRef = await addDoc(null, {
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return paymentRef.id;
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    const doc = await getDoc(doc(db, 'payments', paymentId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      paidAt: doc.data().paidAt?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
      refundedAt: doc.data().refundedAt?.toDate(),
    } as Payment;
  }

  async getUserPayments(
    userId?: string,
    status?: PaymentStatus,
    type?: PaymentType
  ): Promise<Payment[]> {
    const currentUser = userId || (await this.getCurrentUser())?.uid;
    if (!currentUser) throw new Error('User not authenticated');

    let q = query(
      null,
      where('userId', '==', currentUser),
      orderBy('createdAt', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    if (type) {
      q = query(q, where('type', '==', type));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      paidAt: doc.data().paidAt?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      expiresAt: doc.data().expiresAt?.toDate(),
      refundedAt: doc.data().refundedAt?.toDate(),
    })) as Payment[];
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    metadata?: Record<string, any>
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'succeeded') {
      updateData.paidAt = serverTimestamp();
    }

    if (metadata) {
      updateData.metadata = { ...updateData.metadata, ...metadata };
    }

    await updateDoc(doc(db, 'payments', paymentId), updateData);
  }

  // Stripe Payment Intent Management
  async createPaymentIntent(
    paymentId: string,
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    // This would typically call a Cloud Function to create a Stripe Payment Intent
    // For now, we'll create a mock payment intent
    const paymentIntentData: Omit<PaymentIntent, 'id' | 'createdAt' | 'updatedAt'> = {
      paymentId,
      stripePaymentIntentId: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: 'requires_payment_method',
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      paymentMethodTypes: ['card'],
      confirmationMethod: 'automatic',
      captureMethod: 'automatic',
      metadata: metadata || {},
    };

    const paymentIntentRef = await addDoc(
      null,
      {
        ...paymentIntentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );

    return {
      id: paymentIntentRef.id,
      ...paymentIntentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<void> {
    // This would call a Cloud Function to confirm the payment with Stripe
    await updateDoc(doc(db, 'paymentIntents', paymentIntentId), {
      status: 'succeeded',
      updatedAt: serverTimestamp(),
    });
  }

  // Invoice Management
  async createInvoice(
    invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const invoiceRef = await addDoc(null, {
      ...invoiceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return invoiceRef.id;
  }

  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const doc = await getDoc(doc(db, 'invoices', invoiceId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      sentAt: doc.data().sentAt?.toDate(),
      viewedAt: doc.data().viewedAt?.toDate(),
    } as Invoice;
  }

  async getUserInvoices(
    userId?: string,
    status?: InvoiceStatus
  ): Promise<Invoice[]> {
    const currentUser = userId || (await this.getCurrentUser())?.uid;
    if (!currentUser) throw new Error('User not authenticated');

    let q = query(
      null,
      where('userId', '==', currentUser),
      orderBy('createdAt', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      paidDate: doc.data().paidDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      sentAt: doc.data().sentAt?.toDate(),
      viewedAt: doc.data().viewedAt?.toDate(),
    })) as Invoice[];
  }

  async sendInvoice(invoiceId: string): Promise<void> {
    await updateDoc(doc(db, 'invoices', invoiceId), {
      status: 'sent',
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // Subscription Management
  async createSubscription(
    subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const subscriptionRef = await addDoc(null, {
      ...subscriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return subscriptionRef.id;
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    const doc = await getDoc(doc(db, 'subscriptions', subscriptionId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      currentPeriodStart: doc.data().currentPeriodStart?.toDate(),
      currentPeriodEnd: doc.data().currentPeriodEnd?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      endedAt: doc.data().endedAt?.toDate(),
      trialStart: doc.data().trialStart?.toDate(),
      trialEnd: doc.data().trialEnd?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Subscription;
  }

  async getUserSubscriptions(
    userId?: string,
    status?: SubscriptionStatus
  ): Promise<Subscription[]> {
    const currentUser = userId || (await this.getCurrentUser())?.uid;
    if (!currentUser) throw new Error('User not authenticated');

    let q = query(
      null,
      where('userId', '==', currentUser),
      orderBy('createdAt', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      currentPeriodStart: doc.data().currentPeriodStart?.toDate(),
      currentPeriodEnd: doc.data().currentPeriodEnd?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      endedAt: doc.data().endedAt?.toDate(),
      trialStart: doc.data().trialStart?.toDate(),
      trialEnd: doc.data().trialEnd?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Subscription[];
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<void> {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      cancelAtPeriodEnd,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // Subscription Plans
  async getSubscriptionPlans(
    clubId?: string,
    isActive: boolean = true
  ): Promise<SubscriptionPlan[]> {
    let q = query(
      null,
      where('isActive', '==', isActive),
      orderBy('price', 'asc')
    );

    if (clubId) {
      q = query(q, where('clubId', '==', clubId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as SubscriptionPlan[];
  }

  // Payment Methods
  async savePaymentMethod(
    paymentMethodData: Omit<SavedPaymentMethod, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const paymentMethodRef = await addDoc(null, {
      ...paymentMethodData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return paymentMethodRef.id;
  }

  async getUserPaymentMethods(
    userId?: string,
    isActive: boolean = true
  ): Promise<SavedPaymentMethod[]> {
    const currentUser = userId || (await this.getCurrentUser())?.uid;
    if (!currentUser) throw new Error('User not authenticated');

    const q = query(
      null,
      where('userId', '==', currentUser),
      where('isActive', '==', isActive),
      orderBy('isDefault', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as SavedPaymentMethod[];
  }

  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Remove default from all other payment methods
    const userPaymentMethods = await this.getUserPaymentMethods();
    const batch = writeBatch(db);

    userPaymentMethods.forEach(pm => {
      if (pm.id !== paymentMethodId && pm.isDefault) {
        batch.update(doc(db, 'paymentMethods', pm.id), {
          isDefault: false,
          updatedAt: serverTimestamp(),
        });
      }
    });

    // Set the new default
    batch.update(doc(db, 'paymentMethods', paymentMethodId), {
      isDefault: true,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    await updateDoc(doc(db, 'paymentMethods', paymentMethodId), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  }

  // Refunds
  async createRefund(
    paymentId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const refundData: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'> = {
      paymentId,
      stripeRefundId: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: 'usd',
      reason: reason as any,
      status: 'succeeded',
      metadata: metadata || {},
    };

    const refundRef = await addDoc(null, {
      ...refundData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update payment with refund information
    await updateDoc(doc(db, 'payments', paymentId), {
      refundedAmount: increment(amount),
      refundedAt: serverTimestamp(),
      status: amount === (await this.getPayment(paymentId))?.total ? 'refunded' : 'partially_refunded',
      updatedAt: serverTimestamp(),
    });

    return refundRef.id;
  }

  // Payment Reminders
  async schedulePaymentReminder(
    paymentId: string,
    reminderData: Omit<PaymentReminder, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const reminderRef = await addDoc(null, {
      ...reminderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return reminderRef.id;
  }

  async getPaymentReminders(
    paymentId?: string,
    status?: string
  ): Promise<PaymentReminder[]> {
    let q = query(
      null,
      orderBy('scheduledDate', 'asc')
    );

    if (paymentId) {
      q = query(q, where('paymentId', '==', paymentId));
    }

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      scheduledDate: doc.data().scheduledDate?.toDate(),
      sentDate: doc.data().sentDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as PaymentReminder[];
  }

  // Payment Settings
  async getPaymentSettings(clubId?: string): Promise<PaymentSettings | null> {
    const settingsId = clubId || 'default';
    const doc = await getDoc(doc(db, 'paymentSettings', settingsId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as PaymentSettings;
  }

  async updatePaymentSettings(
    settingsId: string,
    updates: Partial<PaymentSettings>
  ): Promise<void> {
    await updateDoc(doc(db, 'paymentSettings', settingsId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  // Stripe Customer Management
  async createStripeCustomer(
    customerData: Omit<StripeCustomer, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const customerRef = await addDoc(null, {
      ...customerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return customerRef.id;
  }

  async getStripeCustomer(userId: string): Promise<StripeCustomer | null> {
    const q = query(
      null,
      where('userId', '==', userId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as StripeCustomer;
  }

  // Payment Sessions
  async createPaymentSession(
    paymentId: string,
    sessionData: Omit<PaymentSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const sessionRef = await addDoc(null, {
      ...sessionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return sessionRef.id;
  }

  // Real-time Listeners
  subscribeToUserPayments(
    userId: string,
    callback: (payments: Payment[]) => void
  ): () => void {
    const q = query(
      null,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        paidAt: doc.data().paidAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        refundedAt: doc.data().refundedAt?.toDate(),
      })) as Payment[];
      callback(payments);
    });
  }

  subscribeToUserInvoices(
    userId: string,
    callback: (invoices: Invoice[]) => void
  ): () => void {
    const q = query(
      null,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        paidDate: doc.data().paidDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        sentAt: doc.data().sentAt?.toDate(),
        viewedAt: doc.data().viewedAt?.toDate(),
      })) as Invoice[];
      callback(invoices);
    });
  }

  // Utility Methods
  private async getCurrentUser() {
    // This would be implemented based on your auth provider
    // For now, returning null - implement based on your auth setup
    return null;
  }

  // Payment Processing
  async processPayment(
    paymentId: string,
    paymentMethodId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create payment intent
      const paymentIntent = await this.createPaymentIntent(
        paymentId,
        amount,
        currency
      );

      // Confirm payment
      await this.confirmPaymentIntent(paymentIntent.id, paymentMethodId);

      // Update payment status
      await this.updatePaymentStatus(paymentId, 'succeeded', {
        stripePaymentIntentId: paymentIntent.stripePaymentIntentId,
      });

      return { success: true };
    } catch (error) {
      console.error('Payment processing error:', error);
      await this.updatePaymentStatus(paymentId, 'failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Calculate fees and totals
  calculatePaymentTotals(
    subtotal: number,
    taxRate: number = 0,
    processingFee: number = 0,
    discountAmount: number = 0
  ): {
    subtotal: number;
    taxAmount: number;
    processingFee: number;
    discountAmount: number;
    total: number;
  } {
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount + processingFee - discountAmount;

    return {
      subtotal,
      taxAmount,
      processingFee,
      discountAmount,
      total: Math.max(0, total),
    };
  }
}

export const paymentService = new PaymentService(); 