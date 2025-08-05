import * as Location from 'expo-location';
import { Alert } from 'react-native';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

interface VenueLocation {
  id: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  radius: number; // in meters
  type: 'stadium' | 'field' | 'gym' | 'other';
}

interface LocationSettings {
  enabled: boolean;
  highAccuracy: boolean;
  distanceFilter: number; // in meters
  timeInterval: number; // in milliseconds
  backgroundLocation: boolean;
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationCoordinates | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private settings: LocationSettings = {
    enabled: false,
    highAccuracy: true,
    distanceFilter: 10,
    timeInterval: 5000,
    backgroundLocation: false,
  };
  private venues: VenueLocation[] = [];

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  constructor() {
    this.loadSettings();
  }

  private async loadSettings() {
    // Load settings from AsyncStorage if needed
    // For now, using default settings
  }

  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to show nearby venues and provide location-based features.',
          [{ text: 'OK' }]
        );
        return false;
      }

      if (this.settings.backgroundLocation) {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn('Background location permission not granted');
        }
      }

      this.settings.enabled = true;
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      if (!this.settings.enabled) {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: this.settings.highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
        timeInterval: this.settings.timeInterval,
        distanceInterval: this.settings.distanceFilter,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Start location tracking
  async startLocationTracking(callback?: (location: LocationCoordinates) => void): Promise<void> {
    try {
      if (!this.settings.enabled) {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return;
      }

      // Stop existing subscription if any
      if (this.locationSubscription) {
        this.locationSubscription.remove();
      }

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: this.settings.highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
          timeInterval: this.settings.timeInterval,
          distanceInterval: this.settings.distanceFilter,
        },
        (location) => {
          const coordinates: LocationCoordinates = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
          };

          this.currentLocation = coordinates;
          
          if (callback) {
            callback(coordinates);
          }
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  }

  // Stop location tracking
  stopLocationTracking(): void {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  // Calculate distance between two coordinates
  calculateDistance(
    coord1: LocationCoordinates,
    coord2: LocationCoordinates
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Check if user is at a venue
  isAtVenue(venue: VenueLocation): boolean {
    if (!this.currentLocation) return false;

    const distance = this.calculateDistance(this.currentLocation, venue.coordinates);
    return distance <= venue.radius;
  }

  // Get nearby venues
  getNearbyVenues(maxDistance: number = 5000): VenueLocation[] {
    if (!this.currentLocation) return [];

    return this.venues.filter(venue => {
      const distance = this.calculateDistance(this.currentLocation!, venue.coordinates);
      return distance <= maxDistance;
    }).sort((a, b) => {
      const distanceA = this.calculateDistance(this.currentLocation!, a.coordinates);
      const distanceB = this.calculateDistance(this.currentLocation!, b.coordinates);
      return distanceA - distanceB;
    });
  }

  // Add venue
  addVenue(venue: VenueLocation): void {
    const existingIndex = this.venues.findIndex(v => v.id === venue.id);
    if (existingIndex >= 0) {
      this.venues[existingIndex] = venue;
    } else {
      this.venues.push(venue);
    }
  }

  // Remove venue
  removeVenue(venueId: string): void {
    this.venues = this.venues.filter(v => v.id !== venueId);
  }

  // Get venue by ID
  getVenue(venueId: string): VenueLocation | undefined {
    return this.venues.find(v => v.id === venueId);
  }

  // Get all venues
  getAllVenues(): VenueLocation[] {
    return [...this.venues];
  }

  // Get directions to venue
  async getDirectionsToVenue(venue: VenueLocation): Promise<string | null> {
    try {
      if (!this.currentLocation) {
        await this.getCurrentLocation();
        if (!this.currentLocation) return null;
      }

      const url = `https://www.google.com/maps/dir/?api=1&origin=${this.currentLocation.latitude},${this.currentLocation.longitude}&destination=${venue.coordinates.latitude},${venue.coordinates.longitude}`;
      return url;
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  }

  // Reverse geocoding - get address from coordinates
  async getAddressFromCoordinates(coordinates: LocationCoordinates): Promise<string | null> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        const addressParts = [
          result.street,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);
        
        return addressParts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  // Geocoding - get coordinates from address
  async getCoordinatesFromAddress(address: string): Promise<LocationCoordinates | null> {
    try {
      const results = await Location.geocodeAsync(address);

      if (results.length > 0) {
        const result = results[0];
        return {
          latitude: result.latitude,
          longitude: result.longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding:', error);
      return null;
    }
  }

  // Update location settings
  updateSettings(updates: Partial<LocationSettings>): void {
    this.settings = { ...this.settings, ...updates };
    
    // Restart tracking if needed
    if (this.locationSubscription && updates.distanceFilter !== undefined) {
      this.stopLocationTracking();
      this.startLocationTracking();
    }
  }

  // Get current settings
  getSettings(): LocationSettings {
    return { ...this.settings };
  }

  // Get current location
  getCurrentLocationData(): LocationCoordinates | null {
    return this.currentLocation ? { ...this.currentLocation } : null;
  }

  // Check if location services are enabled
  async isLocationEnabled(): Promise<boolean> {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      return isEnabled;
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  // Get location accuracy
  getLocationAccuracy(): 'high' | 'balanced' | 'low' {
    return this.settings.highAccuracy ? 'high' : 'balanced';
  }

  // Format distance for display
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }

  // Check if location is within reasonable bounds
  isValidLocation(coordinates: LocationCoordinates): boolean {
    return (
      coordinates.latitude >= -90 &&
      coordinates.latitude <= 90 &&
      coordinates.longitude >= -180 &&
      coordinates.longitude <= 180
    );
  }
}

export const locationService = LocationService.getInstance(); 