import { PerformanceTestingService, DeviceInfo } from './performanceTestingService';
import { AdvancedPerformanceTuningService, PerformanceTuningProfile } from './advancedPerformanceTuningService';
import { ParameterOptimizationService, OptimizationResult } from './parameterOptimizationService';
import { ParameterValidationService, ValidationResult } from './parameterValidationService';

export interface DeviceCluster {
  id: string;
  name: string;
  devices: DeviceInfo[];
  centroid: DeviceInfo;
  performanceProfiles: PerformanceTuningProfile[];
  averageImprovement: number;
  confidence: number;
  lastUpdated: number;
}

export interface LearningModel {
  version: string;
  clusters: DeviceCluster[];
  globalOptimizations: {
    throttleInterval: { mean: number; std: number; confidence: number };
    debounceDelay: { mean: number; std: number; confidence: number };
    touchThreshold: { mean: number; std: number; confidence: number };
    touchDelay: { mean: number; std: number; confidence: number };
    maxConcurrentAnimations: { mean: number; std: number; confidence: number };
  };
  learningRate: number;
  convergenceThreshold: number;
  lastTraining: number;
}

export interface CrossDeviceRecommendation {
  deviceInfo: DeviceInfo;
  recommendedProfile: PerformanceTuningProfile;
  confidence: number;
  reasoning: string;
  similarDevices: DeviceInfo[];
  improvement: number;
}

export class CrossDeviceLearningService {
  private static learningModel: LearningModel;
  private static isInitialized = false;
  private static trainingQueue: Array<{ deviceInfo: DeviceInfo; result: OptimizationResult }> = [];
  private static isTraining = false;

  // Initialize cross-device learning service
  static initialize(): void {
    this.loadLearningModel();
    this.isInitialized = true;
    console.log('Cross-device learning service initialized');
  }

  // Load learning model from localStorage
  private static loadLearningModel(): void {
    try {
      const saved = localStorage.getItem('crossDeviceLearningModel');
      if (saved) {
        this.learningModel = JSON.parse(saved);
      } else {
        this.learningModel = this.createInitialModel();
      }
    } catch (error) {
      console.warn('Could not load learning model:', error);
      this.learningModel = this.createInitialModel();
    }
  }

  // Create initial learning model
  private static createInitialModel(): LearningModel {
    return {
      version: '1.0.0',
      clusters: [],
      globalOptimizations: {
        throttleInterval: { mean: 16, std: 8, confidence: 0.5 },
        debounceDelay: { mean: 100, std: 50, confidence: 0.5 },
        touchThreshold: { mean: 10, std: 3, confidence: 0.5 },
        touchDelay: { mean: 200, std: 100, confidence: 0.5 },
        maxConcurrentAnimations: { mean: 6, std: 2, confidence: 0.5 },
      },
      learningRate: 0.1,
      convergenceThreshold: 0.05,
      lastTraining: Date.now(),
    };
  }

  // Save learning model to localStorage
  private static saveLearningModel(): void {
    try {
      localStorage.setItem('crossDeviceLearningModel', JSON.stringify(this.learningModel));
    } catch (error) {
      console.warn('Could not save learning model:', error);
    }
  }

  // Add optimization result to training queue
  static addToTrainingQueue(deviceInfo: DeviceInfo, result: OptimizationResult): void {
    this.trainingQueue.push({ deviceInfo, result });
    
    // Trigger training if queue is large enough
    if (this.trainingQueue.length >= 5) {
      this.trainModel();
    }
  }

  // Train the learning model
  static async trainModel(): Promise<void> {
    if (this.isTraining || this.trainingQueue.length === 0) return;

    this.isTraining = true;
    console.log('Training cross-device learning model...');

    try {
      // Process training queue
      const trainingData = this.trainingQueue.splice(0);
      
      // Update device clusters
      await this.updateDeviceClusters(trainingData);
      
      // Update global optimizations
      this.updateGlobalOptimizations(trainingData);
      
      // Retrain clusters
      await this.retrainClusters();
      
      // Save updated model
      this.saveLearningModel();
      
      this.learningModel.lastTraining = Date.now();
      console.log('Cross-device learning model training completed');
      
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      this.isTraining = false;
    }
  }

