import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';

export function SignInScreen() {
  const navigation = useNavigation<any>();
  const { signIn, signInWithGoogle, signInWithOTP, resetPassword, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  const handleSignIn = async () => {
    await signIn(email, password);
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleOTPSignIn = async () => {
    if (!showOTP) {
      await signInWithOTP(phone);
      setShowOTP(true);
    } else {
      await signInWithOTP(phone, otpCode);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }
    
    Alert.alert(
      'Reset Password',
      `Send password reset email to ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: async () => {
            await resetPassword(email);
            Alert.alert('Success', 'Password reset email sent!');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {!showOTP ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title={loading ? 'Signing In...' : 'Sign In'} onPress={handleSignIn} disabled={loading} />
          
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading}>
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowOTP(true)} style={styles.otpLink}>
            <Text style={styles.link}>Sign in with Phone Number</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="OTP Code"
            keyboardType="number-pad"
            value={otpCode}
            onChangeText={setOtpCode}
          />
          <Button title={loading ? 'Verifying...' : 'Verify OTP'} onPress={handleOTPSignIn} disabled={loading} />
          
          <TouchableOpacity onPress={() => setShowOTP(false)} style={styles.backLink}>
            <Text style={styles.link}>Back to Email Sign In</Text>
          </TouchableOpacity>
        </>
      )}
      
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.linkContainer}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#3b82f6',
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  error: {
    color: '#ef4444',
    marginBottom: 12,
  },
  forgotPassword: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#64748b',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  otpLink: {
    marginBottom: 16,
  },
  backLink: {
    marginTop: 8,
  },
  linkContainer: {
    marginTop: 16,
  },
  link: {
    color: '#3b82f6',
    fontWeight: '500',
    fontSize: 16,
  },
}); 