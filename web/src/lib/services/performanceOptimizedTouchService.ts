import { Event } from '../../../../shared/src/types';
import { TouchDragService, TouchDragState, TouchDragOptions } from './touchDragService';
import { DragDropService, DropTarget } from './dragDropService';
import { AdvancedPerformanceTuningService, PerformanceTuningProfile } from './advancedPerformanceTuningService';
import { ParameterValidationService } from './parameterValidationService';
import { HapticFeedbackService } from './hapticFeedbackService';
import { CrossDeviceLearningService } from './crossDeviceLearningService';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  touchLatency: number;
  renderTime: number;
}

export interface PerformanceOptimizedTouchOptions extends TouchDragOptions {
  enablePerformanceMonitoring?: boolean;
  targetFPS?: number;
  enableThrottling?: boolean;
  throttleInterval?: number;
  enableDebouncing?: boolean;
  debounceDelay?: number;
  enableRequestAnimationFrame?: boolean;
  enableTransform3d?: boolean;
  enableAdaptiveTuning?: boolean;
  enableDynamicThrottling?: boolean;
  enableDynamicDebouncing?: boolean;
  performanceBudget?: {
    frameBudget: number;
    eventBudget: number;
  };
}

export class PerformanceOptimizedTouchService {
  private static performanceMetrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    touchLatency: 0,
    renderTime: 0,
  };

  private static frameCount = 0;
  private static lastFrameTime = performance.now();
  private static animationFrameId: number | null = null;
  private static touchStartTime = 0;
  private static lastTouchMoveTime = 0;
  private static throttleTimeout: NodeJS.Timeout | null = null;
  private static debounceTimeout: NodeJS.Timeout | null = null;
  private static currentProfile: PerformanceTuningProfile | null = null;
  private static performanceBudgetManager: any = null;
  private static dynamicThrottler: any = null;
  private static dynamicDebouncer: any = null;
  private static userInteractionLevel = 0.5;
  private static interactionHistory: Array<{ timestamp: number; type: string }> = [];

  private static defaultOptions: PerformanceOptimizedTouchOptions = {
    enableTouchDrag: true,
    touchThreshold: 10,
    touchDelay: 200,
    enablePerformanceMonitoring: true,
    targetFPS: 60,
    enableThrottling: true,
    throttleInterval: 16,
    enableDebouncing: true,
    debounceDelay: 100,
    enableRequestAnimationFrame: true,
    enableTransform3d: true,
    enableAdaptiveTuning: true,
    enableDynamicThrottling: true,
    enableDynamicDebouncing: true,
    performanceBudget: {
      frameBudget: 16,
      eventBudget: 8,
    },
  };

  // Initialize with advanced tuning
  static initialize(): void {
    // Advanced performance tuning is already initialized
    
    // Initialize parameter validation
    ParameterValidationService.initialize();
    
    // Initialize haptic feedback
    HapticFeedbackService.initialize();
    
    // Initialize cross-device learning
    CrossDeviceLearningService.initialize();
    
    // Get optimal profile and setup services
    this.currentProfile = AdvancedPerformanceTuningService.getOptimalProfile();
    this.performanceBudgetManager = AdvancedPerformanceTuningService.createPerformanceBudgetManager(
      this.currentProfile.animationFrameBudget,
      this.currentProfile.touchEventBudget
    );
    this.dynamicThrottler = AdvancedPerformanceTuningService.createDynamicThrottler(
      this.currentProfile.throttleInterval,
      {
        enableDynamicThrottling: this.defaultOptions.enableDynamicThrottling ?? true,
        minInterval: 8,
        maxInterval: 50,
        performanceThreshold: 0.8,
      }
    );
    this.dynamicDebouncer = AdvancedPerformanceTuningService.createDynamicDebouncer(
      this.currentProfile.debounceDelay,
      {
        enableDynamicDebouncing: this.defaultOptions.enableDynamicDebouncing ?? true,
        minDelay: 25,
        maxDelay: 300,
        interactionLevel: this.userInteractionLevel,
      }
    );
    
    console.log('Performance Optimized Touch Service initialized with all subsystems');
  }

  // Performance Monitoring
  static getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  static startPerformanceMonitoring(): void {
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.updateFPS();
  }

  private static updateFPS(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime >= 1000) {
      this.performanceMetrics.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.performanceMetrics.frameTime = deltaTime / this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;

      // Update adaptive tuning
      if (this.currentProfile && this.defaultOptions.enableAdaptiveTuning) {
        const newProfile = AdvancedPerformanceTuningService.updateProfileAdaptively(
          this.performanceMetrics.fps,
          this.performanceMetrics.touchLatency,
          this.userInteractionLevel
        );
        
        if (newProfile.name !== this.currentProfile.name) {
          this.currentProfile = newProfile;
          this.updateTuningParameters();
        }
      }
    }
    
    this.frameCount++;
    this.animationFrameId = requestAnimationFrame(() => this.updateFPS());
  }

  static stopPerformanceMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // User interaction tracking
  static trackUserInteraction(type: string): void {
    const now = performance.now();
    this.interactionHistory.push({ timestamp: now, type });
    
    // Keep only recent interactions (last 5 seconds)
    const fiveSecondsAgo = now - 5000;
    this.interactionHistory = this.interactionHistory.filter(
      entry => entry.timestamp > fiveSecondsAgo
    );
    
    // Calculate interaction level based on frequency
    const interactionCount = this.interactionHistory.length;
    this.userInteractionLevel = Math.min(interactionCount / 10, 1); // Normalize to 0-1
    
    // Update dynamic debouncer with new interaction level
    if (this.dynamicDebouncer) {
      this.dynamicDebouncer.setInteractionLevel?.(this.userInteractionLevel);
    }
  }

  // Update tuning parameters when profile changes
  private static updateTuningParameters(): void {
    if (!this.currentProfile) return;

    this.performanceBudgetManager = AdvancedPerformanceTuningService.createPerformanceBudgetManager(
      this.currentProfile.animationFrameBudget,
      this.currentProfile.touchEventBudget
    );
    
    this.dynamicThrottler = AdvancedPerformanceTuningService.createDynamicThrottler(
      this.currentProfile.throttleInterval,
      {
        enableDynamicThrottling: this.defaultOptions.enableDynamicThrottling ?? true,
        minInterval: 8,
        maxInterval: 50,
        performanceThreshold: 0.8,
      }
    );
    
    this.dynamicDebouncer = AdvancedPerformanceTuningService.createDynamicDebouncer(
      this.currentProfile.debounceDelay,
      {
        enableDynamicDebouncing: this.defaultOptions.enableDynamicDebouncing ?? true,
        minDelay: 25,
        maxDelay: 300,
        interactionLevel: this.userInteractionLevel,
      }
    );
  }

  // Optimized Touch Event Handlers
  static handleOptimizedTouchStart(event: TouchEvent, element: HTMLElement): TouchDragState {
    if (!this.performanceBudgetManager?.canExecuteEvent(8)) {
      return { 
        isDragging: false, 
        draggedEvent: null, 
        touchStartPosition: null, 
        currentPosition: null, 
        dropTarget: null, 
        touchId: null 
      };
    }

    this.trackUserInteraction('touchstart');
    this.touchStartTime = performance.now();
    
    // Trigger haptic feedback
    HapticFeedbackService.triggerTouchHaptic();

    const touch = event.touches[0];
    const rect = element.getBoundingClientRect();
    const startX = touch.clientX - rect.left;
    const startY = touch.clientY - rect.top;

    return {
      isDragging: true,
      draggedEvent: null,
      touchStartPosition: { x: startX, y: startY },
      currentPosition: { x: startX, y: startY },
      dropTarget: null,
      touchId: event.touches[0].identifier,
    };
  }

  static handleOptimizedTouchMove(
    event: TouchEvent,
    options: PerformanceOptimizedTouchOptions = {},
    callback?: (position: { x: number; y: number }) => void
  ): boolean {
    const opts = { ...this.defaultOptions, ...options };
    const currentTime = performance.now();
    
    this.trackUserInteraction('touch-move');
    
    // Use dynamic throttling if available
    if (this.dynamicThrottler && opts.enableDynamicThrottling) {
      this.dynamicThrottler(() => {
        this.executeTouchMove(event, opts, callback, currentTime);
      }, this.performanceMetrics.fps / 60); // Performance metric
      return true;
    }
    
    // Fallback to static throttling
    if (opts.enableThrottling && this.throttleTimeout) {
      return false;
    }
    
    if (opts.enableThrottling) {
      this.throttleTimeout = setTimeout(() => {
        this.throttleTimeout = null;
      }, opts.throttleInterval);
    }
    
    return this.executeTouchMove(event, opts, callback, currentTime);
  }

  private static executeTouchMove(
    event: TouchEvent,
    options: PerformanceOptimizedTouchOptions,
    callback?: (position: { x: number; y: number }) => void,
    currentTime?: number
  ): boolean {
    const opts = { ...this.defaultOptions, ...options };
    const now = currentTime || performance.now();
    
    // Check performance budget
    if (this.performanceBudgetManager && !this.performanceBudgetManager.canExecuteEvent(1)) {
      return false;
    }
    
    const touch = event.touches[0];
    if (!touch) return false;
    
    const position = { x: touch.clientX, y: touch.clientY };
    
    // Use requestAnimationFrame for smooth updates
    if (opts.enableRequestAnimationFrame) {
      requestAnimationFrame(() => {
        TouchDragService.handleTouchMove(event, opts);
        if (callback) {
          callback(position);
        }
        this.lastTouchMoveTime = now;
        this.performanceMetrics.touchLatency = now - this.touchStartTime;
        if (this.performanceBudgetManager) {
          this.performanceBudgetManager.recordEventTime(1);
        }
      });
    } else {
      TouchDragService.handleTouchMove(event, opts);
      if (callback) {
        callback(position);
      }
      this.lastTouchMoveTime = now;
      this.performanceMetrics.touchLatency = now - this.touchStartTime;
      if (this.performanceBudgetManager) {
        this.performanceBudgetManager.recordEventTime(1);
      }
    }
    
    return true;
  }

  static handleOptimizedTouchEnd(
    event: TouchEvent,
    options: PerformanceOptimizedTouchOptions = {},
    onReschedule?: (result: { success: boolean; event: Event; error?: string }) => void
  ): boolean {
    const opts = { ...this.defaultOptions, ...options };
    const currentTime = performance.now();
    
    this.trackUserInteraction('touch-end');
    
    // Use dynamic debouncing if available
    if (this.dynamicDebouncer && opts.enableDynamicDebouncing) {
      this.dynamicDebouncer(() => {
        this.executeTouchEnd(event, opts, onReschedule, currentTime);
      }, this.userInteractionLevel);
      return true;
    }
    
    // Fallback to static debouncing
    if (opts.enableDebouncing && this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    if (opts.enableDebouncing) {
      this.debounceTimeout = setTimeout(() => {
        this.executeTouchEnd(event, opts, onReschedule, currentTime);
        this.debounceTimeout = null;
      }, opts.debounceDelay);
      return true;
    }
    
    return this.executeTouchEnd(event, opts, onReschedule, currentTime);
  }

  private static executeTouchEnd(
    event: TouchEvent,
    options: PerformanceOptimizedTouchOptions,
    onReschedule?: (result: { success: boolean; event: Event; error?: string }) => void,
    currentTime?: number
  ): boolean {
    const opts = { ...this.defaultOptions, ...options };
    const now = currentTime || performance.now();
    
    // Check performance budget
    if (this.performanceBudgetManager && !this.performanceBudgetManager.canExecuteEvent(2)) {
      return false;
    }
    
    // Trigger haptic feedback based on result
    const touchState = TouchDragService.getTouchState();
    if (touchState.dropTarget) {
      HapticFeedbackService.triggerDropHaptic();
    } else {
      HapticFeedbackService.triggerTouchHaptic();
    }
    
    // Use requestAnimationFrame for smooth end
    if (opts.enableRequestAnimationFrame) {
      requestAnimationFrame(() => {
        TouchDragService.handleTouchEnd(event, onReschedule);
        this.performanceMetrics.touchLatency = now - this.touchStartTime;
        if (this.performanceBudgetManager) {
          this.performanceBudgetManager.recordEventTime(2);
        }
      });
    } else {
      TouchDragService.handleTouchEnd(event, onReschedule);
      this.performanceMetrics.touchLatency = now - this.touchStartTime;
      if (this.performanceBudgetManager) {
        this.performanceBudgetManager.recordEventTime(2);
      }
    }
    
    return true;
  }

  // Optimized Visual Feedback
  static createOptimizedTouchRipple(
    x: number, 
    y: number, 
    color: string = '#3B82F6',
    options: PerformanceOptimizedTouchOptions = {}
  ): void {
    const opts = { ...this.defaultOptions, ...options };
    
    // Check performance budget
    if (this.performanceBudgetManager && !this.performanceBudgetManager.canExecuteFrame(5)) {
      return;
    }
    
    if (opts.enableRequestAnimationFrame) {
      requestAnimationFrame(() => {
        TouchDragService.createTouchRipple(x, y, color);
        if (this.performanceBudgetManager) {
          this.performanceBudgetManager.recordFrameTime(5);
        }
      });
    } else {
      TouchDragService.createTouchRipple(x, y, color);
      if (this.performanceBudgetManager) {
        this.performanceBudgetManager.recordFrameTime(5);
      }
    }
  }

  static getOptimizedDragPreviewStyle(
    event: Event,
    position: { x: number; y: number },
    options: PerformanceOptimizedTouchOptions = {}
  ): React.CSSProperties {
    const opts = { ...this.defaultOptions, ...options };
    const baseStyle = TouchDragService.getTouchDragPreviewStyle(event, position);
    
    // Use transform3d for hardware acceleration
    if (opts.enableTransform3d) {
      return {
        ...baseStyle,
        transform: 'translate3d(0, 0, 0) rotate(2deg) scale(1.05)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      };
    }
    
    return baseStyle;
  }

  static getOptimizedDropTargetStyle(
    dropTarget: DropTarget | null,
    options: PerformanceOptimizedTouchOptions = {}
  ): React.CSSProperties {
    const opts = { ...this.defaultOptions, ...options };
    const baseStyle = TouchDragService.getTouchDropTargetStyle(dropTarget);
    
    // Use transform3d for hardware acceleration
    if (opts.enableTransform3d) {
      return {
        ...baseStyle,
        transform: 'translate3d(0, 0, 0) scale(1.02)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      };
    }
    
    return baseStyle;
  }

  // Memory Management
  static cleanup(): void {
    this.stopPerformanceMonitoring();
    
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = null;
    }
    
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    
    this.interactionHistory = [];
    this.userInteractionLevel = 0.5;
  }

  // Performance Utilities
  static isLowPerformanceDevice(): boolean {
    const memory = (navigator as any).deviceMemory || 4;
    const cores = (navigator as any).hardwareConcurrency || 4;
    const connection = (navigator as any).connection;
    
    return memory < 4 || cores < 4 || (connection && connection.effectiveType === 'slow-2g');
  }

  static getOptimalOptions(): PerformanceOptimizedTouchOptions {
    if (!this.currentProfile) {
      this.initialize();
    }
    
    if (this.currentProfile) {
      return AdvancedPerformanceTuningService.profileToOptions(this.currentProfile);
    }
    
    const isLowPerformance = this.isLowPerformanceDevice();
    
    return {
      ...this.defaultOptions,
      targetFPS: isLowPerformance ? 30 : 60,
      throttleInterval: isLowPerformance ? 32 : 16,
      enableTransform3d: !isLowPerformance,
      enablePerformanceMonitoring: !isLowPerformance,
    };
  }

  // Frame Rate Monitoring
  static monitorFrameRate(callback: (fps: number) => void): () => void {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        callback(fps);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }

  // Touch Event Optimization
  static optimizeTouchEvents(element: HTMLElement, options: PerformanceOptimizedTouchOptions = {}): void {
    const opts = { ...this.defaultOptions, ...options };
    
    // Prevent default touch behaviors that might interfere
    element.style.touchAction = 'none';
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    (element.style as any).webkitTouchCallout = 'none';
    
    // Enable hardware acceleration
    if (opts.enableTransform3d) {
      element.style.transform = 'translate3d(0, 0, 0)';
      element.style.willChange = 'transform';
      element.style.backfaceVisibility = 'hidden';
      element.style.perspective = '1000px';
    }
  }

  // Batch Updates
  static batchUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }

  // Debounced Updates
  static debouncedUpdate(
    updateFn: () => void,
    delay: number = 16,
    options: PerformanceOptimizedTouchOptions = {}
  ): () => void {
    const opts = { ...this.defaultOptions, ...options };
    let timeoutId: NodeJS.Timeout | null = null;
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        if (opts.enableRequestAnimationFrame) {
          requestAnimationFrame(updateFn);
        } else {
          updateFn();
        }
        timeoutId = null;
      }, delay);
    };
  }

  // Get current profile
  static getCurrentProfile(): PerformanceTuningProfile | null {
    return this.currentProfile;
  }

  // Get performance budget status
  static getPerformanceBudgetStatus(): any {
    if (!this.performanceBudgetManager) return null;
    
    return {
      frameBudgetRemaining: this.performanceBudgetManager.getFrameBudgetRemaining(),
      eventBudgetRemaining: this.performanceBudgetManager.getEventBudgetRemaining(),
      userInteractionLevel: this.userInteractionLevel,
    };
  }
} 