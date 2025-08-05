import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { ClubService } from '../services/clubService';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  HelperText,
  Switch,
  Divider 
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type CreateClubScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateClub'>;

const CreateClubScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<CreateClubScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoURL: '',
    bannerURL: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    contact: {
      email: '',
      phone: '',
      website: '',
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: '',
    },
    settings: {
      isPublic: false,
      allowRegistration: true,
      requireApproval: true,
      maxTeams: 10,
      maxPlayersPerTeam: 20,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Club description is required';
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.contact.email.trim()) {
      newErrors.email = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a club');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const clubId = await ClubService.createClub({
        ...formData,
        createdBy: user.id,
      });

      // Add the creator as the club owner
      await ClubService.addMemberToClub(clubId, user.id, 'owner');

      Alert.alert(
        'Success',
        'Club created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ClubDetails', { clubId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const updateContact = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const updateSocialMedia = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [field]: value,
      },
    }));
  };

  const updateSettings = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Create New Club</Title>
        <Text style={styles.subtitle}>
          Set up your sports club and start managing teams
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Basic Information</Title>
          
          <TextInput
            label="Club Name *"
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
            style={styles.input}
            error={!!errors.name}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>

          <TextInput
            label="Description *"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            style={styles.input}
            multiline
            numberOfLines={3}
            error={!!errors.description}
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>

          <TextInput
            label="Logo URL (optional)"
            value={formData.logoURL}
            onChangeText={(text) => updateFormData('logoURL', text)}
            style={styles.input}
            placeholder="https://example.com/logo.png"
          />

          <TextInput
            label="Banner URL (optional)"
            value={formData.bannerURL}
            onChangeText={(text) => updateFormData('bannerURL', text)}
            style={styles.input}
            placeholder="https://example.com/banner.png"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Address</Title>
          
          <TextInput
            label="Street Address"
            value={formData.address.street}
            onChangeText={(text) => updateAddress('street', text)}
            style={styles.input}
          />

          <TextInput
            label="City *"
            value={formData.address.city}
            onChangeText={(text) => updateAddress('city', text)}
            style={styles.input}
            error={!!errors.city}
          />
          <HelperText type="error" visible={!!errors.city}>
            {errors.city}
          </HelperText>

          <TextInput
            label="State/Province *"
            value={formData.address.state}
            onChangeText={(text) => updateAddress('state', text)}
            style={styles.input}
            error={!!errors.state}
          />
          <HelperText type="error" visible={!!errors.state}>
            {errors.state}
          </HelperText>

          <TextInput
            label="ZIP/Postal Code"
            value={formData.address.zipCode}
            onChangeText={(text) => updateAddress('zipCode', text)}
            style={styles.input}
          />

          <TextInput
            label="Country"
            value={formData.address.country}
            onChangeText={(text) => updateAddress('country', text)}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Contact Information</Title>
          
          <TextInput
            label="Contact Email *"
            value={formData.contact.email}
            onChangeText={(text) => updateContact('email', text)}
            style={styles.input}
            keyboardType="email-address"
            error={!!errors.email}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          <TextInput
            label="Phone Number"
            value={formData.contact.phone}
            onChangeText={(text) => updateContact('phone', text)}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TextInput
            label="Website"
            value={formData.contact.website}
            onChangeText={(text) => updateContact('website', text)}
            style={styles.input}
            keyboardType="url"
            placeholder="https://example.com"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Social Media (Optional)</Title>
          
          <TextInput
            label="Facebook"
            value={formData.socialMedia.facebook}
            onChangeText={(text) => updateSocialMedia('facebook', text)}
            style={styles.input}
            placeholder="https://facebook.com/yourclub"
          />

          <TextInput
            label="Twitter"
            value={formData.socialMedia.twitter}
            onChangeText={(text) => updateSocialMedia('twitter', text)}
            style={styles.input}
            placeholder="https://twitter.com/yourclub"
          />

          <TextInput
            label="Instagram"
            value={formData.socialMedia.instagram}
            onChangeText={(text) => updateSocialMedia('instagram', text)}
            style={styles.input}
            placeholder="https://instagram.com/yourclub"
          />

          <TextInput
            label="YouTube"
            value={formData.socialMedia.youtube}
            onChangeText={(text) => updateSocialMedia('youtube', text)}
            style={styles.input}
            placeholder="https://youtube.com/yourclub"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Club Settings</Title>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Public Club</Text>
            <Switch
              value={formData.settings.isPublic}
              onValueChange={(value) => updateSettings('isPublic', value)}
            />
          </View>
          <HelperText>
            Public clubs can be discovered by other users
          </HelperText>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Allow Registration</Text>
            <Switch
              value={formData.settings.allowRegistration}
              onValueChange={(value) => updateSettings('allowRegistration', value)}
            />
          </View>
          <HelperText>
            Allow users to request to join your club
          </HelperText>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Require Approval</Text>
            <Switch
              value={formData.settings.requireApproval}
              onValueChange={(value) => updateSettings('requireApproval', value)}
            />
          </View>
          <HelperText>
            Require admin approval for new members
          </HelperText>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Create Club
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  input: {
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  divider: {
    marginVertical: 12,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 12,
  },
});

export default CreateClubScreen; 