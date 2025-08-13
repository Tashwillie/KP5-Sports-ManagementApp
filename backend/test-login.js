require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Testing login process...\n');
    
    const email = 'admin@kp5academy.com';
    const password = 'password123';
    
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🔐 JWT Secret:', process.env.JWT_SECRET ? '✅ Set' : '❌ Not set');
    
    // 1. Find user
    console.log('\n1️⃣ Finding user...');
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password
    });
    
    if (!user.isActive) {
      console.log('❌ User is not active');
      return;
    }
    
    // 2. Check password
    console.log('\n2️⃣ Checking password...');
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    console.log('Password valid:', isValidPassword ? '✅ Yes' : '❌ No');
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return;
    }
    
    // 3. Generate JWT token
    console.log('\n3️⃣ Generating JWT token...');
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT token generated');
    console.log('Token:', token.substring(0, 50) + '...');
    
    // 4. Verify token
    console.log('\n4️⃣ Verifying JWT token...');
    try {
      const decoded = jwt.verify(token, jwtSecret);
      console.log('✅ JWT token verified');
      console.log('Decoded:', decoded);
    } catch (error) {
      console.log('❌ JWT verification failed:', error.message);
    }
    
    // 5. Simulate response
    console.log('\n5️⃣ Simulating response...');
    const { password: _, ...userWithoutPassword } = user;
    
    const response = {
      success: true,
      message: 'Login successful.',
      data: {
        user: userWithoutPassword,
        token,
      },
    };
    
    console.log('✅ Response would be:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
