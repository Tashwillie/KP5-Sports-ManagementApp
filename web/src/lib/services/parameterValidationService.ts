import { PerformanceTestingService, DeviceInfo, PerformanceTestResult } from './performanceTestingService';
import { AdvancedPerformanceTuningService, PerformanceTuningProfile } from './advancedPerformanceTuningService';
import { ParameterOptimizationService, ParameterRange } from './parameterOptimizationService';

export interface ValidationResult {
  parameter: string;
  currentRange: { min: number; max: number; step: number };
  recommendedRange: { min: number; max: number; step: number };
  confidence: number;
  reasoning: string;
  testResults: Array<{
    value: number;
    performance: number;
    stability: number;
  }>;
}

export interface DeviceCategory {
  name: string;
  description: string;
  criteria: {
    memoryMin?: number;
    memoryMax?: number;
    coresMin?: number;
    coresMax?: number;
    capabilityMin?: number;
    capabilityMax?: number;
    platform?: string;
  };
  recommendedRanges: ParameterRange;
}

export interface ValidationConfig {
  testIterations: number;
  stabilityThreshold: number;
  performanceWeight: number;
  stabilityWeight: number;
  minConfidence: number;
}

export class ParameterValidationService {
  private static validationHistory: Array<{
    deviceInfo: DeviceInfo;
    validationResults: ValidationResult[];
    timestamp: number;
  }> = [];

  private static deviceCategories: DeviceCategory[] = [
    {
      name: 'Ultra High-End',
      description: 'Latest flagship devices with maximum performance',
      criteria: {
        memoryMin: 8,
        coresMin: 8,
        capabilityMin: 0.8,
      },
      recommendedRanges: {
        throttleInterval: { min: 8, max: 20, step: 1 },
        debounceDelay: { min: 25, max: 100, step: 10 },
        touchThreshold: { min: 3, max: 8, step: 1 },
        touchDelay: { min: 30, max: 150, step: 20 },
        maxConcurrentAnimations: { min: 8, max: 15, step: 1 },
      },
    },
    {
      name: 'High-End',
      description: 'Modern devices with good performance',
      criteria: {
        memoryMin: 6,
        coresMin: 6,
        capabilityMin: 0.6,
        capabilityMax: 0.8,
      },
      recommendedRanges: {
        throttleInterval: { min: 12, max: 25, step: 2 },
        debounceDelay: { min: 50, max: 150, step: 15 },
        touchThreshold: { min: 5, max: 10, step: 1 },
        touchDelay: { min: 50, max: 200, step: 25 },
        maxConcurrentAnimations: { min: 6, max: 12, step: 1 },
      },
    },
    {
      name: 'Mid-Range',
      description: 'Average devices with balanced performance',
      criteria: {
        memoryMin: 4,
        coresMin: 4,
        capabilityMin: 0.4,
        capabilityMax: 0.6,
      },
      recommendedRanges: {
        throttleInterval: { min: 16, max: 32, step: 2 },
        debounceDelay: { min: 75, max: 200, step: 20 },
        touchThreshold: { min: 8, max: 12, step: 1 },
        touchDelay: { min: 100, max: 300, step: 30 },
        maxConcurrentAnimations: { min: 4, max: 8, step: 1 },
      },
    },
    {
      name: 'Low-End',
      description: 'Budget devices with limited performance',
      criteria: {
        memoryMax: 4,
        coresMax: 4,
        capabilityMax: 0.4,
      },
      recommendedRanges: {
        throttleInterval: { min: 25, max: 50, step: 5 },
        debounceDelay: { min: 100, max: 300, step: 25 },
        touchThreshold: { min: 10, max: 15, step: 1 },
        touchDelay: { min: 200, max: 500, step: 50 },
        maxConcurrentAnimations: { min: 2, max: 5, step: 1 },
      },
    },
    {
      name: 'Legacy',
      description: 'Older devices with minimal performance',
      criteria: {
        memoryMax: 2,
        coresMax: 2,
        capabilityMax: 0.2,
      },
      recommendedRanges: {
        throttleInterval: { min: 40, max: 60, step: 5 },
        debounceDelay: { min: 150, max: 400, step: 50 },
        touchThreshold: { min: 12, max: 18, step: 1 },
        touchDelay: { min: 300, max: 600, step: 100 },
        maxConcurrentAnimations: { min: 1, max: 3, step: 1 },
      },
    },
  ];

  private static defaultConfig: ValidationConfig = {
    testIterations: 5,
    stabilityThreshold: 0.1,
    performanceWeight: 0.7,
    stabilityWeight: 0.3,
    minConfidence: 0.6,
  };

  // Initialize validation service
  static initialize(): void {
    this.loadValidationHistory();
  }

  // Validate parameter ranges for a specific device
  static async validateParameterRanges(
    deviceInfo: DeviceInfo,
    config: Partial<ValidationConfig> = {}
  ): Promise<ValidationResult[]> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const results: ValidationResult[] = [];

