export interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  type: MediaType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata: MediaMetadata;
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  isActive: boolean;
  tags: string[];
  category: MediaCategory;
  permissions: MediaPermissions;
  storage: StorageInfo;
}

export type MediaType = 
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'archive'
  | 'other';

export type MediaCategory = 
  | 'player_photo'
  | 'team_photo'
  | 'match_highlight'
  | 'tournament_media'
  | 'event_media'
  | 'club_logo'
  | 'document'
  | 'form'
  | 'waiver'
  | 'medical_record'
  | 'training_video'
  | 'coaching_material'
  | 'newsletter'
  | 'announcement'
  | 'custom';

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number; // seconds
  bitrate?: number;
  fps?: number;
  codec?: string;
  pages?: number; // for documents
  orientation?: 'portrait' | 'landscape' | 'square';
  exif?: Record<string, any>;
  customFields?: Record<string, any>;
}

export interface MediaPermissions {
  canView: string[]; // User IDs or role names
  canEdit: string[];
  canDelete: string[];
  canDownload: string[];
  isPublic: boolean;
  requiresAuth: boolean;
}

export interface StorageInfo {
  bucket: string;
  path: string;
  storageClass: string;
  etag: string;
  versionId?: string;
  isEncrypted: boolean;
}

export interface MediaUpload {
  id: string;
  fileId: string;
  status: UploadStatus;
  progress: number; // 0-100
  uploadedBytes: number;
  totalBytes: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
  metadata: UploadMetadata;
}

export type UploadStatus = 
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface UploadMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  category: MediaCategory;
  tags: string[];
  isPublic: boolean;
  permissions: MediaPermissions;
  customFields?: Record<string, any>;
}

export interface MediaAlbum {
  id: string;
  name: string;
  description?: string;
  coverImageId?: string;
  files: string[]; // MediaFile IDs
  category: MediaCategory;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  permissions: MediaPermissions;
  tags: string[];
  metadata: AlbumMetadata;
}

export interface AlbumMetadata {
  totalFiles: number;
  totalSize: number;
  fileTypes: MediaType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: string;
  eventId?: string;
  tournamentId?: string;
  teamId?: string;
  customFields?: Record<string, any>;
}

export interface MediaFolder {
  id: string;
  name: string;
  description?: string;
  parentFolderId?: string;
  path: string;
  files: string[]; // MediaFile IDs
  subfolders: string[]; // MediaFolder IDs
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  permissions: MediaPermissions;
  metadata: FolderMetadata;
}

export interface FolderMetadata {
  totalFiles: number;
  totalSize: number;
  fileTypes: MediaType[];
  lastModified: Date;
  customFields?: Record<string, any>;
}

export interface MediaShare {
  id: string;
  fileId: string;
  sharedBy: string;
  sharedWith: string[];
  permissions: SharePermissions;
  expiresAt?: Date;
  createdAt: Date;
  isActive: boolean;
  accessCount: number;
  lastAccessedAt?: Date;
}

export interface SharePermissions {
  canView: boolean;
  canDownload: boolean;
  canEdit: boolean;
  canShare: boolean;
  canDelete: boolean;
}

export interface MediaComment {
  id: string;
  fileId: string;
  commenterId: string;
  commenterName: string;
  commenterAvatar?: string;
  content: string;
  timestamp: number; // for video/audio comments
  position?: { x: number; y: number }; // for image comments
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  likes: string[]; // User IDs
  replies: MediaComment[];
  isResolved: boolean;
}

export interface MediaAnalytics {
  id: string;
  fileId: string;
  date: Date;
  views: number;
  downloads: number;
  shares: number;
  comments: number;
  likes: number;
  uniqueViewers: string[]; // User IDs
  viewerCountries: Record<string, number>;
  viewerDevices: Record<string, number>;
  averageViewDuration?: number; // seconds
  bounceRate?: number;
  engagementRate?: number;
}

