import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  writeBatch,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  LiveMatch, 
  LiveMatchEvent, 
  LiveMatchEventType, 
  LiveMatchStatus,
  ApiResponse 
} from '../../../shared/src/types';

interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId?: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingItems: number;
  isSyncing: boolean;
  error: string | null;
}

export class OfflineSyncService {
  private static instance: OfflineSyncService;
  private isOnline = true;
  private syncStatus: SyncStatus = {
    isOnline: true,
    lastSync: null,
    pendingItems: 0,
    isSyncing: false,
    error: null,
  };
  private offlineQueue: OfflineQueueItem[] = [];
  private syncCallbacks: ((status: SyncStatus) => void)[] = [];

  public static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  constructor() {
    this.initializeOfflineSupport();
    this.setupNetworkListener();
    this.loadOfflineQueue();
  }

  private async initializeOfflineSupport() {
    try {
      // Enable offline persistence
      await enableIndexedDbPersistence(db, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      });
      console.log('Firebase offline persistence enabled');
    } catch (error) {
      console.warn('Failed to enable offline persistence:', error);
    }
  }

  private setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      if (wasOnline && !this.isOnline) {
        console.log('Device went offline');
        this.updateSyncStatus({ isOnline: false });
      } else if (!wasOnline && this.isOnline) {
        console.log('Device came online');
        this.updateSyncStatus({ isOnline: true });
        this.syncOfflineQueue();
      }
    });
  }

  private async loadOfflineQueue() {
    try {
      const queueData = await AsyncStorage.getItem('offlineQueue');
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
        this.updateSyncStatus({ pendingItems: this.offlineQueue.length });
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  private async saveOfflineQueue() {
    try {
      await AsyncStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
      this.updateSyncStatus({ pendingItems: this.offlineQueue.length });
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  private updateSyncStatus(updates: Partial<SyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...updates };
    this.syncCallbacks.forEach(callback => callback(this.syncStatus));
  }

  // Add item to offline queue
  async addToOfflineQueue(
    type: OfflineQueueItem['type'],
    collection: string,
    data?: any,
    documentId?: string
  ): Promise<string> {
    const queueItem: OfflineQueueItem = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      collection,
      documentId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
    };

    this.offlineQueue.push(queueItem);
    await this.saveOfflineQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncOfflineQueue();
    }

    return queueItem.id;
  }

  // Sync offline queue
  async syncOfflineQueue(): Promise<void> {
    if (this.syncStatus.isSyncing || !this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    this.updateSyncStatus({ isSyncing: true, error: null });

    try {
      const itemsToProcess = [...this.offlineQueue];
      const batch = writeBatch(db);
      const processedItems: string[] = [];

      for (const item of itemsToProcess) {
        try {
          if (item.retryCount >= item.maxRetries) {
            console.warn(`Max retries exceeded for item ${item.id}`);
            processedItems.push(item.id);
            continue;
          }

          switch (item.type) {
            case 'create':
              if (item.data) {
                const docRef = doc(collection(db, item.collection));
                batch.set(docRef, {
                  ...item.data,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
              }
              break;

            case 'update':
              if (item.documentId && item.data) {
                const docRef = doc(db, item.collection, item.documentId);
                batch.update(docRef, {
                  ...item.data,
                  updatedAt: serverTimestamp(),
                });
              }
              break;

            case 'delete':
              if (item.documentId) {
                const docRef = doc(db, item.collection, item.documentId);
                batch.delete(docRef);
              }
              break;
          }

          processedItems.push(item.id);
        } catch (error) {
          console.error(`Error processing offline item ${item.id}:`, error);
          item.retryCount++;
        }
      }

      // Commit batch if there are operations
      if (processedItems.length > 0) {
        await batch.commit();
      }

      // Remove processed items from queue
      this.offlineQueue = this.offlineQueue.filter(
        item => !processedItems.includes(item.id)
      );
      await this.saveOfflineQueue();

      this.updateSyncStatus({
        lastSync: new Date(),
        isSyncing: false,
      });

      console.log(`Synced ${processedItems.length} offline items`);
    } catch (error) {
      console.error('Error syncing offline queue:', error);
      this.updateSyncStatus({
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      });
    }
  }

  // Force sync
  async forceSync(): Promise<void> {
    await this.syncOfflineQueue();
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Subscribe to sync status changes
  subscribeToSyncStatus(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  // Clear offline queue
  async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await AsyncStorage.removeItem('offlineQueue');
    this.updateSyncStatus({ pendingItems: 0 });
  }

  // Get pending items count
  getPendingItemsCount(): number {
    return this.offlineQueue.length;
  }

  // Check if online
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  // Enable/disable network
  async setNetworkEnabled(enabled: boolean): Promise<void> {
    if (enabled) {
      await enableNetwork(db);
    } else {
      await disableNetwork(db);
    }
  }
}

export const offlineSyncService = OfflineSyncService.getInstance(); 