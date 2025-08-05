import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { tw } from '../utils/tailwind';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
}

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I join a team?',
      answer: 'To join a team, navigate to the Teams section, find a team you\'re interested in, and tap "Join Team". You\'ll need to be approved by the team coach or administrator.'
    },
    {
      id: '2',
      question: 'How do I register for a tournament?',
      answer: 'Go to the Tournaments section, select a tournament, and tap "Register". Make sure your team is eligible and all required information is provided.'
    },
    {
      id: '3',
      question: 'How do I update my profile?',
      answer: 'Go to your Profile section and tap "Edit Profile". You can update your display name, phone number, and profile photo.'
    },
    {
      id: '4',
      question: 'How do I receive notifications?',
      answer: 'Go to Settings > Notifications to configure your notification preferences. You can enable push notifications, email notifications, and SMS alerts.'
    },
    {
      id: '5',
      question: 'How do I report an issue?',
      answer: 'You can report issues by contacting support through email, phone, or using the feedback form in the Settings section.'
    },
    {
      id: '6',
      question: 'How do I change my password?',
      answer: 'Go to Settings > Change Password to update your account password. You\'ll need to enter your current password for security.'
    }
  ];

  const supportOptions: SupportOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us an email and we\'ll get back to you within 24 hours',
      icon: 'mail',
      action: () => Linking.openURL('mailto:support@kp5academy.com')
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call us directly for immediate assistance',
      icon: 'call',
      action: () => Linking.openURL('tel:+1234567890')
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: 'chatbubbles',
      action: () => Alert.alert('Coming Soon', 'Live chat will be available soon.')
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Share your thoughts and suggestions with us',
      icon: 'chatbox',
      action: () => navigation.navigate('Feedback' as never)
    }
  ];

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const renderFAQItem = (faq: FAQItem) => (
    <Card key={faq.id} style={tw('mb-3')}>
      <TouchableOpacity 
        onPress={() => toggleFAQ(faq.id)}
        style={tw('flex-row justify-between items-center')}
      >
        <Text style={tw('text-base font-medium text-gray-900 flex-1 pr-4')}>
          {faq.question}
        </Text>
        <Ionicons 
          name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#6B7280" 
        />
      </TouchableOpacity>
      
      {expandedFAQ === faq.id && (
        <Text style={tw('text-sm text-gray-600 mt-3 leading-5')}>
          {faq.answer}
        </Text>
      )}
    </Card>
  );

  const renderSupportOption = (option: SupportOption) => (
    <TouchableOpacity key={option.id} onPress={option.action}>
      <Card style={tw('mb-3')}>
        <View style={tw('flex-row items-center')}>
          <View style={tw('w-12 h-12 bg-blue-100 rounded-lg items-center justify-center mr-4')}>
            <Ionicons name={option.icon as any} size={24} color="#3B82F6" />
          </View>
          <View style={tw('flex-1')}>
            <Text style={tw('text-base font-semibold text-gray-900')}>
              {option.title}
            </Text>
            <Text style={tw('text-sm text-gray-600 mt-1')}>
              {option.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={tw('flex-1 bg-gray-50')}>
      {/* Header */}
      <View style={tw('bg-white border-b border-gray-200 px-4 py-3')}>
        <View style={tw('flex-row items-center')}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={tw('text-xl font-bold text-gray-900 ml-3')}>Help & Support</Text>
        </View>
      </View>

      <ScrollView style={tw('flex-1')} contentContainerStyle={tw('p-4')}>
        {/* Quick Actions */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            Get Help Quickly
          </Text>
          <View style={tw('space-y-3')}>
            {supportOptions.map(renderSupportOption)}
          </View>
        </Card>

        {/* FAQ Section */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            Frequently Asked Questions
          </Text>
          <View style={tw('space-y-2')}>
            {faqs.map(renderFAQItem)}
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            Contact Information
          </Text>
          
          <View style={tw('space-y-4')}>
            <View style={tw('flex-row items-center')}>
              <Ionicons name="mail" size={20} color="#6B7280" />
              <View style={tw('ml-3')}>
                <Text style={tw('text-sm font-medium text-gray-900')}>Email</Text>
                <Text style={tw('text-sm text-gray-600')}>support@kp5academy.com</Text>
              </View>
            </View>
            
            <View style={tw('flex-row items-center')}>
              <Ionicons name="call" size={20} color="#6B7280" />
              <View style={tw('ml-3')}>
                <Text style={tw('text-sm font-medium text-gray-900')}>Phone</Text>
                <Text style={tw('text-sm text-gray-600')}>+1 (234) 567-8900</Text>
              </View>
            </View>
            
            <View style={tw('flex-row items-center')}>
              <Ionicons name="time" size={20} color="#6B7280" />
              <View style={tw('ml-3')}>
                <Text style={tw('text-sm font-medium text-gray-900')}>Support Hours</Text>
                <Text style={tw('text-sm text-gray-600')}>Monday - Friday: 9 AM - 6 PM EST</Text>
              </View>
            </View>
            
            <View style={tw('flex-row items-center')}>
              <Ionicons name="location" size={20} color="#6B7280" />
              <View style={tw('ml-3')}>
                <Text style={tw('text-sm font-medium text-gray-900')}>Address</Text>
                <Text style={tw('text-sm text-gray-600')}>123 Sports Ave, City, State 12345</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* App Information */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            App Information
          </Text>
          
          <View style={tw('space-y-3')}>
            <View style={tw('flex-row justify-between items-center py-2')}>
              <Text style={tw('text-sm text-gray-600')}>Version</Text>
              <Text style={tw('text-sm font-medium text-gray-900')}>1.0.0</Text>
            </View>
            
            <View style={tw('flex-row justify-between items-center py-2')}>
              <Text style={tw('text-sm text-gray-600')}>Build</Text>
              <Text style={tw('text-sm font-medium text-gray-900')}>2024.1.1</Text>
            </View>
            
            <View style={tw('flex-row justify-between items-center py-2')}>
              <Text style={tw('text-sm text-gray-600')}>Platform</Text>
              <Text style={tw('text-sm font-medium text-gray-900')}>React Native</Text>
            </View>
          </View>
        </Card>

        {/* Additional Resources */}
        <Card style={tw('mb-6')}>
          <Text style={tw('text-lg font-semibold text-gray-900 mb-4')}>
            Additional Resources
          </Text>
          
          <View style={tw('space-y-3')}>
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://kp5academy.com/docs')}
              style={tw('flex-row items-center py-2')}
            >
              <Ionicons name="document-text" size={20} color="#3B82F6" />
              <Text style={tw('text-blue-600 font-medium ml-3')}>User Documentation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://kp5academy.com/tutorials')}
              style={tw('flex-row items-center py-2')}
            >
              <Ionicons name="play-circle" size={20} color="#3B82F6" />
              <Text style={tw('text-blue-600 font-medium ml-3')}>Video Tutorials</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => Linking.openURL('https://kp5academy.com/community')}
              style={tw('flex-row items-center py-2')}
            >
              <Ionicons name="people" size={20} color="#3B82F6" />
              <Text style={tw('text-blue-600 font-medium ml-3')}>Community Forum</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
} 