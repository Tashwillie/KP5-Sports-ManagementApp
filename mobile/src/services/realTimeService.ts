import { RealTimeService, RealTimeConfig } from '@kp5-academy/shared';
import { Platform } from 'react-native';

class MobileRealTimeService extends RealTimeService {
  constructor(config: RealTimeConfig) {
    super(config);
  }

  // Mobile-specific connection handling
  async connect(): Promise<void> {
    try {
      // Add mobile-specific connection logic here
      await super.connect();
      
      // Set up mobile-specific event listeners
      this.setupMobileEventListeners();
    } catch (error) {
      console.error('Mobile real-time connection failed:', error);
      throw error;
    }
  }

  private setupMobileEventListeners() {
    // Add mobile-specific event handling
    if (this.socket) {
      this.socket.on('app-state-change', (data) => {
        // Handle app state changes (foreground/background)
        console.log('App state changed:', data);
      });

      this.socket.on('push-notification', (data) => {
        // Handle push notifications
        console.log('Push notification received:', data);
      });
    }
  }

  // Mobile-specific methods
  async sendLocationUpdate(latitude: number, longitude: number) {
    if (this.isConnected()) {
      this.emit('location-update', { latitude, longitude, platform: Platform.OS });
    }
  }

  async sendDeviceInfo() {
    if (this.isConnected()) {
      this.emit('device-info', {
        platform: Platform.OS,
        version: Platform.Version,
        timestamp: new Date()
      });
    }
  }
}

export default MobileRealTimeService;
