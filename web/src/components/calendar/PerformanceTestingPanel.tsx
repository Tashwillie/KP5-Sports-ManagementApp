'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PerformanceTestingService, PerformanceTestResult, TestScenario, DeviceInfo } from '@web/lib/services/performanceTestingService';

interface PerformanceTestingPanelProps {
  onTestComplete?: (result: PerformanceTestResult) => void;
  onParametersOptimized?: (parameters: any) => void;
}

export function PerformanceTestingPanel({ 
  onTestComplete,
  onParametersOptimized 
}: PerformanceTestingPanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testMessage, setTestMessage] = useState('');
  const [currentTest, setCurrentTest] = useState<PerformanceTestResult | null>(null);
  const [testResults, setTestResults] = useState<PerformanceTestResult[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario>({
    name: 'Standard Touch Test',
    description: 'Simulates typical touch interactions',
    duration: 10,
    eventCount: 100,
    complexity: 'medium',
    interactionType: 'touch',
  });

  // Predefined test scenarios
  const testScenarios: TestScenario[] = [
    {
      name: 'Light Touch Test',
      description: 'Minimal touch interactions for low-end devices',
      duration: 5,
      eventCount: 50,
      complexity: 'low',
      interactionType: 'touch',
    },
    {
      name: 'Standard Touch Test',
      description: 'Typical touch interactions for most devices',
      duration: 10,
      eventCount: 100,
      complexity: 'medium',
      interactionType: 'touch',
    },
    {
      name: 'Heavy Touch Test',
      description: 'Intensive touch interactions for high-end devices',
      duration: 15,
      eventCount: 200,
      complexity: 'high',
      interactionType: 'touch',
    },
    {
      name: 'Mixed Interaction Test',
      description: 'Combined touch and mouse interactions',
      duration: 12,
      eventCount: 150,
      complexity: 'medium',
      interactionType: 'mixed',
    },
    {
      name: 'Drag and Drop Test',
      description: 'Focused on drag and drop performance',
      duration: 8,
      eventCount: 80,
      complexity: 'medium',
      interactionType: 'touch',
    },
  ];

  useEffect(() => {
    // Initialize testing service
    PerformanceTestingService.initialize();
    
    // Get device info
    const info = PerformanceTestingService.getDeviceInfo();
    setDeviceInfo(info);
    
    // Load existing test results
    const results = PerformanceTestingService.getTestResults();
    setTestResults(results);
  }, []);

  const handleRunTest = async () => {
    if (isTestRunning) return;

    setIsTestRunning(true);
    setTestProgress(0);
    setTestMessage('Initializing test...');

    try {
      const result = await PerformanceTestingService.runPerformanceTest(
        selectedScenario,
        (progress, message) => {
          setTestProgress(progress);
          setTestMessage(message);
        }
      );

      setCurrentTest(result);
      setTestResults(prev => [result, ...prev]);
      
      if (onTestComplete) {
        onTestComplete(result);
      }

      setTestMessage('Test completed successfully!');
    } catch (error) {
      setTestMessage(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestRunning(false);
    }
  };

  const handleOptimizeParameters = () => {
    if (!deviceInfo) return;

    const optimalParams = PerformanceTestingService.getOptimalParameters(deviceInfo);
    
    if (onParametersOptimized) {
      onParametersOptimized(optimalParams);
    }

    setTestMessage('Parameters optimized based on test results!');
  };

  const handleClearResults = () => {
    PerformanceTestingService.clearTestResults();
    setTestResults([]);
    setCurrentTest(null);
    setTestMessage('Test results cleared');
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

  const getRecommendationPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50"
        variant="outline"
      >
        {isVisible ? 'Hide' : 'Show'} Performance Testing
      </Button>

      {/* Testing Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Testing & Optimization</h2>
                <Button
                  onClick={() => setIsVisible(false)}
                  variant="outline"
                  size="sm"
                >
                  ×
                </Button>
              </div>

              {/* Device Information */}
              {deviceInfo && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold mb-3">Device Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Platform:</span>
                      <div className="text-gray-600">{deviceInfo.platform}</div>
                    </div>
                    <div>
                      <span className="font-medium">Memory:</span>
                      <div className="text-gray-600">{deviceInfo.deviceMemory || 'Unknown'} GB</div>
                    </div>
                    <div>
                      <span className="font-medium">CPU Cores:</span>
                      <div className="text-gray-600">{deviceInfo.hardwareConcurrency || 'Unknown'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Capability:</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getDeviceCapabilityColor(deviceInfo.deviceCapability)}`} />
                        <span className="text-gray-600">{getDeviceCapabilityLabel(deviceInfo.deviceCapability)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Screen:</span>
                      <div className="text-gray-600">{deviceInfo.screenResolution}</div>
                    </div>
                    <div>
                      <span className="font-medium">Pixel Ratio:</span>
                      <div className="text-gray-600">{deviceInfo.devicePixelRatio}x</div>
                    </div>
                    <div>
                      <span className="font-medium">Touch Support:</span>
                      <div className="text-gray-600">{deviceInfo.touchSupport ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <span className="font-medium">Connection:</span>
                      <div className="text-gray-600">{deviceInfo.connectionType || 'Unknown'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Configuration */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Test Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Scenario
                    </label>
                    <select
                      value={testScenarios.findIndex(s => s.name === selectedScenario.name)}
                      onChange={(e) => setSelectedScenario(testScenarios[parseInt(e.target.value)])}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={isTestRunning}
                    >
                      {testScenarios.map((scenario, index) => (
                        <option key={index} value={index}>
                          {scenario.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scenario Details
                    </label>
                    <div className="text-sm text-gray-600">
                      <div>Duration: {selectedScenario.duration}s</div>
                      <div>Events: {selectedScenario.eventCount}</div>
                      <div>Complexity: {selectedScenario.complexity}</div>
                      <div>Type: {selectedScenario.interactionType}</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{selectedScenario.description}</p>
              </div>

              {/* Test Controls */}
              <div className="flex space-x-4 mb-6">
                <Button
                  onClick={handleRunTest}
                  disabled={isTestRunning}
                  className="flex-1"
                >
                  {isTestRunning ? 'Running Test...' : 'Run Performance Test'}
                </Button>
                <Button
                  onClick={handleOptimizeParameters}
                  disabled={testResults.length === 0}
                  variant="outline"
                >
                  Optimize Parameters
                </Button>
                <Button
                  onClick={handleClearResults}
                  disabled={testResults.length === 0}
                  variant="outline"
                >
                  Clear Results
                </Button>
              </div>

              {/* Test Progress */}
              {isTestRunning && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Test Progress</span>
                    <span className="text-sm text-gray-500">{Math.round(testProgress * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${testProgress * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{testMessage}</p>
                </div>
              )}

              {/* Current Test Results */}
              {currentTest && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Latest Test Results</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">FPS</span>
                        <div className="text-2xl font-bold text-blue-600">
                          {currentTest.metrics.fps.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Latency</span>
                        <div className="text-2xl font-bold text-blue-600">
                          {currentTest.metrics.touchLatency.toFixed(0)}ms
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Frame Time</span>
                        <div className="text-2xl font-bold text-blue-600">
                          {currentTest.metrics.frameTime.toFixed(1)}ms
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Profile</span>
                        <div className="text-lg font-semibold text-blue-600">
                          {currentTest.profile.name.split('-').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {currentTest.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <div className="space-y-2">
                          {currentTest.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <Badge className={`text-xs ${getRecommendationPriorityColor(rec.priority)}`}>
                                {rec.priority}
                              </Badge>
                              <div className="flex-1">
                                <div className="text-sm font-medium">{rec.reason}</div>
                                <div className="text-xs text-gray-600">
                                  {rec.currentValue} → {rec.recommendedValue} ({rec.expectedImprovement})
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Test History */}
              {testResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Test History</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {testResults.slice(0, 10).map((result) => (
                      <div key={result.testId} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{result.testScenario.name}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(result.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{result.metrics.fps.toFixed(1)} FPS</div>
                            <div className="text-sm text-gray-600">
                              {result.metrics.touchLatency.toFixed(0)}ms latency
                            </div>
                          </div>
                        </div>
                        {result.recommendations.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">
                              {result.recommendations.length} recommendation(s)
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 