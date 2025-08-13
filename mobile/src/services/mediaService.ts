import {
  MediaFile,
  MediaType,
  MediaCategory,
  MediaUpload,
  UploadStatus,
  MediaAlbum,
  MediaFolder,
  MediaShare,
  MediaComment,
  MediaAnalytics,
  MediaSettings,
  MediaSearchFilters,
  MediaBatchOperation,
} from '@shared/types/media';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export class MediaService {
  // File Upload Management
  async uploadFile(
    file: File | Blob | string,
    metadata: {
      name: string;
      originalName: string;
      mimeType: string;
      size: number;
      category: MediaCategory;
      tags?: string[];
      isPublic?: boolean;
      permissions?: any;
      customFields?: Record<string, any>;
    }
  ): Promise<MediaUpload> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Create upload record
    const uploadData: Omit<MediaUpload, 'id' | 'startedAt'> = {
      fileId: '',
      status: 'pending',
      progress: 0,
      uploadedBytes: 0,
      totalBytes: metadata.size,
      retryCount: 0,
      maxRetries: 3,
      metadata: {
        originalName: metadata.originalName,
        mimeType: metadata.mimeType,
        size: metadata.size,
        category: metadata.category,
        tags: metadata.tags || [],
        isPublic: metadata.isPublic || false,
        permissions: metadata.permissions || {
          canView: [user.uid],
          canEdit: [user.uid],
          canDelete: [user.uid],
          canDownload: [user.uid],
          isPublic: metadata.isPublic || false,
          requiresAuth: true,
        },
        customFields: metadata.customFields || {},
      },
    };

    const uploadRef = await addDoc(null, {
      ...uploadData,
      startedAt: serverTimestamp(),
    });

    // Start upload process
    this.processUpload(uploadRef.id, file, metadata);

    return {
      id: uploadRef.id,
      ...uploadData,
      startedAt: new Date(),
    };
  }

  private async processUpload(
    uploadId: string,
    file: File | Blob | string,
    metadata: any
  ): Promise<void> {
    try {
      // Update status to uploading
      await updateDoc(doc(db, 'mediaUploads', uploadId), {
        status: 'uploading',
        updatedAt: serverTimestamp(),
      });

      // Generate file path
      const fileName = `${Date.now()}_${metadata.originalName}`;
      const filePath = `uploads/${metadata.category}/${fileName}`;
      const storageRef = ref(storage, filePath);

      // Upload to Firebase Storage
      let uploadResult;
      if (typeof file === 'string') {
        // Handle file path (for mobile)
        const response = await fetch(file);
        const blob = await response.blob();
        uploadResult = await uploadBytes(storageRef, blob);
      } else {
        uploadResult = await uploadBytes(storageRef, file);
      }

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update upload status to processing
      await updateDoc(doc(db, 'mediaUploads', uploadId), {
        status: 'processing',
        progress: 50,
        updatedAt: serverTimestamp(),
      });

      // Create media file record
      const mediaFileData: Omit<MediaFile, 'id' | 'uploadedAt' | 'updatedAt'> = {
        name: metadata.name,
        originalName: metadata.originalName,
        type: this.getMediaType(metadata.mimeType),
        mimeType: metadata.mimeType,
        size: metadata.size,
        url: downloadURL,
        metadata: await this.extractMetadata(file, metadata.mimeType),
        uploadedBy: (await this.getCurrentUser())?.uid || '',
        isPublic: metadata.isPublic || false,
        isActive: true,
        tags: metadata.tags || [],
        category: metadata.category,
        permissions: metadata.permissions || {
          canView: [(await this.getCurrentUser())?.uid || ''],
          canEdit: [(await this.getCurrentUser())?.uid || ''],
          canDelete: [(await this.getCurrentUser())?.uid || ''],
          canDownload: [(await this.getCurrentUser())?.uid || ''],
          isPublic: metadata.isPublic || false,
          requiresAuth: true,
        },
        storage: {
          bucket: storageRef.bucket,
          path: filePath,
          storageClass: 'STANDARD',
          etag: uploadResult.metadata.etag,
          isEncrypted: false,
        },
      };

      const mediaFileRef = await addDoc(null, {
        ...mediaFileData,
        uploadedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update upload record
      await updateDoc(doc(db, 'mediaUploads', uploadId), {
        fileId: mediaFileRef.id,
        status: 'completed',
        progress: 100,
        uploadedBytes: metadata.size,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

    } catch (error) {
      console.error('Upload error:', error);
      await updateDoc(doc(db, 'mediaUploads', uploadId), {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Upload failed',
        updatedAt: serverTimestamp(),
      });
    }
  }

  // Media File Management
  async getMediaFile(fileId: string): Promise<MediaFile | null> {
    const doc = await getDoc(doc(db, 'mediaFiles', fileId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as MediaFile;
  }

  async getUserMediaFiles(
    userId?: string,
    filters?: MediaSearchFilters
  ): Promise<MediaFile[]> {
    const currentUser = userId || (await this.getCurrentUser())?.uid;
    if (!currentUser) throw new Error('User not authenticated');

    let q = query(
      null,
      where('uploadedBy', '==', currentUser),
      orderBy('uploadedAt', 'desc')
    );

    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.isPublic !== undefined) {
      q = query(q, where('isPublic', '==', filters.isPublic));
    }

    const snapshot = await getDocs(q);
    let files = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as MediaFile[];

    // Apply additional filters
    if (filters?.query) {
      const query = filters.query.toLowerCase();
      files = files.filter(file => 
        file.name.toLowerCase().includes(query) ||
        file.originalName.toLowerCase().includes(query) ||
        file.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (filters?.tags && filters.tags.length > 0) {
      files = files.filter(file => 
        filters.tags!.some(tag => file.tags.includes(tag))
      );
    }

    if (filters?.dateRange) {
      files = files.filter(file => 
        file.uploadedAt >= filters.dateRange!.start &&
        file.uploadedAt <= filters.dateRange!.end
      );
    }

    if (filters?.sizeRange) {
      files = files.filter(file => 
        file.size >= filters.sizeRange!.min &&
        file.size <= filters.sizeRange!.max
      );
    }

    // Apply sorting
    if (filters?.sortBy) {
      files.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'size':
            aValue = a.size;
            bValue = b.size;
            break;
          case 'uploadedAt':
            aValue = a.uploadedAt;
            bValue = b.uploadedAt;
            break;
          case 'updatedAt':
            aValue = a.updatedAt;
            bValue = b.updatedAt;
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    // Apply pagination
    if (filters?.limit) {
      files = files.slice(filters.offset || 0, (filters.offset || 0) + filters.limit);
    }

    return files;
  }

  async updateMediaFile(
    fileId: string,
    updates: Partial<MediaFile>
  ): Promise<void> {
    await updateDoc(doc(db, 'mediaFiles', fileId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteMediaFile(fileId: string): Promise<void> {
    const file = await this.getMediaFile(fileId);
    if (!file) throw new Error('File not found');

    // Delete from Firebase Storage
    const storageRef = ref(storage, file.storage.path);
    await deleteObject(storageRef);

    // Delete from Firestore
    await deleteDoc(doc(db, 'mediaFiles', fileId));
  }

  // Album Management
  async createAlbum(
    albumData: Omit<MediaAlbum, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const albumRef = await addDoc(null, {
      ...albumData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return albumRef.id;
  }

  async getAlbum(albumId: string): Promise<MediaAlbum | null> {
    const doc = await getDoc(doc(db, 'mediaAlbums', albumId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as MediaAlbum;
  }

  async getUserAlbums(userId?: string): Promise<MediaAlbum[]> {
    const currentUser = userId || (await this.getCurrentUser())?.uid;
    if (!currentUser) throw new Error('User not authenticated');

    const q = query(
      null,
      where('createdBy', '==', currentUser),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as MediaAlbum[];
  }

  async addFileToAlbum(albumId: string, fileId: string): Promise<void> {
    await updateDoc(doc(db, 'mediaAlbums', albumId), {
      files: arrayUnion(fileId),
      updatedAt: serverTimestamp(),
    });
  }

  async removeFileFromAlbum(albumId: string, fileId: string): Promise<void> {
    await updateDoc(doc(db, 'mediaAlbums', albumId), {
      files: arrayRemove(fileId),
      updatedAt: serverTimestamp(),
    });
  }

  // Folder Management
  async createFolder(
    folderData: Omit<MediaFolder, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const folderRef = await addDoc(null, {
      ...folderData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return folderRef.id;
  }

  async getFolder(folderId: string): Promise<MediaFolder | null> {
    const doc = await getDoc(doc(db, 'mediaFolders', folderId));
    if (!doc.exists()) return null;

    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as MediaFolder;
  }

  async getUserFolders(userId?: string): Promise<MediaFolder[]> {
    const currentUser = userId || (await this.getCurrentUser())?.uid;
    if (!currentUser) throw new Error('User not authenticated');

    const q = query(
      null,
      where('createdBy', '==', currentUser),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as MediaFolder[];
  }

  // Sharing Management
  async shareFile(
    fileId: string,
    sharedWith: string[],
    permissions: any
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const shareData: Omit<MediaShare, 'id' | 'createdAt'> = {
      fileId,
      sharedBy: user.uid,
      sharedWith,
      permissions,
      isActive: true,
      accessCount: 0,
    };

    const shareRef = await addDoc(null, {
      ...shareData,
      createdAt: serverTimestamp(),
    });

    return shareRef.id;
  }

  async getSharedFiles(userId?: string): Promise<MediaShare[]> {
    const currentUser = userId || (await this.getCurrentUser())?.uid;
    if (!currentUser) throw new Error('User not authenticated');

    const q = query(
      null,
      where('sharedWith', 'array-contains', currentUser),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as MediaShare[];
  }

  // Comments Management
  async addComment(
    fileId: string,
    content: string,
    timestamp?: number,
    position?: { x: number; y: number }
  ): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const commentData: Omit<MediaComment, 'id' | 'createdAt' | 'updatedAt'> = {
      fileId,
      commenterId: user.uid,
      commenterName: user.displayName || user.email || 'Unknown User',
      commenterAvatar: user.photoURL,
      content,
      timestamp: timestamp || 0,
      position,
      isEdited: false,
      likes: [],
      replies: [],
      isResolved: false,
    };

    const commentRef = await addDoc(null, {
      ...commentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return commentRef.id;
  }

  async getFileComments(fileId: string): Promise<MediaComment[]> {
    const q = query(
      null,
      where('fileId', '==', fileId),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as MediaComment[];
  }

  // Analytics
  async trackFileView(fileId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analyticsRef = doc(db, 'mediaAnalytics', `${fileId}_${today.toISOString().split('T')[0]}`);
    const analyticsDoc = await getDoc(analyticsRef);

    if (analyticsDoc.exists()) {
      await updateDoc(analyticsRef, {
        views: increment(1),
        uniqueViewers: arrayUnion(user.uid),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(analyticsRef, {
        fileId,
        date: today,
        views: 1,
        downloads: 0,
        shares: 0,
        comments: 0,
        likes: 0,
        uniqueViewers: [user.uid],
        viewerCountries: {},
        viewerDevices: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  // Mobile-specific methods
  async pickImage(options?: ImagePicker.ImagePickerOptions): Promise<string | null> {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      throw new Error('Permission to access camera roll is required!');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      ...options,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  }

  async pickVideo(options?: ImagePicker.ImagePickerOptions): Promise<string | null> {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      throw new Error('Permission to access camera roll is required!');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      ...options,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  }

  async takePhoto(options?: ImagePicker.ImagePickerOptions): Promise<string | null> {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      throw new Error('Permission to access camera is required!');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      ...options,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  }

  // Utility methods
  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';
    return 'other';
  }

  private async extractMetadata(file: File | Blob | string, mimeType: string): Promise<any> {
    const metadata: any = {};

    if (mimeType.startsWith('image/')) {
      // Extract image metadata
      metadata.width = 0;
      metadata.height = 0;
      metadata.orientation = 'portrait';
    } else if (mimeType.startsWith('video/')) {
      // Extract video metadata
      metadata.duration = 0;
      metadata.bitrate = 0;
      metadata.fps = 0;
      metadata.codec = '';
    }

    return metadata;
  }

  private async getCurrentUser() {
    // This would be implemented based on your auth provider
    // For now, returning null - implement based on your auth setup
    return null;
  }

  // Real-time listeners
  subscribeToUserFiles(
    userId: string,
    callback: (files: MediaFile[]) => void
  ): () => void {
    const q = query(
      null,
      where('uploadedBy', '==', userId),
      orderBy('uploadedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const files = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as MediaFile[];
      callback(files);
    });
  }

  subscribeToUploads(
    userId: string,
    callback: (uploads: MediaUpload[]) => void
  ): () => void {
    const q = query(
      null,
      where('metadata.uploadedBy', '==', userId),
      orderBy('startedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const uploads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startedAt: doc.data().startedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as MediaUpload[];
      callback(uploads);
    });
  }
}

export const mediaService = new MediaService(); 