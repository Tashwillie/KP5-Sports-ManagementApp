import apiClient from '../apiClient';

// Base API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Generic API service class
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Generic GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const queryString = params ? new URLSearchParams(params).toString() : '';
      const url = `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(`${this.baseUrl}${endpoint}`, data);
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}${endpoint}`, data);
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}${endpoint}`, data);
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}${endpoint}`);
      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`${this.baseUrl}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Handle API errors
  private handleError(error: any): ApiResponse {
    console.error('API Error:', error);

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return {
            success: false,
            error: 'Bad Request',
            message: data?.message || 'Invalid request data'
          };
        case 401:
          return {
            success: false,
            error: 'Unauthorized',
            message: 'Please log in to continue'
          };
        case 403:
          return {
            success: false,
            error: 'Forbidden',
            message: 'You do not have permission to perform this action'
          };
        case 404:
          return {
            success: false,
            error: 'Not Found',
            message: 'The requested resource was not found'
          };
        case 422:
          return {
            success: false,
            error: 'Validation Error',
            message: data?.message || 'Please check your input data'
          };
        case 500:
          return {
            success: false,
            error: 'Server Error',
            message: 'An internal server error occurred'
          };
        default:
          return {
            success: false,
            error: 'Request Failed',
            message: data?.message || 'An unexpected error occurred'
          };
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.'
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: 'Request Error',
        message: error.message || 'An error occurred while processing your request'
      };
    }
  }
}

// Create default API service instance
export const apiService = new ApiService();
