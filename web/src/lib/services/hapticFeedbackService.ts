export interface HapticPattern {
  name: string;
  description: string;
  pattern: number[];
  intensity: 'light' | 'medium' | 'heavy';
  duration: number;
}

export interface HapticConfig {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  patterns: {
    touch: HapticPattern;
    drag: HapticPattern;
    drop: HapticPattern;
    success: HapticPattern;
    error: HapticPattern;
    warning: HapticPattern;
  };
}

export class HapticFeedbackService {
  private static isSupported = false;
  private static isEnabled = true;
  private static currentConfig: HapticConfig;
  private static vibrationQueue: Array<{ pattern: number[]; timestamp: number }> = [];
  private static isVibrating = false;

  // Default haptic patterns
  private static defaultPatterns = {
    touch: {
      name: 'Touch Feedback',
      description: 'Light vibration for touch events',
      pattern: [10],
      intensity: 'light' as const,
      duration: 10,
    },
    drag: {
      name: 'Drag Feedback',
      description: 'Continuous vibration during drag',
      pattern: [20, 10, 20],
      intensity: 'medium' as const,
      duration: 50,
    },
    drop: {
      name: 'Drop Feedback',
      description: 'Strong vibration for successful drop',
      pattern: [30, 20, 30],
      intensity: 'heavy' as const,
      duration: 80,
    },
    success: {
      name: 'Success Feedback',
      description: 'Positive vibration for successful actions',
      pattern: [20, 10, 20, 10, 20],
      intensity: 'medium' as const,
      duration: 80,
    },
    error: {
      name: 'Error Feedback',
      description: 'Negative vibration for errors',
      pattern: [50, 100, 50, 100, 50],
      intensity: 'heavy' as const,
      duration: 350,
    },
    warning: {
      name: 'Warning Feedback',
      description: 'Warning vibration for conflicts',
      pattern: [30, 50, 30, 50, 30],
      intensity: 'medium' as const,
      duration: 190,
    },
  };

  // Initialize haptic feedback service
  static initialize(): void {
    this.checkSupport();
    this.loadConfig();
    this.setupEventListeners();
  }

  // Check if haptic feedback is supported
  private static checkSupport(): void {
    this.isSupported = 'vibrate' in navigator && typeof navigator.vibrate === 'function';
    
    if (this.isSupported) {
      console.log('Haptic feedback is supported');
    } else {
      console.log('Haptic feedback is not supported');
    }
  }

  // Load haptic configuration
  private static loadConfig(): void {
    try {
      const saved = localStorage.getItem('hapticConfig');
      if (saved) {
        this.currentConfig = JSON.parse(saved);
      } else {
        this.currentConfig = {
          enabled: true,
          intensity: 'medium',
          patterns: this.defaultPatterns,
        };
      }
    } catch (error) {
      console.warn('Could not load haptic config:', error);
      this.currentConfig = {
        enabled: true,
        intensity: 'medium',
        patterns: this.defaultPatterns,
      };
    }
  }

  // Save haptic configuration
  private static saveConfig(): void {
    try {
      localStorage.setItem('hapticConfig', JSON.stringify(this.currentConfig));
    } catch (error) {
      console.warn('Could not save haptic config:', error);
    }
  }

  // Setup event listeners for automatic haptic feedback
  private static setupEventListeners(): void {
    if (!this.isSupported || !this.currentConfig.enabled) return;

    // Touch events
    document.addEventListener('touchstart', (e) => {
      if (this.shouldTriggerHaptic('touch', e.target as HTMLElement)) {
        this.triggerHaptic('touch');
      }
    }, { passive: true });

    // Drag events
    document.addEventListener('dragstart', (e) => {
      if (this.shouldTriggerHaptic('drag', e.target as HTMLElement)) {
        this.triggerHaptic('drag');
      }
    });

    // Drop events
    document.addEventListener('drop', (e) => {
      if (this.shouldTriggerHaptic('drop', e.target as HTMLElement)) {
        this.triggerHaptic('drop');
      }
    });
  }

  // Check if haptic should be triggered for an element
  private static shouldTriggerHaptic(type: string, element: HTMLElement): boolean {
    if (!element) return false;

    // Check if element has haptic attributes
    const hapticAttr = element.getAttribute('data-haptic');
    if (hapticAttr === 'false') return false;
    if (hapticAttr === 'true') return true;

    // Check element classes
    const classes = element.className;
    if (classes.includes('no-haptic')) return false;
    if (classes.includes('haptic-enabled')) return true;

    // Default behavior based on type
    switch (type) {
      case 'touch':
        return element.classList.contains('touch-draggable') || 
               element.classList.contains('calendar-event') ||
               element.classList.contains('drop-zone');
      case 'drag':
        return element.classList.contains('touch-draggable') ||
               element.classList.contains('calendar-event');
      case 'drop':
        return element.classList.contains('drop-zone');
      default:
        return false;
    }
  }

