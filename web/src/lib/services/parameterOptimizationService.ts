import { PerformanceTestingService, PerformanceTestResult, DeviceInfo, TestScenario } from './performanceTestingService';
import { AdvancedPerformanceTuningService, PerformanceTuningProfile } from './advancedPerformanceTuningService';
import { PerformanceOptimizedTouchService } from './performanceOptimizedTouchService';

export interface OptimizationResult {
  success: boolean;
  originalProfile: PerformanceTuningProfile;
  optimizedProfile: PerformanceTuningProfile;
  improvements: {
    fps: number;
    latency: number;
    frameTime: number;
    overall: number;
  };
  recommendations: string[];
  confidence: number;
}

export interface OptimizationConfig {
  maxIterations: number;
  convergenceThreshold: number;
  learningRate: number;
  explorationRate: number;
  minImprovement: number;
}

export interface ParameterRange {
  throttleInterval: { min: number; max: number; step: number };
  debounceDelay: { min: number; max: number; step: number };
  touchThreshold: { min: number; max: number; step: number };
  touchDelay: { min: number; max: number; step: number };
  maxConcurrentAnimations: { min: number; max: number; step: number };
}

export class ParameterOptimizationService {
  private static optimizationHistory: Array<{
    deviceInfo: DeviceInfo;
    originalProfile: PerformanceTuningProfile;
    optimizedProfile: PerformanceTuningProfile;
    improvements: any;
    timestamp: number;
  }> = [];

  private static defaultConfig: OptimizationConfig = {
    maxIterations: 10,
    convergenceThreshold: 0.05,
    learningRate: 0.1,
    explorationRate: 0.2,
    minImprovement: 0.05,
  };

  private static parameterRanges: ParameterRange = {
    throttleInterval: { min: 8, max: 50, step: 2 },
    debounceDelay: { min: 25, max: 300, step: 25 },
    touchThreshold: { min: 5, max: 15, step: 1 },
    touchDelay: { min: 50, max: 500, step: 50 },
    maxConcurrentAnimations: { min: 1, max: 10, step: 1 },
  };

  // Initialize optimization service
  static initialize(): void {
    this.loadOptimizationHistory();
  }

  // Run automated parameter optimization
  static async optimizeParameters(
    deviceInfo: DeviceInfo,
    config: Partial<OptimizationConfig> = {}
  ): Promise<OptimizationResult> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Get current profile
    const originalProfile = AdvancedPerformanceTuningService.getOptimalProfile();
    
    // Run baseline test
    const baselineResult = await this.runBaselineTest(deviceInfo);
    
    // Start optimization process
    let currentProfile = { ...originalProfile };
    let bestProfile = { ...originalProfile };
    let bestScore = this.calculatePerformanceScore(baselineResult.metrics);
    let iterations = 0;
    let converged = false;

    console.log('Starting parameter optimization...');
    console.log('Baseline score:', bestScore);

    while (iterations < finalConfig.maxIterations && !converged) {
      iterations++;
      
      // Generate candidate profile
      const candidateProfile = this.generateCandidateProfile(
        currentProfile,
        bestProfile,
        finalConfig,
        iterations
      );

      // Test candidate profile
      const testResult = await this.testProfile(candidateProfile, deviceInfo);
      const candidateScore = this.calculatePerformanceScore(testResult.metrics);

      console.log(`Iteration ${iterations}: Score ${candidateScore.toFixed(3)}`);

      // Update best profile if improvement found
      if (candidateScore > bestScore + finalConfig.minImprovement) {
        bestProfile = { ...candidateProfile };
        bestScore = candidateScore;
        console.log(`New best score: ${bestScore.toFixed(3)}`);
      }

      // Check convergence
      const improvement = (bestScore - this.calculatePerformanceScore(baselineResult.metrics)) / 
                         this.calculatePerformanceScore(baselineResult.metrics);
      
      if (improvement < finalConfig.convergenceThreshold) {
        converged = true;
        console.log('Optimization converged');
      }

      // Update current profile for next iteration
      currentProfile = this.updateCurrentProfile(
        currentProfile,
        bestProfile,
        candidateProfile,
        candidateScore,
        bestScore,
        finalConfig
      );
    }

    // Calculate improvements
    const improvements = this.calculateImprovements(baselineResult.metrics, bestProfile);
    const confidence = this.calculateConfidence(iterations, converged, improvements.overall);

