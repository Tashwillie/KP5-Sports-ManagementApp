import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../services/paymentService';
import {
  Payment,
  PaymentType,
  PaymentStatus,
  SavedPaymentMethod,
  PaymentIntent,
} from '@shared/types/payment';

interface PaymentScreenParams {
  paymentId?: string;
  amount: number;
  currency?: string;
  description: string;
  type: PaymentType;
  metadata?: Record<string, any>;
  returnUrl?: string;
}

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as PaymentScreenParams;

  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [useNewPaymentMethod, setUseNewPaymentMethod] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  useEffect(() => {
    initializePayment();
    loadSavedPaymentMethods();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      
      if (params.paymentId) {
        // Load existing payment
        const existingPayment = await paymentService.getPayment(params.paymentId);
        if (existingPayment) {
          setPayment(existingPayment);
          return;
        }
      }

      // Create new payment
      const paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: 'current-user-id', // Replace with actual user ID
        type: params.type,
        amount: params.amount,
        currency: params.currency || 'usd',
        status: 'pending',
        method: 'stripe_card',
        description: params.description,
        metadata: params.metadata || {},
        subtotal: params.amount,
        total: params.amount,
      };

      const paymentId = await paymentService.createPayment(paymentData);
      const newPayment = await paymentService.getPayment(paymentId);
      setPayment(newPayment);

      // Create payment intent
      const intent = await paymentService.createPaymentIntent(
        paymentId,
        params.amount,
        params.currency || 'usd',
        params.metadata
      );
      setPaymentIntent(intent);
    } catch (error) {
      console.error('Error initializing payment:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPaymentMethods = async () => {
    try {
      const methods = await paymentService.getUserPaymentMethods();
      setSavedPaymentMethods(methods);
      
      // Select default payment method
      const defaultMethod = methods.find(m => m.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handlePaymentMethodSelection = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setUseNewPaymentMethod(false);
  };

  const handleNewPaymentMethod = () => {
    setUseNewPaymentMethod(true);
    setSelectedPaymentMethod(null);
  };

  const validateCardDetails = () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
      Alert.alert('Error', 'Please fill in all card details');
      return false;
    }

    // Basic card validation
    if (cardDetails.number.length < 13 || cardDetails.number.length > 19) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      Alert.alert('Error', 'Please enter expiry date in MM/YY format');
      return false;
    }

    if (cardDetails.cvc.length < 3 || cardDetails.cvc.length > 4) {
      Alert.alert('Error', 'Please enter a valid CVC');
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!payment) return;

    try {
      setLoading(true);

      let paymentMethodId = selectedPaymentMethod;

      if (useNewPaymentMethod) {
        if (!validateCardDetails()) return;

        // Save new payment method
        const newPaymentMethod: Omit<SavedPaymentMethod, 'id' | 'createdAt' | 'updatedAt'> = {
          userId: 'current-user-id', // Replace with actual user ID
          stripePaymentMethodId: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'card',
          billingDetails: {
            name: cardDetails.name,
            email: 'user@example.com', // Replace with actual user email
            address: {
              line1: '',
              city: '',
              state: '',
              postalCode: '',
              country: '',
            },
          },
          isDefault: savedPaymentMethods.length === 0,
          isActive: true,
          metadata: {},
        };

        paymentMethodId = await paymentService.savePaymentMethod(newPaymentMethod);
      }

      if (!paymentMethodId) {
        Alert.alert('Error', 'Please select a payment method');
        return;
      }

      // Process payment
      const result = await paymentService.processPayment(
        payment.id,
        paymentMethodId,
        payment.total,
        payment.currency
      );

      if (result.success) {
        Alert.alert(
          'Payment Successful',
          'Your payment has been processed successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (params.returnUrl) {
                  navigation.navigate(params.returnUrl as any);
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', result.error || 'Payment processing failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in cents
  };

  const maskCardNumber = (number: string) => {
    if (number.length < 4) return number;
    return `**** **** **** ${number.slice(-4)}`;
  };

  if (loading && !payment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!payment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Payment not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Description</Text>
            <Text style={styles.summaryValue}>{payment.description}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(payment.total, payment.currency)}</Text>
          </View>
          {payment.taxAmount && payment.taxAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>{formatCurrency(payment.taxAmount, payment.currency)}</Text>
            </View>
          )}
          {payment.processingFee && payment.processingFee > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Processing Fee</Text>
              <Text style={styles.summaryValue}>{formatCurrency(payment.processingFee, payment.currency)}</Text>
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {/* Saved Payment Methods */}
          {savedPaymentMethods.length > 0 && !useNewPaymentMethod && (
            <View style={styles.paymentMethodsContainer}>
              {savedPaymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
                  ]}
                  onPress={() => handlePaymentMethodSelection(method.id)}
                >
                  <View style={styles.paymentMethodInfo}>
                    <Ionicons
                      name={method.type === 'card' ? 'card' : 'card-outline'}
                      size={24}
                      color="#007AFF"
                    />
                    <View style={styles.paymentMethodDetails}>
                      <Text style={styles.paymentMethodName}>
                        {method.card ? `${method.card.brand} •••• ${method.card.last4}` : 'Payment Method'}
                      </Text>
                      <Text style={styles.paymentMethodExpiry}>
                        {method.card ? `Expires ${method.card.expMonth}/${method.card.expYear}` : ''}
                      </Text>
                    </View>
                  </View>
                  {selectedPaymentMethod === method.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* New Payment Method Option */}
          <TouchableOpacity
            style={[
              styles.newPaymentMethodCard,
              useNewPaymentMethod && styles.selectedPaymentMethod,
            ]}
            onPress={handleNewPaymentMethod}
          >
            <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.newPaymentMethodText}>Use a new payment method</Text>
            {useNewPaymentMethod && (
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            )}
          </TouchableOpacity>

          {/* New Card Form */}
          {useNewPaymentMethod && (
            <View style={styles.cardForm}>
              <Text style={styles.formLabel}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChangeText={(text) => setCardDetails({ ...cardDetails, number: text })}
                keyboardType="numeric"
                maxLength={19}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.formLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChangeText={(text) => setCardDetails({ ...cardDetails, expiry: text })}
                    maxLength={5}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.formLabel}>CVC</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="123"
                    value={cardDetails.cvc}
                    onChangeText={(text) => setCardDetails({ ...cardDetails, cvc: text })}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                value={cardDetails.name}
                onChangeText={(text) => setCardDetails({ ...cardDetails, name: text })}
              />
            </View>
          )}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={processPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay {formatCurrency(payment.total, payment.currency)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    marginBottom: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  paymentMethodExpiry: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  newPaymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  newPaymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 12,
    flex: 1,
  },
  cardForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  payButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 