  // Trigger haptic feedback
  static triggerHaptic(type: keyof HapticConfig['patterns']): void {
    if (!this.isSupported || !this.currentConfig.enabled) return;

    const pattern = this.currentConfig.patterns[type];
    if (!pattern) return;

    // Adjust pattern based on intensity setting
    const adjustedPattern = this.adjustPatternIntensity(pattern.pattern, this.currentConfig.intensity);
    
    // Add to vibration queue
    this.vibrationQueue.push({
      pattern: adjustedPattern,
      timestamp: performance.now(),
    });

    // Process queue if not currently vibrating
    if (!this.isVibrating) {
      this.processVibrationQueue();
    }
  }

  // Trigger custom haptic pattern
  static triggerCustomHaptic(pattern: number[], intensity: 'light' | 'medium' | 'heavy' = 'medium'): void {
    if (!this.isSupported || !this.currentConfig.enabled) return;

    const adjustedPattern = this.adjustPatternIntensity(pattern, intensity);
    
    this.vibrationQueue.push({
      pattern: adjustedPattern,
      timestamp: performance.now(),
    });

    if (!this.isVibrating) {
      this.processVibrationQueue();
    }
  }

  // Process vibration queue
  private static async processVibrationQueue(): Promise<void> {
    if (this.vibrationQueue.length === 0) {
      this.isVibrating = false;
      return;
    }

    this.isVibrating = true;
    const { pattern } = this.vibrationQueue.shift()!;

    try {
      // Trigger vibration
      navigator.vibrate(pattern);
      
      // Wait for vibration to complete
      const totalDuration = pattern.reduce((sum, duration) => sum + duration, 0);
      await new Promise(resolve => setTimeout(resolve, totalDuration));
      
      // Process next vibration
      this.processVibrationQueue();
    } catch (error) {
      console.warn('Vibration failed:', error);
      this.isVibrating = false;
    }
  }

  // Adjust pattern intensity
  private static adjustPatternIntensity(pattern: number[], intensity: 'light' | 'medium' | 'heavy'): number[] {
    const multipliers = {
      light: 0.5,
      medium: 1.0,
      heavy: 1.5,
    };

    const multiplier = multipliers[intensity];
    return pattern.map(duration => Math.round(duration * multiplier));
  }

  // Enable/disable haptic feedback
  static setEnabled(enabled: boolean): void {
    this.currentConfig.enabled = enabled;
    this.saveConfig();
  }

  // Set haptic intensity
  static setIntensity(intensity: 'light' | 'medium' | 'heavy'): void {
    this.currentConfig.intensity = intensity;
    this.saveConfig();
  }

  // Update haptic pattern
  static updatePattern(type: keyof HapticConfig['patterns'], pattern: HapticPattern): void {
    this.currentConfig.patterns[type] = pattern;
    this.saveConfig();
  }

  // Get current configuration
  static getConfig(): HapticConfig {
    return { ...this.currentConfig };
  }

  // Check if haptic feedback is supported
  static isHapticSupported(): boolean {
    return this.isSupported;
  }

  // Check if haptic feedback is enabled
  static isHapticEnabled(): boolean {
    return this.isSupported && this.currentConfig.enabled;
  }

  // Get default patterns
  static getDefaultPatterns(): typeof this.defaultPatterns {
    return { ...this.defaultPatterns };
  }

  // Create custom haptic pattern
  static createCustomPattern(
    name: string,
    description: string,
    pattern: number[],
    intensity: 'light' | 'medium' | 'heavy',
    duration: number
  ): HapticPattern {
    return {
      name,
      description,
      pattern,
      intensity,
      duration,
    };
  }

  // Trigger haptic for specific events
  static triggerTouchHaptic(): void {
    this.triggerHaptic('touch');
  }

  static triggerDragHaptic(): void {
    this.triggerHaptic('drag');
  }

  static triggerDropHaptic(): void {
    this.triggerHaptic('drop');
  }

  static triggerSuccessHaptic(): void {
    this.triggerHaptic('success');
  }

  static triggerErrorHaptic(): void {
    this.triggerHaptic('error');
  }

  static triggerWarningHaptic(): void {
    this.triggerHaptic('warning');
  }

  // Stop all vibrations
  static stopVibration(): void {
    if (this.isSupported) {
      navigator.vibrate(0);
    }
    this.vibrationQueue = [];
    this.isVibrating = false;
  }

  // Get vibration queue status
  static getVibrationStatus(): { isVibrating: boolean; queueLength: number } {
    return {
      isVibrating: this.isVibrating,
      queueLength: this.vibrationQueue.length,
    };
  }

  // Reset to default configuration
  static resetToDefaults(): void {
    this.currentConfig = {
      enabled: true,
      intensity: 'medium',
      patterns: this.defaultPatterns,
    };
    this.saveConfig();
  }
} 