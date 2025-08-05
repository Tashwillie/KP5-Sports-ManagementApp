import { PerformanceOptimizedTouchOptions } from './performanceOptimizedTouchService';

export interface PerformanceTuningProfile {
  name: string;
  description: string;
  fps: number;
  throttleInterval: number;
  debounceDelay: number;
  touchThreshold: number;
  touchDelay: number;
  enableTransform3d: boolean;
  enablePerformanceMonitoring: boolean;
  enableRequestAnimationFrame: boolean;
  enableThrottling: boolean;
  enableDebouncing: boolean;
  maxConcurrentAnimations: number;
  animationFrameBudget: number;
  touchEventBudget: number;
}

export interface AdaptiveTuningConfig {
  enableAdaptiveTuning: boolean;
  performanceSamplingInterval: number;
  tuningUpdateThreshold: number;
  minFPSThreshold: number;
  maxLatencyThreshold: number;
  deviceCapabilityWeight: number;
  userInteractionWeight: number;
  batteryLevelWeight: number;
}

export class AdvancedPerformanceTuningService {
  private static currentProfile: PerformanceTuningProfile | null = null;
  private static performanceHistory: Array<{ fps: number; latency: number; timestamp: number }> = [];
  private static adaptiveConfig: AdaptiveTuningConfig = {
    enableAdaptiveTuning: true,
    performanceSamplingInterval: 2000, // 2 seconds
    tuningUpdateThreshold: 0.1, // 10% performance change
    minFPSThreshold: 45,
    maxLatencyThreshold: 33,
    deviceCapabilityWeight: 0.4,
    userInteractionWeight: 0.3,
    batteryLevelWeight: 0.3,
  };

  // Predefined performance profiles
  private static performanceProfiles: PerformanceTuningProfile[] = [
    {
      name: 'ultra-high-performance',
      description: 'Maximum performance for high-end devices',
      fps: 60,
      throttleInterval: 8, // ~120fps equivalent
      debounceDelay: 50,
      touchThreshold: 5,
      touchDelay: 100,
      enableTransform3d: true,
      enablePerformanceMonitoring: true,
      enableRequestAnimationFrame: true,
      enableThrottling: true,
      enableDebouncing: true,
      maxConcurrentAnimations: 10,
      animationFrameBudget: 16,
      touchEventBudget: 8,
    },
    {
      name: 'high-performance',
      description: 'Optimized for modern devices',
      fps: 60,
      throttleInterval: 16, // ~60fps
      debounceDelay: 75,
      touchThreshold: 8,
      touchDelay: 150,
      enableTransform3d: true,
      enablePerformanceMonitoring: true,
      enableRequestAnimationFrame: true,
      enableThrottling: true,
      enableDebouncing: true,
      maxConcurrentAnimations: 8,
      animationFrameBudget: 16,
      touchEventBudget: 16,
    },
    {
      name: 'balanced-performance',
      description: 'Balanced performance and battery life',
      fps: 60,
      throttleInterval: 20, // ~50fps
      debounceDelay: 100,
      touchThreshold: 10,
      touchDelay: 200,
      enableTransform3d: true,
      enablePerformanceMonitoring: false,
      enableRequestAnimationFrame: true,
      enableThrottling: true,
      enableDebouncing: true,
      maxConcurrentAnimations: 6,
      animationFrameBudget: 20,
      touchEventBudget: 20,
    },
    {
      name: 'power-saver',
      description: 'Optimized for battery life and older devices',
      fps: 30,
      throttleInterval: 32, // ~30fps
      debounceDelay: 150,
      touchThreshold: 12,
      touchDelay: 300,
      enableTransform3d: false,
      enablePerformanceMonitoring: false,
      enableRequestAnimationFrame: true,
      enableThrottling: true,
      enableDebouncing: true,
      maxConcurrentAnimations: 3,
      animationFrameBudget: 32,
      touchEventBudget: 32,
    },
    {
      name: 'ultra-power-saver',
      description: 'Maximum battery life, minimal performance',
      fps: 30,
      throttleInterval: 50, // ~20fps
      debounceDelay: 200,
      touchThreshold: 15,
      touchDelay: 400,
      enableTransform3d: false,
      enablePerformanceMonitoring: false,
      enableRequestAnimationFrame: false,
      enableThrottling: true,
      enableDebouncing: true,
      maxConcurrentAnimations: 1,
      animationFrameBudget: 50,
      touchEventBudget: 50,
    },
  ];

