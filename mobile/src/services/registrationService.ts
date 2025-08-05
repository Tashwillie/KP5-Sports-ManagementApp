import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@shared/utils/firebase';
import {
  RegistrationForm,
  RegistrationFormType,
  RegistrationFormStatus,
  FormField,
  FieldType,
  Waiver,
  WaiverType,
  Registration,
  RegistrationStatus,
  RegistrationField,
  WaiverSignature,
  Payment,
  PaymentMethod,
  PaymentStatus,
  PricingStructure,
  PricingType,
  Discount,
  PaymentPlan,
  AgeRestrictions,
  AgeGroup,
  RegistrationAnalytics,
  FormTemplate,
  FormTemplateCategory,
  RegistrationExport,
  ExportFilter,
  RegistrationWorkflow,
  WorkflowStep,
} from '@shared/types/registration';

export class RegistrationService {
  // Registration Form Management
  async createRegistrationForm(
    formData: Omit<RegistrationForm, 'id' | 'createdAt' | 'updatedAt' | 'currentRegistrations'>
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const formRef = await addDoc(collection(db, 'registrationForms'), {
      ...formData,
      currentRegistrations: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return formRef.id;
  }

  async getRegistrationForm(formId: string): Promise<RegistrationForm | null> {
    const doc = await getDoc(doc(db, 'registrationForms', formId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      registrationDeadline: doc.data().registrationDeadline?.toDate(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
    } as RegistrationForm;
  }

  async getRegistrationForms(
    clubId?: string,
    type?: RegistrationFormType,
    status?: RegistrationFormStatus
  ): Promise<RegistrationForm[]> {
    let q = query(
      collection(db, 'registrationForms'),
      orderBy('createdAt', 'desc')
    );

    if (clubId) {
      q = query(q, where('clubId', '==', clubId));
    }

    if (type) {
      q = query(q, where('type', '==', type));
    }

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      registrationDeadline: doc.data().registrationDeadline?.toDate(),
      startDate: doc.data().startDate?.toDate(),
      endDate: doc.data().endDate?.toDate(),
    })) as RegistrationForm[];
  }

  async updateRegistrationForm(
    formId: string,
    updates: Partial<RegistrationForm>
  ): Promise<void> {
    await updateDoc(doc(db, 'registrationForms', formId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteRegistrationForm(formId: string): Promise<void> {
    await deleteDoc(doc(db, 'registrationForms', formId));
  }

  // Form Field Management
  async addFormField(
    formId: string,
    field: Omit<FormField, 'id'>
  ): Promise<string> {
    const fieldRef = await addDoc(
      collection(db, 'registrationForms', formId, 'fields'),
      {
        ...field,
        id: fieldRef?.id || Date.now().toString(),
      }
    );

    return fieldRef.id;
  }

  async updateFormField(
    formId: string,
    fieldId: string,
    updates: Partial<FormField>
  ): Promise<void> {
    await updateDoc(
      doc(db, 'registrationForms', formId, 'fields', fieldId),
      updates
    );
  }

  async deleteFormField(formId: string, fieldId: string): Promise<void> {
    await deleteDoc(
      doc(db, 'registrationForms', formId, 'fields', fieldId)
    );
  }

  async reorderFormFields(
    formId: string,
    fieldOrders: { fieldId: string; order: number }[]
  ): Promise<void> {
    const batch = writeBatch(db);
    
    fieldOrders.forEach(({ fieldId, order }) => {
      const fieldRef = doc(db, 'registrationForms', formId, 'fields', fieldId);
      batch.update(fieldRef, { order });
    });

    await batch.commit();
  }

  // Waiver Management
  async createWaiver(
    waiverData: Omit<Waiver, 'id' | 'createdAt'>
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const waiverRef = await addDoc(collection(db, 'waivers'), {
      ...waiverData,
      createdAt: serverTimestamp(),
    });

    return waiverRef.id;
  }

  async getWaivers(
    type?: WaiverType,
    isActive: boolean = true
  ): Promise<Waiver[]> {
    let q = query(
      collection(db, 'waivers'),
      where('isActive', '==', isActive),
      orderBy('createdAt', 'desc')
    );

    if (type) {
      q = query(q, where('type', '==', type));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      effectiveDate: doc.data().effectiveDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Waiver[];
  }

  async updateWaiver(
    waiverId: string,
    updates: Partial<Waiver>
  ): Promise<void> {
    await updateDoc(doc(db, 'waivers', waiverId), updates);
  }

  // Registration Submission
  async submitRegistration(
    formId: string,
    registrationData: {
      registrantName: string;
      registrantEmail: string;
      registrantPhone?: string;
      fields: RegistrationField[];
      waivers: WaiverSignature[];
      registrationCode?: string;
    }
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const form = await this.getRegistrationForm(formId);
    if (!form) throw new Error('Registration form not found');

    // Check if registration is still open
    if (form.registrationDeadline && new Date() > form.registrationDeadline) {
      throw new Error('Registration deadline has passed');
    }

    // Check capacity
    if (form.maxRegistrations && form.currentRegistrations >= form.maxRegistrations) {
      if (!form.settings.enableWaitlist) {
        throw new Error('Registration is full');
      }
    }

    // Validate age restrictions
    if (form.ageRestrictions) {
      const ageValidation = await this.validateAgeRestrictions(
        registrationData.fields,
        form.ageRestrictions
      );
      if (!ageValidation.isValid) {
        throw new Error(ageValidation.error);
      }
    }

    // Calculate pricing
    const pricing = await this.calculatePricing(form, registrationData);

    const registrationRef = await addDoc(collection(db, 'registrations'), {
      formId,
      registrantId: user.uid,
      ...registrationData,
      status: form.settings.autoApprove ? 'approved' : 'submitted',
      submittedAt: serverTimestamp(),
      totalAmount: pricing.totalAmount,
      amountPaid: 0,
      amountDue: pricing.totalAmount,
      isWaitlisted: form.maxRegistrations && form.currentRegistrations >= form.maxRegistrations,
      waitlistPosition: form.maxRegistrations && form.currentRegistrations >= form.maxRegistrations 
        ? form.currentRegistrations - form.maxRegistrations + 1 
        : undefined,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update form registration count
    await updateDoc(doc(db, 'registrationForms', formId), {
      currentRegistrations: increment(1),
    });

    // Send notifications
    await this.sendRegistrationNotifications(registrationRef.id, form);

    return registrationRef.id;
  }

  async getRegistrations(
    formId?: string,
    status?: RegistrationStatus,
    userId?: string
  ): Promise<Registration[]> {
    let q = query(
      collection(db, 'registrations'),
      orderBy('createdAt', 'desc')
    );

    if (formId) {
      q = query(q, where('formId', '==', formId));
    }

    if (status) {
      q = query(q, where('status', '==', status));
    }

    if (userId) {
      q = query(q, where('registrantId', '==', userId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate(),
      approvedAt: doc.data().approvedAt?.toDate(),
      rejectedAt: doc.data().rejectedAt?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Registration[];
  }

  async updateRegistrationStatus(
    registrationId: string,
    status: RegistrationStatus,
    notes?: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === 'approved') {
      updateData.approvedAt = serverTimestamp();
    } else if (status === 'rejected') {
      updateData.rejectedAt = serverTimestamp();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = serverTimestamp();
    }

    if (notes) {
      updateData.notes = notes;
    }

    await updateDoc(doc(db, 'registrations', registrationId), updateData);
  }

  // Payment Management
  async processPayment(
    registrationId: string,
    paymentData: {
      amount: number;
      method: PaymentMethod;
      transactionId?: string;
      description?: string;
    }
  ): Promise<string> {
    const paymentRef = await addDoc(
      collection(db, 'registrations', registrationId, 'payments'),
      {
        ...paymentData,
        currency: 'USD',
        status: 'completed',
        paymentDate: serverTimestamp(),
      }
    );

    // Update registration payment totals
    const registration = await getDoc(doc(db, 'registrations', registrationId));
    if (registration.exists()) {
      const regData = registration.data();
      const newAmountPaid = (regData.amountPaid || 0) + paymentData.amount;
      
      await updateDoc(doc(db, 'registrations', registrationId), {
        amountPaid: newAmountPaid,
        amountDue: regData.totalAmount - newAmountPaid,
        updatedAt: serverTimestamp(),
      });
    }

    return paymentRef.id;
  }

  async getPayments(registrationId: string): Promise<Payment[]> {
    const snapshot = await getDocs(
      collection(db, 'registrations', registrationId, 'payments')
    );

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paymentDate: doc.data().paymentDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      refundedAt: doc.data().refundedAt?.toDate(),
    })) as Payment[];
  }

  // Pricing and Discounts
  async calculatePricing(
    form: RegistrationForm,
    registrationData: any
  ): Promise<{ totalAmount: number; discountAmount: number; discountCode?: string }> {
    let totalAmount = form.pricing.basePrice;
    let discountAmount = 0;
    let discountCode: string | undefined;

    // Apply discounts
    if (registrationData.registrationCode) {
      const discount = form.settings.registrationCodes.find(
        code => code.code === registrationData.registrationCode && code.isActive
      );

      if (discount) {
        const discountObj = form.pricing.discounts.find(d => d.id === discount.discountId);
        if (discountObj && discountObj.isActive) {
          if (discountObj.type === 'percentage') {
            discountAmount = totalAmount * (discountObj.value / 100);
          } else {
            discountAmount = discountObj.value;
          }
          discountCode = registrationData.registrationCode;
        }
      }
    }

    // Apply late fees
    if (form.pricing.lateFees.length > 0) {
      const now = new Date();
      const lateFee = form.pricing.lateFees.find(fee => 
        fee.isActive && now > fee.appliesAfter
      );

      if (lateFee) {
        if (lateFee.type === 'percentage') {
          totalAmount += totalAmount * (lateFee.value / 100);
        } else {
          totalAmount += lateFee.value;
        }
      }
    }

    return {
      totalAmount: Math.max(0, totalAmount - discountAmount),
      discountAmount,
      discountCode,
    };
  }

  // Age Validation
  async validateAgeRestrictions(
    fields: RegistrationField[],
    ageRestrictions: AgeRestrictions
  ): Promise<{ isValid: boolean; error?: string }> {
    const birthDateField = fields.find(f => f.fieldName === 'birthDate');
    if (!birthDateField || !birthDateField.value) {
      return { isValid: false, error: 'Birth date is required' };
    }

    const birthDate = new Date(birthDateField.value);
    const ageAsOfDate = ageRestrictions.ageAsOfDate || new Date();
    const age = ageAsOfDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = ageAsOfDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && ageAsOfDate.getDate() < birthDate.getDate())) {
      age--;
    }

    if (ageRestrictions.minAge && age < ageRestrictions.minAge) {
      return { 
        isValid: false, 
        error: `Minimum age requirement is ${ageRestrictions.minAge} years` 
      };
    }

    if (ageRestrictions.maxAge && age > ageRestrictions.maxAge) {
      return { 
        isValid: false, 
        error: `Maximum age requirement is ${ageRestrictions.maxAge} years` 
      };
    }

    return { isValid: true };
  }

  // Analytics
  async getRegistrationAnalytics(
    formId: string,
    startDate: Date,
    endDate: Date
  ): Promise<RegistrationAnalytics[]> {
    const q = query(
      collection(db, 'registrationAnalytics'),
      where('formId', '==', formId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
    })) as RegistrationAnalytics[];
  }

  // Form Templates
  async getFormTemplates(
    category?: FormTemplateCategory,
    type?: RegistrationFormType
  ): Promise<FormTemplate[]> {
    let q = query(
      collection(db, 'formTemplates'),
      where('isPublic', '==', true),
      orderBy('usageCount', 'desc')
    );

    if (category) {
      q = query(q, where('category', '==', category));
    }

    if (type) {
      q = query(q, where('type', '==', type));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as FormTemplate[];
  }

  async createFormFromTemplate(
    templateId: string,
    clubId: string,
    customizations: Partial<RegistrationForm>
  ): Promise<string> {
    const template = await getDoc(doc(db, 'formTemplates', templateId));
    if (!template.exists()) {
      throw new Error('Template not found');
    }

    const templateData = template.data();
    const formData: Omit<RegistrationForm, 'id' | 'createdAt' | 'updatedAt' | 'currentRegistrations'> = {
      ...templateData,
      ...customizations,
      clubId,
      status: 'draft',
      isActive: false,
      currentRegistrations: 0,
    };

    return await this.createRegistrationForm(formData);
  }

  // Export and Reporting
  async exportRegistrations(
    formId: string,
    format: 'csv' | 'excel' | 'pdf',
    filters: ExportFilter[]
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const exportRef = await addDoc(collection(db, 'registrationExports'), {
      formId,
      requestedBy: user.uid,
      format,
      filters,
      status: 'pending',
      recordCount: 0,
      createdAt: serverTimestamp(),
    });

    // This would trigger a Cloud Function to process the export
    // For now, return the export ID
    return exportRef.id;
  }

  // Real-time Listeners
  subscribeToRegistrations(
    formId: string,
    callback: (registrations: Registration[]) => void
  ): () => void {
    const q = query(
      collection(db, 'registrations'),
      where('formId', '==', formId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const registrations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate(),
        approvedAt: doc.data().approvedAt?.toDate(),
        rejectedAt: doc.data().rejectedAt?.toDate(),
        cancelledAt: doc.data().cancelledAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Registration[];
      callback(registrations);
    });
  }

  // Utility Methods
  private async getCurrentUser() {
    // This would be implemented based on your auth provider
    // For now, returning null - implement based on your auth setup
    return null;
  }

  private async sendRegistrationNotifications(
    registrationId: string,
    form: RegistrationForm
  ): Promise<void> {
    // Implementation for sending registration notifications
    // This would integrate with your notification system
  }
}

export const registrationService = new RegistrationService(); 