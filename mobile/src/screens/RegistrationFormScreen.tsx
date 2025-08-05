import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registrationService } from '../services/registrationService';
import {
  RegistrationForm,
  FormField,
  FieldType,
  RegistrationField,
  WaiverSignature,
  AgeRestrictions,
} from '@shared/types/registration';

interface RegistrationFormScreenProps {
  route: {
    params: {
      formId: string;
      form: RegistrationForm;
    };
  };
  navigation: any;
}

export default function RegistrationFormScreen({ route, navigation }: RegistrationFormScreenProps) {
  const { formId, form } = route.params;
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [waiverSignatures, setWaiverSignatures] = useState<Record<string, boolean>>({});
  const [parentSignatures, setParentSignatures] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    navigation.setOptions({
      title: form.name,
    });
  }, [form, navigation]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: '',
      }));
    }
  };

  const handleWaiverToggle = (waiverId: string, signed: boolean) => {
    setWaiverSignatures(prev => ({
      ...prev,
      [waiverId]: signed,
    }));
  };

  const handleParentSignature = (waiverId: string, parentData: any) => {
    setParentSignatures(prev => ({
      ...prev,
      [waiverId]: parentData,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    form.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.id];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }

      // Validate field-specific rules
      if (formData[field.id]) {
        const validationError = validateField(field, formData[field.id]);
        if (validationError) {
          newErrors[field.id] = validationError;
        }
      }
    });

    // Validate age restrictions
    if (form.ageRestrictions) {
      const ageValidation = validateAgeRestrictions(formData, form.ageRestrictions);
      if (!ageValidation.isValid) {
        newErrors.birthDate = ageValidation.error;
      }
    }

    // Validate waivers
    form.waivers.forEach(waiver => {
      if (waiver.isRequired && !waiverSignatures[waiver.id]) {
        newErrors[`waiver_${waiver.id}`] = 'You must accept this waiver to continue';
      }

      if (waiver.requiresParentSignature && waiverSignatures[waiver.id]) {
        const parentData = parentSignatures[waiver.id];
        if (!parentData || !parentData.parentName || !parentData.parentEmail) {
          newErrors[`parent_${waiver.id}`] = 'Parent signature is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (!field.validation) return null;

    const validation = field.validation;

    if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }

    if (validation.minValue && typeof value === 'number' && value < validation.minValue) {
      return `${field.label} must be at least ${validation.minValue}`;
    }

    if (validation.maxValue && typeof value === 'number' && value > validation.maxValue) {
      return `${field.label} must be no more than ${validation.maxValue}`;
    }

    if (validation.pattern && typeof value === 'string') {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return `${field.label} format is invalid`;
      }
    }

    return null;
  };

  const validateAgeRestrictions = (
    data: Record<string, any>,
    restrictions: AgeRestrictions
  ): { isValid: boolean; error?: string } => {
    const birthDate = data.birthDate;
    if (!birthDate) return { isValid: false, error: 'Birth date is required' };

    const birth = new Date(birthDate);
    const ageAsOfDate = restrictions.ageAsOfDate || new Date();
    const age = ageAsOfDate.getFullYear() - birth.getFullYear();
    const monthDiff = ageAsOfDate.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && ageAsOfDate.getDate() < birth.getDate())) {
      age--;
    }

    if (restrictions.minAge && age < restrictions.minAge) {
      return { 
        isValid: false, 
        error: `Minimum age requirement is ${restrictions.minAge} years` 
      };
    }

    if (restrictions.maxAge && age > restrictions.maxAge) {
      return { 
        isValid: false, 
        error: `Maximum age requirement is ${restrictions.maxAge} years` 
      };
    }

    return { isValid: true };
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare registration data
      const registrationFields: RegistrationField[] = form.fields.map(field => ({
        fieldId: field.id,
        fieldName: field.name,
        fieldType: field.type,
        value: formData[field.id],
        isRequired: field.required,
        validationPassed: !errors[field.id],
        validationErrors: errors[field.id] ? [errors[field.id]] : undefined,
      }));

      const waiverSignatures: WaiverSignature[] = form.waivers
        .filter(waiver => waiverSignatures[waiver.id])
        .map(waiver => ({
          waiverId: waiver.id,
          waiverTitle: waiver.title,
          signedBy: 'currentUserId', // Replace with actual user ID
          signedAt: new Date(),
          parentSignature: waiver.requiresParentSignature && parentSignatures[waiver.id] ? {
            parentName: parentSignatures[waiver.id].parentName,
            parentEmail: parentSignatures[waiver.id].parentEmail,
            signedAt: new Date(),
            relationship: parentSignatures[waiver.id].relationship,
          } : undefined,
        }));

      await registrationService.submitRegistration(formId, {
        registrantName: formData.fullName || 'Unknown',
        registrantEmail: formData.email || '',
        registrantPhone: formData.phone,
        fields: registrationFields,
        waivers: waiverSignatures,
        registrationCode: formData.registrationCode,
      });

      Alert.alert(
        'Registration Submitted',
        'Your registration has been submitted successfully. You will receive a confirmation email shortly.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting registration:', error);
      Alert.alert('Error', 'Failed to submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];
    const error = errors[field.id];

    return (
      <View key={field.id} style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
        
        {field.description && (
          <Text style={styles.fieldDescription}>{field.description}</Text>
        )}

        {renderFieldInput(field, value)}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  };

  const renderFieldInput = (field: FormField, value: any) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <TextInput
            style={[styles.textInput, errors[field.id] && styles.errorInput]}
            value={value}
            onChangeText={(text) => handleFieldChange(field.id, text)}
            placeholder={field.placeholder}
            keyboardType={field.type === 'email' ? 'email-address' : field.type === 'phone' ? 'phone-pad' : 'default'}
            autoCapitalize={field.type === 'email' ? 'none' : 'words'}
          />
        );

      case 'number':
        return (
          <TextInput
            style={[styles.textInput, errors[field.id] && styles.errorInput]}
            value={value?.toString()}
            onChangeText={(text) => handleFieldChange(field.id, parseFloat(text) || 0)}
            placeholder={field.placeholder}
            keyboardType="numeric"
          />
        );

      case 'date':
        return (
          <TouchableOpacity
            style={[styles.dateInput, errors[field.id] && styles.errorInput]}
            onPress={() => {
              // Implement date picker
              Alert.alert('Date Picker', 'Date picker implementation needed');
            }}
          >
            <Text style={value ? styles.dateText : styles.placeholderText}>
              {value ? new Date(value).toLocaleDateString() : field.placeholder || 'Select date'}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
        );

      case 'select':
        return (
          <TouchableOpacity
            style={[styles.selectInput, errors[field.id] && styles.errorInput]}
            onPress={() => {
              // Implement select picker
              Alert.alert('Select', 'Select picker implementation needed');
            }}
          >
            <Text style={value ? styles.selectText : styles.placeholderText}>
              {value || field.placeholder || 'Select option'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        );

      case 'checkbox':
        return (
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleFieldChange(field.id, !value)}
          >
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
              {value && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>{field.label}</Text>
          </TouchableOpacity>
        );

      case 'textarea':
        return (
          <TextInput
            style={[styles.textArea, errors[field.id] && styles.errorInput]}
            value={value}
            onChangeText={(text) => handleFieldChange(field.id, text)}
            placeholder={field.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        );

      default:
        return (
          <TextInput
            style={[styles.textInput, errors[field.id] && styles.errorInput]}
            value={value}
            onChangeText={(text) => handleFieldChange(field.id, text)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  const renderWaiver = (waiver: any) => {
    const isSigned = waiverSignatures[waiver.id];
    const error = errors[`waiver_${waiver.id}`];

    return (
      <View key={waiver.id} style={styles.waiverContainer}>
        <View style={styles.waiverHeader}>
          <Text style={styles.waiverTitle}>{waiver.title}</Text>
          <Switch
            value={isSigned}
            onValueChange={(value) => handleWaiverToggle(waiver.id, value)}
            trackColor={{ false: '#e1e5e9', true: '#007AFF' }}
            thumbColor={isSigned ? '#fff' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.waiverContent} numberOfLines={6}>
          {waiver.content}
        </Text>

        {waiver.requiresParentSignature && isSigned && (
          <View style={styles.parentSignatureContainer}>
            <Text style={styles.parentSignatureTitle}>Parent/Guardian Information</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Parent/Guardian Name"
              value={parentSignatures[waiver.id]?.parentName}
              onChangeText={(text) => handleParentSignature(waiver.id, {
                ...parentSignatures[waiver.id],
                parentName: text,
              })}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Parent/Guardian Email"
              value={parentSignatures[waiver.id]?.parentEmail}
              onChangeText={(text) => handleParentSignature(waiver.id, {
                ...parentSignatures[waiver.id],
                parentEmail: text,
              })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.textInput}
              placeholder="Relationship to Participant"
              value={parentSignatures[waiver.id]?.relationship}
              onChangeText={(text) => handleParentSignature(waiver.id, {
                ...parentSignatures[waiver.id],
                relationship: text,
              })}
            />
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.formTitle}>{form.name}</Text>
          {form.description && (
            <Text style={styles.formDescription}>{form.description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Information</Text>
          {form.fields.map(renderField)}
        </View>

        {form.waivers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Waivers & Agreements</Text>
            {form.waivers.map(renderWaiver)}
          </View>
        )}

        {form.pricing.type !== 'free' && (
          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Registration Fee</Text>
            <Text style={styles.pricingAmount}>${form.pricing.basePrice}</Text>
          </View>
        )}

        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Registration</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  fieldDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
  },
  errorInput: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  waiverContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  waiverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  waiverTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  waiverContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  parentSignatureContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  parentSignatureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  pricingSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
    alignItems: 'center',
  },
  pricingTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  submitContainer: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 