  // Device capability assessment
  static assessDeviceCapability(): number {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = (navigator as any).hardwareConcurrency || 4;
    const connection = (navigator as any).connection;
    const battery = (navigator as any).getBattery?.();
    
    let score = 0;
    
    // Memory score (0-1)
    score += Math.min(memory / 8, 1) * 0.3;
    
    // CPU cores score (0-1)
    score += Math.min(cores / 8, 1) * 0.3;
    
    // Network score (0-1)
    if (connection) {
      const effectiveType = connection.effectiveType;
      const networkScore = effectiveType === '4g' ? 1 : 
                          effectiveType === '3g' ? 0.7 : 
                          effectiveType === '2g' ? 0.4 : 0.2;
      score += networkScore * 0.2;
    } else {
      score += 0.5 * 0.2; // Default to medium
    }
    
    // Battery score (0-1) - if available
    if (battery) {
      battery.then((battery: any) => {
        const batteryScore = battery.level || 0.5;
        score += batteryScore * 0.2;
      });
    } else {
      score += 0.5 * 0.2; // Default to medium
    }
    
    return Math.min(score, 1);
  }

  // Get optimal profile based on device capability
  static getOptimalProfile(): PerformanceTuningProfile {
    const deviceCapability = this.assessDeviceCapability();
    
    if (deviceCapability >= 0.8) {
      return this.performanceProfiles[0]; // ultra-high-performance
    } else if (deviceCapability >= 0.6) {
      return this.performanceProfiles[1]; // high-performance
    } else if (deviceCapability >= 0.4) {
      return this.performanceProfiles[2]; // balanced-performance
    } else if (deviceCapability >= 0.2) {
      return this.performanceProfiles[3]; // power-saver
    } else {
      return this.performanceProfiles[4]; // ultra-power-saver
    }
  }

  // Adaptive tuning based on real-time performance
  static updateProfileAdaptively(
    currentFPS: number,
    currentLatency: number,
    userInteractionLevel: number = 0.5
  ): PerformanceTuningProfile {
    if (!this.adaptiveConfig.enableAdaptiveTuning) {
      return this.getOptimalProfile();
    }

    // Add to performance history
    this.performanceHistory.push({
      fps: currentFPS,
      latency: currentLatency,
      timestamp: performance.now(),
    });

    // Keep only recent history (last 10 seconds)
    const tenSecondsAgo = performance.now() - 10000;
    this.performanceHistory = this.performanceHistory.filter(
      entry => entry.timestamp > tenSecondsAgo
    );

    // Calculate average performance
    const avgFPS = this.performanceHistory.reduce((sum, entry) => sum + entry.fps, 0) / this.performanceHistory.length;
    const avgLatency = this.performanceHistory.reduce((sum, entry) => sum + entry.latency, 0) / this.performanceHistory.length;

    // Determine if tuning is needed
    const currentProfile = this.currentProfile || this.getOptimalProfile();
    const fpsRatio = avgFPS / currentProfile.fps;
    const latencyRatio = avgLatency / currentProfile.maxLatencyThreshold;

    // Calculate performance score
    const performanceScore = (fpsRatio * 0.6) + ((1 - latencyRatio) * 0.4);

    // Determine new profile based on performance
    let newProfile: PerformanceTuningProfile;

    if (performanceScore >= 0.9) {
      // Performance is excellent, can try higher profile
      newProfile = this.getNextHigherProfile(currentProfile);
    } else if (performanceScore <= 0.7) {
      // Performance is poor, need lower profile
      newProfile = this.getNextLowerProfile(currentProfile);
    } else {
      // Performance is acceptable, keep current profile
      newProfile = currentProfile;
    }

    // Apply user interaction level adjustments
    newProfile = this.adjustForUserInteraction(newProfile, userInteractionLevel);

    this.currentProfile = newProfile;
    return newProfile;
  }