export interface MediaSettings {
  id: string;
  clubId?: string;
  teamId?: string;
  maxFileSize: number; // bytes
  allowedFileTypes: string[];
  maxFilesPerUpload: number;
  autoGenerateThumbnails: boolean;
  thumbnailSizes: ThumbnailSize[];
  imageCompression: ImageCompressionSettings;
  videoCompression: VideoCompressionSettings;
  storageSettings: StorageSettings;
  watermarkSettings: WatermarkSettings;
  retentionPolicy: RetentionPolicy;
  backupSettings: BackupSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThumbnailSize {
  name: string;
  width: number;
  height: number;
  quality: number; // 0-100
  format: 'jpeg' | 'png' | 'webp';
}

export interface ImageCompressionSettings {
  enabled: boolean;
  quality: number; // 0-100
  maxWidth: number;
  maxHeight: number;
  format: 'jpeg' | 'png' | 'webp';
  progressive: boolean;
  stripMetadata: boolean;
}

export interface VideoCompressionSettings {
  enabled: boolean;
  codec: 'h264' | 'h265' | 'vp9';
  bitrate: number;
  maxWidth: number;
  maxHeight: number;
  fps: number;
  audioCodec: 'aac' | 'mp3';
  audioBitrate: number;
}

export interface StorageSettings {
  defaultBucket: string;
  backupBucket?: string;
  cdnEnabled: boolean;
  cdnDomain?: string;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  lifecycleRules: LifecycleRule[];
}

export interface LifecycleRule {
  id: string;
  name: string;
  conditions: LifecycleCondition[];
  actions: LifecycleAction[];
  isActive: boolean;
}

export interface LifecycleCondition {
  type: 'age' | 'size' | 'access' | 'custom';
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

export interface LifecycleAction {
  type: 'delete' | 'archive' | 'move' | 'change_class';
  target: string;
  parameters?: Record<string, any>;
}

export interface WatermarkSettings {
  enabled: boolean;
  imageUrl?: string;
  text?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number; // 0-100
  size: number; // percentage of original
  fontFamily?: string;
  fontSize?: number;
  color?: string;
}

export interface RetentionPolicy {
  enabled: boolean;
  defaultRetentionDays: number;
  categoryRetention: Record<MediaCategory, number>;
  archiveAfterDays: number;
  deleteAfterDays: number;
  exceptions: RetentionException[];
}

export interface RetentionException {
  id: string;
  fileId?: string;
  category?: MediaCategory;
  retentionDays: number;
  reason: string;
  createdBy: string;
  createdAt: Date;
}

export interface BackupSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number; // days
  includeMetadata: boolean;
  compression: boolean;
  encryption: boolean;
  lastBackupAt?: Date;
  nextBackupAt?: Date;
}

export interface MediaSearchFilters {
  query?: string;
  type?: MediaType;
  category?: MediaCategory;
  uploadedBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  isPublic?: boolean;
  sortBy?: 'name' | 'size' | 'uploadedAt' | 'updatedAt' | 'views';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MediaBatchOperation {
  id: string;
  type: 'move' | 'copy' | 'delete' | 'tag' | 'permission' | 'compress';
  fileIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  results: BatchOperationResult[];
}

export interface BatchOperationResult {
  fileId: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface MediaTemplate {
  id: string;
  name: string;
  description?: string;
  category: MediaCategory;
  settings: MediaSettings;
  permissions: MediaPermissions;
  tags: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  createdBy: string;
}

export interface MediaExport {
  id: string;
  requestedBy: string;
  type: 'files' | 'albums' | 'analytics';
  format: 'zip' | 'csv' | 'json';
  filters: MediaSearchFilters;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  recordCount: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export interface MediaWebhook {
  id: string;
  url: string;
  events: MediaEvent[];
  secret: string;
  isActive: boolean;
  lastTriggeredAt?: Date;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaEvent = 
  | 'file.uploaded'
  | 'file.updated'
  | 'file.deleted'
  | 'file.shared'
  | 'album.created'
  | 'album.updated'
  | 'album.deleted'
  | 'comment.added'
  | 'comment.updated'
  | 'comment.deleted'; 