    // Generate recommendations
    const recommendations = this.generateOptimizationRecommendations(
      originalProfile,
      bestProfile,
      improvements
    );

    // Save optimization result
    this.saveOptimizationResult(deviceInfo, originalProfile, bestProfile, improvements);

    return {
      success: true,
      originalProfile,
      optimizedProfile: bestProfile,
      improvements,
      recommendations,
      confidence,
    };
  }

  // Run baseline performance test
  private static async runBaselineTest(deviceInfo: DeviceInfo): Promise<PerformanceTestResult> {
    const baselineScenario: TestScenario = {
      name: 'Baseline Test',
      description: 'Baseline performance measurement',
      duration: 5,
      eventCount: 50,
      complexity: 'medium',
      interactionType: 'touch',
    };

    return await PerformanceTestingService.runPerformanceTest(baselineScenario);
  }

  // Generate candidate profile using various strategies
  private static generateCandidateProfile(
    currentProfile: PerformanceTuningProfile,
    bestProfile: PerformanceTuningProfile,
    config: OptimizationConfig,
    iteration: number
  ): PerformanceTuningProfile {
    const candidate = { ...currentProfile };

    // Exploration vs exploitation
    const shouldExplore = Math.random() < config.explorationRate;
    
    if (shouldExplore) {
      // Random exploration
      candidate.throttleInterval = this.randomInRange(this.parameterRanges.throttleInterval);
      candidate.debounceDelay = this.randomInRange(this.parameterRanges.debounceDelay);
      candidate.touchThreshold = this.randomInRange(this.parameterRanges.touchThreshold);
      candidate.touchDelay = this.randomInRange(this.parameterRanges.touchDelay);
      candidate.maxConcurrentAnimations = this.randomInRange(this.parameterRanges.maxConcurrentAnimations);
    } else {
      // Gradient-based optimization
      const gradient = this.calculateGradient(currentProfile, bestProfile);
      
      candidate.throttleInterval = this.clamp(
        currentProfile.throttleInterval + gradient.throttleInterval * config.learningRate,
        this.parameterRanges.throttleInterval
      );
      
      candidate.debounceDelay = this.clamp(
        currentProfile.debounceDelay + gradient.debounceDelay * config.learningRate,
        this.parameterRanges.debounceDelay
      );
      
      candidate.touchThreshold = this.clamp(
        currentProfile.touchThreshold + gradient.touchThreshold * config.learningRate,
        this.parameterRanges.touchThreshold
      );
      
      candidate.touchDelay = this.clamp(
        currentProfile.touchDelay + gradient.touchDelay * config.learningRate,
        this.parameterRanges.touchDelay
      );
      
      candidate.maxConcurrentAnimations = this.clamp(
        currentProfile.maxConcurrentAnimations + gradient.maxConcurrentAnimations * config.learningRate,
        this.parameterRanges.maxConcurrentAnimations
      );
    }

    return candidate;
  }

  // Test a specific profile
  private static async testProfile(
    profile: PerformanceTuningProfile,
    deviceInfo: DeviceInfo
  ): Promise<PerformanceTestResult> {
    // Apply profile
    const options = AdvancedPerformanceTuningService.profileToOptions(profile);
    PerformanceOptimizedTouchService.initialize();
    
    // Run test
    const testScenario: TestScenario = {
      name: 'Profile Test',
      description: 'Testing specific profile configuration',
      duration: 3,
      eventCount: 30,
      complexity: 'medium',
      interactionType: 'touch',
    };

    return await PerformanceTestingService.runPerformanceTest(testScenario);
  }

  // Calculate performance score
  private static calculatePerformanceScore(metrics: any): number {
    const fpsScore = Math.min(metrics.fps / 60, 1);
    const latencyScore = Math.max(0, 1 - metrics.touchLatency / 50);
    const frameTimeScore = Math.max(0, 1 - metrics.frameTime / 33);
    
    // Weighted combination
    return fpsScore * 0.5 + latencyScore * 0.3 + frameTimeScore * 0.2;
  }

  // Calculate gradient between profiles
  private static calculateGradient(
    current: PerformanceTuningProfile,
    best: PerformanceTuningProfile
  ): any {
    return {
      throttleInterval: (best.throttleInterval - current.throttleInterval) / current.throttleInterval,
      debounceDelay: (best.debounceDelay - current.debounceDelay) / current.debounceDelay,
      touchThreshold: (best.touchThreshold - current.touchThreshold) / current.touchThreshold,
      touchDelay: (best.touchDelay - current.touchDelay) / current.touchDelay,
      maxConcurrentAnimations: (best.maxConcurrentAnimations - current.maxConcurrentAnimations) / current.maxConcurrentAnimations,
    };
  }

  // Update current profile for next iteration
  private static updateCurrentProfile(
    current: PerformanceTuningProfile,
    best: PerformanceTuningProfile,
    candidate: PerformanceTuningProfile,
    candidateScore: number,
    bestScore: number,
    config: OptimizationConfig
  ): PerformanceTuningProfile {
    // Momentum-based update
    const momentum = 0.9;
    const update = {
      throttleInterval: current.throttleInterval * momentum + candidate.throttleInterval * (1 - momentum),
      debounceDelay: current.debounceDelay * momentum + candidate.debounceDelay * (1 - momentum),
      touchThreshold: current.touchThreshold * momentum + candidate.touchThreshold * (1 - momentum),
      touchDelay: current.touchDelay * momentum + candidate.touchDelay * (1 - momentum),
      maxConcurrentAnimations: current.maxConcurrentAnimations * momentum + candidate.maxConcurrentAnimations * (1 - momentum),
    };

    return {
      ...current,
      ...update,
    };
  }

  // Calculate improvements
  private static calculateImprovements(
    baselineMetrics: any,
    optimizedProfile: PerformanceTuningProfile
  ): any {
    // Estimate improvements based on profile changes
    const fpsImprovement = this.estimateFPSImprovement(optimizedProfile);
    const latencyImprovement = this.estimateLatencyImprovement(optimizedProfile);
    const frameTimeImprovement = this.estimateFrameTimeImprovement(optimizedProfile);
    
    const overallImprovement = (fpsImprovement + latencyImprovement + frameTimeImprovement) / 3;
    
    return {
      fps: fpsImprovement,
      latency: latencyImprovement,
      frameTime: frameTimeImprovement,
      overall: overallImprovement,
    };
  }

  // Estimate FPS improvement
  private static estimateFPSImprovement(profile: PerformanceTuningProfile): number {
    // Higher throttle interval generally means lower FPS but better performance
    const baseFPS = 60;
    const adjustedFPS = baseFPS * (16 / profile.throttleInterval);
    return Math.max(0, (adjustedFPS - baseFPS) / baseFPS);
  }

  // Estimate latency improvement
  private static estimateLatencyImprovement(profile: PerformanceTuningProfile): number {
    // Lower debounce delay means better responsiveness
    const baseLatency = 100;
    const adjustedLatency = baseLatency * (profile.debounceDelay / 100);
    return Math.max(0, (baseLatency - adjustedLatency) / baseLatency);
  }

  // Estimate frame time improvement
  private static estimateFrameTimeImprovement(profile: PerformanceTuningProfile): number {
    // More concurrent animations might increase frame time
    const baseFrameTime = 16;
    const adjustedFrameTime = baseFrameTime * (profile.maxConcurrentAnimations / 5);
    return Math.max(0, (baseFrameTime - adjustedFrameTime) / baseFrameTime);
  }

  // Calculate confidence score
  private static calculateConfidence(
    iterations: number,
    converged: boolean,
    improvement: number
  ): number {
    let confidence = 0.5; // Base confidence
    
    // More iterations = higher confidence
    confidence += Math.min(iterations / 10, 0.3);
    
    // Convergence = higher confidence
    if (converged) confidence += 0.2;
    
    // Significant improvement = higher confidence
    if (improvement > 0.1) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  // Generate optimization recommendations
  private static generateOptimizationRecommendations(
    original: PerformanceTuningProfile,
    optimized: PerformanceTuningProfile,
    improvements: any
  ): string[] {
    const recommendations: string[] = [];
    
    if (optimized.throttleInterval !== original.throttleInterval) {
      const change = optimized.throttleInterval > original.throttleInterval ? 'increased' : 'decreased';
      recommendations.push(`Throttle interval ${change} from ${original.throttleInterval}ms to ${optimized.throttleInterval}ms for better performance`);
    }
    
    if (optimized.debounceDelay !== original.debounceDelay) {
      const change = optimized.debounceDelay > original.debounceDelay ? 'increased' : 'decreased';
      recommendations.push(`Debounce delay ${change} from ${original.debounceDelay}ms to ${optimized.debounceDelay}ms for better responsiveness`);
    }
    
    if (optimized.touchThreshold !== original.touchThreshold) {
      const change = optimized.touchThreshold > original.touchThreshold ? 'increased' : 'decreased';
      recommendations.push(`Touch threshold ${change} from ${original.touchThreshold}px to ${optimized.touchThreshold}px for better touch detection`);
    }
    
    if (optimized.touchDelay !== original.touchDelay) {
      const change = optimized.touchDelay > original.touchDelay ? 'increased' : 'decreased';
      recommendations.push(`Touch delay ${change} from ${original.touchDelay}ms to ${optimized.touchDelay}ms for better touch handling`);
    }
    
    if (optimized.maxConcurrentAnimations !== original.maxConcurrentAnimations) {
      const change = optimized.maxConcurrentAnimations > original.maxConcurrentAnimations ? 'increased' : 'decreased';
      recommendations.push(`Max concurrent animations ${change} from ${original.maxConcurrentAnimations} to ${optimized.maxConcurrentAnimations} for better animation performance`);
    }
    
    if (improvements.overall > 0.1) {
      recommendations.push(`Overall performance improvement of ${(improvements.overall * 100).toFixed(1)}% expected`);
    }
    
    return recommendations;
  }

  // Utility functions
  private static randomInRange(range: { min: number; max: number; step: number }): number {
    const steps = Math.floor((range.max - range.min) / range.step);
    const randomStep = Math.floor(Math.random() * (steps + 1));
    return range.min + randomStep * range.step;
  }

  private static clamp(value: number, range: { min: number; max: number; step: number }): number {
    const clamped = Math.max(range.min, Math.min(range.max, value));
    const steps = Math.round((clamped - range.min) / range.step);
    return range.min + steps * range.step;
  }

  // Save optimization result
  private static saveOptimizationResult(
    deviceInfo: DeviceInfo,
    originalProfile: PerformanceTuningProfile,
    optimizedProfile: PerformanceTuningProfile,
    improvements: any
  ): void {
    this.optimizationHistory.push({
      deviceInfo,
      originalProfile,
      optimizedProfile,
      improvements,
      timestamp: Date.now(),
    });
    
    this.saveOptimizationHistory();
  }

  // Save optimization history to localStorage
  private static saveOptimizationHistory(): void {
    try {
      localStorage.setItem('parameterOptimizationHistory', JSON.stringify(this.optimizationHistory));
    } catch (error) {
      console.warn('Could not save optimization history:', error);
    }
  }

  // Load optimization history from localStorage
  private static loadOptimizationHistory(): void {
    try {
      const saved = localStorage.getItem('parameterOptimizationHistory');
      if (saved) {
        this.optimizationHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Could not load optimization history:', error);
    }
  }

  // Get optimization history
  static getOptimizationHistory(): any[] {
    return [...this.optimizationHistory];
  }

  // Get optimized parameters for similar device
  static getOptimizedParametersForDevice(deviceInfo: DeviceInfo): PerformanceTuningProfile | null {
    const similarResults = this.optimizationHistory.filter(result => {
      // Check for similar device characteristics
      if (result.deviceInfo.platform !== deviceInfo.platform) return false;
      if (result.deviceInfo.deviceMemory !== deviceInfo.deviceMemory) return false;
      if (result.deviceInfo.hardwareConcurrency !== deviceInfo.hardwareConcurrency) return false;
      
      // Check if device capability is similar (±0.2)
      const capabilityDiff = Math.abs(result.deviceInfo.deviceCapability - deviceInfo.deviceCapability);
      if (capabilityDiff > 0.2) return false;
      
      return true;
    });

    if (similarResults.length === 0) return null;

    // Return the most recent result with best improvement
    const bestResult = similarResults.reduce((best, current) => {
      return current.improvements.overall > best.improvements.overall ? current : best;
    });

    return bestResult.optimizedProfile;
  }

  // Clear optimization history
  static clearOptimizationHistory(): void {
    this.optimizationHistory = [];
    localStorage.removeItem('parameterOptimizationHistory');
  }

  // Update parameter ranges
  static updateParameterRanges(ranges: Partial<ParameterRange>): void {
    this.parameterRanges = { ...this.parameterRanges, ...ranges };
  }

  // Get current parameter ranges
  static getParameterRanges(): ParameterRange {
    return { ...this.parameterRanges };
  }
} 