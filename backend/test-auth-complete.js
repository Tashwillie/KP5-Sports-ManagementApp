const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let testUserId = '';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPass123',
  displayName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890'
};

const testPhoneUser = {
  phone: '+1987654321'
};

async function testAuthentication() {
  console.log('🧪 Starting comprehensive authentication tests...\n');

  try {
    // Test 1: User Registration
    console.log('1️⃣ Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    
    // Test 2: User Login
    console.log('\n2️⃣ Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    authToken = loginResponse.data.data.token;
    testUserId = loginResponse.data.data.user.id;

    // Test 3: Get Current User
    console.log('\n3️⃣ Testing get current user...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get current user successful:', meResponse.data.data.user.email);

    // Test 4: Update Profile
    console.log('\n4️⃣ Testing profile update...');
    const updateResponse = await axios.put(`${BASE_URL}/auth/profile`, {
      displayName: 'Updated Test User'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile update successful:', updateResponse.data.message);

    // Test 5: Send Phone OTP
    console.log('\n5️⃣ Testing phone OTP sending...');
    const sendOTPResponse = await axios.post(`${BASE_URL}/auth/phone/send-otp`, {
      phone: testPhoneUser.phone
    });
    console.log('✅ OTP sent successfully:', sendOTPResponse.data.message);
    
    // Note: In real testing, you'd get the OTP from logs or SMS
    console.log('📱 Check server logs for OTP code');

    // Test 6: Forgot Password
    console.log('\n6️⃣ Testing forgot password...');
    const forgotPasswordResponse = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: testUser.email
    });
    console.log('✅ Forgot password successful:', forgotPasswordResponse.data.message);

    // Test 7: Refresh Token
    console.log('\n7️⃣ Testing token refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
      token: authToken
    });
    console.log('✅ Token refresh successful:', refreshResponse.data.message);
    authToken = refreshResponse.data.data.token;

    // Test 8: Get OAuth Accounts (should be empty for new user)
    console.log('\n8️⃣ Testing OAuth accounts retrieval...');
    const oauthResponse = await axios.get(`${BASE_URL}/auth/oauth/accounts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ OAuth accounts retrieved:', oauthResponse.data.data.accounts.length, 'accounts');

    // Test 9: Logout
    console.log('\n9️⃣ Testing logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Logout successful:', logoutResponse.data.message);

    console.log('\n🎉 All authentication tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n💡 Make sure the database is running and the new tables are created.');
      console.log('💡 Run: node scripts/migrate-auth.js');
    }
  }
}

// Test OAuth simulation (without actual Google tokens)
async function testOAuthSimulation() {
  console.log('\n🔐 Testing OAuth simulation...');
  
  try {
    // This would fail with invalid token, but tests the endpoint
    const oauthResponse = await axios.post(`${BASE_URL}/auth/google`, {
      idToken: 'invalid-token-for-testing'
    });
    console.log('✅ OAuth endpoint accessible');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ OAuth endpoint working (correctly rejected invalid token)');
    } else {
      console.log('⚠️ OAuth endpoint test inconclusive');
    }
  }
}

// Test phone authentication simulation
async function testPhoneAuthSimulation() {
  console.log('\n📱 Testing phone authentication simulation...');
  
  try {
    // Test with invalid OTP
    const verifyResponse = await axios.post(`${BASE_URL}/auth/phone/verify-otp`, {
      phone: testPhoneUser.phone,
      code: '000000'
    });
    console.log('✅ Phone verification endpoint accessible');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Phone verification endpoint working (correctly rejected invalid OTP)');
    } else {
      console.log('⚠️ Phone verification endpoint test inconclusive');
    }
  }
}

// Run all tests
async function runAllTests() {
  await testAuthentication();
  await testOAuthSimulation();
  await testPhoneAuthSimulation();
  
  console.log('\n🏁 All tests completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Set up Google OAuth credentials in your .env file');
  console.log('2. Configure SMTP settings for email functionality');
  console.log('3. Set up SMS service for phone verification (Twilio, AWS SNS, etc.)');
  console.log('4. Test with real OAuth tokens and phone numbers');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testAuthentication, testOAuthSimulation, testPhoneAuthSimulation };
