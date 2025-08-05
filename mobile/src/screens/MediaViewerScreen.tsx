import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { mediaService } from '../services/mediaService';
import {
  MediaFile,
  MediaType,
  MediaComment,
  MediaShare,
} from '@shared/types/media';

interface MediaViewerParams {
  fileId: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MediaViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as MediaViewerParams;

  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [comments, setComments] = useState<MediaComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [videoRef, setVideoRef] = useState<Video | null>(null);
  const [videoStatus, setVideoStatus] = useState<any>(null);

  useEffect(() => {
    loadMediaFile();
    loadComments();
    trackView();
  }, [params.fileId]);

  const loadMediaFile = async () => {
    try {
      setLoading(true);
      const file = await mediaService.getMediaFile(params.fileId);
      if (file) {
        setMediaFile(file);
      } else {
        Alert.alert('Error', 'Media file not found.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading media file:', error);
      Alert.alert('Error', 'Failed to load media file.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const fileComments = await mediaService.getFileComments(params.fileId);
      setComments(fileComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const trackView = async () => {
    try {
      await mediaService.trackFileView(params.fileId);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const handleShare = async () => {
    if (!mediaFile) return;

    try {
      await Share.share({
        message: `Check out this ${mediaFile.type}: ${mediaFile.name}`,
        url: mediaFile.url,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await mediaService.addComment(params.fileId, newComment.trim());
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment.');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    // This would be implemented to like/unlike comments
    Alert.alert('Coming Soon', 'Like functionality will be available soon.');
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderImage = () => (
    <Image
      source={{ uri: mediaFile!.url }}
      style={styles.mediaContent}
      resizeMode="contain"
    />
  );

  const renderVideo = () => (
    <Video
      ref={setVideoRef}
      source={{ uri: mediaFile!.url }}
      style={styles.mediaContent}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
      isLooping
      onPlaybackStatusUpdate={setVideoStatus}
    />
  );

  const renderDocument = () => (
    <View style={styles.documentContainer}>
      <Ionicons name="document" size={64} color="#007AFF" />
      <Text style={styles.documentName}>{mediaFile!.name}</Text>
      <Text style={styles.documentInfo}>
        {formatFileSize(mediaFile!.size)} • {mediaFile!.mimeType}
      </Text>
      <TouchableOpacity style={styles.downloadButton}>
        <Ionicons name="download" size={20} color="#FFFFFF" />
        <Text style={styles.downloadButtonText}>Download</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMediaContent = () => {
    if (!mediaFile) return null;

    switch (mediaFile.type) {
      case 'image':
        return renderImage();
      case 'video':
        return renderVideo();
      case 'document':
        return renderDocument();
      default:
        return (
          <View style={styles.unsupportedContainer}>
            <Ionicons name="document" size={64} color="#8E8E93" />
            <Text style={styles.unsupportedText}>
              Preview not available for this file type
            </Text>
          </View>
        );
    }
  };

  const renderComments = () => (
    <View style={styles.commentsContainer}>
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
      </View>
      
      <ScrollView style={styles.commentsList}>
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <Text style={styles.commenterName}>{comment.commenterName}</Text>
              <Text style={styles.commentDate}>
                {formatDate(comment.createdAt)}
              </Text>
            </View>
            <Text style={styles.commentContent}>{comment.content}</Text>
            <View style={styles.commentActions}>
              <TouchableOpacity
                style={styles.commentAction}
                onPress={() => handleLikeComment(comment.id)}
              >
                <Ionicons
                  name={comment.likes.length > 0 ? 'heart' : 'heart-outline'}
                  size={16}
                  color={comment.likes.length > 0 ? '#FF3B30' : '#8E8E93'}
                />
                <Text style={styles.commentActionText}>
                  {comment.likes.length}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.addCommentContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!newComment.trim()}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading media...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!mediaFile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Media file not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {mediaFile.name}
          </Text>
          <Text style={styles.fileInfo}>
            {formatFileSize(mediaFile.size)} • {formatDate(mediaFile.uploadedAt)}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowComments(!showComments)}
          >
            <Ionicons
              name={showComments ? 'chatbubble' : 'chatbubble-outline'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {renderMediaContent()}
      </View>

      {showComments && renderComments()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fileInfo: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContent: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  documentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  documentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  documentInfo: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  unsupportedText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
  },
  commentsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: screenHeight * 0.4,
  },
  commentsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  commentsList: {
    maxHeight: screenHeight * 0.25,
  },
  commentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commenterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  commentDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commentContent: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  commentActionText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
  },
}); 