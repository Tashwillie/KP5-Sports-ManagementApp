import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Card, Button } from '../components/ui';

export default function AboutScreen() {
  const navigation = useNavigation();
  
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  const handleOpenLink = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${title}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${title}`);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to contact us:',
      [
        {
          text: 'Email',
          onPress: () => handleOpenLink('mailto:support@kp5academy.com', 'Email'),
        },
        {
          text: 'Phone',
          onPress: () => handleOpenLink('tel:+1234567890', 'Phone'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleShareApp = () => {
    // TODO: Implement share functionality
    Alert.alert('Share App', 'Share functionality will be implemented soon!');
  };

  const legalLinks = [
    {
      title: 'Terms of Service',
      icon: 'document-text-outline',
      onPress: () => handleOpenLink('https://kp5academy.com/terms', 'Terms of Service'),
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark-outline',
      onPress: () => handleOpenLink('https://kp5academy.com/privacy', 'Privacy Policy'),
    },
    {
      title: 'Cookie Policy',
      icon: 'cafe-outline',
      onPress: () => handleOpenLink('https://kp5academy.com/cookies', 'Cookie Policy'),
    },
    {
      title: 'Data Processing Agreement',
      icon: 'settings-outline',
      onPress: () => handleOpenLink('https://kp5academy.com/dpa', 'Data Processing Agreement'),
    },
  ];

  const developerInfo = [
    {
      title: 'Website',
      value: 'kp5academy.com',
      icon: 'globe-outline',
      onPress: () => handleOpenLink('https://kp5academy.com', 'Website'),
    },
    {
      title: 'Support Email',
      value: 'support@kp5academy.com',
      icon: 'mail-outline',
      onPress: () => handleOpenLink('mailto:support@kp5academy.com', 'Support Email'),
    },
    {
      title: 'Business Hours',
      value: 'Mon-Fri 9AM-6PM EST',
      icon: 'time-outline',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
        <View style={styles.placeholder} />
      </View>

      {/* App Info Card */}
      <Card style={styles.card}>
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Ionicons name="football" size={48} color="#007AFF" />
          </View>
          <Text style={styles.appName}>KP5 Academy</Text>
          <Text style={styles.appTagline}>Sports Management Platform</Text>
          <Text style={styles.appVersion}>Version {appVersion} ({buildNumber})</Text>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            KP5 Academy is a comprehensive sports management platform designed to help clubs, 
            teams, and players organize, track, and improve their sporting activities. 
            From live match tracking to tournament management, we provide all the tools 
            you need for successful sports organization.
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <Button
            title="Contact Support"
            onPress={handleContactSupport}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Share App"
            onPress={handleShareApp}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </Card>

      {/* Legal Links */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Legal</Text>
        {legalLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.linkItem}
            onPress={link.onPress}
          >
            <View style={styles.linkContent}>
              <Ionicons name={link.icon as any} size={20} color="#666" />
              <Text style={styles.linkTitle}>{link.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </Card>

      {/* Developer Info */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Developer Information</Text>
        {developerInfo.map((info, index) => (
          <View key={index} style={styles.infoItem}>
            <View style={styles.infoContent}>
              <Ionicons name={info.icon as any} size={20} color="#666" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>{info.title}</Text>
                <Text style={styles.infoValue}>{info.value}</Text>
              </View>
            </View>
            {info.onPress && (
              <TouchableOpacity onPress={info.onPress}>
                <Ionicons name="open-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </Card>

      {/* Features */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Live Match Tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Team & Club Management</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Tournament Organization</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Real-time Notifications</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Player Statistics</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Event Scheduling</Text>
          </View>
        </View>
      </Card>

      {/* Technology Stack */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Technology</Text>
        <View style={styles.techStack}>
          <View style={styles.techItem}>
            <Text style={styles.techLabel}>Frontend:</Text>
            <Text style={styles.techValue}>React Native, Expo</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techLabel}>Backend:</Text>
            <Text style={styles.techValue}>Firebase, Cloud Functions</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techLabel}>Database:</Text>
            <Text style={styles.techValue}>Cloud Firestore</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techLabel}>Authentication:</Text>
            <Text style={styles.techValue}>Firebase Auth</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techLabel}>Storage:</Text>
            <Text style={styles.techValue}>Firebase Storage</Text>
          </View>
        </View>
      </Card>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 KP5 Academy. All rights reserved.
        </Text>
        <Text style={styles.footerText}>
          Made with ❤️ for the sports community
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
  },
  description: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkTitle: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  techStack: {
    gap: 8,
  },
  techItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  techLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  techValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
}); 