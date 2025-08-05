import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Card, Button, Badge } from '../components/ui';

type FeedbackType = 'bug' | 'feature' | 'general' | 'complaint';
type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export default function FeedbackScreen() {
  const navigation = useNavigation();
  
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const feedbackTypes = [
    { id: 'bug', label: 'Bug Report', icon: 'bug-outline', color: '#FF6B6B' },
    { id: 'feature', label: 'Feature Request', icon: 'bulb-outline', color: '#4ECDC4' },
    { id: 'general', label: 'General Feedback', icon: 'chatbubble-outline', color: '#45B7D1' },
    { id: 'complaint', label: 'Complaint', icon: 'warning-outline', color: '#FFA726' },
  ];

  const priorityLevels = [
    { id: 'low', label: 'Low', color: '#4CAF50' },
    { id: 'medium', label: 'Medium', color: '#FF9800' },
    { id: 'high', label: 'High', color: '#F44336' },
    { id: 'critical', label: 'Critical', color: '#9C27B0' },
  ];

  const validateForm = () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    
    if (description.length < 10) {
      Alert.alert('Error', 'Description must be at least 10 characters long');
      return false;
    }
    
    return true;
  };

  const handleSubmitFeedback = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // TODO: Implement feedback submission using API
      // For now, show success message
      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully. We\'ll review it and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedType = () => feedbackTypes.find(type => type.id === feedbackType);
  const getSelectedPriority = () => priorityLevels.find(level => level.id === priority);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Feedback</Text>
          <View style={styles.placeholder} />
        </View>

        <Card style={styles.card}>
          <Text style={styles.description}>
            Help us improve by sharing your feedback, reporting bugs, or suggesting new features.
          </Text>

          {/* Feedback Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback Type</Text>
            <View style={styles.typeGrid}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    feedbackType === type.id && styles.typeButtonActive,
                  ]}
                  onPress={() => setFeedbackType(type.id as FeedbackType)}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={feedbackType === type.id ? '#fff' : type.color}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      feedbackType === type.id && styles.typeLabelActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Level</Text>
            <View style={styles.priorityContainer}>
              {priorityLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.priorityButton,
                    priority === level.id && styles.priorityButtonActive,
                  ]}
                  onPress={() => setPriority(level.id as PriorityLevel)}
                >
                  <Badge
                    text={level.label}
                    color={priority === level.id ? '#fff' : level.color}
                    backgroundColor={priority === level.id ? level.color : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief description of your feedback"
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
            />
            <Text style={styles.characterCount}>{subject.length}/100</Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Please provide detailed information..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>{description.length}/1000</Text>
          </View>

          {/* Email Input (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              We'll use this to follow up on your feedback
            </Text>
          </View>

          {/* Selected Options Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Type:</Text>
              <View style={styles.summaryValue}>
                <Ionicons
                  name={getSelectedType()?.icon as any}
                  size={16}
                  color={getSelectedType()?.color}
                />
                <Text style={styles.summaryText}>{getSelectedType()?.label}</Text>
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Priority:</Text>
              <Badge
                text={getSelectedPriority()?.label || ''}
                color="#fff"
                backgroundColor={getSelectedPriority()?.color}
              />
            </View>
          </View>

          <Button
            title={isLoading ? 'Submitting...' : 'Submit Feedback'}
            onPress={handleSubmitFeedback}
            disabled={isLoading || !subject.trim() || !description.trim()}
            style={styles.submitButton}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            We typically respond to feedback within 24-48 hours.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  typeLabelActive: {
    color: '#fff',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  priorityButtonActive: {
    borderColor: '#007AFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  summary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 