  private static getNextHigherProfile(currentProfile: PerformanceTuningProfile): PerformanceTuningProfile {
    const currentIndex = this.performanceProfiles.findIndex(p => p.name === currentProfile.name);
    if (currentIndex > 0) {
      return this.performanceProfiles[currentIndex - 1];
    }
    return currentProfile;
  }

  private static getNextLowerProfile(currentProfile: PerformanceTuningProfile): PerformanceTuningProfile {
    const currentIndex = this.performanceProfiles.findIndex(p => p.name === currentProfile.name);
    if (currentIndex < this.performanceProfiles.length - 1) {
      return this.performanceProfiles[currentIndex + 1];
    }
    return currentProfile;
  }

  private static adjustForUserInteraction(
    profile: PerformanceTuningProfile,
    interactionLevel: number
  ): PerformanceTuningProfile {
    // Adjust based on user interaction level (0 = passive, 1 = very active)
    const adjustedProfile = { ...profile };

    if (interactionLevel > 0.8) {
      // High interaction - prioritize responsiveness
      adjustedProfile.throttleInterval = Math.max(8, profile.throttleInterval * 0.8);
      adjustedProfile.debounceDelay = Math.max(25, profile.debounceDelay * 0.8);
      adjustedProfile.touchDelay = Math.max(50, profile.touchDelay * 0.8);
    } else if (interactionLevel < 0.3) {
      // Low interaction - prioritize battery life
      adjustedProfile.throttleInterval = Math.min(50, profile.throttleInterval * 1.2);
      adjustedProfile.debounceDelay = Math.min(300, profile.debounceDelay * 1.2);
      adjustedProfile.touchDelay = Math.min(500, profile.touchDelay * 1.2);
    }

    return adjustedProfile;
  }

  // Convert profile to PerformanceOptimizedTouchOptions
  static profileToOptions(profile: PerformanceTuningProfile): PerformanceOptimizedTouchOptions {
    return {
      enableTouchDrag: true,
      touchThreshold: profile.touchThreshold,
      touchDelay: profile.touchDelay,
      enablePerformanceMonitoring: profile.enablePerformanceMonitoring,
      targetFPS: profile.fps,
      enableThrottling: profile.enableThrottling,
      throttleInterval: profile.throttleInterval,
      enableDebouncing: profile.enableDebouncing,
      debounceDelay: profile.debounceDelay,
      enableRequestAnimationFrame: profile.enableRequestAnimationFrame,
      enableTransform3d: profile.enableTransform3d,
    };
  }

  // Advanced throttling with dynamic intervals
  static createDynamicThrottler(
    baseInterval: number,
    adaptiveConfig: {
      enableDynamicThrottling: boolean;
      minInterval: number;
      maxInterval: number;
      performanceThreshold: number;
    } = {
      enableDynamicThrottling: true,
      minInterval: 8,
      maxInterval: 50,
      performanceThreshold: 0.8,
    }
  ) {
    let lastExecution = 0;
    let currentInterval = baseInterval;
    let performanceHistory: number[] = [];

    return (callback: () => void, performanceMetric?: number) => {
      const now = performance.now();

      if (adaptiveConfig.enableDynamicThrottling && performanceMetric !== undefined) {
        // Update performance history
        performanceHistory.push(performanceMetric);
        if (performanceHistory.length > 10) {
          performanceHistory.shift();
        }

        // Calculate average performance
        const avgPerformance = performanceHistory.reduce((sum, metric) => sum + metric, 0) / performanceHistory.length;

        // Adjust interval based on performance
        if (avgPerformance < adaptiveConfig.performanceThreshold) {
          // Performance is poor, increase interval
          currentInterval = Math.min(adaptiveConfig.maxInterval, currentInterval * 1.1);
        } else if (avgPerformance > adaptiveConfig.performanceThreshold * 1.2) {
          // Performance is excellent, decrease interval
          currentInterval = Math.max(adaptiveConfig.minInterval, currentInterval * 0.9);
        }
      }

      if (now - lastExecution >= currentInterval) {
        callback();
        lastExecution = now;
      }
    };
  }

