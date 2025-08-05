import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card, Button } from '../components/ui';

type AccountType = 'google' | 'facebook' | 'apple' | 'twitter' | 'instagram';

interface LinkedAccount {
  id: string;
  type: AccountType;
  name: string;
  email: string;
  isConnected: boolean;
  icon: string;
  color: string;
}

export default function LinkedAccountsScreen() {
  const navigation = useNavigation();
  
  const [accounts, setAccounts] = useState<LinkedAccount[]>([
    {
      id: '1',
      type: 'google',
      name: 'Google',
      email: 'user@gmail.com',
      isConnected: true,
      icon: 'logo-google',
      color: '#DB4437',
    },
    {
      id: '2',
      type: 'facebook',
      name: 'Facebook',
      email: 'user@facebook.com',
      isConnected: false,
      icon: 'logo-facebook',
      color: '#4267B2',
    },
    {
      id: '3',
      type: 'apple',
      name: 'Apple',
      email: 'user@icloud.com',
      isConnected: false,
      icon: 'logo-apple',
      color: '#000000',
    },
    {
      id: '4',
      type: 'twitter',
      name: 'Twitter',
      email: 'user@twitter.com',
      isConnected: false,
      icon: 'logo-twitter',
      color: '#1DA1F2',
    },
    {
      id: '5',
      type: 'instagram',
      name: 'Instagram',
      email: 'user@instagram.com',
      isConnected: false,
      icon: 'logo-instagram',
      color: '#E4405F',
    },
  ]);

  const handleToggleAccount = (accountId: string) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(account =>
        account.id === accountId
          ? { ...account, isConnected: !account.isConnected }
          : account
      )
    );
  };

  const handleConnectAccount = (account: LinkedAccount) => {
    Alert.alert(
      `Connect ${account.name}`,
      `Would you like to connect your ${account.name} account?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect',
          onPress: () => {
            // TODO: Implement actual OAuth connection
            Alert.alert('Success', `${account.name} account connected successfully!`);
            handleToggleAccount(account.id);
          },
        },
      ]
    );
  };

  const handleDisconnectAccount = (account: LinkedAccount) => {
    Alert.alert(
      `Disconnect ${account.name}`,
      `Are you sure you want to disconnect your ${account.name} account?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement actual OAuth disconnection
            Alert.alert('Success', `${account.name} account disconnected successfully!`);
            handleToggleAccount(account.id);
          },
        },
      ]
    );
  };

  const handleManagePermissions = (account: LinkedAccount) => {
    Alert.alert(
      'Manage Permissions',
      `Manage what data ${account.name} can access from your account.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Manage',
          onPress: () => {
            // TODO: Navigate to permissions management screen
            Alert.alert('Info', 'Permissions management will be implemented soon!');
          },
        },
      ]
    );
  };

  const connectedAccounts = accounts.filter(account => account.isConnected);
  const availableAccounts = accounts.filter(account => !account.isConnected);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Linked Accounts</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.description}>
        Connect your social media accounts to enhance your experience and share your achievements.
      </Text>

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          {connectedAccounts.map((account) => (
            <View key={account.id} style={styles.accountItem}>
              <View style={styles.accountInfo}>
                <View style={[styles.accountIcon, { backgroundColor: account.color }]}>
                  <Ionicons name={account.icon as any} size={24} color="#fff" />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountEmail}>{account.email}</Text>
                </View>
              </View>
              <View style={styles.accountActions}>
                <Switch
                  value={account.isConnected}
                  onValueChange={() => handleDisconnectAccount(account)}
                  trackColor={{ false: '#ddd', true: account.color }}
                  thumbColor="#fff"
                />
                <TouchableOpacity
                  onPress={() => handleManagePermissions(account)}
                  style={styles.permissionsButton}
                >
                  <Ionicons name="settings-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Available Accounts */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Available Accounts</Text>
        {availableAccounts.map((account) => (
          <View key={account.id} style={styles.accountItem}>
            <View style={styles.accountInfo}>
              <View style={[styles.accountIcon, { backgroundColor: account.color }]}>
                <Ionicons name={account.icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.accountDetails}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountStatus}>Not connected</Text>
              </View>
            </View>
            <View style={styles.accountActions}>
              <Switch
                value={account.isConnected}
                onValueChange={() => handleConnectAccount(account)}
                trackColor={{ false: '#ddd', true: account.color }}
                thumbColor="#fff"
              />
            </View>
          </View>
        ))}
      </Card>

      {/* Benefits */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Benefits of Linking Accounts</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="share-social-outline" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Share achievements and highlights</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="people-outline" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Find and connect with friends</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Sync events and schedules</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="cloud-upload-outline" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Backup photos and videos</Text>
          </View>
        </View>
      </Card>

      {/* Privacy Notice */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <Text style={styles.privacyText}>
          We only access the information you explicitly grant permission for. 
          Your data is encrypted and never shared with third parties without your consent. 
          You can revoke access to any connected account at any time.
        </Text>
        <Button
          title="View Privacy Policy"
          onPress={() => {
            // TODO: Navigate to privacy policy
            Alert.alert('Privacy Policy', 'Privacy policy will be shown here.');
          }}
          variant="outline"
          style={styles.privacyButton}
        />
      </Card>

      {/* Data Usage */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Data Usage</Text>
        <View style={styles.dataUsageItem}>
          <Text style={styles.dataUsageLabel}>Profile Information</Text>
          <Text style={styles.dataUsageValue}>Name, email, profile picture</Text>
        </View>
        <View style={styles.dataUsageItem}>
          <Text style={styles.dataUsageLabel}>Activity Data</Text>
          <Text style={styles.dataUsageValue}>Match results, achievements, statistics</Text>
        </View>
        <View style={styles.dataUsageItem}>
          <Text style={styles.dataUsageLabel}>Social Features</Text>
          <Text style={styles.dataUsageValue}>Friend connections, team memberships</Text>
        </View>
      </Card>
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
    marginBottom: 16,
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
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    color: '#666',
  },
  accountStatus: {
    fontSize: 14,
    color: '#999',
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionsButton: {
    padding: 8,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  privacyText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  privacyButton: {
    alignSelf: 'flex-start',
  },
  dataUsageItem: {
    marginBottom: 16,
  },
  dataUsageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dataUsageValue: {
    fontSize: 14,
    color: '#666',
  },
}); 