    // Get device category
    const category = this.getDeviceCategory(deviceInfo);
    const currentRanges = ParameterOptimizationService.getParameterRanges();

    // Validate each parameter
    const parameters = ['throttleInterval', 'debounceDelay', 'touchThreshold', 'touchDelay', 'maxConcurrentAnimations'];
    
    for (const param of parameters) {
      const validationResult = await this.validateParameter(
        param,
        currentRanges[param as keyof ParameterRange],
        category.recommendedRanges[param as keyof ParameterRange],
        deviceInfo,
        finalConfig
      );
      
      results.push(validationResult);
    }

    // Save validation results
    this.saveValidationResult(deviceInfo, results);

    return results;
  }

  // Validate a specific parameter
  private static async validateParameter(
    parameter: string,
    currentRange: { min: number; max: number; step: number },
    recommendedRange: { min: number; max: number; step: number },
    deviceInfo: DeviceInfo,
    config: ValidationConfig
  ): Promise<ValidationResult> {
    const testResults: Array<{ value: number; performance: number; stability: number }> = [];
    
    // Test values across the recommended range
    const testValues = this.generateTestValues(recommendedRange);
    
    for (const value of testValues) {
      const performance = await this.testParameterValue(parameter, value, deviceInfo);
      const stability = await this.testParameterStability(parameter, value, deviceInfo, config.testIterations);
      
      testResults.push({
        value,
        performance,
        stability,
      });
    }

    // Analyze results and generate recommendations
    const analysis = this.analyzeTestResults(testResults, config);
    const newRecommendedRange = this.generateRecommendedRange(testResults, analysis, recommendedRange);

    return {
      parameter,
      currentRange,
      recommendedRange: newRecommendedRange,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      testResults,
    };
  }

  // Generate test values for a parameter range
  private static generateTestValues(range: { min: number; max: number; step: number }): number[] {
    const values: number[] = [];
    let current = range.min;
    
    while (current <= range.max) {
      values.push(current);
      current += range.step;
    }
    
    return values;
  }

  // Test a specific parameter value
  private static async testParameterValue(
    parameter: string,
    value: number,
    deviceInfo: DeviceInfo
  ): Promise<number> {
    // Create test profile with the specific parameter value
    const testProfile = this.createTestProfile(parameter, value);
    
    // Run performance test
    const testScenario = {
      name: `Parameter Test - ${parameter}`,
      description: `Testing ${parameter} = ${value}`,
      duration: 3,
      eventCount: 30,
      complexity: 'medium' as const,
      interactionType: 'touch',
    };

    const result = await PerformanceTestingService.runPerformanceTest(testScenario);
    
    // Calculate performance score
    return this.calculatePerformanceScore(result.metrics);
  }

  // Test parameter stability
  private static async testParameterStability(
    parameter: string,
    value: number,
    deviceInfo: DeviceInfo,
    iterations: number
  ): Promise<number> {
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const performance = await this.testParameterValue(parameter, value, deviceInfo);
      results.push(performance);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Calculate stability (lower variance = higher stability)
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
    const stability = Math.max(0, 1 - Math.sqrt(variance));
    
    return stability;
  }

  // Create test profile with specific parameter value
  private static createTestProfile(parameter: string, value: number): PerformanceTuningProfile {
    const baseProfile = AdvancedPerformanceTuningService.getOptimalProfile();
    
    return {
      ...baseProfile,
      [parameter]: value,
    };
  }

  // Calculate performance score
  private static calculatePerformanceScore(metrics: any): number {
    const fpsScore = Math.min(metrics.fps / 60, 1);
    const latencyScore = Math.max(0, 1 - metrics.touchLatency / 50);
    const frameTimeScore = Math.max(0, 1 - metrics.frameTime / 33);
    
    return fpsScore * 0.5 + latencyScore * 0.3 + frameTimeScore * 0.2;
  }

  // Analyze test results
  private static analyzeTestResults(
    testResults: Array<{ value: number; performance: number; stability: number }>,
    config: ValidationConfig
  ): { confidence: number; reasoning: string } {
    // Find best performing value
    const bestResult = testResults.reduce((best, current) => {
      const bestScore = best.performance * config.performanceWeight + best.stability * config.stabilityWeight;
      const currentScore = current.performance * config.performanceWeight + current.stability * config.stabilityWeight;
      return currentScore > bestScore ? current : best;
    });

    // Calculate confidence based on performance spread and stability
    const performanceSpread = Math.max(...testResults.map(r => r.performance)) - Math.min(...testResults.map(r => r.performance));
    const averageStability = testResults.reduce((sum, r) => sum + r.stability, 0) / testResults.length;
    
    let confidence = 0.5; // Base confidence
    confidence += Math.min(performanceSpread, 0.3); // Higher spread = higher confidence
    confidence += averageStability * 0.2; // Higher stability = higher confidence

    // Generate reasoning
    const reasoning = `Best value: ${bestResult.value} (Performance: ${bestResult.performance.toFixed(3)}, Stability: ${bestResult.stability.toFixed(3)})`;

    return { confidence: Math.min(confidence, 1.0), reasoning };
  }

  // Generate recommended range based on test results
  private static generateRecommendedRange(
    testResults: Array<{ value: number; performance: number; stability: number }>,
    analysis: { confidence: number; reasoning: string },
    baseRange: { min: number; max: number; step: number }
  ): { min: number; max: number; step: number } {
    // Find values that perform within 10% of the best
    const bestPerformance = Math.max(...testResults.map(r => r.performance));
    const threshold = bestPerformance * 0.9;
    
    const goodValues = testResults
      .filter(r => r.performance >= threshold)
      .map(r => r.value)
      .sort((a, b) => a - b);

    if (goodValues.length === 0) {
      return baseRange;
    }

    const min = Math.max(baseRange.min, goodValues[0] - baseRange.step);
    const max = Math.min(baseRange.max, goodValues[goodValues.length - 1] + baseRange.step);

    return {
      min,
      max,
      step: baseRange.step,
    };
  }

  // Get device category
  private static getDeviceCategory(deviceInfo: DeviceInfo): DeviceCategory {
    for (const category of this.deviceCategories) {
      const criteria = category.criteria;
      
      if (criteria.memoryMin && deviceInfo.deviceMemory && deviceInfo.deviceMemory < criteria.memoryMin) continue;
      if (criteria.memoryMax && deviceInfo.deviceMemory && deviceInfo.deviceMemory > criteria.memoryMax) continue;
      if (criteria.coresMin && deviceInfo.hardwareConcurrency && deviceInfo.hardwareConcurrency < criteria.coresMin) continue;
      if (criteria.coresMax && deviceInfo.hardwareConcurrency && deviceInfo.hardwareConcurrency > criteria.coresMax) continue;
      if (criteria.capabilityMin && deviceInfo.deviceCapability < criteria.capabilityMin) continue;
      if (criteria.capabilityMax && deviceInfo.deviceCapability > criteria.capabilityMax) continue;
      if (criteria.platform && deviceInfo.platform !== criteria.platform) continue;
      
      return category;
    }
    
    // Default to mid-range if no category matches
    return this.deviceCategories[2];
  }

  // Save validation result
  private static saveValidationResult(deviceInfo: DeviceInfo, results: ValidationResult[]): void {
    this.validationHistory.push({
      deviceInfo,
      validationResults: results,
      timestamp: Date.now(),
    });
    
    this.saveValidationHistory();
  }

  // Save validation history to localStorage
  private static saveValidationHistory(): void {
    try {
      localStorage.setItem('parameterValidationHistory', JSON.stringify(this.validationHistory));
    } catch (error) {
      console.warn('Could not save validation history:', error);
    }
  }

  // Load validation history from localStorage
  private static loadValidationHistory(): void {
    try {
      const saved = localStorage.getItem('parameterValidationHistory');
      if (saved) {
        this.validationHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Could not load validation history:', error);
    }
  }

  // Get validation history
  static getValidationHistory(): any[] {
    return [...this.validationHistory];
  }

  // Get validated ranges for similar device
  static getValidatedRangesForDevice(deviceInfo: DeviceInfo): ParameterRange | null {
    const similarResults = this.validationHistory.filter(result => {
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

    // Aggregate validated ranges from similar devices
    const aggregatedRanges: ParameterRange = {
      throttleInterval: { min: 8, max: 50, step: 2 },
      debounceDelay: { min: 25, max: 300, step: 25 },
      touchThreshold: { min: 5, max: 15, step: 1 },
      touchDelay: { min: 50, max: 500, step: 50 },
      maxConcurrentAnimations: { min: 1, max: 10, step: 1 },
    };

    // Calculate average recommended ranges
    for (const result of similarResults) {
      for (const validationResult of result.validationResults) {
        const param = validationResult.parameter as keyof ParameterRange;
        const current = aggregatedRanges[param];
        const recommended = validationResult.recommendedRange;
        
        aggregatedRanges[param] = {
          min: Math.min(current.min, recommended.min),
          max: Math.max(current.max, recommended.max),
          step: Math.min(current.step, recommended.step),
        };
      }
    }

    return aggregatedRanges;
  }

  // Clear validation history
  static clearValidationHistory(): void {
    this.validationHistory = [];
    localStorage.removeItem('parameterValidationHistory');
  }

  // Get device categories
  static getDeviceCategories(): DeviceCategory[] {
    return [...this.deviceCategories];
  }

  // Update device categories
  static updateDeviceCategories(categories: DeviceCategory[]): void {
    this.deviceCategories = [...categories];
  }
} 