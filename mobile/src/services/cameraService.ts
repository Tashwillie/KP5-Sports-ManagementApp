import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

interface CameraOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  mediaTypes?: ImagePicker.MediaTypeOptions;
  allowsMultipleSelection?: boolean;
  maxFiles?: number;
}

interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  type: string;
  size: number;
  fileName: string;
}

interface VideoResult {
  uri: string;
  duration: number;
  type: string;
  size: number;
  fileName: string;
}

export class CameraService {
  private static instance: CameraService;

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  constructor() {
    this.requestPermissions();
  }

  private async requestPermissions() {
    try {
      // Request camera permissions
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to take photos and videos.',
          [{ text: 'OK' }]
        );
      }

      // Request media library permissions
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      if (!mediaPermission.granted) {
        Alert.alert(
          'Media Library Permission Required',
          'This app needs access to your media library to save photos and videos.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  // Take a photo using camera
  async takePhoto(options: CameraOptions = {}): Promise<PhotoResult | null> {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
        ...options,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: 'image/jpeg',
          size: fileInfo.size || 0,
          fileName: this.generateFileName('photo'),
        };
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  // Record a video using camera
  async recordVideo(options: CameraOptions = {}): Promise<VideoResult | null> {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [16, 9],
        quality: options.quality ?? 0.8,
        videoMaxDuration: 60, // 60 seconds max
        ...options,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        
        return {
          uri: asset.uri,
          duration: asset.duration || 0,
          type: 'video/mp4',
          size: fileInfo.size || 0,
          fileName: this.generateFileName('video'),
        };
      }

      return null;
    } catch (error) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
      return null;
    }
  }

  // Pick photo from gallery
  async pickPhoto(options: CameraOptions = {}): Promise<PhotoResult | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: options.allowsMultipleSelection ?? false,
        ...options,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: 'image/jpeg',
          size: fileInfo.size || 0,
          fileName: this.generateFileName('photo'),
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking photo:', error);
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
      return null;
    }
  }

  // Pick multiple photos from gallery
  async pickMultiplePhotos(options: CameraOptions = {}): Promise<PhotoResult[]> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? false,
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: true,
        maxFiles: options.maxFiles ?? 10,
        ...options,
      });

      if (!result.canceled && result.assets) {
        const photos: PhotoResult[] = [];
        
        for (const asset of result.assets) {
          const fileInfo = await FileSystem.getInfoAsync(asset.uri);
          photos.push({
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
            type: 'image/jpeg',
            size: fileInfo.size || 0,
            fileName: this.generateFileName('photo'),
          });
        }
        
        return photos;
      }

      return [];
    } catch (error) {
      console.error('Error picking multiple photos:', error);
      Alert.alert('Error', 'Failed to pick photos. Please try again.');
      return [];
    }
  }

  // Pick video from gallery
  async pickVideo(options: CameraOptions = {}): Promise<VideoResult | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [16, 9],
        quality: options.quality ?? 0.8,
        videoMaxDuration: 300, // 5 minutes max
        ...options,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);
        
        return {
          uri: asset.uri,
          duration: asset.duration || 0,
          type: 'video/mp4',
          size: fileInfo.size || 0,
          fileName: this.generateFileName('video'),
        };
      }

      return null;
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video. Please try again.');
      return null;
    }
  }

  // Upload photo to Firebase Storage
  async uploadPhoto(
    photo: PhotoResult,
    path: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `${path}/${photo.fileName}`);
      const uploadResult = await uploadBytes(storageRef, blob, {
        contentType: photo.type,
        customMetadata: metadata,
      });
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  }

  // Upload video to Firebase Storage
  async uploadVideo(
    video: VideoResult,
    path: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      const response = await fetch(video.uri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `${path}/${video.fileName}`);
      const uploadResult = await uploadBytes(storageRef, blob, {
        contentType: video.type,
        customMetadata: metadata,
      });
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Failed to upload video');
    }
  }

  // Save photo to device gallery
  async saveToGallery(uri: string): Promise<boolean> {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('KP5 Academy', asset, false);
      return true;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      return false;
    }
  }

  // Compress image
  async compressImage(uri: string, quality: number = 0.8): Promise<string> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }

      return uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  }

  // Get file info
  async getFileInfo(uri: string): Promise<{
    size: number;
    exists: boolean;
    isDirectory: boolean;
  }> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return {
        size: fileInfo.size || 0,
        exists: fileInfo.exists,
        isDirectory: fileInfo.isDirectory || false,
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return {
        size: 0,
        exists: false,
        isDirectory: false,
      };
    }
  }

  // Delete local file
  async deleteFile(uri: string): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(uri);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Generate unique filename
  private generateFileName(type: 'photo' | 'video'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = type === 'photo' ? 'jpg' : 'mp4';
    return `${type}_${timestamp}_${random}.${extension}`;
  }

  // Check if camera is available
  async isCameraAvailable(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }

  // Check if media library is available
  async isMediaLibraryAvailable(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking media library availability:', error);
      return false;
    }
  }
}

export const cameraService = CameraService.getInstance(); 