  // Update device clusters with new data
  private static async updateDeviceClusters(
    trainingData: Array<{ deviceInfo: DeviceInfo; result: OptimizationResult }>
  ): Promise<void> {
    for (const { deviceInfo, result } of trainingData) {
      // Find best matching cluster
      let bestCluster: DeviceCluster | null = null;
      let bestSimilarity = 0;

      for (const cluster of this.learningModel.clusters) {
        const similarity = this.calculateDeviceSimilarity(deviceInfo, cluster.centroid);
        if (similarity > bestSimilarity && similarity > 0.7) {
          bestSimilarity = similarity;
          bestCluster = cluster;
        }
      }

      if (bestCluster) {
        // Add device to existing cluster
        bestCluster.devices.push(deviceInfo);
        bestCluster.performanceProfiles.push(result.optimizedProfile);
        bestCluster.averageImprovement = this.calculateAverageImprovement(bestCluster.performanceProfiles);
        bestCluster.confidence = this.calculateClusterConfidence(bestCluster);
        bestCluster.lastUpdated = Date.now();
      } else {
        // Create new cluster
        const newCluster: DeviceCluster = {
          id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: `Device Cluster ${this.learningModel.clusters.length + 1}`,
          devices: [deviceInfo],
          centroid: { ...deviceInfo },
          performanceProfiles: [result.optimizedProfile],
          averageImprovement: result.improvements.overall,
          confidence: 0.8,
          lastUpdated: Date.now(),
        };
        
        this.learningModel.clusters.push(newCluster);
      }
    }
  }

  // Update global optimizations
  private static updateGlobalOptimizations(
    trainingData: Array<{ deviceInfo: DeviceInfo; result: OptimizationResult }>
  ): void {
    const parameters = ['throttleInterval', 'debounceDelay', 'touchThreshold', 'touchDelay', 'maxConcurrentAnimations'];
    
    for (const param of parameters) {
      const values = trainingData.map(({ result }) => result.optimizedProfile[param as keyof PerformanceTuningProfile] as number);
      const improvements = trainingData.map(({ result }) => result.improvements.overall);
      
      // Calculate weighted mean and standard deviation
      const totalWeight = improvements.reduce((sum, imp) => sum + imp, 0);
      const weightedMean = values.reduce((sum, val, i) => sum + val * improvements[i], 0) / totalWeight;
      
      const weightedVariance = values.reduce((sum, val, i) => {
        const weight = improvements[i] / totalWeight;
        return sum + weight * Math.pow(val - weightedMean, 2);
      }, 0);
      
      const weightedStd = Math.sqrt(weightedVariance);
      
      // Update global optimization
      this.learningModel.globalOptimizations[param as keyof typeof this.learningModel.globalOptimizations] = {
        mean: weightedMean,
        std: weightedStd,
        confidence: Math.min(0.9, this.learningModel.globalOptimizations[param as keyof typeof this.learningModel.globalOptimizations].confidence + 0.1),
      };
    }
  }

  // Retrain clusters using K-means clustering
  private static async retrainClusters(): Promise<void> {
    if (this.learningModel.clusters.length < 2) return;

    // Extract device features for clustering
    const deviceFeatures = this.learningModel.clusters.flatMap(cluster => 
      cluster.devices.map(device => this.extractDeviceFeatures(device))
    );

    // Perform K-means clustering
    const k = Math.min(5, Math.ceil(this.learningModel.clusters.length / 2));
    const clusters = await this.kMeansClustering(deviceFeatures, k);

    // Update cluster centroids
    for (let i = 0; i < clusters.length; i++) {
      if (this.learningModel.clusters[i]) {
        const clusterDevices = clusters[i].map((_, index) => 
          this.learningModel.clusters.flatMap(c => c.devices)[index]
        ).filter(Boolean);
        
        if (clusterDevices.length > 0) {
          this.learningModel.clusters[i].centroid = this.calculateCentroid(clusterDevices);
          this.learningModel.clusters[i].devices = clusterDevices;
        }
      }
    }
  }

  // Extract device features for clustering
  private static extractDeviceFeatures(device: DeviceInfo): number[] {
    return [
      device.deviceMemory || 4,
      device.hardwareConcurrency || 4,
      device.deviceCapability,
      device.devicePixelRatio || 1,
      device.touchSupport ? 1 : 0,
    ];
  }

