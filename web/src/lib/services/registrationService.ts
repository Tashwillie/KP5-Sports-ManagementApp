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
  writeBatch,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  RegistrationForm, 
  RegistrationSubmission,
  FormField,
  ApiResponse 
} from '../../../../shared/src/types';

export class RegistrationService {
  private static instance: RegistrationService;
  private formsCollection = collection(db, 'registrationForms');
  private submissionsCollection = collection(db, 'registrationSubmissions');

  public static getInstance(): RegistrationService {
    if (!RegistrationService.instance) {
      RegistrationService.instance = new RegistrationService();
    }
    return RegistrationService.instance;
  }

  // Get all registration forms
  async getRegistrationForms(): Promise<RegistrationForm[]> {
    try {
      const q = query(
        this.formsCollection,
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          registrationDeadline: data.registrationDeadline?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as RegistrationForm;
      });
    } catch (error) {
      console.error('Error getting registration forms:', error);
      throw new Error('Failed to get registration forms');
    }
  }

  // Get registration form by ID
  async getRegistrationForm(formId: string): Promise<RegistrationForm> {
    try {
      const docRef = doc(this.formsCollection, formId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Registration form not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        registrationDeadline: data.registrationDeadline?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as RegistrationForm;
    } catch (error) {
      console.error('Error getting registration form:', error);
      throw new Error('Failed to get registration form');
    }
  }

  // Create registration form
  async createRegistrationForm(formData: Omit<RegistrationForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.formsCollection, {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating registration form:', error);
      throw new Error('Failed to create registration form');
    }
  }

  // Update registration form
  async updateRegistrationForm(formId: string, updates: Partial<RegistrationForm>): Promise<void> {
    try {
      const docRef = doc(this.formsCollection, formId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating registration form:', error);
      throw new Error('Failed to update registration form');
    }
  }

  // Delete registration form
  async deleteRegistrationForm(formId: string): Promise<void> {
    try {
      const docRef = doc(this.formsCollection, formId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting registration form:', error);
      throw new Error('Failed to delete registration form');
    }
  }

  // Submit registration form
  async submitRegistrationForm(
    formId: string, 
    submissionData: Omit<RegistrationSubmission, 'id' | 'formId' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(this.submissionsCollection, {
        formId,
        ...submissionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error('Error submitting registration form:', error);
      throw new Error('Failed to submit registration form');
    }
  }

  // Get form submissions
  async getFormSubmissions(formId: string): Promise<RegistrationSubmission[]> {
    try {
      const q = query(
        this.submissionsCollection,
        where('formId', '==', formId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as RegistrationSubmission;
      });
    } catch (error) {
      console.error('Error getting form submissions:', error);
      throw new Error('Failed to get form submissions');
    }
  }

  // Get submission by ID
  async getSubmission(submissionId: string): Promise<RegistrationSubmission> {
    try {
      const docRef = doc(this.submissionsCollection, submissionId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Submission not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as RegistrationSubmission;
    } catch (error) {
      console.error('Error getting submission:', error);
      throw new Error('Failed to get submission');
    }
  }

  // Update submission status
  async updateSubmissionStatus(submissionId: string, status: string): Promise<void> {
    try {
      const docRef = doc(this.submissionsCollection, submissionId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw new Error('Failed to update submission status');
    }
  }

  // Delete submission
  async deleteSubmission(submissionId: string): Promise<void> {
    try {
      const docRef = doc(this.submissionsCollection, submissionId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw new Error('Failed to delete submission');
    }
  }

  // Get submissions by user
  async getUserSubmissions(userId: string): Promise<RegistrationSubmission[]> {
    try {
      const q = query(
        this.submissionsCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as RegistrationSubmission;
      });
    } catch (error) {
      console.error('Error getting user submissions:', error);
      throw new Error('Failed to get user submissions');
    }
  }

  // Validate form submission
  validateFormSubmission(form: RegistrationForm, submissionData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!form.fields) {
      return { isValid: false, errors: ['Form has no fields'] };
    }

    for (const field of form.fields) {
      const value = submissionData[field.id];

      // Check required fields
      if (field.required && (!value || value.trim() === '')) {
        errors.push(`${field.label} is required`);
        continue;
      }

      // Skip validation for empty optional fields
      if (!value || value.trim() === '') {
        continue;
      }

      // Validate field types
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${field.label} must be a valid email address`);
          }
          break;

        case 'phone':
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            errors.push(`${field.label} must be a valid phone number`);
          }
          break;

        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${field.label} must be a valid number`);
          }
          break;

        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push(`${field.label} must be a valid date`);
          }
          break;
      }

      // Validate field constraints
      if (field.validation) {
        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
        }

        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors.push(`${field.label} must be no more than ${field.validation.maxLength} characters`);
        }

        if (field.validation.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors.push(`${field.label} format is invalid`);
          }
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  // Subscribe to form updates
  subscribeToForm(formId: string, callback: (form: RegistrationForm) => void): () => void {
    const docRef = doc(this.formsCollection, formId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const form: RegistrationForm = {
          id: doc.id,
          ...data,
          registrationDeadline: data.registrationDeadline?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as RegistrationForm;
        
        callback(form);
      }
    });
  }

  // Subscribe to form submissions
  subscribeToFormSubmissions(formId: string, callback: (submissions: RegistrationSubmission[]) => void): () => void {
    const q = query(
      this.submissionsCollection,
      where('formId', '==', formId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const submissions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as RegistrationSubmission;
      });
      
      callback(submissions);
    });
  }
}

export const registrationService = RegistrationService.getInstance(); 