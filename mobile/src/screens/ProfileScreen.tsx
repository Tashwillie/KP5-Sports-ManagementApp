import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { User, UserRole } from '@kp5-academy/shared';
import { TextInput, Button, Card, Avatar, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
  });

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile({
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const getRoleDisplayName = (role: UserRole) => {
    const roleNames = {
      'super-admin': 'Super Admin',
      'club-admin': 'Club Admin',
      'coach': 'Coach',
      'player': 'Player',
      'parent': 'Parent',
      'referee': 'Referee',
    };
    return roleNames[role] || role;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image
          size={80}
          source={
            user.photoURL
              ? { uri: user.photoURL }
              : require('../../assets/default-avatar.png')
          }
        />
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.role}>{getRoleDisplayName(user.role)}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Profile Information" />
        <Card.Content>
          {isEditing ? (
            <View>
              <TextInput
                label="Display Name"
                value={formData.displayName}
                onChangeText={(text) =>
                  setFormData({ ...formData, displayName: text })
                }
                style={styles.input}
              />
              <TextInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, phoneNumber: text })
                }
                style={styles.input}
                keyboardType="phone-pad"
              />
              <TextInput
                label="Email"
                value={formData.email}
                editable={false}
                style={styles.input}
              />
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditing(false)}
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={loading}
                  style={styles.button}
                >
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.infoRow}>
                <MaterialIcons name="person" size={20} color="#666" />
                <Text style={styles.infoText}>{user.displayName}</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {user.phoneNumber || 'Not provided'}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={20} color="#666" />
                <Text style={styles.infoText}>{user.email}</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.infoRow}>
                <MaterialIcons name="badge" size={20} color="#666" />
                <Text style={styles.infoText}>
                  {getRoleDisplayName(user.role)}
                </Text>
              </View>
              <Button
                mode="outlined"
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Account Settings" />
        <Card.Content>
          <TouchableOpacity style={styles.settingRow}>
            <MaterialIcons name="notifications" size={20} color="#666" />
            <Text style={styles.settingText}>Notification Preferences</Text>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
          <Divider style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <MaterialIcons name="security" size={20} color="#666" />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
          <Divider style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <MaterialIcons name="help" size={20} color="#666" />
            <Text style={styles.settingText}>Help & Support</Text>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleSignOut}
        style={styles.signOutButton}
        textColor="#d32f2f"
      >
        Sign Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  divider: {
    marginVertical: 4,
  },
  editButton: {
    marginTop: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  signOutButton: {
    margin: 16,
    borderColor: '#d32f2f',
  },
});

export default ProfileScreen; 