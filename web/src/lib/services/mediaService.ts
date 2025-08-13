import apiClient from '@/lib/apiClient';

export interface UiMediaItem {
  id: string;
  name: string;
  description?: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  thumbnail?: string;
  category?: string;
  metadata?: Record<string, any>;
  uploadedBy?: string;
  uploadedAt: Date;
}

class MediaService {
  async getMedia(): Promise<UiMediaItem[]> {
    try {
      const response = await apiClient.get('/media/files');
      return response.data.mediaFiles || [];
    } catch (error) {
      console.error('Error fetching media:', error);
      return [];
    }
  }
}

export default new MediaService();