  // K-means clustering algorithm
  private static async kMeansClustering(features: number[][], k: number): Promise<number[][]> {
    // Initialize centroids randomly
    const centroids = this.initializeCentroids(features, k);
    const clusters = new Array(k).fill(0).map(() => [] as number[]);
    
    let converged = false;
    let iterations = 0;
    const maxIterations = 100;

    while (!converged && iterations < maxIterations) {
      // Assign points to nearest centroid
      for (let i = 0; i < features.length; i++) {
        let minDistance = Infinity;
        let bestCluster = 0;
        
        for (let j = 0; j < k; j++) {
          const distance = this.calculateEuclideanDistance(features[i], centroids[j]);
          if (distance < minDistance) {
            minDistance = distance;
            bestCluster = j;
          }
        }
        
        clusters[bestCluster].push(i);
      }

      // Update centroids
      const newCentroids = clusters.map(cluster => {
        if (cluster.length === 0) return centroids[0];
        
        const clusterFeatures = cluster.map(index => features[index]);
        return this.calculateCentroidFeatures(clusterFeatures);
      });

      // Check convergence
      const centroidChanges = newCentroids.map((centroid, i) => 
        this.calculateEuclideanDistance(centroid, centroids[i])
      );
      
      converged = centroidChanges.every(change => change < this.learningModel.convergenceThreshold);
      
      centroids.splice(0, centroids.length, ...newCentroids);
      iterations++;
    }

    return clusters;
  }

  // Initialize centroids for K-means
  private static initializeCentroids(features: number[][], k: number): number[][] {
    const centroids: number[][] = [];
    const featureCount = features[0].length;
    
    for (let i = 0; i < k; i++) {
      const centroid = new Array(featureCount).fill(0).map(() => Math.random());
      centroids.push(centroid);
    }
    
    return centroids;
  }

  // Calculate Euclidean distance between two feature vectors
  private static calculateEuclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  // Calculate centroid features
  private static calculateCentroidFeatures(features: number[][]): number[] {
    const featureCount = features[0].length;
    const centroid = new Array(featureCount).fill(0);
    
    for (const feature of features) {
      for (let i = 0; i < featureCount; i++) {
        centroid[i] += feature[i];
      }
    }
    
    return centroid.map(sum => sum / features.length);
  }

  // Calculate device similarity
  private static calculateDeviceSimilarity(device1: DeviceInfo, device2: DeviceInfo): number {
    const features1 = this.extractDeviceFeatures(device1);
    const features2 = this.extractDeviceFeatures(device2);
    
    const distance = this.calculateEuclideanDistance(features1, features2);
    const maxDistance = Math.sqrt(features1.length); // Maximum possible distance
    
    return Math.max(0, 1 - distance / maxDistance);
  }

  // Calculate average improvement for a cluster
  private static calculateAverageImprovement(profiles: PerformanceTuningProfile[]): number {
    if (profiles.length === 0) return 0;
    
    // Estimate improvement based on profile characteristics
    const improvements = profiles.map(profile => {
      const baseProfile = AdvancedPerformanceTuningService.getOptimalProfile();
      const throttleImprovement = (baseProfile.throttleInterval - profile.throttleInterval) / baseProfile.throttleInterval;
      const debounceImprovement = (baseProfile.debounceDelay - profile.debounceDelay) / baseProfile.debounceDelay;
      
      return (throttleImprovement + debounceImprovement) / 2;
    });
    
    return improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
  }

  // Calculate cluster confidence
  private static calculateClusterConfidence(cluster: DeviceCluster): number {
    const deviceCount = cluster.devices.length;
    const recency = Math.max(0, 1 - (Date.now() - cluster.lastUpdated) / (30 * 24 * 60 * 60 * 1000)); // 30 days
    
    return Math.min(1, (deviceCount / 10) * 0.6 + recency * 0.4);
  }

  // Calculate centroid from device list
  private static calculateCentroid(devices: DeviceInfo[]): DeviceInfo {
    if (devices.length === 0) {
      return {
        userAgent: '',
        platform: '',
        screenResolution: '',
        devicePixelRatio: 1,
        touchSupport: false,
        deviceCapability: 0.5,
      };
    }

    const centroid: DeviceInfo = {
      userAgent: devices[0].userAgent,
      platform: devices[0].platform,
      deviceMemory: devices.reduce((sum, d) => sum + (d.deviceMemory || 0), 0) / devices.length,
      hardwareConcurrency: devices.reduce((sum, d) => sum + (d.hardwareConcurrency || 0), 0) / devices.length,
      connectionType: devices[0].connectionType,
      batteryLevel: devices.reduce((sum, d) => sum + (d.batteryLevel || 0.5), 0) / devices.length,
      screenResolution: devices[0].screenResolution,
      devicePixelRatio: devices.reduce((sum, d) => sum + (d.devicePixelRatio || 1), 0) / devices.length,
      touchSupport: devices.some(d => d.touchSupport),
      deviceCapability: devices.reduce((sum, d) => sum + d.deviceCapability, 0) / devices.length,
    };

    return centroid;
  }

