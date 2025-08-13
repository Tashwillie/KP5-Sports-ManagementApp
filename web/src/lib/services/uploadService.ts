export interface UploadResponse {
  success: boolean;
  url?: string;
  message?: string;
}

export interface UploadOptions {
  file: File;
  type: 'team-logo' | 'club-logo' | 'tournament-banner' | 'player-photo' | 'document';
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

class UploadService {
  private readonly defaultMaxSize = 5 * 1024 * 1024; // 5MB
  private readonly defaultAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

  async uploadFile(options: UploadOptions): Promise<UploadResponse> {
    const { file, type, maxSize = this.defaultMaxSize, allowedTypes = this.defaultAllowedTypes } = options;

    try {
      // Validate file size
      if (file.size > maxSize) {
        return {
          success: false,
          message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
        };
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Upload to backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      return {
        success: true,
        url: result.url
      };

    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Upload failed'
      };
    }
  }

  async uploadImage(file: File, type: string): Promise<UploadResponse> {
    return this.uploadFile({
      file,
      type: type as any,
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    });
  }

  async uploadDocument(file: File, type: string): Promise<UploadResponse> {
    return this.uploadFile({
      file,
      type: type as any,
      allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      maxSize: 10 * 1024 * 1024 // 10MB for documents
    });
  }

  // Helper method to validate file before upload
  validateFile(file: File, maxSize?: number, allowedTypes?: string[]): { valid: boolean; message?: string } {
    const size = maxSize || this.defaultMaxSize;
    const types = allowedTypes || this.defaultAllowedTypes;

    if (file.size > size) {
      return {
        valid: false,
        message: `File size must be less than ${Math.round(size / 1024 / 1024)}MB`
      };
    }

    if (!types.includes(file.type)) {
      return {
        valid: false,
        message: `File type not allowed. Allowed types: ${types.join(', ')}`
      };
    }

    return { valid: true };
  }
}

export const uploadService = new UploadService();
export default uploadService;
