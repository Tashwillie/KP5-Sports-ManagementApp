import enhancedApiClient from '@/lib/enhancedApiClient';

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
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const url = `${this.baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await enhancedApiClient.get(url);
    return response as ApiResponse<T>;
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await enhancedApiClient.post(`${this.baseUrl}${endpoint}`, data);
    return response as ApiResponse<T>;
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await enhancedApiClient.put(`${this.baseUrl}${endpoint}`, data);
    return response as ApiResponse<T>;
  }

  // Generic PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await enhancedApiClient.patch(`${this.baseUrl}${endpoint}`, data);
    return response as ApiResponse<T>;
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await enhancedApiClient.delete(`${this.baseUrl}${endpoint}`);
    return response as ApiResponse<T>;
  }

  // Upload file
  async upload<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    // Note: onProgress callback is not currently supported by enhancedApiClient
    const response = await enhancedApiClient.post(`${this.baseUrl}${endpoint}`, formData);
    return response as ApiResponse<T>;
  }


}

// Create default API service instance
export const apiService = new ApiService();