  // Get cross-device recommendation
  static getCrossDeviceRecommendation(deviceInfo: DeviceInfo): CrossDeviceRecommendation | null {
    if (!this.isInitialized) return null;

    // Find best matching cluster
    let bestCluster: DeviceCluster | null = null;
    let bestSimilarity = 0;

    for (const cluster of this.learningModel.clusters) {
      const similarity = this.calculateDeviceSimilarity(deviceInfo, cluster.centroid);
      if (similarity > bestSimilarity && similarity > 0.6) {
        bestSimilarity = similarity;
        bestCluster = cluster;
      }
    }

    if (!bestCluster) {
      // Use global optimizations
      const globalProfile = this.createProfileFromGlobalOptimizations();
      return {
        deviceInfo,
        recommendedProfile: globalProfile,
        confidence: this.learningModel.globalOptimizations.throttleInterval.confidence,
        reasoning: 'Using global optimizations (no similar devices found)',
        similarDevices: [],
        improvement: 0.1,
      };
    }

    // Create recommended profile from cluster
    const recommendedProfile = this.createProfileFromCluster(bestCluster);
    const improvement = bestCluster.averageImprovement;

    return {
      deviceInfo,
      recommendedProfile,
      confidence: bestCluster.confidence * bestSimilarity,
      reasoning: `Based on ${bestCluster.devices.length} similar devices`,
      similarDevices: bestCluster.devices,
      improvement,
    };
  }

  // Create profile from global optimizations
  private static createProfileFromGlobalOptimizations(): PerformanceTuningProfile {
    const baseProfile = AdvancedPerformanceTuningService.getOptimalProfile();
    const global = this.learningModel.globalOptimizations;

    return {
      ...baseProfile,
      throttleInterval: Math.round(global.throttleInterval.mean),
      debounceDelay: Math.round(global.debounceDelay.mean),
      touchThreshold: Math.round(global.touchThreshold.mean),
      touchDelay: Math.round(global.touchDelay.mean),
      maxConcurrentAnimations: Math.round(global.maxConcurrentAnimations.mean),
    };
  }

  // Create profile from cluster
  private static createProfileFromCluster(cluster: DeviceCluster): PerformanceTuningProfile {
    if (cluster.performanceProfiles.length === 0) {
      return this.createProfileFromGlobalOptimizations();
    }

    const baseProfile = AdvancedPerformanceTuningService.getOptimalProfile();
    const parameters = ['throttleInterval', 'debounceDelay', 'touchThreshold', 'touchDelay', 'maxConcurrentAnimations'];
    
    const profile = { ...baseProfile };
    
         for (const param of parameters) {
       const values = cluster.performanceProfiles.map(p => p[param as keyof PerformanceTuningProfile] as number);
       const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
       (profile as any)[param] = Math.round(mean);
     }

    return profile;
  }

  // Get learning model status
  static getLearningModelStatus(): {
    isInitialized: boolean;
    isTraining: boolean;
    clusterCount: number;
    trainingQueueLength: number;
    lastTraining: number;
    modelVersion: string;
  } {
    return {
      isInitialized: this.isInitialized,
      isTraining: this.isTraining,
      clusterCount: this.learningModel.clusters.length,
      trainingQueueLength: this.trainingQueue.length,
      lastTraining: this.learningModel.lastTraining,
      modelVersion: this.learningModel.version,
    };
  }

  // Get all clusters
  static getClusters(): DeviceCluster[] {
    return [...this.learningModel.clusters];
  }

  // Clear learning model
  static clearLearningModel(): void {
    this.learningModel = this.createInitialModel();
    this.trainingQueue = [];
    this.saveLearningModel();
  }

  // Update learning rate
  static updateLearningRate(rate: number): void {
    this.learningModel.learningRate = Math.max(0.01, Math.min(0.5, rate));
    this.saveLearningModel();
  }

  // Update convergence threshold
  static updateConvergenceThreshold(threshold: number): void {
    this.learningModel.convergenceThreshold = Math.max(0.01, Math.min(0.2, threshold));
    this.saveLearningModel();
  }
} 