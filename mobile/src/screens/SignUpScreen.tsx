import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthProvider';

export function SignUpScreen() {
  const navigation = useNavigation<any>();
  const { signUp, signInWithGoogle, signInWithOTP, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOTP, setShowOTP] = useState(false);

  const handleSignUp = async () => {
    await signUp(email, password);
  };

  const handleGoogleSignUp = async () => {
    await signInWithGoogle();
  };

  const handleOTPSignUp = async () => {
    if (!showOTP) {
      await signInWithOTP(phone);
      setShowOTP(true);
    } else {
      await signInWithOTP(phone, otpCode);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
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
          <Button title={loading ? 'Signing Up...' : 'Sign Up'} onPress={handleSignUp} disabled={loading} />
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp} disabled={loading}>
            <Text style={styles.googleButtonText}>Sign up with Google</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowOTP(true)} style={styles.otpLink}>
            <Text style={styles.link}>Sign up with Phone Number</Text>
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
          <Button title={loading ? 'Verifying...' : 'Verify OTP'} onPress={handleOTPSignUp} disabled={loading} />
          
          <TouchableOpacity onPress={() => setShowOTP(false)} style={styles.backLink}>
            <Text style={styles.link}>Back to Email Sign Up</Text>
          </TouchableOpacity>
        </>
      )}
      
      <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.linkContainer}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
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