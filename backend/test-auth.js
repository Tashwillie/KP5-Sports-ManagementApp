const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🔍 Testing authentication...\n');
    
    // 1. Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@kp5academy.com' }
    });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      isActive: adminUser.isActive,
      hasPassword: !!adminUser.password
    });
    
    // 2. Test password verification
    const testPassword = 'password123';
    const isValidPassword = await bcrypt.compare(testPassword, adminUser.password || '');
    
    console.log(`\n🔐 Password verification: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      return;
    }
    
    // 3. Test JWT token generation
    const jwtSecret = process.env.JWT_SECRET || 'kp5-academy-super-secret-jwt-key-2024-change-in-production';
    console.log(`\n🔑 JWT Secret: ${jwtSecret.substring(0, 20)}...`);
    
    const token = jwt.sign(
      { 
        id: adminUser.id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT token generated successfully');
    console.log(`Token: ${token.substring(0, 50)}...`);
    
    // 4. Test JWT token verification
    try {
      const decoded = jwt.verify(token, jwtSecret);
      console.log('✅ JWT token verification successful');
      console.log('Decoded token:', decoded);
    } catch (error) {
      console.log('❌ JWT token verification failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
