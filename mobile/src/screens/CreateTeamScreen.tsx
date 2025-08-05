import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { tw } from '../utils/tailwind';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useMobileCreateTeam, useMobileClubs } from '../hooks/useMobileApi';
import { Team } from '../../../shared/src/types';

export default function CreateTeamScreen() {
  const navigation = useNavigation();
  const createTeamMutation = useMobileCreateTeam();
  const { data: clubs } = useMobileClubs([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clubId: '',
    ageGroup: {
      minAge: '',
      maxAge: '',
      category: ''
    },
    division: '',
    season: '',
    jerseyColors: {
      primary: '#3B82F6',
      secondary: '#1F2937'
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const ageGroupCategories = [
    'U6', 'U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'Senior'
  ];

  const divisions = [
    'Premier', 'Division 1', 'Division 2', 'Division 3', 'Recreation'
  ];

  const seasons = [
    '2024 Spring', '2024 Fall', '2024 Summer', '2025 Spring', '2025 Fall'
  ];

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }

    if (!formData.clubId) {
      Alert.alert('Error', 'Please select a club');
      return;
    }

    if (!formData.ageGroup.category) {
      Alert.alert('Error', 'Please select an age group');
      return;
    }

    if (!formData.division) {
      Alert.alert('Error', 'Please select a division');
      return;
    }

    if (!formData.season) {
      Alert.alert('Error', 'Please select a season');
      return;
    }

    setIsLoading(true);
    try {
      const teamData: Partial<Team> = {
        clubId: formData.clubId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        ageGroup: {
          minAge: parseInt(formData.ageGroup.minAge) || 0,
          maxAge: parseInt(formData.ageGroup.maxAge) || 0,
          category: formData.ageGroup.category
        },
        division: formData.division,
        season: formData.season,
        jerseyColors: formData.jerseyColors,
        roster: {
          players: [],
          coaches: [],
          managers: []
        },
        stats: {
          wins: 0,
          losses: 0,
          draws: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        },
        schedule: {
          practices: [],
          games: []
        },
        isActive: true
      };

      await createTeamMutation.mutateAsync(teamData);
      
      Alert.alert('Success', 'Team created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderSelectionModal = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={tw('mb-4')}>
      <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
        {title}
      </Text>
      <View style={tw('flex-row flex-wrap gap-2')}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            style={[
              tw('px-3 py-2 rounded-lg border'),
              selectedValue === option 
                ? tw('bg-blue-600 border-blue-600') 
                : tw('bg-white border-gray-300')
            ]}
          >
            <Text style={[
              tw('text-sm font-medium'),
              selectedValue === option ? tw('text-white') : tw('text-gray-700')
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-50')}>
      {/* Header */}
      <View style={tw('bg-white border-b border-gray-200 px-4 py-3')}>
        <View style={tw('flex-row items-center justify-between')}>
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={tw('text-lg font-semibold text-gray-900')}>Create Team</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isLoading}
            style={tw('bg-blue-600 px-4 py-2 rounded-lg')}
          >
            <Text style={tw('text-white font-medium')}>
              {isLoading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={tw('flex-1')} contentContainerStyle={tw('p-4')}>
        {/* Basic Information */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            Basic Information
          </Text>
          
          <View style={tw('space-y-4')}>
            <View>
              <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                Team Name *
              </Text>
              <Input
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter team name"
                style={tw('bg-gray-50 border-gray-200')}
              />
            </View>

            <View>
              <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                Description
              </Text>
              <Input
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter team description"
                multiline
                numberOfLines={3}
                style={tw('bg-gray-50 border-gray-200')}
              />
            </View>

            <View>
              <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                Club *
              </Text>
              <View style={tw('flex-row flex-wrap gap-2')}>
                {clubs?.map((club) => (
                  <TouchableOpacity
                    key={club.id}
                    onPress={() => setFormData(prev => ({ ...prev, clubId: club.id }))}
                    style={[
                      tw('px-3 py-2 rounded-lg border'),
                      formData.clubId === club.id 
                        ? tw('bg-blue-600 border-blue-600') 
                        : tw('bg-white border-gray-300')
                    ]}
                  >
                    <Text style={[
                      tw('text-sm font-medium'),
                      formData.clubId === club.id ? tw('text-white') : tw('text-gray-700')
                    ]}>
                      {club.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* Team Details */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            Team Details
          </Text>
          
          <View style={tw('space-y-4')}>
            {renderSelectionModal(
              'Age Group *',
              ageGroupCategories,
              formData.ageGroup.category,
              (category) => setFormData(prev => ({ 
                ...prev, 
                ageGroup: { ...prev.ageGroup, category } 
              }))
            )}

            <View style={tw('flex-row space-x-2')}>
              <View style={tw('flex-1')}>
                <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                  Min Age
                </Text>
                <Input
                  value={formData.ageGroup.minAge}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    ageGroup: { ...prev.ageGroup, minAge: text } 
                  }))}
                  placeholder="0"
                  keyboardType="numeric"
                  style={tw('bg-gray-50 border-gray-200')}
                />
              </View>
              <View style={tw('flex-1')}>
                <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                  Max Age
                </Text>
                <Input
                  value={formData.ageGroup.maxAge}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    ageGroup: { ...prev.ageGroup, maxAge: text } 
                  }))}
                  placeholder="0"
                  keyboardType="numeric"
                  style={tw('bg-gray-50 border-gray-200')}
                />
              </View>
            </View>

            {renderSelectionModal(
              'Division *',
              divisions,
              formData.division,
              (division) => setFormData(prev => ({ ...prev, division }))
            )}

            {renderSelectionModal(
              'Season *',
              seasons,
              formData.season,
              (season) => setFormData(prev => ({ ...prev, season }))
            )}
          </View>
        </Card>

        {/* Jersey Colors */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            Jersey Colors
          </Text>
          
          <View style={tw('space-y-4')}>
            <View>
              <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                Primary Color
              </Text>
              <View style={tw('flex-row items-center space-x-2')}>
                <View 
                  style={[
                    tw('w-8 h-8 rounded-lg border border-gray-300'),
                    { backgroundColor: formData.jerseyColors.primary }
                  ]} 
                />
                <Input
                  value={formData.jerseyColors.primary}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    jerseyColors: { ...prev.jerseyColors, primary: text } 
                  }))}
                  placeholder="#3B82F6"
                  style={tw('flex-1 bg-gray-50 border-gray-200')}
                />
              </View>
            </View>

            <View>
              <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                Secondary Color
              </Text>
              <View style={tw('flex-row items-center space-x-2')}>
                <View 
                  style={[
                    tw('w-8 h-8 rounded-lg border border-gray-300'),
                    { backgroundColor: formData.jerseyColors.secondary }
                  ]} 
                />
                <Input
                  value={formData.jerseyColors.secondary}
                  onChangeText={(text) => setFormData(prev => ({ 
                    ...prev, 
                    jerseyColors: { ...prev.jerseyColors, secondary: text } 
                  }))}
                  placeholder="#1F2937"
                  style={tw('flex-1 bg-gray-50 border-gray-200')}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={tw('space-y-3')}>
          <Button
            title="Create Team"
            onPress={handleSave}
            variant="primary"
            size="lg"
            loading={isLoading}
          />
          
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="secondary"
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 