import { 
  RegistrationForm, 
  RegistrationSubmission,
  FormField,
  ApiResponse 
} from '../../../../shared/src/types';
import apiClient from '../apiClient';

export class RegistrationService {
  private static instance: RegistrationService;

  public static getInstance(): RegistrationService {
    if (!RegistrationService.instance) {
      RegistrationService.instance = new RegistrationService();
    }
    return RegistrationService.instance;
  }

  // Get all registration forms
  async getRegistrationForms(): Promise<RegistrationForm[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/forms`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registration forms');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting registration forms:', error);
      throw new Error('Failed to get registration forms');
    }
  }

  // Get registration form by ID
  async getRegistrationForm(formId: string): Promise<RegistrationForm> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/forms/${formId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Registration form not found');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting registration form:', error);
      throw new Error('Failed to get registration form');
    }
  }

  // Create registration form
  async createRegistrationForm(formData: Omit<RegistrationForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create registration form');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error creating registration form:', error);
      throw new Error('Failed to create registration form');
    }
  }

  // Update registration form
  async updateRegistrationForm(formId: string, updates: Partial<RegistrationForm>): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update registration form');
      }
    } catch (error) {
      console.error('Error updating registration form:', error);
      throw new Error('Failed to update registration form');
    }
  }

  // Delete registration form
  async deleteRegistrationForm(formId: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete registration form');
      }
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
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration form');
      }

      const result = await response.json();
      return result.data.id;
    } catch (error) {
      console.error('Error submitting registration form:', error);
      throw new Error('Failed to submit registration form');
    }
  }

  // Get form submissions
  async getFormSubmissions(formId: string): Promise<RegistrationSubmission[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/forms/${formId}/submissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch form submissions');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting form submissions:', error);
      throw new Error('Failed to get form submissions');
    }
  }

  // Get submission by ID
  async getSubmission(submissionId: string): Promise<RegistrationSubmission> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/submissions/${submissionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Submission not found');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting submission:', error);
      throw new Error('Failed to get submission');
    }
  }

  // Update submission status
  async updateSubmissionStatus(submissionId: string, status: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/submissions/${submissionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update submission status');
      }
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw new Error('Failed to update submission status');
    }
  }

  // Delete submission
  async deleteSubmission(submissionId: string): Promise<void> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw new Error('Failed to delete submission');
    }
  }

  // Get user submissions
  async getUserSubmissions(userId: string): Promise<RegistrationSubmission[]> {
    try {
      // Note: This would need to be implemented in the backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/registration/users/${userId}/submissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiClient.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user submissions');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting user submissions:', error);
      throw new Error('Failed to get user submissions');
    }
  }

  // Validate form submission
  validateFormSubmission(form: RegistrationForm, submissionData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    form.fields.forEach(field => {
      if (field.required) {
        const value = submissionData[field.name];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(`${field.label} is required`);
        }
      }
    });

    // Validate field types
    form.fields.forEach(field => {
      const value = submissionData[field.name];
      if (value) {
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
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              errors.push(`${field.label} must be a valid date`);
            }
            break;
        }
      }
    });

    // Validate field constraints
    form.fields.forEach(field => {
      const value = submissionData[field.name];
      if (value && field.validation) {
        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
        }
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors.push(`${field.label} must be no more than ${field.validation.maxLength} characters`);
        }
        if (field.validation.min && Number(value) < field.validation.min) {
          errors.push(`${field.label} must be at least ${field.validation.min}`);
        }
        if (field.validation.max && Number(value) > field.validation.max) {
          errors.push(`${field.label} must be no more than ${field.validation.max}`);
        }
        if (field.validation.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            errors.push(`${field.label} format is invalid`);
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Real-time subscriptions (simplified for API-based approach)
  subscribeToForm(formId: string, callback: (form: RegistrationForm) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const form = await this.getRegistrationForm(formId);
        callback(form);
      } catch (error) {
        console.error('Error in form subscription:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }

  subscribeToFormSubmissions(formId: string, callback: (submissions: RegistrationSubmission[]) => void): () => void {
    // For API-based approach, we'll use polling instead of real-time subscriptions
    const interval = setInterval(async () => {
      try {
        const submissions = await this.getFormSubmissions(formId);
        callback(submissions);
      } catch (error) {
        console.error('Error in form submissions subscription:', error);
        callback([]);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }
}

export const registrationService = RegistrationService.getInstance(); 