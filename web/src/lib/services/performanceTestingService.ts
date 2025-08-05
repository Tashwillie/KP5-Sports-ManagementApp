import { PerformanceOptimizedTouchService, PerformanceMetrics } from './performanceOptimizedTouchService';
import { AdvancedPerformanceTuningService, PerformanceTuningProfile } from './advancedPerformanceTuningService';

export interface PerformanceTestResult {
  testId: string;
  timestamp: number;
  deviceInfo: DeviceInfo;
  testScenario: TestScenario;
  metrics: PerformanceMetrics;
  profile: PerformanceTuningProfile;
  recommendations: PerformanceRecommendation[];
  success: boolean;
  error?: string;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connectionType?: string;
  batteryLevel?: number;
  screenResolution: string;
  devicePixelRatio: number;
  touchSupport: boolean;
  deviceCapability: number;
}

export interface TestScenario {
  name: string;
  description: string;
  duration: number;
  eventCount: number;
  complexity: 'low' | 'medium' | 'high';
  interactionType: 'touch' | 'mouse' | 'mixed';
}

export interface PerformanceRecommendation {
  type: 'throttle' | 'debounce' | 'budget' | 'profile' | 'hardware';
  priority: 'low' | 'medium' | 'high' | 'critical';
  currentValue: number;
  recommendedValue: number;
  reason: string;
  expectedImprovement: string;
}

export interface OptimizationThresholds {
  fps: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
  latency: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
  frameTime: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
  budgetUtilization: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
}

export class PerformanceTestingService {
  private static testResults: PerformanceTestResult[] = [];
  private static isTestRunning = false;
  private static currentTest: PerformanceTestResult | null = null;
  private static testStartTime = 0;
  private static eventCount = 0;
  private static metricsHistory: PerformanceMetrics[] = [];
  private static optimizationThresholds: OptimizationThresholds = {
    fps: {
      excellent: 58,
      good: 50,
      acceptable: 30,
      poor: 20,
    },
    latency: {
      excellent: 8,
      good: 16,
      acceptable: 33,
      poor: 50,
    },
    frameTime: {
      excellent: 12,
      good: 16,
      acceptable: 33,
      poor: 50,
    },
    budgetUtilization: {
      excellent: 0.7,
      good: 0.8,
      acceptable: 0.9,
      poor: 1.0,
    },
  };

  // Initialize testing environment
  static initialize(): void {
    // Load existing test results from localStorage
    this.loadTestResults();
    
    // Set up performance monitoring
    PerformanceOptimizedTouchService.initialize();
    
    console.log('Performance Testing Service initialized');
  }

