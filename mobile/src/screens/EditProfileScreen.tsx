import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { tw } from '../utils/tailwind';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useMobileAuth, useMobileUpdateUser } from '../hooks/useMobileApi';
import { User } from '../../../shared/src/types';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user } = useMobileAuth();
  const updateUserMutation = useMobileUpdateUser();
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    photoURL: user?.photoURL || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'No user found');
      return;
    }

    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        userData: {
          displayName: formData.displayName.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
          photoURL: formData.photoURL.trim() || undefined,
        }
      });
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleChangePhoto = () => {
    // TODO: Implement photo upload functionality
    Alert.alert('Coming Soon', 'Photo upload functionality will be available soon.');
  };

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-50')}>
      {/* Header */}
      <View style={tw('bg-white border-b border-gray-200 px-4 py-3')}>
        <View style={tw('flex-row items-center justify-between')}>
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={tw('text-lg font-semibold text-gray-900')}>Edit Profile</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isLoading}
            style={tw('bg-blue-600 px-4 py-2 rounded-lg')}
          >
            <Text style={tw('text-white font-medium')}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={tw('flex-1')} contentContainerStyle={tw('p-4')}>
        {/* Profile Photo Section */}
        <Card style={tw('mb-6')}>
          <View style={tw('items-center py-6')}>
            <View style={tw('relative')}>
              {formData.photoURL ? (
                <Image 
                  source={{ uri: formData.photoURL }} 
                  style={tw('w-24 h-24 rounded-full')}
                />
              ) : (
                <View style={tw('w-24 h-24 rounded-full bg-gray-300 items-center justify-center')}>
                  <Ionicons name="person" size={48} color="#6B7280" />
                </View>
              )}
              <TouchableOpacity 
                onPress={handleChangePhoto}
                style={tw('absolute bottom-0 right-0 bg-blue-600 w-8 h-8 rounded-full items-center justify-center')}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              onPress={handleChangePhoto}
              style={tw('mt-3')}
            >
              <Text style={tw('text-blue-600 font-medium')}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Profile Information */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            Personal Information
          </Text>
          
          <View style={tw('space-y-4')}>
            <View>
              <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                Display Name *
              </Text>
              <Input
                value={formData.displayName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, displayName: text }))}
                placeholder="Enter your display name"
                style={tw('bg-gray-50 border-gray-200')}
              />
            </View>

            <View>
              <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                Email
              </Text>
              <Input
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
                style={tw('bg-gray-100 border-gray-200')}
              />
              <Text style={tw('text-xs text-gray-500 mt-1')}>
                Email cannot be changed
              </Text>
            </View>

            <View>
              <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                Phone Number
              </Text>
              <Input
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View>
              <Text style={tw('text-sm font-medium text-gray-700 mb-1')}>
                Profile Photo URL
              </Text>
              <Input
                value={formData.photoURL}
                onChangeText={(text) => setFormData(prev => ({ ...prev, photoURL: text }))}
                placeholder="Enter photo URL (optional)"
                autoCapitalize="none"
              />
            </View>
          </View>
        </Card>

        {/* Account Information */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            Account Information
          </Text>
          
          <View style={tw('space-y-3')}>
            <View style={tw('flex-row justify-between items-center py-2')}>
              <Text style={tw('text-sm text-gray-600')}>User ID</Text>
              <Text style={tw('text-sm font-mono text-gray-900')}>
                {user?.id || 'N/A'}
              </Text>
            </View>
            
            <View style={tw('flex-row justify-between items-center py-2')}>
              <Text style={tw('text-sm text-gray-600')}>Role</Text>
              <Text style={tw('text-sm font-medium text-gray-900 capitalize')}>
                {user?.role?.replace('_', ' ') || 'N/A'}
              </Text>
            </View>
            
            <View style={tw('flex-row justify-between items-center py-2')}>
              <Text style={tw('text-sm text-gray-600')}>Member Since</Text>
              <Text style={tw('text-sm text-gray-900')}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            
            <View style={tw('flex-row justify-between items-center py-2')}>
              <Text style={tw('text-sm text-gray-600')}>Status</Text>
              <View style={tw('flex-row items-center')}>
                <View style={[
                  tw('w-2 h-2 rounded-full mr-2'),
                  user?.isActive ? tw('bg-green-500') : tw('bg-red-500')
                ]} />
                <Text style={tw('text-sm font-medium')}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={tw('space-y-3')}>
          <Button
            title="Save Changes"
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