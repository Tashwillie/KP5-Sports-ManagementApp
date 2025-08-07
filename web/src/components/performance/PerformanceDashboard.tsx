'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PerformanceTestingPanel } from '../calendar/PerformanceTestingPanel';
import { AdvancedPerformanceMonitor } from '../calendar/AdvancedPerformanceMonitor';
import { PerformanceOptimizedTouchService } from '../../lib/services/performanceOptimizedTouchService';
import { ParameterValidationService, ValidationResult } from '../../lib/services/parameterValidationService';
import { HapticFeedbackService, HapticConfig } from '../../lib/services/hapticFeedbackService';
import { CrossDeviceLearningService, DeviceCluster } from '../../lib/services/crossDeviceLearningService';
import { PerformanceTestingService, DeviceInfo } from '../../lib/services/performanceTestingService';

interface PerformanceDashboardProps {
  onProfileChange?: (profile: any) => void;
  onOptimizationComplete?: (result: any) => void;
}

export function PerformanceDashboard({ 
  onProfileChange,
  onOptimizationComplete 
}: PerformanceDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [hapticConfig, setHapticConfig] = useState<HapticConfig | null>(null);
  const [deviceClusters, setDeviceClusters] = useState<DeviceCluster[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'testing' | 'validation' | 'haptic' | 'learning'>('overview');

  useEffect(() => {
    // Initialize all services
    PerformanceOptimizedTouchService.initialize();
    
    // Get device information
    const info = PerformanceTestingService.getDeviceInfo();
    setDeviceInfo(info);
    
    // Get current profile
    const profile = PerformanceOptimizedTouchService.getCurrentProfile();
    setCurrentProfile(profile);
    
    // Get haptic configuration
    const haptic = HapticFeedbackService.getConfig();
    setHapticConfig(haptic);
    
    // Get device clusters
    const clusters = CrossDeviceLearningService.getClusters();
    setDeviceClusters(clusters);
    
    // Load validation results
    const validationHistory = ParameterValidationService.getValidationHistory();
    if (validationHistory.length > 0) {
      const latestValidation = validationHistory[validationHistory.length - 1];
      setValidationResults(latestValidation.validationResults || []);
    }
  }, []);

  const handleRunValidation = async () => {
    if (!deviceInfo || isValidating) return;

    setIsValidating(true);
    try {
      const results = await ParameterValidationService.validateParameterRanges(deviceInfo, {
        testIterations: 3,
        stabilityThreshold: 0.1,
        performanceWeight: 0.7,
        stabilityWeight: 0.3,
        minConfidence: 0.6,
      });

      setValidationResults(results);
      
      // Apply validated parameters
      if (results.length > 0) {
        const validatedRanges = ParameterValidationService.getValidatedRangesForDevice(deviceInfo);
        if (validatedRanges) {
          // Update optimization service with validated ranges
          // This would integrate with your backend
          console.log('Validated ranges:', validatedRanges);
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleTrainModel = async () => {
    if (isTraining) return;

    setIsTraining(true);
    try {
      await CrossDeviceLearningService.trainModel();
      
      // Update clusters
      const clusters = CrossDeviceLearningService.getClusters();
      setDeviceClusters(clusters);
      
      console.log('Model training completed');
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const handleHapticConfigChange = (config: Partial<HapticConfig>) => {
    if (!hapticConfig) return;

    const newConfig = { ...hapticConfig, ...config };
    setHapticConfig(newConfig);

    // Apply haptic configuration
    if (config.enabled !== undefined) {
      HapticFeedbackService.setEnabled(config.enabled);
    }
    if (config.intensity) {
      HapticFeedbackService.setIntensity(config.intensity);
    }
  };

  const handleProfileChange = (profile: any) => {
    setCurrentProfile(profile);
    if (onProfileChange) {
      onProfileChange(profile);
    }
  };

  const getDeviceCapabilityLabel = (capability: number) => {
    if (capability >= 0.8) return 'Ultra High';
    if (capability >= 0.6) return 'High';
    if (capability >= 0.4) return 'Medium';
    if (capability >= 0.2) return 'Low';
    return 'Very Low';
  };

  const getDeviceCapabilityColor = (capability: number) => {
    if (capability >= 0.8) return 'bg-purple-500';
    if (capability >= 0.6) return 'bg-green-500';
    if (capability >= 0.4) return 'bg-blue-500';
    if (capability >= 0.2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50"
        variant="outline"
      >
        {isVisible ? 'Hide' : 'Show'} Performance Dashboard
      </Button>

      {/* Dashboard Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="outline"
                  size="sm"
                >
                  ×
                </Button>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'testing', label: 'Testing' },
                  { id: 'validation', label: 'Validation' },
                  { id: 'haptic', label: 'Haptic' },
                  { id: 'learning', label: 'Learning' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Device Information */}
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-3">Device Information</h3>
                      {deviceInfo && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Platform:</span>
                            <span className="font-medium">{deviceInfo.platform}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Memory:</span>
                            <span className="font-medium">{deviceInfo.deviceMemory || 'Unknown'} GB</span>
                          </div>
                          <div className="flex justify-between">
                            <span>CPU Cores:</span>
                            <span className="font-medium">{deviceInfo.hardwareConcurrency || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Capability:</span>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${getDeviceCapabilityColor(deviceInfo.deviceCapability)}`} />
                              <span className="font-medium">{getDeviceCapabilityLabel(deviceInfo.deviceCapability)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span>Touch Support:</span>
                            <span className="font-medium">{deviceInfo.touchSupport ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Current Profile */}
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-3">Current Profile</h3>
                      {currentProfile && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Profile:</span>
                            <span className="font-medium">
                              {currentProfile.name.split('-').map((word: string) => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>FPS Target:</span>
                            <span className="font-medium">{currentProfile.fps}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Throttle Interval:</span>
                            <span className="font-medium">{currentProfile.throttleInterval}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Debounce Delay:</span>
                            <span className="font-medium">{currentProfile.debounceDelay}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Touch Threshold:</span>
                            <span className="font-medium">{currentProfile.touchThreshold}px</span>
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Performance Monitor */}
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-3">Performance Monitor</h3>
                      <AdvancedPerformanceMonitor
                        enabled={true}
                        showDetails={false}
                        showTuningInfo={false}
                        position="static"
                      />
                    </Card>

                    {/* Haptic Status */}
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-3">Haptic Feedback</h3>
                      {hapticConfig && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <Badge className={hapticConfig.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {hapticConfig.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Intensity:</span>
                            <span className="font-medium capitalize">{hapticConfig.intensity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Support:</span>
                            <span className="font-medium">{HapticFeedbackService.isHapticSupported() ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Learning Status */}
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-3">Cross-Device Learning</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {CrossDeviceLearningService.getLearningModelStatus().isTraining ? 'Training' : 'Ready'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Clusters:</span>
                          <span className="font-medium">{deviceClusters.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Model Version:</span>
                          <span className="font-medium">{CrossDeviceLearningService.getLearningModelStatus().modelVersion}</span>
                        </div>
                      </div>
                    </Card>

                    {/* Validation Status */}
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-3">Parameter Validation</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <Badge className={isValidating ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                            {isValidating ? 'Validating' : 'Ready'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Results:</span>
                          <span className="font-medium">{validationResults.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>History:</span>
                          <span className="font-medium">{ParameterValidationService.getValidationHistory().length}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Testing Tab */}
                {activeTab === 'testing' && (
                  <div>
                    <PerformanceTestingPanel
                      onTestComplete={(result) => {
                        console.log('Test completed:', result);
                        if (onOptimizationComplete) {
                          onOptimizationComplete(result);
                        }
                      }}
                      onParametersOptimized={(parameters) => {
                        console.log('Parameters optimized:', parameters);
                        handleProfileChange(parameters);
                      }}
                    />
                  </div>
                )}

                {/* Validation Tab */}
                {activeTab === 'validation' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Parameter Validation</h3>
                      <Button
                        onClick={handleRunValidation}
                        disabled={isValidating}
                        className="flex items-center space-x-2"
                      >
                        {isValidating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Validating...</span>
                          </>
                        ) : (
                          <>
                            <span>Run Validation</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {validationResults.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {validationResults.map((result, index) => (
                          <Card key={index} className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold capitalize">{result.parameter}</h4>
                              <Badge className={getConfidenceColor(result.confidence)}>
                                {Math.round(result.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Current Range:</span>
                                <span>{result.currentRange.min}-{result.currentRange.max}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Recommended:</span>
                                <span>{result.recommendedRange.min}-{result.recommendedRange.max}</span>
                              </div>
                              <div className="text-xs text-gray-600 mt-2">
                                {result.reasoning}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Haptic Tab */}
                {activeTab === 'haptic' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Haptic Feedback Configuration</h3>
                    
                    {hapticConfig && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-4">
                          <h4 className="font-semibold mb-3">General Settings</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Enable Haptic Feedback</span>
                              <input
                                type="checkbox"
                                checked={hapticConfig.enabled}
                                onChange={(e) => handleHapticConfigChange({ enabled: e.target.checked })}
                                className="rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Intensity</label>
                              <select
                                value={hapticConfig.intensity}
                                onChange={(e) => handleHapticConfigChange({ intensity: e.target.value as any })}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              >
                                <option value="light">Light</option>
                                <option value="medium">Medium</option>
                                <option value="heavy">Heavy</option>
                              </select>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <h4 className="font-semibold mb-3">Patterns</h4>
                          <div className="space-y-3">
                            {Object.entries(hapticConfig.patterns).map(([type, pattern]) => (
                              <div key={type} className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium capitalize">{type}</div>
                                  <div className="text-xs text-gray-600">{pattern.description}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{pattern.duration}ms</div>
                                  <div className="text-xs text-gray-600 capitalize">{pattern.intensity}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                {/* Learning Tab */}
                {activeTab === 'learning' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Cross-Device Learning</h3>
                      <Button
                        onClick={handleTrainModel}
                        disabled={isTraining}
                        className="flex items-center space-x-2"
                      >
                        {isTraining ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Training...</span>
                          </>
                        ) : (
                          <>
                            <span>Train Model</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Device Clusters</h4>
                        <div className="space-y-3">
                          {deviceClusters.map((cluster, index) => (
                            <div key={cluster.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium">{cluster.name}</div>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {cluster.devices.length} devices
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                Confidence: {Math.round(cluster.confidence * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">
                                Avg Improvement: {Math.round(cluster.averageImprovement * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">Learning Status</h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(CrossDeviceLearningService.getLearningModelStatus()).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.split(/(?=[A-Z])/).join(' ').toLowerCase()}:</span>
                              <span className="font-medium">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 