import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { mediaService } from '../services/mediaService';
import {
  MediaFile,
  MediaType,
  MediaCategory,
  MediaAlbum,
  MediaFolder,
  MediaSearchFilters,
} from '@shared/types/media';

export default function MediaLibraryScreen() {
  const navigation = useNavigation();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [albums, setAlbums] = useState<MediaAlbum[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters: MediaSearchFilters = {
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        type: selectedType === 'all' ? undefined : selectedType,
        query: searchQuery || undefined,
        sortBy: 'uploadedAt',
        sortOrder: 'desc',
      };

      const [files, userAlbums, userFolders] = await Promise.all([
        mediaService.getUserMediaFiles(undefined, filters),
        mediaService.getUserAlbums(),
        mediaService.getUserFolders(),
      ]);

      setMediaFiles(files);
      setAlbums(userAlbums);
      setFolders(userFolders);
    } catch (error) {
      console.error('Error loading media:', error);
      Alert.alert('Error', 'Failed to load media files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleUpload = async (type: 'image' | 'video' | 'document') => {
    try {
      let fileUri: string | null = null;

      switch (type) {
        case 'image':
          fileUri = await mediaService.pickImage();
          break;
        case 'video':
          fileUri = await mediaService.pickVideo();
          break;
        case 'document':
          // For documents, you might want to use a document picker
          Alert.alert('Coming Soon', 'Document upload will be available soon.');
          return;
      }

      if (fileUri) {
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          Alert.alert('Error', 'File not found.');
          return;
        }

        // Determine mime type
        const mimeType = this.getMimeType(fileUri);
        const fileName = fileUri.split('/').pop() || 'unknown';
        const category = selectedCategory === 'all' ? 'custom' : selectedCategory;

        // Upload file
        await mediaService.uploadFile(fileUri, {
          name: fileName,
          originalName: fileName,
          mimeType,
          size: fileInfo.size || 0,
          category,
          tags: [],
          isPublic: false,
        });

        Alert.alert('Success', 'File uploaded successfully!');
        loadData();
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      Alert.alert('Error', 'Please enter an album name.');
      return;
    }

    try {
      await mediaService.createAlbum({
        name: newAlbumName,
        description: newAlbumDescription,
        files: [],
        category: selectedCategory === 'all' ? 'custom' : selectedCategory,
        isPublic: false,
        permissions: {
          canView: [],
          canEdit: [],
          canDelete: [],
          canDownload: [],
          isPublic: false,
          requiresAuth: true,
        },
        tags: [],
        metadata: {
          totalFiles: 0,
          totalSize: 0,
          fileTypes: [],
        },
      });

      setNewAlbumName('');
      setNewAlbumDescription('');
      setShowCreateAlbumModal(false);
      loadData();
      Alert.alert('Success', 'Album created successfully!');
    } catch (error) {
      console.error('Error creating album:', error);
      Alert.alert('Error', 'Failed to create album. Please try again.');
    }
  };

  const handleFilePress = (file: MediaFile) => {
    navigation.navigate('MediaViewer' as any, { fileId: file.id });
  };

  const handleAlbumPress = (album: MediaAlbum) => {
    navigation.navigate('AlbumView' as any, { albumId: album.id });
  };

  const handleFolderPress = (folder: MediaFolder) => {
    navigation.navigate('FolderView' as any, { folderId: folder.id });
  };

  const getMimeType = (uri: string): string => {
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'mp4':
        return 'video/mp4';
      case 'mov':
        return 'video/quicktime';
      case 'avi':
        return 'video/x-msvideo';
      default:
        return 'application/octet-stream';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getFileIcon = (type: MediaType): string => {
    switch (type) {
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'audio':
        return 'musical-notes';
      case 'document':
        return 'document-text';
      case 'archive':
        return 'folder';
      default:
        return 'document';
    }
  };

  const renderFileItem = ({ item }: { item: MediaFile }) => (
    <TouchableOpacity
      style={[styles.fileItem, viewMode === 'grid' && styles.fileItemGrid]}
      onPress={() => handleFilePress(item)}
    >
      {item.type === 'image' && item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.fileThumbnail} />
      ) : (
        <View style={styles.fileIconContainer}>
          <Ionicons name={getFileIcon(item.type) as any} size={32} color="#007AFF" />
        </View>
      )}
      
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.fileSize}>{formatFileSize(item.size)}</Text>
        <Text style={styles.fileDate}>{formatDate(item.uploadedAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: MediaAlbum }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => handleAlbumPress(item)}
    >
      <View style={styles.albumCover}>
        {item.coverImageId ? (
          <Image source={{ uri: item.coverImageId }} style={styles.albumImage} />
        ) : (
          <Ionicons name="images" size={32} color="#007AFF" />
        )}
        <Text style={styles.albumFileCount}>{item.files.length} files</Text>
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.albumDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.albumDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFolderItem = ({ item }: { item: MediaFolder }) => (
    <TouchableOpacity
      style={styles.folderItem}
      onPress={() => handleFolderPress(item)}
    >
      <View style={styles.folderIcon}>
        <Ionicons name="folder" size={32} color="#FF9500" />
      </View>
      <View style={styles.folderInfo}>
        <Text style={styles.folderName}>{item.name}</Text>
        <Text style={styles.folderFileCount}>{item.files.length} files</Text>
        <Text style={styles.folderDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'player_photo', 'team_photo', 'match_highlight', 'tournament_media', 'document'] as const).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterButton,
              selectedCategory === category && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory === category && styles.filterButtonTextActive,
              ]}
            >
              {category === 'all' ? 'All' : category.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTypeFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'image', 'video', 'document', 'audio'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              selectedType === type && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedType === type && styles.filterButtonTextActive,
              ]}
            >
              {type === 'all' ? 'All' : type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="images-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyStateTitle}>No Media Files</Text>
      <Text style={styles.emptyStateText}>
        {selectedCategory === 'all' && selectedType === 'all'
          ? "You don't have any media files yet."
          : `No ${selectedType === 'all' ? selectedCategory : selectedType} files found.`}
      </Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => setShowUploadModal(true)}
      >
        <Text style={styles.uploadButtonText}>Upload Your First File</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading media library...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Media Library</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setShowUploadModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search files..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={loadData}
        />
      </View>

      {renderCategoryFilter()}
      {renderTypeFilter()}

      <FlatList
        data={mediaFiles}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Media</Text>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.uploadOptions}>
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => {
                  setShowUploadModal(false);
                  handleUpload('image');
                }}
              >
                <Ionicons name="image" size={48} color="#007AFF" />
                <Text style={styles.uploadOptionText}>Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => {
                  setShowUploadModal(false);
                  handleUpload('video');
                }}
              >
                <Ionicons name="videocam" size={48} color="#007AFF" />
                <Text style={styles.uploadOptionText}>Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.uploadOption}
                onPress={() => {
                  setShowUploadModal(false);
                  handleUpload('document');
                }}
              >
                <Ionicons name="document" size={48} color="#007AFF" />
                <Text style={styles.uploadOptionText}>Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Album Modal */}
      <Modal
        visible={showCreateAlbumModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateAlbumModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Album</Text>
              <TouchableOpacity onPress={() => setShowCreateAlbumModal(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Album name"
              value={newAlbumName}
              onChangeText={setNewAlbumName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newAlbumDescription}
              onChangeText={setNewAlbumDescription}
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateAlbum}
            >
              <Text style={styles.createButtonText}>Create Album</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewModeButton: {
    padding: 8,
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  fileItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileItemGrid: {
    flex: 1,
    marginHorizontal: 6,
    flexDirection: 'column',
    alignItems: 'center',
  },
  fileThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  fileIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  fileDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  albumItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  albumImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  albumFileCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  albumInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  albumDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  albumDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  folderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  folderIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  folderFileCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  folderDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  uploadOption: {
    alignItems: 'center',
    padding: 16,
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 