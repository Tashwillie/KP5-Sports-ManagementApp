'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdvancedPerformanceTuningService, PerformanceTuningProfile } from '../../lib/services/advancedPerformanceTuningService';
import { ParameterValidationService, DeviceCategory } from '../../lib/services/parameterValidationService';
import { HapticFeedbackService, HapticPattern } from '../../lib/services/hapticFeedbackService';
import { CrossDeviceLearningService } from '../../lib/services/crossDeviceLearningService';

interface PerformanceSettingsProps {
  onSettingsChange?: (settings: any) => void;
}

export function PerformanceSettings({ onSettingsChange }: PerformanceSettingsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<PerformanceTuningProfile | null>(null);
  const [deviceCategories, setDeviceCategories] = useState<DeviceCategory[]>([]);
  const [hapticPatterns, setHapticPatterns] = useState<any>(null);
  const [learningRate, setLearningRate] = useState(0.1);
  const [convergenceThreshold, setConvergenceThreshold] = useState(0.05);
  const [activeSection, setActiveSection] = useState<'profiles' | 'validation' | 'haptic' | 'learning'>('profiles');

  useEffect(() => {
    // Load current settings
    const profile = AdvancedPerformanceTuningService.getCurrentProfile();
    setCurrentProfile(profile);
    
    const categories = ParameterValidationService.getDeviceCategories();
    setDeviceCategories(categories);
    
    const patterns = HapticFeedbackService.getDefaultPatterns();
    setHapticPatterns(patterns);
    
    const learningStatus = CrossDeviceLearningService.getLearningModelStatus();
    setLearningRate(learningStatus.learningRate || 0.1);
    setConvergenceThreshold(learningStatus.convergenceThreshold || 0.05);
  }, []);

  const handleProfileChange = (profileName: string) => {
    const profiles = AdvancedPerformanceTuningService.getAllProfiles();
    const selectedProfile = profiles.find(p => p.name === profileName);
    if (selectedProfile) {
      setCurrentProfile(selectedProfile);
      if (onSettingsChange) {
        onSettingsChange({ type: 'profile', profile: selectedProfile });
      }
    }
  };

  const handleCategoryUpdate = (categoryIndex: number, field: string, value: any) => {
    const updatedCategories = [...deviceCategories];
    if (field === 'criteria') {
      updatedCategories[categoryIndex].criteria = { ...updatedCategories[categoryIndex].criteria, ...value };
    } else if (field === 'recommendedRanges') {
      updatedCategories[categoryIndex].recommendedRanges = { ...updatedCategories[categoryIndex].recommendedRanges, ...value };
    }
    setDeviceCategories(updatedCategories);
    ParameterValidationService.updateDeviceCategories(updatedCategories);
  };

  const handleHapticPatternUpdate = (type: string, field: string, value: any) => {
    if (!hapticPatterns) return;
    
    const updatedPatterns = { ...hapticPatterns };
    updatedPatterns[type] = { ...updatedPatterns[type], [field]: value };
    setHapticPatterns(updatedPatterns);
    
    HapticFeedbackService.updatePattern(type as any, updatedPatterns[type]);
  };

  const handleLearningRateChange = (rate: number) => {
    setLearningRate(rate);
    CrossDeviceLearningService.updateLearningRate(rate);
  };

  const handleConvergenceThresholdChange = (threshold: number) => {
    setConvergenceThreshold(threshold);
    CrossDeviceLearningService.updateConvergenceThreshold(threshold);
  };

  const resetToDefaults = () => {
    // Reset all settings to defaults
    AdvancedPerformanceTuningService.resetToOptimal();
    HapticFeedbackService.resetToDefaults();
    CrossDeviceLearningService.clearLearningModel();
    
    // Reload settings
    const profile = AdvancedPerformanceTuningService.getCurrentProfile();
    setCurrentProfile(profile);
    
    const patterns = HapticFeedbackService.getDefaultPatterns();
    setHapticPatterns(patterns);
    
    setLearningRate(0.1);
    setConvergenceThreshold(0.05);
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50"
        variant="outline"
      >
        {isVisible ? 'Hide' : 'Show'} Performance Settings
      </Button>

      {/* Settings Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Settings</h2>
                <div className="flex space-x-2">
                  <Button
                    onClick={resetToDefaults}
                    variant="outline"
                    size="sm"
                  >
                    Reset to Defaults
                  </Button>
                  <Button
                    onClick={() => setIsVisible(false)}
                    variant="outline"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>
              </div>

              {/* Section Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'profiles', label: 'Performance Profiles' },
                  { id: 'validation', label: 'Device Categories' },
                  { id: 'haptic', label: 'Haptic Patterns' },
                  { id: 'learning', label: 'Learning Settings' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Section Content */}
              <div className="space-y-6">
                {/* Performance Profiles Section */}
                {activeSection === 'profiles' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Performance Profiles</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {AdvancedPerformanceTuningService.getAllProfiles().map((profile) => (
                        <Card 
                          key={profile.name} 
                          className={`p-4 cursor-pointer transition-colors ${
                            currentProfile?.name === profile.name 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleProfileChange(profile.name)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold capitalize">
                              {profile.name.split('-').map((word: string) => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </h4>
                            {currentProfile?.name === profile.name && (
                              <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{profile.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>FPS: {profile.fps}</div>
                            <div>Throttle: {profile.throttleInterval}ms</div>
                            <div>Debounce: {profile.debounceDelay}ms</div>
                            <div>Touch: {profile.touchThreshold}px</div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Device Categories Section */}
                {activeSection === 'validation' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Device Categories</h3>
                    
                    <div className="space-y-4">
                      {deviceCategories.map((category, index) => (
                        <Card key={category.name} className="p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-semibold">{category.name}</h4>
                            <Badge className="bg-green-100 text-green-800">
                              {category.devices?.length || 0} devices
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium mb-2">Criteria</h5>
                              <div className="space-y-2 text-sm">
                                {Object.entries(category.criteria).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key}:</span>
                                    <input
                                      type="number"
                                      value={value || ''}
                                      onChange={(e) => handleCategoryUpdate(index, 'criteria', { [key]: parseFloat(e.target.value) || undefined })}
                                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="Value"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-medium mb-2">Recommended Ranges</h5>
                              <div className="space-y-2 text-sm">
                                {Object.entries(category.recommendedRanges).map(([param, range]) => (
                                  <div key={param} className="space-y-1">
                                    <div className="font-medium capitalize">{param}</div>
                                    <div className="grid grid-cols-3 gap-1">
                                      <input
                                        type="number"
                                        value={range.min}
                                        onChange={(e) => handleCategoryUpdate(index, 'recommendedRanges', { 
                                          [param]: { ...range, min: parseFloat(e.target.value) || 0 }
                                        })}
                                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="Min"
                                      />
                                      <input
                                        type="number"
                                        value={range.max}
                                        onChange={(e) => handleCategoryUpdate(index, 'recommendedRanges', { 
                                          [param]: { ...range, max: parseFloat(e.target.value) || 0 }
                                        })}
                                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="Max"
                                      />
                                      <input
                                        type="number"
                                        value={range.step}
                                        onChange={(e) => handleCategoryUpdate(index, 'recommendedRanges', { 
                                          [param]: { ...range, step: parseFloat(e.target.value) || 1 }
                                        })}
                                        className="px-2 py-1 border border-gray-300 rounded text-xs"
                                        placeholder="Step"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Haptic Patterns Section */}
                {activeSection === 'haptic' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Haptic Patterns</h3>
                    
                    {hapticPatterns && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(hapticPatterns).map(([type, pattern]) => (
                          <Card key={type} className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold capitalize">{type}</h4>
                              <select
                                value={pattern.intensity}
                                onChange={(e) => handleHapticPatternUpdate(type, 'intensity', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="light">Light</option>
                                <option value="medium">Medium</option>
                                <option value="heavy">Heavy</option>
                              </select>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                            
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium mb-1">Pattern (ms)</label>
                                <input
                                  type="text"
                                  value={pattern.pattern.join(', ')}
                                  onChange={(e) => {
                                    const values = e.target.value.split(',').map(v => parseInt(v.trim()) || 0);
                                    handleHapticPatternUpdate(type, 'pattern', values);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="10, 20, 10"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Duration (ms)</label>
                                <input
                                  type="number"
                                  value={pattern.duration}
                                  onChange={(e) => handleHapticPatternUpdate(type, 'duration', parseInt(e.target.value) || 0)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Learning Settings Section */}
                {activeSection === 'learning' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Learning Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-4">
                        <h4 className="font-semibold mb-4">Model Configuration</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Learning Rate</label>
                            <input
                              type="range"
                              min="0.01"
                              max="0.5"
                              step="0.01"
                              value={learningRate}
                              onChange={(e) => handleLearningRateChange(parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>0.01</span>
                              <span>{learningRate.toFixed(2)}</span>
                              <span>0.5</span>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Convergence Threshold</label>
                            <input
                              type="range"
                              min="0.01"
                              max="0.2"
                              step="0.01"
                              value={convergenceThreshold}
                              onChange={(e) => handleConvergenceThresholdChange(parseFloat(e.target.value))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>0.01</span>
                              <span>{convergenceThreshold.toFixed(2)}</span>
                              <span>0.2</span>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-semibold mb-4">Model Status</h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(CrossDeviceLearningService.getLearningModelStatus()).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="font-medium">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Button
                            onClick={() => CrossDeviceLearningService.clearLearningModel()}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Clear Learning Model
                          </Button>
                          <Button
                            onClick={() => CrossDeviceLearningService.trainModel()}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Force Training
                          </Button>
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