  // Advanced debouncing with dynamic delays
  static createDynamicDebouncer(
    baseDelay: number,
    adaptiveConfig: {
      enableDynamicDebouncing: boolean;
      minDelay: number;
      maxDelay: number;
      interactionLevel: number;
    } = {
      enableDynamicDebouncing: true,
      minDelay: 25,
      maxDelay: 300,
      interactionLevel: 0.5,
    }
  ) {
    let timeoutId: NodeJS.Timeout | null = null;
    let currentDelay = baseDelay;

    return (callback: () => void, interactionLevel?: number) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (adaptiveConfig.enableDynamicDebouncing) {
        const level = interactionLevel ?? adaptiveConfig.interactionLevel;
        
        // Adjust delay based on interaction level
        if (level > 0.8) {
          // High interaction - reduce delay for responsiveness
          currentDelay = Math.max(adaptiveConfig.minDelay, baseDelay * 0.5);
        } else if (level < 0.3) {
          // Low interaction - increase delay for battery life
          currentDelay = Math.min(adaptiveConfig.maxDelay, baseDelay * 1.5);
        } else {
          currentDelay = baseDelay;
        }
      }

      timeoutId = setTimeout(() => {
        callback();
        timeoutId = null;
      }, currentDelay);
    };
  }

  // Performance budget management
  static createPerformanceBudgetManager(
    frameBudget: number,
    eventBudget: number
  ) {
    let frameTimeUsed = 0;
    let eventTimeUsed = 0;
    let lastReset = performance.now();

    const resetBudgets = () => {
      frameTimeUsed = 0;
      eventTimeUsed = 0;
      lastReset = performance.now();
    };

    const canExecuteFrame = (estimatedTime: number) => {
      const now = performance.now();
      if (now - lastReset > 16) { // Reset every frame
        resetBudgets();
      }
      return frameTimeUsed + estimatedTime <= frameBudget;
    };

    const canExecuteEvent = (estimatedTime: number) => {
      const now = performance.now();
      if (now - lastReset > 16) { // Reset every frame
        resetBudgets();
      }
      return eventTimeUsed + estimatedTime <= eventBudget;
    };

    const recordFrameTime = (time: number) => {
      frameTimeUsed += time;
    };

    const recordEventTime = (time: number) => {
      eventTimeUsed += time;
    };

    return {
      canExecuteFrame,
      canExecuteEvent,
      recordFrameTime,
      recordEventTime,
      resetBudgets,
      getFrameBudgetRemaining: () => Math.max(0, frameBudget - frameTimeUsed),
      getEventBudgetRemaining: () => Math.max(0, eventBudget - eventTimeUsed),
    };
  }

  // Get current profile
  static getCurrentProfile(): PerformanceTuningProfile | null {
    return this.currentProfile;
  }

  // Set adaptive tuning configuration
  static setAdaptiveConfig(config: Partial<AdaptiveTuningConfig>): void {
    this.adaptiveConfig = { ...this.adaptiveConfig, ...config };
  }

  // Get adaptive tuning configuration
  static getAdaptiveConfig(): AdaptiveTuningConfig {
    return { ...this.adaptiveConfig };
  }

  // Reset to optimal profile
  static resetToOptimal(): PerformanceTuningProfile {
    this.currentProfile = this.getOptimalProfile();
    return this.currentProfile;
  }

  // Get all available profiles
  static getAllProfiles(): PerformanceTuningProfile[] {
    return [...this.performanceProfiles];
  }
} 