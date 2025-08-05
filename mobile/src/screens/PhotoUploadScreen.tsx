import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Card, Button, Badge } from '../components/ui';

const { width } = Dimensions.get('window');

interface PhotoItem {
  id: string;
  uri: string;
  name: string;
  size: number;
  type: 'gallery' | 'camera';
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
}

export default function PhotoUploadScreen() {
  const navigation = useNavigation();
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to upload photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await processAndAddPhoto(asset.uri, 'camera');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          await processAndAddPhoto(asset.uri, 'gallery');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photos. Please try again.');
    }
  };

  const processAndAddPhoto = async (uri: string, type: 'gallery' | 'camera') => {
    try {
      // Compress and resize image
      const processedImage = await manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      const photoItem: PhotoItem = {
        id: Date.now().toString(),
        uri: processedImage.uri,
        name: `photo_${Date.now()}.jpg`,
        size: processedImage.width * processedImage.height,
        type,
        uploadStatus: 'pending',
        progress: 0,
      };

      setPhotos(prev => [...prev, photoItem]);
    } catch (error) {
      Alert.alert('Error', 'Failed to process photo. Please try again.');
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const removePhoto = (photoId: string) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter(photo => photo.id !== photoId));
            setSelectedPhotos(prev => prev.filter(id => id !== photoId));
          },
        },
      ]
    );
  };

  const uploadPhotos = async () => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'Please add some photos to upload.');
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload progress for each photo
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.uploadStatus === 'pending') {
          // Update status to uploading
          setPhotos(prev =>
            prev.map(p =>
              p.id === photo.id ? { ...p, uploadStatus: 'uploading' } : p
            )
          );

          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setPhotos(prev =>
              prev.map(p =>
                p.id === photo.id ? { ...p, progress } : p
              )
            );
          }

          // Mark as completed
          setPhotos(prev =>
            prev.map(p =>
              p.id === photo.id ? { ...p, uploadStatus: 'completed', progress: 100 } : p
            )
          );
        }
      }

      Alert.alert(
        'Upload Complete',
        'All photos have been uploaded successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Upload Failed', 'Some photos failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getUploadStatusIcon = (status: PhotoItem['uploadStatus']) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'uploading':
        return 'cloud-upload-outline';
      case 'completed':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      default:
        return 'help-outline';
    }
  };

  const getUploadStatusColor = (status: PhotoItem['uploadStatus']) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'uploading':
        return '#2196F3';
      case 'completed':
        return '#4CAF50';
      case 'failed':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const formatFileSize = (size: number) => {
    const kb = size / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Photo Upload</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.description}>
        Upload photos from your camera or gallery. You can select multiple photos and edit them before uploading.
      </Text>

      {/* Upload Actions */}
      <Card style={styles.card}>
        <View style={styles.uploadActions}>
          <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="#007AFF" />
            <Text style={styles.uploadButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={pickFromGallery}>
            <Ionicons name="images-outline" size={24} color="#007AFF" />
            <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.photoHeader}>
            <Text style={styles.sectionTitle}>
              Photos ({photos.length})
            </Text>
            {selectedPhotos.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedPhotos([])}
                style={styles.clearSelection}
              >
                <Text style={styles.clearSelectionText}>
                  Clear Selection
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.photoGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <TouchableOpacity
                  style={styles.photoContainer}
                  onPress={() => togglePhotoSelection(photo.id)}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  
                  {/* Selection Overlay */}
                  {selectedPhotos.includes(photo.id) && (
                    <View style={styles.selectionOverlay}>
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    </View>
                  )}

                  {/* Upload Status */}
                  <View style={styles.uploadStatus}>
                    <Ionicons
                      name={getUploadStatusIcon(photo.uploadStatus)}
                      size={16}
                      color={getUploadStatusColor(photo.uploadStatus)}
                    />
                  </View>

                  {/* Progress Bar */}
                  {photo.uploadStatus === 'uploading' && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${photo.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{photo.progress}%</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.photoInfo}>
                  <Text style={styles.photoName} numberOfLines={1}>
                    {photo.name}
                  </Text>
                  <Text style={styles.photoSize}>
                    {formatFileSize(photo.size)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePhoto(photo.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Upload Summary */}
      {photos.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Upload Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Photos:</Text>
            <Text style={styles.summaryValue}>{photos.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Selected:</Text>
            <Text style={styles.summaryValue}>
              {selectedPhotos.length || 'All'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Size:</Text>
            <Text style={styles.summaryValue}>
              {formatFileSize(photos.reduce((sum, photo) => sum + photo.size, 0))}
            </Text>
          </View>
        </Card>
      )}

      {/* Upload Button */}
      {photos.length > 0 && (
        <Button
          title={isUploading ? 'Uploading...' : 'Upload Photos'}
          onPress={uploadPhotos}
          disabled={isUploading}
          style={styles.uploadButton}
        />
      )}

      {/* Tips */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Tips</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              Photos are automatically compressed to save space
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              You can select multiple photos for batch upload
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            <Text style={styles.tipText}>
              Photos are uploaded securely to our servers
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginTop: 8,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  clearSelection: {
    padding: 8,
  },
  clearSelectionText: {
    fontSize: 14,
    color: '#007AFF',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    width: (width - 64) / 2,
    position: 'relative',
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  photo: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderRadius: 12,
    padding: 4,
  },
  uploadStatus: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  photoInfo: {
    padding: 8,
  },
  photoName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  photoSize: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
}); 