  // Get device information
  static getDeviceInfo(): DeviceInfo {
    const memory = (navigator as any).deviceMemory;
    const cores = (navigator as any).hardwareConcurrency;
    const connection = (navigator as any).connection;
    const battery = (navigator as any).getBattery?.();
    
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      deviceMemory: memory,
      hardwareConcurrency: cores,
      connectionType: connection?.effectiveType,
      batteryLevel: undefined, // Will be set asynchronously
      screenResolution: `${screen.width}x${screen.height}`,
      devicePixelRatio: window.devicePixelRatio || 1,
      touchSupport: 'ontouchstart' in window,
      deviceCapability: AdvancedPerformanceTuningService.assessDeviceCapability(),
    };
  }

  // Run comprehensive performance test
  static async runPerformanceTest(
    scenario: TestScenario,
    onProgress?: (progress: number, message: string) => void
  ): Promise<PerformanceTestResult> {
    if (this.isTestRunning) {
      throw new Error('Test already running');
    }

    this.isTestRunning = true;
    this.currentTest = this.createTestResult(scenario);
    this.testStartTime = performance.now();
    this.eventCount = 0;
    this.metricsHistory = [];

    try {
      // Get device info
      const deviceInfo = this.getDeviceInfo();
      this.currentTest.deviceInfo = deviceInfo;

      // Get battery level if available
      if ((navigator as any).getBattery) {
        try {
          const battery = await (navigator as any).getBattery();
          deviceInfo.batteryLevel = battery.level;
        } catch (error) {
          console.warn('Could not get battery level:', error);
        }
      }

      // Run test scenarios
      await this.runTestScenarios(scenario, onProgress);

      // Analyze results and generate recommendations
      this.currentTest.recommendations = this.generateRecommendations();
      this.currentTest.success = true;

      // Save test result
      this.testResults.push(this.currentTest);
      this.saveTestResults();

      return this.currentTest;
    } catch (error) {
      this.currentTest.success = false;
      this.currentTest.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      this.isTestRunning = false;
      this.currentTest = null;
    }
  }

  // Run different test scenarios
  private static async runTestScenarios(
    scenario: TestScenario,
    onProgress?: (progress: number, message: string) => void
  ): Promise<void> {
    const testDuration = scenario.duration * 1000; // Convert to milliseconds
    const startTime = performance.now();
    const endTime = startTime + testDuration;

    // Start performance monitoring
    PerformanceOptimizedTouchService.startPerformanceMonitoring();

    // Simulate different interaction patterns
    await this.simulateInteractions(scenario, onProgress);

    // Collect metrics during test
    const metricsInterval = setInterval(() => {
      const metrics = PerformanceOptimizedTouchService.getPerformanceMetrics();
      this.metricsHistory.push({ ...metrics });
      
      const progress = Math.min((performance.now() - startTime) / testDuration, 1);
      onProgress?.(progress, `Collecting metrics: ${Math.round(progress * 100)}%`);
    }, 100);

    // Wait for test duration
    await new Promise(resolve => {
      setTimeout(() => {
        clearInterval(metricsInterval);
        resolve(undefined);
      }, testDuration);
    });

    // Stop performance monitoring
    PerformanceOptimizedTouchService.stopPerformanceMonitoring();

    // Calculate average metrics
    this.currentTest!.metrics = this.calculateAverageMetrics();
    this.currentTest!.profile = PerformanceOptimizedTouchService.getCurrentProfile()!;
  }

  // Simulate different interaction patterns
  private static async simulateInteractions(
    scenario: TestScenario,
    onProgress?: (progress: number, message: string) => void
  ): Promise<void> {
    const { interactionType, eventCount, complexity } = scenario;
    
    // Create test elements
    const testContainer = this.createTestContainer();
    document.body.appendChild(testContainer);

    try {
      // Simulate touch interactions
      if (interactionType === 'touch' || interactionType === 'mixed') {
        await this.simulateTouchInteractions(testContainer, eventCount, complexity, onProgress);
      }

      // Simulate mouse interactions
      if (interactionType === 'mouse' || interactionType === 'mixed') {
        await this.simulateMouseInteractions(testContainer, eventCount, complexity, onProgress);
      }

      // Simulate drag and drop
      await this.simulateDragAndDrop(testContainer, eventCount, complexity, onProgress);

    } finally {
      // Clean up
      document.body.removeChild(testContainer);
    }
  }

  // Create test container
  private static createTestContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: -1000px;
      left: -1000px;
      width: 100px;
      height: 100px;
      background: rgba(0,0,0,0.1);
      z-index: -1;
      pointer-events: none;
    `;
    return container;
  }

  // Simulate touch interactions
  private static async simulateTouchInteractions(
    container: HTMLElement,
    eventCount: number,
    complexity: 'low' | 'medium' | 'high',
    onProgress?: (progress: number, message: string) => void
  ): Promise<void> {
    const eventsPerSecond = complexity === 'high' ? 60 : complexity === 'medium' ? 30 : 15;
    const totalDuration = (eventCount / eventsPerSecond) * 1000;
    const interval = 1000 / eventsPerSecond;

    let eventsProcessed = 0;
    const startTime = performance.now();

    while (eventsProcessed < eventCount) {
      // Create touch event
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{
          clientX: Math.random() * 100,
          clientY: Math.random() * 100,
          identifier: 0,
          target: container,
        } as Touch],
        changedTouches: [],
        targetTouches: [],
      });

      // Dispatch event
      container.dispatchEvent(touchEvent);
      this.eventCount++;

      // Update progress
      eventsProcessed++;
      const progress = eventsProcessed / eventCount;
      onProgress?.(progress, `Touch events: ${eventsProcessed}/${eventCount}`);

      // Wait for next event
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  // Simulate mouse interactions
  private static async simulateMouseInteractions(
    container: HTMLElement,
    eventCount: number,
    complexity: 'low' | 'medium' | 'high',
    onProgress?: (progress: number, message: string) => void
  ): Promise<void> {
    const eventsPerSecond = complexity === 'high' ? 60 : complexity === 'medium' ? 30 : 15;
    const interval = 1000 / eventsPerSecond;

    let eventsProcessed = 0;

    while (eventsProcessed < eventCount) {
      // Create mouse event
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: Math.random() * 100,
        clientY: Math.random() * 100,
        bubbles: true,
        cancelable: true,
      });

      // Dispatch event
      container.dispatchEvent(mouseEvent);
      this.eventCount++;

      // Update progress
      eventsProcessed++;
      const progress = eventsProcessed / eventCount;
      onProgress?.(progress, `Mouse events: ${eventsProcessed}/${eventCount}`);

      // Wait for next event
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  // Simulate drag and drop
  private static async simulateDragAndDrop(
    container: HTMLElement,
    eventCount: number,
    complexity: 'low' | 'medium' | 'high',
    onProgress?: (progress: number, message: string) => void
  ): Promise<void> {
    const dragsPerSecond = complexity === 'high' ? 10 : complexity === 'medium' ? 5 : 2;
    const interval = 1000 / dragsPerSecond;

    let dragsProcessed = 0;

    while (dragsProcessed < eventCount / 10) { // Fewer drag operations
      // Simulate drag start
      const startEvent = new MouseEvent('mousedown', {
        clientX: 50,
        clientY: 50,
        bubbles: true,
      });
      container.dispatchEvent(startEvent);

      // Simulate drag move
      for (let i = 0; i < 10; i++) {
        const moveEvent = new MouseEvent('mousemove', {
          clientX: 50 + i * 5,
          clientY: 50 + i * 5,
          bubbles: true,
        });
        container.dispatchEvent(moveEvent);
        await new Promise(resolve => setTimeout(resolve, 16)); // 60fps
      }

      // Simulate drag end
      const endEvent = new MouseEvent('mouseup', {
        clientX: 100,
        clientY: 100,
        bubbles: true,
      });
      container.dispatchEvent(endEvent);

      this.eventCount += 12; // start + 10 moves + end
      dragsProcessed++;
      
      const progress = dragsProcessed / (eventCount / 10);
      onProgress?.(progress, `Drag operations: ${dragsProcessed}/${Math.round(eventCount / 10)}`);

      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  // Calculate average metrics from test
  private static calculateAverageMetrics(): PerformanceMetrics {
    if (this.metricsHistory.length === 0) {
      return {
        fps: 0,
        frameTime: 0,
        touchLatency: 0,
        renderTime: 0,
      };
    }

    const sum = this.metricsHistory.reduce((acc, metrics) => ({
      fps: acc.fps + metrics.fps,
      frameTime: acc.frameTime + metrics.frameTime,
      touchLatency: acc.touchLatency + metrics.touchLatency,
      renderTime: acc.renderTime + metrics.renderTime,
    }), { fps: 0, frameTime: 0, touchLatency: 0, renderTime: 0 });

    return {
      fps: sum.fps / this.metricsHistory.length,
      frameTime: sum.frameTime / this.metricsHistory.length,
      touchLatency: sum.touchLatency / this.metricsHistory.length,
      renderTime: sum.renderTime / this.metricsHistory.length,
    };
  }

  // Generate performance recommendations
  private static generateRecommendations(): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];
    const metrics = this.currentTest!.metrics;
    const profile = this.currentTest!.profile;
    const deviceInfo = this.currentTest!.deviceInfo;

    // FPS recommendations
    if (metrics.fps < this.optimizationThresholds.fps.poor) {
      recommendations.push({
        type: 'profile',
        priority: 'critical',
        currentValue: profile.throttleInterval,
        recommendedValue: Math.min(profile.throttleInterval * 1.5, 50),
        reason: 'FPS is critically low',
        expectedImprovement: 'Reduce frame processing load',
      });
    } else if (metrics.fps < this.optimizationThresholds.fps.acceptable) {
      recommendations.push({
        type: 'throttle',
        priority: 'high',
        currentValue: profile.throttleInterval,
        recommendedValue: Math.min(profile.throttleInterval * 1.2, 32),
        reason: 'FPS below acceptable threshold',
        expectedImprovement: 'Increase throttle interval',
      });
    }

    // Latency recommendations
    if (metrics.touchLatency > this.optimizationThresholds.latency.poor) {
      recommendations.push({
        type: 'debounce',
        priority: 'critical',
        currentValue: profile.debounceDelay,
        recommendedValue: Math.max(profile.debounceDelay * 0.7, 25),
        reason: 'Touch latency is critically high',
        expectedImprovement: 'Reduce debounce delay for responsiveness',
      });
    } else if (metrics.touchLatency > this.optimizationThresholds.latency.acceptable) {
      recommendations.push({
        type: 'debounce',
        priority: 'high',
        currentValue: profile.debounceDelay,
        recommendedValue: Math.max(profile.debounceDelay * 0.8, 50),
        reason: 'Touch latency above acceptable threshold',
        expectedImprovement: 'Optimize debounce timing',
      });
    }

    // Frame time recommendations
    if (metrics.frameTime > this.optimizationThresholds.frameTime.poor) {
      recommendations.push({
        type: 'budget',
        priority: 'critical',
        currentValue: profile.animationFrameBudget,
        recommendedValue: Math.min(profile.animationFrameBudget * 1.3, 50),
        reason: 'Frame time is critically high',
        expectedImprovement: 'Increase frame budget allocation',
      });
    }

    // Device-specific recommendations
    if (deviceInfo.deviceCapability < 0.3) {
      recommendations.push({
        type: 'hardware',
        priority: 'high',
        currentValue: profile.enableTransform3d ? 1 : 0,
        recommendedValue: 0,
        reason: 'Low-end device detected',
        expectedImprovement: 'Disable hardware acceleration',
      });
    }

    // Battery optimization
    if (deviceInfo.batteryLevel !== undefined && deviceInfo.batteryLevel < 0.2) {
      recommendations.push({
        type: 'profile',
        priority: 'medium',
        currentValue: profile.throttleInterval,
        recommendedValue: Math.min(profile.throttleInterval * 1.5, 50),
        reason: 'Low battery level',
        expectedImprovement: 'Switch to power-saving mode',
      });
    }

    return recommendations;
  }

  // Create test result object
  private static createTestResult(scenario: TestScenario): PerformanceTestResult {
    return {
      testId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      deviceInfo: this.getDeviceInfo(),
      testScenario: scenario,
      metrics: {
        fps: 0,
        frameTime: 0,
        touchLatency: 0,
        renderTime: 0,
      },
      profile: PerformanceOptimizedTouchService.getCurrentProfile()!,
      recommendations: [],
      success: false,
    };
  }

  // Save test results to localStorage
  private static saveTestResults(): void {
    try {
      localStorage.setItem('performanceTestResults', JSON.stringify(this.testResults));
    } catch (error) {
      console.warn('Could not save test results:', error);
    }
  }

  // Load test results from localStorage
  private static loadTestResults(): void {
    try {
      const saved = localStorage.getItem('performanceTestResults');
      if (saved) {
        this.testResults = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Could not load test results:', error);
    }
  }

  // Get all test results
  static getTestResults(): PerformanceTestResult[] {
    return [...this.testResults];
  }

  // Get test results for specific device
  static getTestResultsForDevice(deviceInfo: Partial<DeviceInfo>): PerformanceTestResult[] {
    return this.testResults.filter(result => {
      if (deviceInfo.platform && result.deviceInfo.platform !== deviceInfo.platform) return false;
      if (deviceInfo.deviceMemory && result.deviceInfo.deviceMemory !== deviceInfo.deviceMemory) return false;
      if (deviceInfo.hardwareConcurrency && result.deviceInfo.hardwareConcurrency !== deviceInfo.hardwareConcurrency) return false;
      return true;
    });
  }

  // Get optimal parameters based on test results
  static getOptimalParameters(deviceInfo: DeviceInfo): Partial<PerformanceTuningProfile> {
    const similarResults = this.getTestResultsForDevice(deviceInfo);
    
    if (similarResults.length === 0) {
      return AdvancedPerformanceTuningService.getOptimalProfile();
    }

    // Find best performing configuration
    const bestResult = similarResults.reduce((best, current) => {
      const bestScore = (best.metrics.fps / 60) + (1 - best.metrics.touchLatency / 50);
      const currentScore = (current.metrics.fps / 60) + (1 - current.metrics.touchLatency / 50);
      return currentScore > bestScore ? current : best;
    });

    return bestResult.profile;
  }

  // Clear test results
  static clearTestResults(): void {
    this.testResults = [];
    localStorage.removeItem('performanceTestResults');
  }

  // Get testing status
  static isRunning(): boolean {
    return this.isTestRunning;
  }

  // Get current test
  static getCurrentTest(): PerformanceTestResult | null {
    return this.currentTest;
  }

  // Update optimization thresholds
  static updateThresholds(thresholds: Partial<OptimizationThresholds>): void {
    this.optimizationThresholds = { ...this.optimizationThresholds, ...thresholds };
  }

  // Get optimization thresholds
  static getThresholds(): OptimizationThresholds {
    return { ...this.optimizationThresholds };
  }
} 